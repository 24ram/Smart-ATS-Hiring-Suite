from fastapi import APIRouter
from app.api.endpoints import jobs, auth, candidates, analytics, interviews, scorecards, applications, public, offers, candidate_auth, candidate, admin

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
api_router.include_router(candidates.router, prefix="/candidates", tags=["candidates"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(interviews.router, prefix="/interviews", tags=["interviews"])
api_router.include_router(scorecards.router, prefix="/scorecards", tags=["scorecards"])
api_router.include_router(applications.router, prefix="/applications", tags=["applications"])
api_router.include_router(public.router, prefix="/public", tags=["public"])
api_router.include_router(offers.router, prefix="/offers", tags=["offers"])
api_router.include_router(candidate_auth.router, prefix="/candidate-auth", tags=["candidate-auth"])
api_router.include_router(candidate.router, prefix="/candidate", tags=["candidate"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
