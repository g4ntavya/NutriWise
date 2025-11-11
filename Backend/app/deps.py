from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_session

async def db_session(session: AsyncSession = Depends(get_session)) -> AsyncSession:
    return session
