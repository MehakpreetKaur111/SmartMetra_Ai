from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


# ---------- Auth ----------
class RegisterIn(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=120)
    password: str = Field(min_length=8, max_length=128)
    role: str = "CONSUMER"
    language: str = "en"


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    roles: list[str]


class RoleOut(BaseModel):
    name: str
    class Config:
        from_attributes = True


class UserOut(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    language: str
    roles: list[RoleOut]
    class Config:
        from_attributes = True


# ---------- Products ----------
class ProductOut(BaseModel):
    id: str
    name: str
    description: str | None
    category: str | None
    ocr_text: str | None
    image_quality: float | None
    is_demo: bool
    created_at: datetime
    class Config:
        from_attributes = True


class OCRResponse(BaseModel):
    product_id: str
    engine: str
    raw_text: str
    blocks: list[dict]
    image_quality: float
    warning: str | None = None


# ---------- Standards ----------
class StandardOut(BaseModel):
    id: str
    is_number: str
    title: str
    scope: str | None
    category: str | None
    department: str | None
    standard_type: str | None
    status: str | None
    certification: str | None
    source_url: str | None
    verification_status: str
    is_demo: bool
    class Config:
        from_attributes = True


# ---------- Match ----------
class MatchIn(BaseModel):
    product_id: str | None = None
    product_name: str | None = None
    description: str | None = None
    specs: dict[str, str] | None = None
    language: str = "en"
    demo: bool = True


class RetrievedStandard(BaseModel):
    is_number: str
    title: str
    category: str | None
    relevance: str
    why: str
    source_url: str | None
    verification_status: str
    score: float | None


class MatchOut(BaseModel):
    ai_summary: str
    missing_info: list[str]
    retrieved: list[RetrievedStandard]
    demo: bool


# ---------- Verification ----------
class VerificationIn(BaseModel):
    recommendation_id: str
    decision: str
    new_value: str
    comment: str | None = None


class VerificationOut(BaseModel):
    id: str
    recommendation_id: str
    decision: str
    old_value: str | None
    new_value: str | None
    comment: str | None
    created_at: datetime
    class Config:
        from_attributes = True


# ---------- Assistant ----------
class AskIn(BaseModel):
    question: str
    language: str = "en"


class SourceOut(BaseModel):
    is_number: str
    title: str
    source_url: str | None
    verification_status: str


class AskOut(BaseModel):
    answer: str
    language: str
    sources: list[SourceOut]
    verification_required: bool