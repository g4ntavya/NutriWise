from typing import Optional, Tuple, List
from sqlalchemy import select, func, asc, desc, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import User

def _ilike_mysql(col, q: str):
    # MySQL has no ILIKE; do lower() LIKE lower('%q%')
    return func.lower(col).like(f"%{q.lower()}%")

async def create_user(session: AsyncSession, **data) -> User:
    user = User(**data)
    session.add(user)
    await session.flush()
    return user

async def get_user_by_email(session: AsyncSession, email: str) -> Optional[User]:
    res = await session.execute(select(User).where(User.email == email))
    return res.scalar_one_or_none()

async def get_user_by_id(session: AsyncSession, user_id: str) -> Optional[User]:
    res = await session.execute(select(User).where(User.id == user_id))
    return res.scalar_one_or_none()

async def list_users(
    session: AsyncSession, q: Optional[str], include_deleted: bool,
    sort: str, order: str, limit: int, offset: int
) -> Tuple[int, List[User]]:
    print("inside list users")
    stmt = select(User)
    if not include_deleted:
        stmt = stmt.where(User.deleted_at.is_(None))
    if q:
        stmt = stmt.where(
            _ilike_mysql(User.email, q) | _ilike_mysql(User.display_name, q)
        )

    # count
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = (await session.execute(count_stmt)).scalar() or 0

    # sort + order
    sort_field = sort if sort in {"created_at","email","display_name","role"} else "created_at"
    col = getattr(User, sort_field)
    col = desc(col) if order == "desc" else asc(col)

    rows = (await session.execute(stmt.order_by(col).limit(limit).offset(offset))).scalars().all()
    return total, rows

async def update_user(session: AsyncSession, user: User, data: dict) -> User:
    for k, v in data.items():
        setattr(user, k, v)
    session.add(user)
    await session.flush()
    return user

async def soft_delete_user(session: AsyncSession, user: User) -> bool:
    from datetime import datetime
    user.is_active = False
    user.deleted_at = datetime.utcnow()
    session.add(user)
    await session.flush()
    return True

async def hard_delete_user(session: AsyncSession, user: User) -> bool:
    await session.delete(user)
    await session.flush()
    return True
