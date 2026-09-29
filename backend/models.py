"""
VelvetAI MongoDB Document Models
"""
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, EmailStr, ConfigDict
import uuid


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def new_id() -> str:
    return str(uuid.uuid4())


# ─── Users ──────────────────────────────────────────────────────────
class UserModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=new_id)
    email: str
    password_hash: str
    name: str
    avatar: str = ""
    level: int = 1
    xp: int = 0
    total_messages: int = 0
    provider: str = "email"
    created_at: datetime = Field(default_factory=utc_now)
    settings: Dict[str, Any] = Field(default_factory=lambda: {
        "nsfw": True,
        "notifications": True,
        "sound_effects": True,
    })


class UserPublic(BaseModel):
    id: str
    email: str
    name: str
    avatar: str
    level: int
    xp: int
    total_messages: int
    provider: str
    created_at: datetime
    settings: Dict[str, Any]


# ─── Characters ─────────────────────────────────────────────────────
class CharacterModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=new_id)
    owner_id: Optional[str] = None  # None = official preset
    name: str
    age: int
    gender: str = "female"          # female | male
    style: str = "realistic"        # realistic | anime
    ethnicity: str = ""
    hair_color: str = ""
    hair_style: str = ""
    eye_color: str = ""
    body_type: str = ""
    personality: List[str] = Field(default_factory=list)
    voice_style: str = ""
    voice_id: str = ""              # ElevenLabs voice id
    relationship: str = ""
    backstory: str = ""
    description: str = ""
    image: str = ""                 # main portrait
    cover_image: str = ""
    gallery: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    interests: List[str] = Field(default_factory=list)
    has_story: bool = True
    has_live: bool = True
    has_audio: bool = True
    is_new: bool = False
    level: int = 1
    xp: int = 0
    message_count: int = 0
    photo_count: int = 0
    video_count: int = 0
    voice_count: int = 0
    status: str = "online"
    is_custom: bool = False
    is_public: bool = True
    image_prompt_seed: str = ""     # base prompt for consistent image gen
    nsfw: bool = True
    created_at: datetime = Field(default_factory=utc_now)


# ─── Conversations & Messages ───────────────────────────────────────
class ConversationModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=new_id)
    user_id: str
    character_id: str
    title: str = ""
    last_message_at: datetime = Field(default_factory=utc_now)
    created_at: datetime = Field(default_factory=utc_now)


class MessageModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=new_id)
    conversation_id: str
    role: str                       # user | assistant | system
    content: str
    media_type: Optional[str] = None  # image | video | audio
    media_url: Optional[str] = None
    audio_url: Optional[str] = None  # voice playback url
    created_at: datetime = Field(default_factory=utc_now)


# ─── Generated Media ────────────────────────────────────────────────
class MediaModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=new_id)
    user_id: str
    character_id: Optional[str] = None
    type: str                        # photo | video | voice
    url: str
    prompt: str = ""
    thumbnail: Optional[str] = None
    favorite: bool = False
    created_at: datetime = Field(default_factory=utc_now)


# ─── Auth Schemas ───────────────────────────────────────────────────
class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    name: Optional[str] = None


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


# ─── Chat Schemas ───────────────────────────────────────────────────
class SendMessageIn(BaseModel):
    conversation_id: Optional[str] = None
    character_id: str
    content: str


class CreateConversationIn(BaseModel):
    character_id: str


# ─── Image / Voice Schemas ──────────────────────────────────────────
class GenerateImageIn(BaseModel):
    character_id: Optional[str] = None
    prompt: Optional[str] = None
    style: str = "realistic"
    nsfw: bool = True


class GenerateVoiceIn(BaseModel):
    text: str
    voice_id: Optional[str] = None
    character_id: Optional[str] = None


# ─── Character Create ───────────────────────────────────────────────
class CreateCharacterIn(BaseModel):
    name: str
    age: int = 25
    gender: str = "female"
    style: str = "realistic"
    ethnicity: str = ""
    hair_color: str = ""
    hair_style: str = ""
    eye_color: str = ""
    body_type: str = ""
    personality: List[str] = Field(default_factory=list)
    voice_style: str = ""
    relationship: str = ""
    backstory: str = ""
