from datetime import datetime
from bson import ObjectId
from app.db.mongodb import db
from app.schemas.candidate_auth import CandidateRegister
from app.core.security import get_password_hash, verify_password

async def get_candidate_by_email(email: str) -> dict | None:
    return await db.db["candidate_users"].find_one({"email": email})

async def get_candidate_user(user_id: str) -> dict | None:
    try:
        user = await db.db["candidate_users"].find_one({"_id": ObjectId(user_id)})
        if user:
            user["id"] = str(user["_id"])
        return user
    except Exception:
        return None

async def create_candidate_user(data: CandidateRegister) -> dict:
    now = datetime.utcnow()
    user_dict = {
        "name": data.name,
        "email": data.email,
        "hashed_password": get_password_hash(data.password),
        "candidate_id": None,
        "created_at": now
    }
    result = await db.db["candidate_users"].insert_one(user_dict)
    return await get_candidate_user(str(result.inserted_id))

async def authenticate_candidate(email: str, password: str) -> dict | None:
    user = await get_candidate_by_email(email)
    if not user:
        return None
    if not verify_password(password, user["hashed_password"]):
        return None
    user["id"] = str(user["_id"])
    return user
