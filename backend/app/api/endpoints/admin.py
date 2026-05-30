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
    recruiters_count = await db.db["users"].count_documents({"role": {"$in": ["recruiter", "admin", "hiring_manager"]}})
    candidates_count = await db.db["candidate_users"].count_documents({})
    jobs_count = await db.db["jobs"].count_documents({})
    applications_count = await db.db["applications"].count_documents({})
    interviews_count = await db.db["interviews"].count_documents({})
    offers_count = await db.db["offers"].count_documents({})

    return {
        "total_recruiters": recruiters_count,
        "total_candidates": candidates_count,
        "total_jobs": jobs_count,
        "total_applications": applications_count,
        "total_interviews": interviews_count,
        "total_offers": offers_count
    }

@router.get("/recruiters", status_code=status.HTTP_200_OK)
async def get_all_recruiters(
    current_user: dict = Depends(require_role([UserRole.admin]))
) -> Any:
    cursor = db.db["users"].find({"role": {"$in": ["recruiter", "admin", "hiring_manager"]}}, {"hashed_password": 0}).sort("created_at", -1)
    users = await cursor.to_list(length=1000)
    for u in users:
        u["id"] = str(u["_id"])
        del u["_id"]
    return users
