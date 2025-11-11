from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, Boolean, DateTime, text
from typing import Optional
import uuid

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"

    # Store UUID as string (CHAR(36)) for MySQL
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    display_name: Mapped[Optional[str]] = mapped_column(String(255))
    phone: Mapped[Optional[str]] = mapped_column(String(32))
    role: Mapped[str] = mapped_column(String(10), nullable=False, default="user")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    created_at: Mapped[str] = mapped_column(
        DateTime(timezone=False), server_default=text("CURRENT_TIMESTAMP")
    )
    updated_at: Mapped[str] = mapped_column(
        DateTime(timezone=False),
        server_default=text("CURRENT_TIMESTAMP"),
        server_onupdate=text("CURRENT_TIMESTAMP")
    )
    deleted_at: Mapped[Optional[str]] = mapped_column(DateTime(timezone=False), nullable=True)
