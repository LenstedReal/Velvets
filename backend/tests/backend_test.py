"""
VelvetAI Backend Regression Suite — Post Postgres JSONB Migration
Covers: health, auth, characters (list/filters/create/delete),
conversations (create with opener, list-enriched, get messages, delete),
chat/send (multi-bubble), chat/stream SSE, images (Pollinations),
images/chat (attaches image to conversation), media CRUD + favorite,
voice (Edge-TTS), scenarios (12), stories, live, roulette,
discord oauth entry redirect, XP accumulation.
"""
import os
import re
import uuid
import time
import base64
import pytest
import requests

# Load BASE_URL from frontend/.env — no defaults
_env_url = None
try:
    _env_url = os.environ.get("REACT_APP_BACKEND_URL")
    if not _env_url:
        with open("/app/frontend/.env") as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    _env_url = line.split("=", 1)[1].strip()
                    break
except Exception:
    pass
assert _env_url, "REACT_APP_BACKEND_URL not set"
BASE_URL = _env_url.rstrip("/")
API = f"{BASE_URL}/api"


# ─── Fixtures ─────────────────────────────────────────────────────────
@pytest.fixture(scope="session")
def user_creds():
    uniq = uuid.uuid4().hex[:10]
    return {
        "email": f"TEST_pg_{uniq}@velvet.ai",
        "password": "Sup3rSecret!",
        "name": f"TEST_PG_{uniq}",
    }


@pytest.fixture(scope="session")
def token(user_creds):
    r = requests.post(f"{API}/auth/register", json=user_creds, timeout=30)
    assert r.status_code == 200, f"register failed: {r.status_code} {r.text}"
    return r.json()["access_token"]


@pytest.fixture(scope="session")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="session")
def user_id(auth_headers):
    r = requests.get(f"{API}/auth/me", headers=auth_headers, timeout=30)
    assert r.status_code == 200
    return r.json()["id"]


@pytest.fixture(scope="session")
def official_char_id():
    r = requests.get(f"{API}/characters?owner=official", timeout=30)
    assert r.status_code == 200
    chars = r.json()
    assert len(chars) > 0
    return chars[0]["id"]


@pytest.fixture(scope="session")
def shared_conversation(auth_headers, official_char_id):
    r = requests.post(f"{API}/conversations", json={"character_id": official_char_id},
                      headers=auth_headers, timeout=30)
    assert r.status_code == 200, r.text
    return r.json()["id"]


# ─── HEALTH ───────────────────────────────────────────────────────────
class TestHealth:
    def test_root(self):
        r = requests.get(f"{API}/", timeout=10)
        assert r.status_code == 200
        assert r.json() == {"app": "VelvetAI", "status": "ok"}


