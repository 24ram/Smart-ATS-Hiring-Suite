from fastapi import APIRouter, Depends, status
from typing import Any
from app.api.deps import require_role
from app.schemas.user import UserRole
from app.db.mongodb import db

router = APIRouter()

@router.get("/stats", status_code=status.HTTP_200_OK)
async def get_admin_stats(
    current_user: dict = Depends(require_role([UserRole.admin]))
) -> Any:
    # Get total counts for all collections
    recruiters_count = await db.db["users"].count_documents({"role": "recruiter"})
    hm_count = await db.db["users"].count_documents({"role": "hiring_manager"})
    candidates_count = await db.db["candidate_users"].count_documents({})
    jobs_count = await db.db["jobs"].count_documents({})
    applications_count = await db.db["applications"].count_documents({})
    interviews_count = await db.db["interviews"].count_documents({})
    offers_count = await db.db["offers"].count_documents({})

    return {
        "total_recruiters": recruiters_count,
        "total_hiring_managers": hm_count,
        "total_candidates": candidates_count,
        "total_jobs": jobs_count,
        "total_applications": applications_count,
        "total_interviews": interviews_count,
        "total_offers": offers_count
    }

@router.get("/users", status_code=status.HTTP_200_OK)
async def get_users(
    role: str = None,
    current_user: dict = Depends(require_role([UserRole.admin]))
) -> Any:
    query = {"role": {"$ne": "admin"}}
    if role:
        query["role"] = role
        
    cursor = db.db["users"].find(query, {"hashed_password": 0}).sort("created_at", -1)
    users = await cursor.to_list(length=1000)
    for u in users:
        u["id"] = str(u["_id"])
        del u["_id"]
        if "status" not in u:
            u["status"] = "approved" # legacy fallback
    return users

from pydantic import BaseModel
class StatusUpdate(BaseModel):
    status: str

from bson import ObjectId
from fastapi import HTTPException

@router.put("/users/{user_id}/status", status_code=status.HTTP_200_OK)
async def update_user_status(
    user_id: str,
    status_update: StatusUpdate,
    current_user: dict = Depends(require_role([UserRole.admin]))
) -> Any:
    if status_update.status not in ["pending", "approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    result = await db.db["users"].update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"status": status_update.status}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
        
    user = await db.db["users"].find_one({"_id": ObjectId(user_id)}, {"hashed_password": 0})
    user["id"] = str(user["_id"])
    del user["_id"]
    return user
