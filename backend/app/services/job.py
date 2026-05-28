from datetime import datetime
from bson import ObjectId
from fastapi import HTTPException, status
from app.db.mongodb import db
from app.schemas.job import JobCreate, JobUpdate
from app.schemas.user import UserRole

async def get_jobs(skip: int = 0, limit: int = 100) -> list[dict]:
    cursor = db.db["jobs"].find().skip(skip).limit(limit)
    jobs = await cursor.to_list(length=limit)
    for job in jobs:
        job["id"] = str(job["_id"])
    return jobs

async def get_job_by_id(job_id: str) -> dict | None:
    try:
        job = await db.db["jobs"].find_one({"_id": ObjectId(job_id)})
        if job:
            job["id"] = str(job["_id"])
        return job
    except Exception:
        return None

async def create_job(job_in: JobCreate, current_user: dict) -> dict:
    job_dict = job_in.model_dump()
    job_dict["created_by"] = current_user["id"]
    job_dict["created_at"] = datetime.utcnow()
    
    result = await db.db["jobs"].insert_one(job_dict)
    created_job = await get_job_by_id(str(result.inserted_id))
    return created_job

async def update_job(job_id: str, job_in: JobUpdate, current_user: dict) -> dict:
    job = await get_job_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    if job["created_by"] != current_user["id"] and current_user["role"] != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Not authorized to update this job"
        )

    update_data = job_in.model_dump(exclude_unset=True)
    if update_data:
        await db.db["jobs"].update_one(
            {"_id": ObjectId(job_id)},
            {"$set": update_data}
        )
    return await get_job_by_id(job_id)

async def delete_job(job_id: str, current_user: dict) -> bool:
    job = await get_job_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    if job["created_by"] != current_user["id"] and current_user["role"] != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Not authorized to delete this job"
        )
        
    result = await db.db["jobs"].delete_one({"_id": ObjectId(job_id)})
    return result.deleted_count > 0
