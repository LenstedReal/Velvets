"""
Free Text-to-Speech via Microsoft Edge-TTS (uses Edge browser's free voices).
No API key required, no quota.
"""
import asyncio
import base64
import io
import edge_tts


# Curated free Edge voices mapped to character voice styles
VOICE_POOL = {
    "Sweet":         "en-US-JennyNeural",         # warm, sweet
    "Soft Whisper":  "en-US-AriaNeural",          # soft, conversational
    "Bold":          "en-US-NancyNeural",         # confident, bold
    "Seductive":     "en-US-AvaMultilingualNeural", # sultry, expressive
    "Cheerful":      "en-US-EmmaMultilingualNeural", # cheerful
    "Deep":          "en-US-GuyNeural",           # deep male
    "Breathy":       "en-US-MichelleNeural",      # breathy soft
    "Playful":       "en-US-AnaNeural",           # young, playful
}
DEFAULT_VOICE = "en-US-AvaMultilingualNeural"


def pick_voice(voice_style: str = "", gender: str = "female") -> str:
    if voice_style and voice_style in VOICE_POOL:
        return VOICE_POOL[voice_style]
    if gender == "male":
        return "en-US-GuyNeural"
    return DEFAULT_VOICE


async def tts_to_base64(text: str, voice_id: str | None = None) -> dict:
    voice = voice_id or DEFAULT_VOICE
    # Edge-TTS voice names sometimes pass through old ElevenLabs IDs — coerce
    if voice and not voice.endswith("Neural"):
        voice = DEFAULT_VOICE
    try:
        communicate = edge_tts.Communicate(
            text=text[:1500],
            voice=voice,
            rate="+0%",
            pitch="+0Hz",
        )
        buf = io.BytesIO()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                buf.write(chunk["data"])
        raw = buf.getvalue()
        if not raw:
            return {"error": "TTS returned no audio"}
        b64 = base64.b64encode(raw).decode("ascii")
        return {"audio_b64": b64, "mime": "audio/mpeg", "voice_id": voice}
    except Exception as e:
        return {"error": f"TTS failed: {str(e)[:200]}"}
