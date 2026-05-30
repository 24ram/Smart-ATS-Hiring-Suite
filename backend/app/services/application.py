from datetime import datetime
from bson import ObjectId
from app.db.mongodb import db
from app.schemas.application import ApplicationCreate, ApplicationStatus

async def create_application(app_in: ApplicationCreate, candidate: dict, job: dict, score: float) -> dict:
    app_dict = app_in.model_dump()
    app_dict["status"] = ApplicationStatus.applied
    app_dict["created_at"] = datetime.utcnow()
    app_dict["updated_at"] = app_dict["created_at"]
    
    # Store denormalized data for easy querying
    app_dict["candidate_name"] = candidate["name"]
    app_dict["candidate_email"] = candidate["email"]
    app_dict["job_title"] = job.get("title", "Unknown")
    app_dict["ai_score"] = score
    
    result = await db.db["applications"].insert_one(app_dict)
    return await get_application_by_id(str(result.inserted_id))

async def get_application_by_id(app_id: str) -> dict | None:
    try:
        app = await db.db["applications"].find_one({"_id": ObjectId(app_id)})
        if app:
            app["id"] = str(app["_id"])
        return app
    except Exception:
        return None

async def _enrich_and_format_applications(apps: list[dict]) -> list[dict]:
    # Collect candidate IDs to fetch missing AI scores
    candidate_ids = []
    for a in apps:
        cid = a.get("candidate_id")
        if cid and ObjectId.is_valid(cid):
            candidate_ids.append(ObjectId(cid))
            
    candidate_map = {}
    if candidate_ids:
        candidates_cursor = db.db["candidates"].find({"_id": {"$in": candidate_ids}})
        candidates = await candidates_cursor.to_list(length=1000)
        candidate_map = {str(c["_id"]): c for c in candidates}

    for a in apps:
        a["id"] = str(a["_id"])
        
        # Defensive status mapping
        status = a.get("status", "")
        status_str = status.lower() if isinstance(status, str) else str(status)
        if status_str == "pending":
            a["status"] = "applied"
        elif status_str == "reviewed":
            a["status"] = "screening"
            
        if "name" in a and "candidate_name" not in a:
            a["candidate_name"] = a["name"]
        if "email" in a and "candidate_email" not in a:
            a["candidate_email"] = a["email"]
            
        # Enrich AI Score from Candidate Profile if missing or to keep it synchronized
        cid = a.get("candidate_id")
        candidate = candidate_map.get(str(cid))
        if candidate and candidate.get("ai_score") is not None:
            a["ai_score"] = candidate["ai_score"]
            
    return apps

async def get_applications_by_job(job_id: str) -> list[dict]:
    cursor = db.db["applications"].find({"job_id": job_id}).sort("created_at", -1)
    apps = await cursor.to_list(length=500)
    return await _enrich_and_format_applications(apps)

async def get_applications_by_candidate(candidate_id: str) -> list[dict]:
    cursor = db.db["applications"].find({"candidate_id": candidate_id}).sort("created_at", -1)
    apps = await cursor.to_list(length=500)
    return await _enrich_and_format_applications(apps)

from app.schemas.user import UserRole

async def get_all_applications(current_user: dict = None) -> list[dict]:
    query = {}
    if current_user and current_user.get("role") == UserRole.hiring_manager:
        hm_jobs = await db.db["jobs"].find({"assigned_hiring_manager_id": current_user["id"]}).to_list(length=None)
        job_ids = [str(j["_id"]) for j in hm_jobs]
        query["job_id"] = {"$in": job_ids}

    cursor = db.db["applications"].find(query).sort("created_at", -1)
    apps = await cursor.to_list(length=500)
    return await _enrich_and_format_applications(apps)

async def update_application_status(app_id: str, status: ApplicationStatus | str) -> dict | None:
    status_val = status.value if hasattr(status, "value") else status
    await db.db["applications"].update_one(
        {"_id": ObjectId(app_id)},
        {"$set": {"status": status_val, "updated_at": datetime.utcnow()}}
    )
    return await get_application_by_id(app_id)

async def update_application_feedback(app_id: str, feedback: str) -> dict | None:
    await db.db["applications"].update_one(
        {"_id": ObjectId(app_id)},
        {"$set": {"hm_feedback": feedback, "updated_at": datetime.utcnow()}}
    )
    return await get_application_by_id(app_id)
