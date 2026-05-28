from typing import List
from fastapi import APIRouter, Depends, HTTPException, status

from app.schemas.job import JobCreate, JobUpdate, JobResponse
from app.services.job import (
    create_job,
    get_jobs,
    get_job_by_id,
    update_job,
    delete_job
)
from app.api.deps import get_current_user, require_role
from app.schemas.user import UserRole

router = APIRouter()


@router.post("/", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_new_job(
    job_in: JobCreate,
    current_user: dict = Depends(
        require_role([
            UserRole.recruiter,
            UserRole.admin,
            UserRole.hiring_manager
        ])
    )
):
    return await create_job(job_in, current_user)


@router.get("/", response_model=List[JobResponse])
async def read_jobs(
    skip: int = 0,
    limit: int = 100,
    current_user: dict = Depends(get_current_user)
):
    return await get_jobs(skip=skip, limit=limit)


@router.get("/{job_id}", response_model=JobResponse)
async def read_job(
    job_id: str,
    current_user: dict = Depends(get_current_user)
):
    job = await get_job_by_id(job_id)

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )

    return job


@router.put("/{job_id}", response_model=JobResponse)
async def update_existing_job(
    job_id: str,
    job_in: JobUpdate,
    current_user: dict = Depends(
        require_role([
            UserRole.recruiter,
            UserRole.admin,
            UserRole.hiring_manager
        ])
    )
):
    return await update_job(job_id, job_in, current_user)


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_job(
    job_id: str,
    current_user: dict = Depends(
        require_role([
            UserRole.recruiter,
            UserRole.admin
        ])
    )
):
    await delete_job(job_id, current_user)