# ─── AUTH ─────────────────────────────────────────────────────────────
class TestAuth:
    def test_register(self, user_creds, token):
        assert isinstance(token, str) and len(token) > 20

    def test_duplicate_register_400(self, user_creds):
        r = requests.post(f"{API}/auth/register", json=user_creds, timeout=30)
        assert r.status_code == 400

    def test_login_ok(self, user_creds):
        r = requests.post(f"{API}/auth/login", json={
            "email": user_creds["email"], "password": user_creds["password"]}, timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert "access_token" in data
        u = data["user"]
        assert u["email"] == user_creds["email"].lower()
        assert u["level"] == 1
        assert isinstance(u["xp"], int)
        assert "password_hash" not in u

    def test_login_bad_creds_401(self, user_creds):
        r = requests.post(f"{API}/auth/login", json={
            "email": user_creds["email"], "password": "nope"}, timeout=30)
        assert r.status_code == 401

    def test_me(self, auth_headers, user_creds):
        r = requests.get(f"{API}/auth/me", headers=auth_headers, timeout=30)
        assert r.status_code == 200
        u = r.json()
        assert u["email"] == user_creds["email"].lower()
        assert "password_hash" not in u

    def test_me_unauth(self):
        r = requests.get(f"{API}/auth/me", timeout=15)
        assert r.status_code in (401, 403)

    def test_patch_me_updates_name(self, auth_headers):
        new_name = f"TEST_Renamed_{uuid.uuid4().hex[:5]}"
        r = requests.patch(f"{API}/auth/me", json={"name": new_name, "email": "hack@x.com"}, headers=auth_headers, timeout=30)
        assert r.status_code == 200, r.text
        u = r.json()
        assert u["name"] == new_name
        # email must remain untouched (not in allow-list)
        assert "hack@x.com" not in u.get("email", "")
        # GET verifies persistence
        r2 = requests.get(f"{API}/auth/me", headers=auth_headers, timeout=15)
        assert r2.json()["name"] == new_name


# ─── CHARACTERS ───────────────────────────────────────────────────────
class TestCharacters:
    def test_list_31_seeded(self):
        r = requests.get(f"{API}/characters?owner=official", timeout=30)
        assert r.status_code == 200
        chars = r.json()
        assert isinstance(chars, list)
        assert len(chars) == 31, f"expected 31 seeded, got {len(chars)}"
        for k in ("id", "name", "gender", "style"):
            assert k in chars[0]
        assert "_id" not in chars[0]
        assert all(c.get("owner_id") in (None, "") for c in chars)

    def test_filter_gender_female(self):
        r = requests.get(f"{API}/characters?gender=female&owner=official", timeout=30)
        assert r.status_code == 200
        chars = r.json()
        assert len(chars) > 0
        assert all(c["gender"] == "female" for c in chars)

    def test_filter_style_anime(self):
        r = requests.get(f"{API}/characters?style=anime&owner=official", timeout=30)
        assert r.status_code == 200
        chars = r.json()
        assert all(c["style"] == "anime" for c in chars)

    def test_get_one(self):
        cid = requests.get(f"{API}/characters?owner=official", timeout=30).json()[0]["id"]
        r = requests.get(f"{API}/characters/{cid}", timeout=15)
        assert r.status_code == 200
        assert r.json()["id"] == cid

    def test_get_404(self):
        r = requests.get(f"{API}/characters/nonexistent-xyz", timeout=15)
        assert r.status_code == 404

    def test_create_custom_and_filter_me_then_delete(self, auth_headers, user_id):
        payload = {
            "name": "TEST_CustomChar", "age": 25, "gender": "female",
            "style": "realistic", "ethnicity": "Caucasian",
            "hair_color": "Blonde", "hair_style": "Long", "eye_color": "Blue",
            "body_type": "Athletic", "personality": ["Playful", "Sweet"],
            "voice_style": "Sweet", "relationship": "girlfriend",
            "backstory": "Test backstory",
        }
        r = requests.post(f"{API}/characters", json=payload, headers=auth_headers, timeout=30)
        assert r.status_code == 200, r.text
        char = r.json()
        assert char["name"] == "TEST_CustomChar"
        assert char["owner_id"] == user_id
        assert char["is_custom"] is True
        cid = char["id"]

        # ?owner=me includes new char
        r2 = requests.get(f"{API}/characters?owner=me", headers=auth_headers, timeout=30)
        assert r2.status_code == 200
        assert cid in [c["id"] for c in r2.json()]

        # Default listing (no owner filter) for authed user should include own custom + official
        r3 = requests.get(f"{API}/characters", headers=auth_headers, timeout=30)
        assert r3.status_code == 200
        ids3 = [c["id"] for c in r3.json()]
        assert cid in ids3

        # Delete
        rd = requests.delete(f"{API}/characters/{cid}", headers=auth_headers, timeout=30)
        assert rd.status_code == 200
        assert rd.json()["ok"] is True

        r4 = requests.get(f"{API}/characters/{cid}", timeout=15)
        assert r4.status_code == 404

    def test_delete_official_forbidden(self, auth_headers):
        official = requests.get(f"{API}/characters?owner=official", timeout=30).json()[0]
        r = requests.delete(f"{API}/characters/{official['id']}", headers=auth_headers, timeout=30)
        assert r.status_code == 404


# ─── CONVERSATIONS ────────────────────────────────────────────────────
class TestConversations:
    def test_create_with_opener(self, auth_headers, official_char_id, shared_conversation):
        cid = official_char_id
        conv_id = shared_conversation
        # Verify conversation belongs to expected character
        convs = requests.get(f"{API}/conversations", headers=auth_headers, timeout=30).json()
        this_conv = next((c for c in convs if c["id"] == conv_id), None)
        assert this_conv is not None
        assert this_conv["character_id"] == cid

        time.sleep(0.4)
        r2 = requests.get(f"{API}/conversations/{conv_id}/messages", headers=auth_headers, timeout=30)
        assert r2.status_code == 200
        msgs = r2.json()
        assert len(msgs) >= 1
        if len(msgs) >= 2:
            assert msgs[0]["created_at"] <= msgs[-1]["created_at"]
        assert any(m["role"] == "assistant" for m in msgs)

    def test_list_enriched(self, auth_headers):
        r = requests.get(f"{API}/conversations", headers=auth_headers, timeout=30)
        assert r.status_code == 200
        convs = r.json()
        assert len(convs) >= 1
        assert any(c.get("character") is not None for c in convs)
        # Character should be embedded, not just id
        first = next(c for c in convs if c.get("character") is not None)
        assert "name" in first["character"]

    def test_conversations_unauth(self):
        r = requests.get(f"{API}/conversations", timeout=15)
        assert r.status_code in (401, 403)

    def test_delete_conversation_and_messages(self, auth_headers, official_char_id):
        # Create a fresh conv with a different official character to delete
        officials = requests.get(f"{API}/characters?owner=official", timeout=30).json()
        cid = next(c["id"] for c in officials if c["id"] != official_char_id)
        r = requests.post(f"{API}/conversations", json={"character_id": cid}, headers=auth_headers, timeout=30)
        assert r.status_code == 200
        conv_id = r.json()["id"]

        # messages exist (opener)
        r_msgs = requests.get(f"{API}/conversations/{conv_id}/messages", headers=auth_headers, timeout=30)
        assert r_msgs.status_code == 200
        assert len(r_msgs.json()) >= 1

        # delete
        rd = requests.delete(f"{API}/conversations/{conv_id}", headers=auth_headers, timeout=30)
        assert rd.status_code == 200
        assert rd.json()["ok"] is True

        # conversation gone => messages endpoint 404
        r_after = requests.get(f"{API}/conversations/{conv_id}/messages", headers=auth_headers, timeout=15)
        assert r_after.status_code == 404


# ─── CHAT ─────────────────────────────────────────────────────────────
class TestChat:
    def test_chat_send_multi_bubble_and_xp(self, auth_headers, official_char_id, shared_conversation):
        cid = official_char_id
        conv_id = shared_conversation

        # capture xp before
        me_before = requests.get(f"{API}/auth/me", headers=auth_headers, timeout=15).json()
        xp_before = me_before["xp"]

        payload = {"conversation_id": conv_id, "character_id": cid,
                   "content": "Say hi in one short sentence."}
        r = requests.post(f"{API}/chat/send", json=payload, headers=auth_headers, timeout=90)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["conversation_id"] == conv_id
        assert data["user_message"]["content"] == payload["content"]
        assert data["assistant_message"]["role"] == "assistant"
        # multi-bubble
        bubbles = data.get("assistant_messages")
        assert isinstance(bubbles, list) and 1 <= len(bubbles) <= 4
        for b in bubbles:
            assert b["role"] == "assistant"
            assert isinstance(b["content"], str) and len(b["content"]) > 0
        reply = data["assistant_message"]["content"]
        assert "I am an AI" not in reply and "I'm an AI language model" not in reply

        # verify xp increased by 10 (chat send is +10)
        me_after = requests.get(f"{API}/auth/me", headers=auth_headers, timeout=15).json()
        assert me_after["xp"] == xp_before + 10, f"xp before={xp_before} after={me_after['xp']}"

    def test_chat_send_persists_history(self, auth_headers, shared_conversation):
        conv_id = shared_conversation
        r = requests.get(f"{API}/conversations/{conv_id}/messages", headers=auth_headers, timeout=30)
        assert r.status_code == 200
        msgs = r.json()
        # should have opener + user + at least one assistant bubble = >= 3
        assert len(msgs) >= 3
        roles = [m["role"] for m in msgs]
        assert "user" in roles and "assistant" in roles

    def test_chat_stream_sse(self, token, official_char_id, shared_conversation):
        cid = official_char_id
        conv_id = shared_conversation
        params = {"character_id": cid, "content": "Say hi briefly.",
                  "conversation_id": conv_id, "token": token}
        with requests.get(f"{API}/chat/stream", params=params, stream=True, timeout=120) as r:
            assert r.status_code == 200, r.text[:300]
            ctype = r.headers.get("content-type", "")
            assert "text/event-stream" in ctype, f"got content-type: {ctype}"
            events, event_types = [], set()
            for i, line in enumerate(r.iter_lines(decode_unicode=True)):
                if line:
                    events.append(line)
                    if line.startswith("event:"):
                        event_types.add(line.split(":", 1)[1].strip())
                    elif line.startswith("event: "):
                        event_types.add(line.split(":", 1)[1].strip())
                if i > 400:
                    break
            blob = "\n".join(events)
            assert "meta" in blob, f"no 'meta' event: {blob[:400]}"
            assert "delta" in blob, f"no 'delta' events: {blob[:400]}"
            assert "done" in blob, f"no 'done' event: {blob[:400]}"

    def test_xp_accumulates_over_multiple_sends(self, auth_headers, official_char_id, shared_conversation):
        """Send 2 more chats and verify xp grows linearly (+10 each)."""
        cid = official_char_id
        conv_id = shared_conversation
        me_before = requests.get(f"{API}/auth/me", headers=auth_headers, timeout=15).json()
        xp_before = me_before["xp"]
        for i in range(2):
            payload = {"conversation_id": conv_id, "character_id": cid, "content": f"Ping {i}"}
            r = requests.post(f"{API}/chat/send", json=payload, headers=auth_headers, timeout=90)
            assert r.status_code == 200
        me_after = requests.get(f"{API}/auth/me", headers=auth_headers, timeout=15).json()
        assert me_after["xp"] == xp_before + 20, f"xp before={xp_before} after={me_after['xp']}"
        # level should be recalculated without error, still 1 (needs 500+ for level 2)
        assert me_after["level"] >= 1


# ─── IMAGES (Pollinations — FREE) ─────────────────────────────────────
@pytest.fixture(scope="session")
def generated_media_id(auth_headers, official_char_id):
    """Generates one image and returns media_id — shared across TestMedia."""
    payload = {"character_id": official_char_id, "prompt": "portrait smiling", "nsfw": False}
    r = requests.post(f"{API}/images/generate", json=payload, headers=auth_headers, timeout=120)
    if r.status_code != 200:
        pytest.skip(f"Pollinations unavailable ({r.status_code}): {r.text[:120]}")
    return r.json().get("media_id")


class TestImages:
    def test_images_generate(self, auth_headers, official_char_id):
        payload = {"character_id": official_char_id, "prompt": "portrait smiling", "nsfw": False}
        r = requests.post(f"{API}/images/generate", json=payload, headers=auth_headers, timeout=120)
        assert r.status_code in (200, 503), f"unexpected {r.status_code}: {r.text[:400]}"
        if r.status_code != 200:
            pytest.skip(f"Pollinations returned 503: {r.text[:120]}")
        data = r.json()
        assert "url" in data and data["url"]
        assert data["url"].startswith("http")
        assert "media_id" in data

    def test_images_chat_attaches_message(self, auth_headers, official_char_id):
        payload = {"character_id": official_char_id, "prompt": "selfie", "nsfw": False}
        r = requests.post(f"{API}/images/chat", json=payload, headers=auth_headers, timeout=120)
        assert r.status_code in (200, 503), f"unexpected {r.status_code}: {r.text[:400]}"
        if r.status_code != 200:
            pytest.skip("Pollinations unavailable")
        data = r.json()
        assert "message" in data and data["message"]["role"] == "assistant"
        assert data["message"].get("media_type") == "image"
        assert data["message"].get("media_url", "").startswith("http")
        assert "conversation_id" in data and data["conversation_id"]


# ─── MEDIA ────────────────────────────────────────────────────────────
class TestMedia:
    def test_list_media_sorted_desc(self, auth_headers, generated_media_id):
        r = requests.get(f"{API}/media", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        assert len(items) >= 1
        # Sorted newest first
        if len(items) >= 2:
            assert items[0]["created_at"] >= items[-1]["created_at"]
        assert any(m["id"] == generated_media_id for m in items)

    def test_favorite_toggle(self, auth_headers, generated_media_id):
        r1 = requests.patch(f"{API}/media/{generated_media_id}/favorite", headers=auth_headers, timeout=15)
        assert r1.status_code == 200
        first = r1.json()["favorite"]
        r2 = requests.patch(f"{API}/media/{generated_media_id}/favorite", headers=auth_headers, timeout=15)
        assert r2.status_code == 200
        assert r2.json()["favorite"] == (not first)

    def test_favorite_unknown_404(self, auth_headers):
        r = requests.patch(f"{API}/media/nonexistent-xyz/favorite", headers=auth_headers, timeout=15)
        assert r.status_code == 404

    def test_delete_media(self, auth_headers, generated_media_id):
        r = requests.delete(f"{API}/media/{generated_media_id}", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        assert r.json()["ok"] is True
        items = requests.get(f"{API}/media", headers=auth_headers, timeout=15).json()
        assert generated_media_id not in [m["id"] for m in items]

    def test_delete_unknown_media_ok_false(self, auth_headers):
        r = requests.delete(f"{API}/media/nonexistent-xyz", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        assert r.json()["ok"] is False


# ─── VOICE (Edge-TTS — FREE) ──────────────────────────────────────────
class TestVoice:
    def test_voice_tts(self, auth_headers, official_char_id):
        payload = {"text": "Hey there, this is a test.", "character_id": official_char_id}
        r = requests.post(f"{API}/voice/tts", json=payload, headers=auth_headers, timeout=60)
        assert r.status_code in (200, 503), f"unexpected {r.status_code}: {r.text[:300]}"
        if r.status_code == 200:
            data = r.json()
            assert "audio_b64" in data
            assert data["mime"] == "audio/mpeg"
            raw = base64.b64decode(data["audio_b64"])
            assert len(raw) > 500, f"audio too small: {len(raw)} bytes"


# ─── FEEDS / MISC ─────────────────────────────────────────────────────
class TestFeeds:
    def test_scenarios_12(self):
        r = requests.get(f"{API}/scenarios", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 12
        for s in data:
            for k in ("id", "title", "icon", "category", "prompt"):
                assert k in s

    def test_stories_max_12(self):
        r = requests.get(f"{API}/stories", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) <= 12
        if data:
            for k in ("id", "name", "avatar", "cover"):
                assert k in data[0]

    def test_live_max_12(self):
        r = requests.get(f"{API}/live", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert len(data) <= 12
        if data:
            assert "viewers" in data[0]
            assert "live_type" in data[0]


# ─── ROULETTE ─────────────────────────────────────────────────────────
class TestRoulette:
    def test_roulette_unauth(self):
        r = requests.get(f"{API}/roulette/spin", timeout=15)
        assert r.status_code in (401, 403)

    def test_roulette_returns_official(self, auth_headers):
        r = requests.get(f"{API}/roulette/spin", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        c = r.json()
        assert c is not None
        assert c.get("owner_id") in (None, "")
        assert "id" in c and "name" in c


# ─── DISCORD OAUTH ENTRY (do NOT complete flow) ───────────────────────
class TestDiscordOAuth:
    def test_login_redirects_to_discord(self):
        r = requests.get(f"{API}/auth/discord/login", allow_redirects=False, timeout=15)
        assert r.status_code in (302, 307), f"expected redirect, got {r.status_code}"
        loc = r.headers.get("location", "")
        assert "discord.com/oauth2/authorize" in loc
        # required params
        for p in ("client_id=", "redirect_uri=", "response_type=code", "scope="):
            assert p in loc, f"missing {p} in redirect location"


# ─── STATUS (legacy) ─────────────────────────────────────────────────
class TestStatusLegacy:
    def test_post_and_get_status(self):
        payload = {"client_name": f"TEST_client_{uuid.uuid4().hex[:6]}"}
        r = requests.post(f"{API}/status", json=payload, timeout=15)
        assert r.status_code == 200
        body = r.json()
        assert body["client_name"] == payload["client_name"]
        assert "id" in body

        r2 = requests.get(f"{API}/status", timeout=15)
        assert r2.status_code == 200
        items = r2.json()
        assert any(i["client_name"] == payload["client_name"] for i in items)
