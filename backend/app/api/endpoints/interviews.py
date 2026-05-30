from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.interview import InterviewCreate, InterviewResponse, InterviewUpdate
from app.services.interview import create_interview, get_interviews, get_interview_by_id, update_interview_status
from app.api.deps import get_current_user, require_role
from app.schemas.user import UserRole
from app.services.candidate import add_candidate_activity

router = APIRouter()

@router.post("/", response_model=InterviewResponse, status_code=status.HTTP_201_CREATED)
async def create_new_interview(
    interview_in: InterviewCreate,
    current_user: dict = Depends(require_role([UserRole.recruiter, UserRole.admin, UserRole.hiring_manager]))
) -> Any:
    # Append activity event to candidate
    await add_candidate_activity(
        interview_in.candidate_id, 
        "Interview Scheduled", 
        f"Interview scheduled with {interview_in.interviewer_name} on {interview_in.scheduled_at.strftime('%Y-%m-%d %H:%M')}"
    )
    return await create_interview(interview_in)

@router.get("/", response_model=List[InterviewResponse])
async def read_interviews(
    candidate_id: str = None,
    current_user: dict = Depends(get_current_user)
) -> Any:
    return await get_interviews(candidate_id)

@router.get("/{candidate_id}", response_model=List[InterviewResponse])
async def read_interviews_for_candidate(
    candidate_id: str,
    current_user: dict = Depends(get_current_user)
) -> Any:
    return await get_interviews(candidate_id)

@router.patch("/{interview_id}/status", response_model=InterviewResponse)
async def update_status(
    interview_id: str,
    status_update: InterviewUpdate,
    current_user: dict = Depends(require_role([UserRole.recruiter, UserRole.admin, UserRole.hiring_manager]))
) -> Any:
    interview = await get_interview_by_id(interview_id)
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
        
    updated = await update_interview_status(interview_id, status_update.status)
    
    # Append activity to candidate
    if status_update.status == "completed":
        await add_candidate_activity(
            interview["candidate_id"], 
            "Interview Completed", 
            f"Interview with {interview['interviewer_name']} was completed."
        )
    elif status_update.status == "cancelled":
        await add_candidate_activity(
            interview["candidate_id"], 
            "Interview Cancelled", 
            f"Interview with {interview['interviewer_name']} was cancelled."
        )
        
    return updated
