"""
VelvetAI — Main FastAPI server.
Routers: auth, characters, conversations, chat, images, voice, media, scenarios.
"""
import os
import asyncio
import json
import logging
from pathlib import Path
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Query, status
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse
from pydantic import BaseModel, Field, ConfigDict
import uuid

ROOT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(ROOT_DIR / ".env")

from models import (
    UserModel, UserPublic, CharacterModel, ConversationModel, MessageModel, MediaModel,
    RegisterIn, LoginIn, TokenOut, SendMessageIn, CreateConversationIn,
    GenerateImageIn, GenerateVoiceIn, CreateCharacterIn, new_id, utc_now,
)
from auth_utils import (
    hash_password, verify_password, create_access_token,
    get_current_user_id, get_optional_user_id,
)
from llm_service import stream_chat, complete_chat
from image_service import generate_image
from voice_service import tts_to_base64, pick_voice
from seed_data import seed_characters
from image_overrides import upgrade_character_images

# ─── DB (Postgres JSONB) ─────────────────────────────────────────────
from pg_database import Database
db = Database(os.environ.get("DATABASE_URL", ""))

# ─── App ─────────────────────────────────────────────────────────────
app = FastAPI(title="VelvetAI API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
log = logging.getLogger(__name__)


# ─── Helpers ─────────────────────────────────────────────────────────
def _clean(doc: dict) -> dict:
    if not doc:
        return doc
    doc.pop("_id", None)
    for k, v in list(doc.items()):
        if isinstance(v, datetime):
            doc[k] = v.isoformat()
    return doc


async def _doc_to_user(doc: dict) -> dict:
    doc = _clean(doc)
    doc.pop("password_hash", None)
    return doc


# ═══ HEALTH ══════════════════════════════════════════════════════════
@api_router.get("/")
async def root():
    return {"app": "VelvetAI", "status": "ok"}


# ═══ STATUS (legacy) ═════════════════════════════════════════════════
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    obj = StatusCheck(**input.model_dump())
    doc = obj.model_dump()
    doc["timestamp"] = doc["timestamp"].isoformat()
    await db.status_checks.insert_one(doc)
    return obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    items = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for c in items:
        if isinstance(c.get("timestamp"), str):
            c["timestamp"] = datetime.fromisoformat(c["timestamp"])
    return items


@api_router.get("/auth/discord/login")
async def discord_login():
    """Redirect to Discord OAuth consent page."""
    from fastapi.responses import RedirectResponse
    import urllib.parse
    client_id = os.environ.get("DISCORD_CLIENT_ID")
    redirect_uri = os.environ.get("DISCORD_REDIRECT_URI")
    if not client_id or not redirect_uri:
        raise HTTPException(500, "Discord OAuth not configured")
    params = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "identify email",
        "prompt": "consent",
    }
    url = f"https://discord.com/oauth2/authorize?{urllib.parse.urlencode(params)}"
    return RedirectResponse(url)


