from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.scorecard import ScorecardCreate, ScorecardResponse
from app.services.scorecard import create_scorecard, get_scorecards_by_candidate
from app.api.deps import get_current_user, require_role
from app.schemas.user import UserRole
from app.services.interview import get_interview_by_id

router = APIRouter()

@router.post("/", response_model=ScorecardResponse, status_code=status.HTTP_201_CREATED)
async def submit_scorecard(
    scorecard_in: ScorecardCreate,
    current_user: dict = Depends(require_role([UserRole.recruiter, UserRole.admin, UserRole.hiring_manager]))
) -> Any:
    interview = await get_interview_by_id(scorecard_in.interview_id)
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
        
    return await create_scorecard(scorecard_in)

@router.get("/candidate/{candidate_id}", response_model=List[ScorecardResponse])
async def read_candidate_scorecards(
    candidate_id: str,
    current_user: dict = Depends(get_current_user)
) -> Any:
    return await get_scorecards_by_candidate(candidate_id)
