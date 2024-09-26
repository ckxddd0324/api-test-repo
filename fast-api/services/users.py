from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

user_router = APIRouter(tags=["Users"])

# Pydantic model for User


class User(BaseModel):
    id: int
    username: str
    email: str
    full_name: str | None = None


# Mock database
users_db: dict[int, User] = {}


@user_router.post("/", response_model=User, status_code=201)
async def create_user(user: User):
    if user.id in users_db:
        raise HTTPException(status_code=400, detail="User already exists")
    users_db[user.id] = user
    return user


@user_router.get("/", response_model=List[User])
async def read_users():
    return list(users_db.values())


@user_router.get("/{user_id}", response_model=User)
async def read_user(user_id: int):
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="User not found")
    return users_db[user_id]


@user_router.put("/{user_id}", response_model=User)
async def update_user(user_id: int, updated_user: User):
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="User not found")
    if user_id != updated_user.id:
        raise HTTPException(status_code=400, detail="User ID mismatch")
    users_db[user_id] = updated_user
    return updated_user


@user_router.delete("/{user_id}", response_model=User)
async def delete_user(user_id: int):
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="User not found")
    user = users_db.pop(user_id)
    return user
