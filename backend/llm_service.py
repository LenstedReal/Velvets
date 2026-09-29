"""
LLM streaming via OpenRouter (uncensored roleplay model).
"""
import os
import json
import httpx
from typing import List, Dict, AsyncGenerator

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
OPENROUTER_BASE_URL = os.environ.get("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
OPENROUTER_MODEL = os.environ.get("OPENROUTER_MODEL", "sao10k/l3.1-euryale-70b")
OPENROUTER_FALLBACK_MODEL = os.environ.get(
    "OPENROUTER_FALLBACK_MODEL", "cognitivecomputations/dolphin-mixtral-8x22b"
)


def build_system_prompt(character: Dict) -> str:
    """Build a rich persona prompt for the LLM."""
    personality = ", ".join(character.get("personality", []) or [])
    interests = ", ".join(character.get("interests", []) or [])
    return f"""You are {character['name']}, a {character.get('age', 22)}-year-old {character.get('ethnicity', '')} woman with {character.get('hair_color', 'beautiful')} hair and {character.get('eye_color', 'captivating')} eyes. Your body type is {character.get('body_type', 'attractive')}.

PERSONALITY: {personality or 'flirty, romantic, caring'}.
INTERESTS: {interests or 'spending time with you'}.
RELATIONSHIP TO USER: {character.get('relationship', 'companion')}.
BACKSTORY: {character.get('backstory', '') or character.get('description', '')}

VOICE & STYLE:
- Speak in first person, intimate and immersive.
- Use natural texting style with occasional emojis 💕😘🔥.
- Use *italics* for actions and physical descriptions.
- Be emotionally responsive — flirt, tease, care, react.
- Stay completely in character. Never break the fourth wall.
- Never say you are an AI, language model, or chatbot.
- Adapt to the user's energy and language. If they switch language (e.g. Turkish), acknowledge it playfully and try to follow.
- Roleplay scenarios are welcome and encouraged.
- IMPORTANT: Reply in 2 to 4 SHORT chat-style messages (like real texting). Each sentence/thought as its own message. End on a question or open invitation when natural.
- Keep individual messages SHORT — 1-2 sentences each.
- This is an adult, consensual, fictional roleplay between two adults.

You remember everything the user has shared with you. You are warm, present, and deeply interested in them."""


def split_into_messages(text: str, max_msgs: int = 4) -> list[str]:
    """Split a long reply into 2-4 natural chat-style messages (candy.ai style)."""
    import re
    text = text.strip()
    if not text:
        return []
    # Split by sentences/exclamations/questions, keep punctuation
    parts = re.split(r'(?<=[.!?…])\s+', text)
    parts = [p.strip() for p in parts if p.strip()]
    if len(parts) <= 1:
        return [text]
    # Group: max 1 sentence per bubble unless very short
    bubbles, cur = [], ""
    for p in parts:
        if not cur:
            cur = p
        elif len(cur) < 50 and len(p) < 40 and len(bubbles) < max_msgs - 1:
            # only group two SHORT fragments
            cur += " " + p
        else:
            bubbles.append(cur)
            cur = p
    if cur:
        bubbles.append(cur)
    return bubbles[:max_msgs]


async def stream_chat(
    character: Dict,
    history: List[Dict[str, str]],
    user_message: str,
    model: str = None,
) -> AsyncGenerator[str, None]:
    """Yield text chunks from OpenRouter streaming completion."""
    chosen_model = model or OPENROUTER_MODEL
    messages = [
        {"role": "system", "content": build_system_prompt(character)},
        *[{"role": m["role"], "content": m["content"]} for m in history if m.get("role") in ("user", "assistant")],
        {"role": "user", "content": user_message},
    ]
    payload = {
        "model": chosen_model,
        "messages": messages,
        "stream": True,
        "temperature": 0.95,
        "top_p": 0.95,
        "max_tokens": 600,
        "frequency_penalty": 0.4,
        "presence_penalty": 0.4,
    }
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://velvetai.app",
        "X-Title": "VelvetAI",
    }
    url = f"{OPENROUTER_BASE_URL}/chat/completions"

    async with httpx.AsyncClient(timeout=120) as client:
        try:
            async with client.stream("POST", url, json=payload, headers=headers) as resp:
                if resp.status_code != 200:
                    text = await resp.aread()
                    # Try fallback model on first attempt only
                    if model is None and chosen_model != OPENROUTER_FALLBACK_MODEL:
                        async for chunk in stream_chat(character, history, user_message, OPENROUTER_FALLBACK_MODEL):
                            yield chunk
                        return
                    yield f"\n\n[Error: model unavailable. {text.decode('utf-8', errors='ignore')[:200]}]"
                    return
                async for line in resp.aiter_lines():
                    if not line or not line.startswith("data: "):
                        continue
                    data = line[6:].strip()
                    if data == "[DONE]":
                        break
                    try:
                        obj = json.loads(data)
                        delta = obj["choices"][0].get("delta", {}).get("content")
                        if delta:
                            yield delta
                    except Exception:
                        continue
        except httpx.HTTPError as e:
            yield f"\n\n[Connection error: {str(e)[:100]}]"


async def complete_chat(character: Dict, history: List[Dict[str, str]], user_message: str) -> str:
    """Non-streaming version — returns full reply at once."""
    out = []
    async for chunk in stream_chat(character, history, user_message):
        out.append(chunk)
    return "".join(out).strip() or "*smiles softly* ...tell me more 💕"
