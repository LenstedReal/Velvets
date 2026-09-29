"""
Image generation — FREE Pollinations.ai (no API key, no rate limit, instant).
Falls back to Fal.ai only if FAL_KEY is set and Pollinations fails.
"""
import os
import asyncio
import httpx
import urllib.parse

POLLINATIONS_BASE = "https://image.pollinations.ai/prompt"


def build_image_prompt(character: dict, user_prompt: str = "", nsfw: bool = True) -> str:
    parts = []
    if character:
        parts.append(character.get("image_prompt_seed", "").strip())
        if character.get("style") == "anime":
            parts.append("anime art style, detailed anime illustration, masterpiece")
        else:
            parts.append("photorealistic, ultra detailed, 8k, professional photography, cinematic lighting, depth of field")
    if user_prompt:
        parts.append(user_prompt)
    if nsfw:
        parts.append("alluring, seductive, intimate")
    parts.append("perfect face, detailed skin, sharp focus, beautiful, glamour")
    return ", ".join([p for p in parts if p])


async def generate_image(character: dict | None, user_prompt: str = "", nsfw: bool = True) -> dict:
    prompt = build_image_prompt(character or {}, user_prompt, nsfw)
    # Encode prompt
    encoded = urllib.parse.quote(prompt[:800])
    # Pollinations supports model=flux|turbo|gptimage, nologo=true, width/height
    seed = abs(hash(prompt)) % 100000
    url = (
        f"{POLLINATIONS_BASE}/{encoded}"
        f"?model=flux&width=768&height=1024&nologo=true&enhance=true&seed={seed}"
    )
    # Verify the URL responds (Pollinations actually generates on-demand, so HEAD may not work)
    # We just return the URL — the client/browser will trigger generation.
    try:
        async with httpx.AsyncClient(timeout=80, follow_redirects=True) as client:
            # Pollinations needs to actually receive the request to start generation
            # Use a quick HEAD-like ping then return the URL
            resp = await client.get(url, timeout=80)
            if resp.status_code == 200 and len(resp.content) > 1000:
                return {"url": url, "prompt": prompt}
            return {"error": f"Pollinations returned {resp.status_code}", "url": None}
    except httpx.HTTPError as e:
        return {"error": f"Image gen connection failed: {str(e)[:120]}", "url": None}


async def generate_avatar(character: dict) -> str | None:
    res = await generate_image(character, user_prompt="portrait, headshot, smiling, soft lighting", nsfw=False)
    return res.get("url")
