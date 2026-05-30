from typing import Any
from fastapi import APIRouter, Depends
from app.services.analytics import get_overview_stats, get_pipeline_stats, get_ai_score_stats, get_recent_activity, get_recommendation_distribution
from app.api.deps import require_role
from app.schemas.user import UserRole

router = APIRouter()

@router.get("/overview")
async def get_overview(
    current_user: dict = Depends(require_role([UserRole.recruiter, UserRole.admin, UserRole.hiring_manager]))
) -> Any:
    overview = await get_overview_stats()
    
    # Also fetch interview stats
    from app.services.interview import get_interview_analytics
    interview_stats = await get_interview_analytics()
    overview["interviews"] = interview_stats
    
    return overview

@router.get("/pipeline")
async def get_pipeline(
    current_user: dict = Depends(require_role([UserRole.recruiter, UserRole.admin, UserRole.hiring_manager]))
) -> Any:
    return await get_pipeline_stats()

@router.get("/ai-scores")
async def get_ai_scores(
    current_user: dict = Depends(require_role([UserRole.recruiter, UserRole.admin, UserRole.hiring_manager]))
) -> Any:
    return await get_ai_score_stats()

@router.get("/recent-activity")
async def get_activity(
    current_user: dict = Depends(require_role([UserRole.recruiter, UserRole.admin, UserRole.hiring_manager]))
) -> Any:
    return await get_recent_activity()

@router.get("/recommendations")
async def get_recommendations(
    current_user: dict = Depends(require_role([UserRole.recruiter, UserRole.admin, UserRole.hiring_manager]))
) -> Any:
    return await get_recommendation_distribution()
