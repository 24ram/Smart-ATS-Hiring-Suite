from pydantic import BaseModel, HttpUrl
from typing import Optional, List
from datetime import datetime
from enum import Enum

class ApplicationStatus(str, Enum):
    applied = "applied"
    screening = "screening"
    interview = "interview"
    technical = "technical"
    hr = "hr"
    offer = "offer"
    offered = "offered"
    hired = "hired"
    rejected = "rejected"

class HMFeedback(str, Enum):
    hire = "Hire"
    hold = "Hold"
    reject = "Reject"

class ApplicationBase(BaseModel):
    job_id: str
    candidate_id: str
    cover_letter: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationUpdate(BaseModel):
    status: ApplicationStatus

class HMFeedbackUpdate(BaseModel):
    feedback: HMFeedback

class ApplicationResponse(ApplicationBase):
    id: str
    status: ApplicationStatus
    ai_score: Optional[float] = None
    candidate_name: Optional[str] = None
    candidate_email: Optional[str] = None
    job_title: Optional[str] = None
    hm_feedback: Optional[HMFeedback] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