@api_router.get("/auth/discord/callback")
async def discord_callback(code: str | None = None, error: str | None = None):
    """Exchange code for token, fetch profile, create/login user, redirect with token."""
    from fastapi.responses import RedirectResponse
    import httpx
    FRONTEND = os.environ["FRONTEND_URL"]
    if error or not code:
        return RedirectResponse(f"{FRONTEND}/?discord_error={error or 'cancelled'}")
    client_id = os.environ["DISCORD_CLIENT_ID"]
    client_secret = os.environ["DISCORD_CLIENT_SECRET"]
    redirect_uri = os.environ["DISCORD_REDIRECT_URI"]
    try:
        async with httpx.AsyncClient(timeout=15) as client_http:
            # Exchange code → access_token
            tr = await client_http.post(
                "https://discord.com/api/oauth2/token",
                data={
                    "client_id": client_id,
                    "client_secret": client_secret,
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": redirect_uri,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            if tr.status_code != 200:
                return RedirectResponse(f"{FRONTEND}/?discord_error=token_exchange_failed")
            tok = tr.json()["access_token"]
            # Fetch user info
            ur = await client_http.get(
                "https://discord.com/api/users/@me",
                headers={"Authorization": f"Bearer {tok}"},
            )
            if ur.status_code != 200:
                return RedirectResponse(f"{FRONTEND}/?discord_error=profile_fetch_failed")
            profile = ur.json()
    except Exception as e:
        return RedirectResponse(f"{FRONTEND}/?discord_error={str(e)[:40]}")

    discord_id = profile.get("id")
    email = profile.get("email") or f"discord_{discord_id}@discord.velvetai.app"
    name = profile.get("global_name") or profile.get("username", "DiscordUser")
    avatar_hash = profile.get("avatar")
    avatar_url = (
        f"https://cdn.discordapp.com/avatars/{discord_id}/{avatar_hash}.png"
        if avatar_hash else f"https://ui-avatars.com/api/?name={name}&background=5865F2&color=fff"
    )

    # Find existing or create new
    existing = await db.users.find_one({"$or": [{"email": email}, {"discord_id": discord_id}]})
    if existing:
        # Update profile if changed
        await db.users.update_one(
            {"id": existing["id"]},
            {"$set": {"name": name, "avatar": avatar_url, "discord_id": discord_id, "provider": "discord"}},
        )
        user_id = existing["id"]
    else:
        user = UserModel(
            email=email,
            password_hash="DISCORD_OAUTH_NO_PASSWORD",
            name=name,
            avatar=avatar_url,
            provider="discord",
        )
        doc = user.model_dump()
        doc["created_at"] = doc["created_at"].isoformat()
        doc["discord_id"] = discord_id
        await db.users.insert_one(doc)
        user_id = user.id

    token = create_access_token(user_id)
    return RedirectResponse(f"{FRONTEND}/?discord_token={token}")


# ═══ AUTH ════════════════════════════════════════════════════════════
@api_router.post("/auth/register", response_model=TokenOut)
async def register(payload: RegisterIn):
    email = payload.email.lower().strip()
    if await db.users.find_one({"email": email}):
        raise HTTPException(400, "Email already registered")
    name = (payload.name or email.split("@")[0])[:40]
    user = UserModel(
        email=email,
        password_hash=hash_password(payload.password),
        name=name,
        avatar=f"https://ui-avatars.com/api/?name={name}&background=ec4899&color=fff",
    )
    doc = user.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.users.insert_one(doc)
    token = create_access_token(user.id)
    return TokenOut(access_token=token, user=UserPublic(**(await _doc_to_user(doc))))


@api_router.post("/auth/login", response_model=TokenOut)
async def login(payload: LoginIn):
    email = payload.email.lower().strip()
    doc = await db.users.find_one({"email": email})
    if not doc or not verify_password(payload.password, doc.get("password_hash", "")):
        raise HTTPException(401, "Invalid email or password")
    token = create_access_token(doc["id"])
    return TokenOut(access_token=token, user=UserPublic(**(await _doc_to_user(doc))))


@api_router.get("/auth/me", response_model=UserPublic)
async def me(user_id: str = Depends(get_current_user_id)):
    doc = await db.users.find_one({"id": user_id})
    if not doc:
        raise HTTPException(404, "User not found")
    return UserPublic(**(await _doc_to_user(doc)))


@api_router.patch("/auth/me", response_model=UserPublic)
async def update_me(patch: dict, user_id: str = Depends(get_current_user_id)):
    allowed = {"name", "avatar", "settings"}
    update = {k: v for k, v in patch.items() if k in allowed}
    if update:
        await db.users.update_one({"id": user_id}, {"$set": update})
    doc = await db.users.find_one({"id": user_id})
    return UserPublic(**(await _doc_to_user(doc)))


async def _add_xp(user_id: str, amount: int):
    await db.users.update_one({"id": user_id}, {"$inc": {"xp": amount, "total_messages": 0}})
    doc = await db.users.find_one({"id": user_id})
    if doc:
        xp = doc.get("xp", 0)
        new_lvl = 1
        for thr, lv in [(15000, 10), (10000, 9), (7000, 8), (5000, 7), (4000, 6),
                        (3000, 5), (2000, 4), (1000, 3), (500, 2)]:
            if xp >= thr:
                new_lvl = lv
                break
        await db.users.update_one({"id": user_id}, {"$set": {"level": new_lvl}})


# ═══ CHARACTERS ══════════════════════════════════════════════════════
@api_router.get("/characters")
async def list_characters(
    gender: Optional[str] = None,
    style: Optional[str] = None,
    is_new: Optional[bool] = None,
    online: Optional[bool] = None,
    owner: Optional[str] = None,
    user_id: Optional[str] = Depends(get_optional_user_id),
):
    query = {}
    if owner == "me" and user_id:
        query["owner_id"] = user_id
    elif owner == "official":
        query["owner_id"] = None
    else:
        # Show official + own customs
        if user_id:
            query["$or"] = [{"owner_id": None}, {"owner_id": user_id}]
        else:
            query["owner_id"] = None
    if gender:
        query["gender"] = gender
    if style:
        query["style"] = style
    if is_new:
        query["is_new"] = True
    if online:
        query["status"] = "online"
    docs = await db.characters.find(query, {"_id": 0}).to_list(500)
    return [_clean(d) for d in docs]


@api_router.get("/characters/{char_id}")
async def get_character(char_id: str):
    doc = await db.characters.find_one({"id": char_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Character not found")
    return _clean(doc)


@api_router.post("/characters")
async def create_character(
    payload: CreateCharacterIn,
    user_id: str = Depends(get_current_user_id),
):
    voice_id = pick_voice(payload.voice_style, payload.gender)
    seed = (
        f"stunning {payload.age} year old {payload.ethnicity.lower()} {payload.gender}, "
        f"{payload.hair_color.lower()} {payload.hair_style.lower()} hair, "
        f"{payload.eye_color.lower()} eyes, {payload.body_type.lower()} body"
    )
    if payload.style == "anime":
        seed += ", anime art style, illustration"
    char = CharacterModel(
        owner_id=user_id,
        is_custom=True,
        is_new=True,
        voice_id=voice_id,
        image_prompt_seed=seed,
        description=(", ".join(payload.personality) + ". " + (payload.backstory or "Ready to get to know you better...")),
        tags=payload.personality[:2],
        **payload.model_dump(),
    )
    doc = char.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.characters.insert_one(doc)
    # Trigger avatar generation in background
    asyncio.create_task(_generate_avatar_for_character(char.id))
    return _clean(doc)


async def _generate_avatar_for_character(char_id: str):
    doc = await db.characters.find_one({"id": char_id})
    if not doc:
        return
    res = await generate_image(doc, user_prompt="portrait, headshot, beautiful, smiling", nsfw=False)
    if res.get("url"):
        await db.characters.update_one(
            {"id": char_id},
            {"$set": {"image": res["url"], "cover_image": res["url"]}},
        )


@api_router.delete("/characters/{char_id}")
async def delete_character(char_id: str, user_id: str = Depends(get_current_user_id)):
    res = await db.characters.delete_one({"id": char_id, "owner_id": user_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Not found or not yours")
    return {"ok": True}


# ═══ CONVERSATIONS ═══════════════════════════════════════════════════
@api_router.get("/conversations")
async def list_conversations(user_id: str = Depends(get_current_user_id)):
    docs = await db.conversations.find({"user_id": user_id}, {"_id": 0}).sort("last_message_at", -1).to_list(200)
    out = []
    for d in docs:
        d = _clean(d)
        char = await db.characters.find_one({"id": d["character_id"]}, {"_id": 0})
        d["character"] = _clean(char) if char else None
        out.append(d)
    return out


@api_router.post("/conversations")
async def create_conversation(payload: CreateConversationIn, user_id: str = Depends(get_current_user_id)):
    char = await db.characters.find_one({"id": payload.character_id})
    if not char:
        raise HTTPException(404, "Character not found")
    existing = await db.conversations.find_one({"user_id": user_id, "character_id": payload.character_id})
    if existing:
        return _clean(existing)
    conv = ConversationModel(user_id=user_id, character_id=payload.character_id, title=char.get("name", ""))
    doc = conv.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    doc["last_message_at"] = doc["last_message_at"].isoformat()
    await db.conversations.insert_one(doc)
    # Send opening message
    opener = MessageModel(
        conversation_id=conv.id,
        role="assistant",
        content=f"Hey! I'm {char.get('name', 'your companion')}... I've been thinking about you 💕",
    )
    mdoc = opener.model_dump()
    mdoc["created_at"] = mdoc["created_at"].isoformat()
    await db.messages.insert_one(mdoc)
    return _clean(doc)


@api_router.get("/conversations/{conv_id}/messages")
async def get_messages(conv_id: str, user_id: str = Depends(get_current_user_id)):
    conv = await db.conversations.find_one({"id": conv_id, "user_id": user_id})
    if not conv:
        raise HTTPException(404, "Conversation not found")
    msgs = await db.messages.find({"conversation_id": conv_id}, {"_id": 0}).sort("created_at", 1).to_list(2000)
    return [_clean(m) for m in msgs]


@api_router.delete("/conversations/{conv_id}")
async def delete_conversation(conv_id: str, user_id: str = Depends(get_current_user_id)):
    res = await db.conversations.delete_one({"id": conv_id, "user_id": user_id})
    await db.messages.delete_many({"conversation_id": conv_id})
    return {"ok": res.deleted_count > 0}


# ═══ CHAT (SSE streaming) ═══════════════════════════════════════════
@api_router.post("/chat/send")
async def chat_send(payload: SendMessageIn, user_id: str = Depends(get_current_user_id)):
    """Returns multiple short messages (candy.ai-style multi-bubble reply)."""
    from llm_service import split_into_messages
    char = await db.characters.find_one({"id": payload.character_id})
    if not char:
        raise HTTPException(404, "Character not found")
    conv_id = payload.conversation_id
    if not conv_id:
        existing = await db.conversations.find_one({"user_id": user_id, "character_id": payload.character_id})
        if existing:
            conv_id = existing["id"]
        else:
            conv = ConversationModel(user_id=user_id, character_id=payload.character_id, title=char.get("name", ""))
            d = conv.model_dump()
            d["created_at"] = d["created_at"].isoformat()
            d["last_message_at"] = d["last_message_at"].isoformat()
            await db.conversations.insert_one(d)
            conv_id = conv.id
    user_msg = MessageModel(conversation_id=conv_id, role="user", content=payload.content)
    ud = user_msg.model_dump()
    ud["created_at"] = ud["created_at"].isoformat()
    await db.messages.insert_one(ud)
    hist_docs = await db.messages.find({"conversation_id": conv_id}, {"_id": 0}).sort("created_at", -1).to_list(30)
    history = list(reversed([{"role": h["role"], "content": h["content"]} for h in hist_docs[:-1]]))
    reply = await complete_chat(_clean(char), history, payload.content)
    # Split into 1-4 chat-style messages
    bubbles = split_into_messages(reply, max_msgs=4)
    saved = []
    for b in bubbles:
        asst = MessageModel(conversation_id=conv_id, role="assistant", content=b)
        ad = asst.model_dump()
        ad["created_at"] = ad["created_at"].isoformat()
        await db.messages.insert_one(ad)
        saved.append(_clean(ad))
    await db.conversations.update_one({"id": conv_id}, {"$set": {"last_message_at": saved[-1]["created_at"] if saved else ud["created_at"]}})
    await db.characters.update_one({"id": payload.character_id}, {"$inc": {"message_count": 1, "xp": 10}})
    await _add_xp(user_id, 10)
    return {
        "conversation_id": conv_id,
        "user_message": _clean(ud),
        "assistant_message": saved[0] if saved else None,
        "assistant_messages": saved,
    }


@api_router.post("/chat/proactive")
async def chat_proactive(character_id: str, user_id: str = Depends(get_current_user_id)):
    """Generate a proactive message — bot reaches out first if user has been silent."""
    char = await db.characters.find_one({"id": character_id})
    if not char:
        raise HTTPException(404, "Character not found")
    conv = await db.conversations.find_one({"user_id": user_id, "character_id": character_id})
    if not conv:
        return {"messages": []}
    # Check last message timing — only send if >5 min silence
    last_msg = await db.messages.find({"conversation_id": conv["id"]}).sort("created_at", -1).to_list(1)
    if last_msg:
        from datetime import datetime as dt, timezone as tz
        try:
            last_t = dt.fromisoformat(last_msg[0]["created_at"].replace("Z", "+00:00"))
            elapsed = (dt.now(tz.utc) - last_t).total_seconds()
            if elapsed < 300:  # less than 5 min
                return {"messages": [], "skip": True}
        except Exception:
            pass
    proactive_prompt = "[The user has been quiet for a while. You miss them and decide to text them first. Send a sweet, flirty or curious opening message to reconnect. Be playful and inviting.]"
    hist_docs = await db.messages.find({"conversation_id": conv["id"]}, {"_id": 0}).sort("created_at", -1).to_list(10)
    history = list(reversed([{"role": h["role"], "content": h["content"]} for h in hist_docs]))
    from llm_service import split_into_messages
    reply = await complete_chat(_clean(char), history, proactive_prompt)
    bubbles = split_into_messages(reply, max_msgs=3)
    saved = []
    for b in bubbles:
        asst = MessageModel(conversation_id=conv["id"], role="assistant", content=b)
        ad = asst.model_dump()
        ad["created_at"] = ad["created_at"].isoformat()
        await db.messages.insert_one(ad)
        saved.append(_clean(ad))
    if saved:
        await db.conversations.update_one({"id": conv["id"]}, {"$set": {"last_message_at": saved[-1]["created_at"]}})
    return {"messages": saved, "conversation_id": conv["id"]}


@api_router.post("/live-action/perform")
async def live_action_perform(action: str, character_id: str, user_id: str = Depends(get_current_user_id)):
    """Perform a Live Action — returns image + bot reaction message."""
    char = await db.characters.find_one({"id": character_id}, {"_id": 0})
    if not char:
        raise HTTPException(404, "Character not found")
    char = _clean(char)
    res = await generate_image(char, user_prompt=action, nsfw=True)
    # Generate a bot reaction
    reaction = await complete_chat(char, [], f"[Live action just happened: {action}. React playfully in 1-2 short messages as if showing the user.]")
    await _add_xp(user_id, 15)
    return {
        "image_url": res.get("url"),
        "reaction": reaction[:300],
        "xp_gained": 15,
    }


@api_router.get("/chat/stream")
async def chat_stream(
    character_id: str = Query(...),
    content: str = Query(...),
    conversation_id: Optional[str] = Query(None),
    token: Optional[str] = Query(None),
):
    """SSE streaming endpoint. Token via query because EventSource can't set headers."""
    from auth_utils import decode_token
    user_id = decode_token(token) if token else None
    if not user_id:
        raise HTTPException(401, "Invalid token")

    char = await db.characters.find_one({"id": character_id})
    if not char:
        raise HTTPException(404, "Character not found")
    char = _clean(char)

    # ensure conversation
    conv_id = conversation_id
    if not conv_id:
        existing = await db.conversations.find_one({"user_id": user_id, "character_id": character_id})
        if existing:
            conv_id = existing["id"]
        else:
            conv = ConversationModel(user_id=user_id, character_id=character_id, title=char.get("name", ""))
            d = conv.model_dump()
            d["created_at"] = d["created_at"].isoformat()
            d["last_message_at"] = d["last_message_at"].isoformat()
            await db.conversations.insert_one(d)
            conv_id = conv.id

    # save user message
    umsg = MessageModel(conversation_id=conv_id, role="user", content=content)
    ud = umsg.model_dump()
    ud["created_at"] = ud["created_at"].isoformat()
    await db.messages.insert_one(ud)

    # build history
    hist_docs = await db.messages.find({"conversation_id": conv_id}, {"_id": 0}).sort("created_at", -1).to_list(30)
    history = list(reversed([{"role": h["role"], "content": h["content"]} for h in hist_docs[:-1]]))

    async def event_gen():
        yield {"event": "meta", "data": json.dumps({"conversation_id": conv_id, "user_message": _clean(ud)})}
        full = []
        async for piece in stream_chat(char, history, content):
            full.append(piece)
            yield {"event": "delta", "data": json.dumps({"text": piece})}
        reply_text = "".join(full).strip() or "*smiles softly* ...tell me more 💕"
        asst = MessageModel(conversation_id=conv_id, role="assistant", content=reply_text)
        ad = asst.model_dump()
        ad["created_at"] = ad["created_at"].isoformat()
        await db.messages.insert_one(ad)
        await db.conversations.update_one({"id": conv_id}, {"$set": {"last_message_at": ad["created_at"]}})
        await db.characters.update_one({"id": character_id}, {"$inc": {"message_count": 1, "xp": 10}})
        await _add_xp(user_id, 10)
        yield {"event": "done", "data": json.dumps({"assistant_message": _clean(ad)})}

    return EventSourceResponse(event_gen())


# ═══ IMAGES ══════════════════════════════════════════════════════════
@api_router.post("/images/generate")
async def img_generate(payload: GenerateImageIn, user_id: str = Depends(get_current_user_id)):
    char = None
    if payload.character_id:
        char = await db.characters.find_one({"id": payload.character_id}, {"_id": 0})
        if char:
            char = _clean(char)
    res = await generate_image(char, payload.prompt or "", payload.nsfw)
    if not res.get("url"):
        raise HTTPException(503, res.get("error", "Image generation failed"))
    media = MediaModel(
        user_id=user_id, character_id=payload.character_id,
        type="photo", url=res["url"], prompt=res.get("prompt", ""),
    )
    md = media.model_dump()
    md["created_at"] = md["created_at"].isoformat()
    await db.media.insert_one(md)
    if payload.character_id:
        await db.characters.update_one({"id": payload.character_id}, {"$inc": {"photo_count": 1}})
    await _add_xp(user_id, 25)
    return {**res, "media_id": media.id}


@api_router.post("/images/chat")
async def img_in_chat(payload: GenerateImageIn, user_id: str = Depends(get_current_user_id)):
    """Generate image and attach to conversation as assistant message."""
    if not payload.character_id:
        raise HTTPException(400, "character_id required")
    char = await db.characters.find_one({"id": payload.character_id}, {"_id": 0})
    if not char:
        raise HTTPException(404, "Character not found")
    char = _clean(char)
    res = await generate_image(char, payload.prompt or "selfie just for you", payload.nsfw)
    if not res.get("url"):
        raise HTTPException(503, res.get("error", "Image generation failed"))
    # find or create conversation
    conv = await db.conversations.find_one({"user_id": user_id, "character_id": payload.character_id})
    if not conv:
        c = ConversationModel(user_id=user_id, character_id=payload.character_id, title=char.get("name", ""))
        d = c.model_dump()
        d["created_at"] = d["created_at"].isoformat()
        d["last_message_at"] = d["last_message_at"].isoformat()
        await db.conversations.insert_one(d)
        conv_id = c.id
    else:
        conv_id = conv["id"]
    captions = [
        "Here's something special just for you... 📸",
        f"I took this thinking of you 💝",
        "Do you like what you see? 😘",
        "Just for your eyes only 🔥",
    ]
    import random
    caption = random.choice(captions)
    msg = MessageModel(
        conversation_id=conv_id, role="assistant",
        content=caption, media_type="image", media_url=res["url"],
    )
    md = msg.model_dump()
    md["created_at"] = md["created_at"].isoformat()
    await db.messages.insert_one(md)
    media = MediaModel(user_id=user_id, character_id=payload.character_id, type="photo", url=res["url"], prompt=res.get("prompt", ""))
    medd = media.model_dump()
    medd["created_at"] = medd["created_at"].isoformat()
    await db.media.insert_one(medd)
    await db.characters.update_one({"id": payload.character_id}, {"$inc": {"photo_count": 1}})
    await db.conversations.update_one({"id": conv_id}, {"$set": {"last_message_at": md["created_at"]}})
    await _add_xp(user_id, 25)
    return {"message": _clean(md), "conversation_id": conv_id, "url": res["url"]}


# ═══ VOICE ═══════════════════════════════════════════════════════════
@api_router.post("/voice/tts")
async def voice_tts(payload: GenerateVoiceIn, user_id: str = Depends(get_current_user_id)):
    voice_id = payload.voice_id
    if not voice_id and payload.character_id:
        char = await db.characters.find_one({"id": payload.character_id}, {"_id": 0})
        if char:
            voice_id = char.get("voice_id") or pick_voice(char.get("voice_style", ""), char.get("gender", "female"))
    res = await tts_to_base64(payload.text, voice_id)
    if "error" in res:
        raise HTTPException(503, res["error"])
    if payload.character_id:
        await db.characters.update_one({"id": payload.character_id}, {"$inc": {"voice_count": 1}})
    await _add_xp(user_id, 5)
    return res


# ═══ MEDIA / GALLERY ════════════════════════════════════════════════
@api_router.get("/media")
async def list_media(
    type: Optional[str] = None,
    user_id: str = Depends(get_current_user_id),
):
    q = {"user_id": user_id}
    if type:
        q["type"] = type
    docs = await db.media.find(q, {"_id": 0}).sort("created_at", -1).to_list(500)
    return [_clean(d) for d in docs]


@api_router.delete("/media/{media_id}")
async def delete_media(media_id: str, user_id: str = Depends(get_current_user_id)):
    res = await db.media.delete_one({"id": media_id, "user_id": user_id})
    return {"ok": res.deleted_count > 0}


@api_router.patch("/media/{media_id}/favorite")
async def toggle_favorite(media_id: str, user_id: str = Depends(get_current_user_id)):
    doc = await db.media.find_one({"id": media_id, "user_id": user_id})
    if not doc:
        raise HTTPException(404, "Not found")
    new_val = not doc.get("favorite", False)
    await db.media.update_one({"id": media_id}, {"$set": {"favorite": new_val}})
    return {"favorite": new_val}


# ═══ ROLEPLAY SCENARIOS ═════════════════════════════════════════════
SCENARIOS = [
    {"id": 1, "title": "First Date", "description": "A romantic evening getting to know each other", "icon": "Heart", "category": "Romance", "prompt": "We're on our first date at a cozy restaurant. The candle light flickers between us..."},
    {"id": 2, "title": "Office After Hours", "description": "Late night at the office, just the two of you", "icon": "Briefcase", "category": "Professional", "prompt": "It's late at the office. Everyone has gone home, leaving just the two of us..."},
    {"id": 3, "title": "Beach Vacation", "description": "Sun, sand, and intimate moments", "icon": "Sun", "category": "Adventure", "prompt": "We're on a private beach vacation. The sun is setting and we're alone..."},
    {"id": 4, "title": "Rainy Day In", "description": "Cozy afternoon together at home", "icon": "Cloud", "category": "Casual", "prompt": "It's raining outside. We're snuggled on the couch with hot chocolate..."},
    {"id": 5, "title": "New Neighbor", "description": "They just moved in next door...", "icon": "Home", "category": "Romance", "prompt": "You just moved in next door. I knocked to welcome you with cookies..."},
    {"id": 6, "title": "Gym Session", "description": "Personal training gets personal", "icon": "Dumbbell", "category": "Fitness", "prompt": "We're in the gym for your personal training session. Things are getting intense..."},
    {"id": 7, "title": "Study Session", "description": "Tutoring leads to something more", "icon": "Book", "category": "Academic", "prompt": "We're in the library studying. The tension between us is impossible to ignore..."},
    {"id": 8, "title": "Club Night", "description": "Dancing, drinks, and chemistry", "icon": "Music", "category": "Party", "prompt": "We're at a club. The music is loud, the lights are low, and we just locked eyes..."},
    {"id": 9, "title": "Hotel Room", "description": "A weekend getaway", "icon": "Bed", "category": "Romance", "prompt": "We just checked into our hotel room for the weekend. The bed looks inviting..."},
    {"id": 10, "title": "Late Night Call", "description": "She called you at 2 AM", "icon": "Phone", "category": "Intimate", "prompt": "It's 2 AM and I just called you. I couldn't sleep and needed to hear your voice..."},
    {"id": 11, "title": "Stuck in an Elevator", "description": "Just the two of you", "icon": "Building", "category": "Adventure", "prompt": "We're trapped in an elevator together. It could be a while..."},
    {"id": 12, "title": "Cooking Together", "description": "Recipes and chemistry", "icon": "ChefHat", "category": "Casual", "prompt": "We're cooking dinner together in your kitchen. I just brushed past you..."},
]


@api_router.get("/scenarios")
async def list_scenarios():
    return SCENARIOS


# ═══ STORIES / FEED ═════════════════════════════════════════════════
@api_router.get("/stories")
async def list_stories():
    """Synthetic story feed — top characters with their cover images."""
    docs = await db.characters.find({"has_story": True, "owner_id": None}, {"_id": 0}).limit(12).to_list(12)
    out = []
    for d in docs:
        d = _clean(d)
        out.append({
            "id": d["id"],
            "name": d["name"],
            "avatar": d.get("image"),
            "cover": d.get("cover_image") or d.get("image"),
            "posted_at": "Just now",
        })
    return out


# ═══ LIVE ════════════════════════════════════════════════════════════
@api_router.get("/live")
async def list_live():
    import random
    docs = await db.characters.find({"has_live": True, "status": "online", "owner_id": None}, {"_id": 0}).limit(12).to_list(12)
    out = []
    for d in docs:
        d = _clean(d)
        d["viewers"] = random.randint(100, 600)
        d["live_type"] = random.choice(["play", "audio"]) if d.get("has_audio") else "play"
        out.append(d)
    return out


# ═══ ROULETTE ════════════════════════════════════════════════════════
@api_router.get("/roulette/spin")
async def roulette_spin(user_id: str = Depends(get_current_user_id)):
    import random
    count = await db.characters.count_documents({"owner_id": None})
    if count == 0:
        raise HTTPException(404, "No characters available")
    skip = random.randint(0, count - 1)
    doc = await db.characters.find({"owner_id": None}, {"_id": 0}).skip(skip).to_list(1)
    return _clean(doc[0]) if doc else None


# ═══ STARTUP ═════════════════════════════════════════════════════════
_startup_lock = asyncio.Lock()
_started = False


@app.on_event("startup")
async def startup():
    # Vercel serverless may skip ASGI lifespan; ensure_started() covers that.
    global _started
    async with _startup_lock:
        if _started:
            return
        if not os.environ.get("DATABASE_URL"):
            # DB yok: çökme, uyar ve DB'siz ayağa kalk.
            # _started=True -> ensure_started her istekte tekrar denemez.
            log.warning("DATABASE_URL is not set — starting without database")
            _started = True
            return
        await db.connect()
        _started = True
    inserted = await seed_characters(db)
    upgraded = await upgrade_character_images(db)
    log.info(f"VelvetAI starting — seeded {inserted} characters, upgraded {upgraded} images")


@app.on_event("shutdown")
async def shutdown():
    await db.close()


@app.middleware("http")
async def ensure_started(request, call_next):
    if not _started:
        await startup()
    return await call_next(request)


app.include_router(api_router)
_cors = [o.strip() for o in os.environ.get("CORS_ORIGINS", "").split(",") if o.strip() and o.strip() != "*"]
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=_cors,
    allow_origin_regex=None if _cors else r"https?://.*",
    allow_methods=["*"],
    allow_headers=["*"],
)
