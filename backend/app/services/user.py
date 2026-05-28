from datetime import datetime
from bson import ObjectId
from fastapi import HTTPException, status
from app.db.mongodb import db
from app.schemas.user import UserCreate, UserInDB
from app.core.security import get_password_hash

async def get_user_by_email(email: str) -> dict | None:
    user = await db.db["users"].find_one({"email": email})
    if user:
        user["id"] = str(user["_id"])
    return user

async def get_user_by_id(user_id: str) -> dict | None:
    try:
        user = await db.db["users"].find_one({"_id": ObjectId(user_id)})
        if user:
            user["id"] = str(user["_id"])
        return user
    except Exception:
        return None

async def create_user(user_in: UserCreate) -> dict:
    existing_user = await get_user_by_email(user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )
    
    user_dict = user_in.model_dump()
    password = user_dict.pop("password")
    user_dict["hashed_password"] = get_password_hash(password)
    user_dict["created_at"] = datetime.utcnow()
    
    result = await db.db["users"].insert_one(user_dict)
    
    created_user = await get_user_by_id(str(result.inserted_id))
    return created_user
