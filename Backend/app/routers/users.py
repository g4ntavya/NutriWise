from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Body, status
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone
from app.deps import db_session
from app.schemas import UserCreate, UserOut, UserUpdate, ApiError, UsersList
from app.crud.users import (
    create_user, get_user_by_email, get_user_by_id, list_users,
    update_user as repo_update_user,
    soft_delete_user, hard_delete_user
)





router = APIRouter(prefix="/users", tags=["Users"])


@router.post(
    "",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
    responses={409: {"model": ApiError}},
    summary="Create user",
    description="Create a new user. Email must be unique."
)
async def create_user_ep(payload: UserCreate, session: AsyncSession = Depends(db_session)):
    print("payload", payload)
    if await get_user_by_email(session, payload.email):
        raise HTTPException(status_code=409, detail="Email already exists")
    user = await create_user(session, **payload.model_dump())
    print("user", user)
    return UserOut.model_validate(user.__dict__)

@router.get(
    "",
    response_model=UsersList,
    summary="List users",
    description="Paginated list of users with optional search, sort, and soft-deleted inclusion."
)
async def list_users_ep(
    q: Optional[str] = Query(None, description="Search by email or display_name"),
    include_deleted: bool = Query(False, description="Include soft-deleted rows"),
    sort: str = Query("created_at", description="Sort by: created_at, email, display_name, role"),
    order: str = Query("desc", description="asc|desc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    session: AsyncSession = Depends(db_session)
):
    limit = page_size
    offset = (page - 1) * page_size
    total, rows = await list_users(session, q, include_deleted, sort, order, limit, offset)
    items = [UserOut.model_validate(r.__dict__,  from_attributes=True) for r in rows]
    print("items,", items)
    return {"total": total, "items": items}

@router.get(
    "/{user_id}",
    response_model=UserOut,
    responses={404: {"model": ApiError}},
    summary="Get user by ID"
)
async def get_user_ep(user_id: str, session: AsyncSession = Depends(db_session)):
    user = await get_user_by_id(session, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    return UserOut.model_validate(user.__dict__, from_attributes=True)

@router.patch(
    "/{user_id}",
    response_model=UserOut,
    responses={404: {"model": ApiError}, 409: {"model": ApiError}},
    summary="Update user (partial)"
)
async def update_user_ep(
    user_id: str,
    payload: UserUpdate = Body(
        ...,
        openapi_examples={
            "makeAdmin": {"summary": "Promote to admin", "value": {"role": "admin"}},
            "deactivate": {"summary": "Deactivate user", "value": {"is_active": False}}
        }
    ),
    session: AsyncSession = Depends(db_session)
):
    user = await get_user_by_id(session, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    if payload.email:
        existing = await get_user_by_email(session, payload.email)
        if existing and existing.id != user.id:
            raise HTTPException(409, "Email already exists")
    data = payload.model_dump(exclude_unset=True)
    print("data", data)
    updated = await repo_update_user(session, user, data)
    return UserOut.model_validate(updated.__dict__, from_attributes=True)

@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={404: {"model": ApiError}},
    summary="Delete user",
    description="Soft delete by default. Pass `hard=true` to permanently delete."
)
async def delete_user_ep(
    user_id: str,
    hard: bool = Query(False, description="Hard delete row if true"),
    session: AsyncSession = Depends(db_session)
):
    user = await get_user_by_id(session, user_id)
    print("user", user)
    if not user:
        raise HTTPException(404, "User not found")
    if hard:
       result= await hard_delete_user(session, user)
    else:
        result = await soft_delete_user(session, user)
    return result
