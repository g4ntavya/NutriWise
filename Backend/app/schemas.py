from typing import Optional, Literal, List
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
Role = Literal["user", "admin"]

class ApiError(BaseModel):
    detail: str = Field(..., examples=["Email already exists"])

class UserBase(BaseModel):
    email: EmailStr = Field(..., examples=["alex@example.com"])
    display_name: Optional[str] = Field(None, examples=["Alex Doe"])
    phone: Optional[str] = Field(None, examples=["+1-555-0101"])
    role: Role = Field("user", examples=["user"])
    is_active: bool = Field(True, examples=[True])

class UserCreate(UserBase):
    created_at: str
    updated_at: str
    """Payload for creating a user."""

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = Field(None, examples=["newmail@example.com"])
    display_name: Optional[str] = Field(None, examples=["New Name"])
    phone: Optional[str] = Field(None, examples=["+91-9876543210"])
    role: Optional[Role] = Field(None, examples=["admin"])
    is_active: Optional[bool] = Field(None, examples=[False])

class UserOut(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

class UsersList(BaseModel):
    total: int = Field(..., examples=[42])
    items: List[UserOut]
