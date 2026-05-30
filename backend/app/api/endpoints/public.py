from typing import List, Any
from fastapi import APIRouter, HTTPException
from app.schemas.job import JobResponse
from app.services.job import get_jobs, get_job_by_id

router = APIRouter()

@router.get("/jobs", response_model=List[JobResponse])
async def read_public_jobs() -> Any:
    # Get all jobs, but we must filter by status="published".
    # Since our get_jobs might not have a status filter built-in yet, 
    # we can fetch all and filter in memory, or pass status if it supports it.
    jobs = await get_jobs(skip=0, limit=1000)
    published_jobs = [j for j in jobs if j.get("status") == "published"]
    return published_jobs

@router.get("/jobs/{job_id}", response_model=JobResponse)
async def read_public_job(job_id: str) -> Any:
    job = await get_job_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.get("status") != "published":
        raise HTTPException(status_code=403, detail="Job is not published")
    return job
