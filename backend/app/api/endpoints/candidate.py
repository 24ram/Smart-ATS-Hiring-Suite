from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from typing import List, Any
from app.api.endpoints.candidate_auth import get_current_candidate_user
from app.services.candidate_portal import get_open_jobs, get_job_details, apply_for_job, get_candidate_applications, get_candidate_profile, update_candidate_profile, upload_candidate_resume_portal, get_candidate_interviews, get_candidate_offers, update_candidate_offer_status
from app.schemas.candidate_portal import CandidateProfileUpdate

router = APIRouter()

@router.get("/jobs", status_code=status.HTTP_200_OK)
async def read_candidate_jobs(
    current_user: dict = Depends(get_current_candidate_user)
) -> Any:
    return await get_open_jobs()

@router.get("/jobs/{job_id}", status_code=status.HTTP_200_OK)
async def read_candidate_job(
    job_id: str,
    current_user: dict = Depends(get_current_candidate_user)
) -> Any:
    job = await get_job_details(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.post("/jobs/{job_id}/apply", status_code=status.HTTP_201_CREATED)
async def apply_job(
    job_id: str,
    current_user: dict = Depends(get_current_candidate_user)
) -> Any:
    return await apply_for_job(job_id, current_user)

@router.get("/applications", status_code=status.HTTP_200_OK)
async def read_candidate_applications(
    current_user: dict = Depends(get_current_candidate_user)
) -> Any:
    return await get_candidate_applications(current_user)

@router.get("/profile", status_code=status.HTTP_200_OK)
async def read_candidate_profile(
    current_user: dict = Depends(get_current_candidate_user)
) -> Any:
    return await get_candidate_profile(current_user)

@router.put("/profile", status_code=status.HTTP_200_OK)
async def update_candidate_profile_endpoint(
    update_data: CandidateProfileUpdate,
    current_user: dict = Depends(get_current_candidate_user)
) -> Any:
    return await update_candidate_profile(current_user, update_data)

@router.post("/profile/resume", status_code=status.HTTP_200_OK)
async def upload_candidate_resume_endpoint(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_candidate_user)
) -> Any:
    # Validate extension
    file_ext = file.filename.split('.')[-1].lower()
    if file_ext not in ['pdf', 'docx']:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported.")
        
    content = await file.read()
    return await upload_candidate_resume_portal(current_user, content, file.filename)

@router.get("/interviews", status_code=status.HTTP_200_OK)
async def read_candidate_interviews(
    current_user: dict = Depends(get_current_candidate_user)
) -> Any:
    return await get_candidate_interviews(current_user)

@router.get("/offers", status_code=status.HTTP_200_OK)
async def read_candidate_offers(
    current_user: dict = Depends(get_current_candidate_user)
) -> Any:
    return await get_candidate_offers(current_user)

from pydantic import BaseModel

class OfferResponseRequest(BaseModel):
    response: str

@router.put("/offers/{offer_id}/respond", status_code=status.HTTP_200_OK)
async def respond_to_offer(
    offer_id: str,
    payload: OfferResponseRequest,
    current_user: dict = Depends(get_current_candidate_user)
) -> Any:
    if payload.response not in ["accepted", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid response")
    return await update_candidate_offer_status(current_user, offer_id, payload.response)
