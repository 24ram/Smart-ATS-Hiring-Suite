from datetime import datetime
from bson import ObjectId
from fastapi import HTTPException
from app.db.mongodb import db
from app.schemas.candidate import CandidateCreate, CandidateStage

from app.schemas.user import UserRole

async def get_candidates(skip: int = 0, limit: int = 100, current_user: dict = None) -> list[dict]:
    query = {}
    if current_user and current_user.get("role") == UserRole.hiring_manager:
        hm_jobs = await db.db["jobs"].find({"assigned_hiring_manager_id": current_user["id"]}).to_list(length=None)
        job_ids = [str(j["_id"]) for j in hm_jobs]
        hm_apps = await db.db["applications"].find({"job_id": {"$in": job_ids}}).to_list(length=None)
        candidate_ids = [app["candidate_id"] for app in hm_apps]
        query["_id"] = {"$in": [ObjectId(cid) for cid in candidate_ids if ObjectId.is_valid(cid)]}

    cursor = db.db["candidates"].find(query).skip(skip).limit(limit)
    candidates = await cursor.to_list(length=limit)
    for c in candidates:
        c["id"] = str(c["_id"])
    return candidates

async def get_candidate_by_id(candidate_id: str) -> dict | None:
    try:
        candidate = await db.db["candidates"].find_one({"_id": ObjectId(candidate_id)})
        if candidate:
            candidate["id"] = str(candidate["_id"])
        return candidate
    except Exception:
        return None

async def create_candidate(candidate_in: CandidateCreate) -> dict:
    candidate_dict = candidate_in.model_dump()
    candidate_dict["created_at"] = datetime.utcnow()
    candidate_dict["updated_at"] = candidate_dict["created_at"]
    candidate_dict["stage"] = CandidateStage.applied
    candidate_dict["notes"] = []
    candidate_dict["matched_jobs"] = []
    candidate_dict["activities"] = [{
        "type": "Candidate Created",
        "message": "Candidate profile was created in the system.",
        "timestamp": datetime.utcnow()
    }]
    candidate_dict["ai_analysis"] = None
    
    result = await db.db["candidates"].insert_one(candidate_dict)
    created_candidate = await get_candidate_by_id(str(result.inserted_id))
    return created_candidate

async def delete_candidate(candidate_id: str) -> bool:
    result = await db.db["candidates"].delete_one({"_id": ObjectId(candidate_id)})
    return result.deleted_count > 0

async def update_candidate_score(candidate_id: str, score: float) -> dict:
    await db.db["candidates"].update_one(
        {"_id": ObjectId(candidate_id)},
        {"$set": {"ai_score": score, "updated_at": datetime.utcnow()}}
    )
    return await get_candidate_by_id(candidate_id)

async def update_candidate_match_details(candidate_id: str, score: float, job_id: str, ai_analysis: dict) -> dict:
    await db.db["candidates"].update_one(
        {"_id": ObjectId(candidate_id)},
        {
            "$set": {
                "ai_score": score, 
                "updated_at": datetime.utcnow(),
                "ai_analysis": ai_analysis
            },
            "$addToSet": {
                "matched_jobs": job_id
            }
        }
    )
    return await get_candidate_by_id(candidate_id)

async def update_candidate_stage(candidate_id: str, stage: CandidateStage) -> bool:
    result = await db.db["candidates"].update_one(
        {"_id": ObjectId(candidate_id)},
        {
            "$set": {
                "stage": stage.value,
                "updated_at": datetime.utcnow()
            }
        }
    )

    # Also update the most recent application to reflect this stage
    app_status = stage.value
    if app_status in ["technical", "hr"]:
        app_status = "interview"
    elif app_status == "offered":
        app_status = "offer"
        
    cursor = db.db["applications"].find({"candidate_id": candidate_id}).sort("created_at", -1).limit(1)
    latest_apps = await cursor.to_list(length=1)
    if latest_apps:
        await db.db["applications"].update_one(
            {"_id": latest_apps[0]["_id"]},
            {"$set": {"status": app_status, "updated_at": datetime.utcnow()}}
        )

    return result.modified_count > 0

async def add_candidate_note(candidate_id: str, note: str, user_name: str) -> dict:
    full_note = f"[{datetime.utcnow().strftime('%Y-%m-%d %H:%M')}] {user_name}: {note}"
    await db.db["candidates"].update_one(
        {"_id": ObjectId(candidate_id)},
        {"$push": {"notes": full_note}, "$set": {"updated_at": datetime.utcnow()}}
    )
    await add_candidate_activity(candidate_id, "Notes Added", f"Note added by {user_name}.")
    return await get_candidate_by_id(candidate_id)

async def add_candidate_activity(candidate_id: str, activity_type: str, message: str) -> bool:
    activity = {
        "type": activity_type,
        "message": message,
        "timestamp": datetime.utcnow()
    }
    result = await db.db["candidates"].update_one(
        {"_id": ObjectId(candidate_id)},
        {"$push": {"activities": activity}, "$set": {"updated_at": datetime.utcnow()}}
    )
    return result.modified_count > 0
