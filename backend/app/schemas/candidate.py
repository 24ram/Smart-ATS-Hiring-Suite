from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class CandidateStage(str, Enum):
    applied = "applied"
    screening = "screening"
    interview = "interview"
    technical = "technical"
    hr = "hr"
    offered = "offered"
    rejected = "rejected"
    hired = "hired"

class CandidateBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: Optional[str] = None
    skills: List[str] = []
    experience: Optional[str] = None
    resume_url: str

class CandidateCreate(CandidateBase):
    pass

class CandidateStageUpdate(BaseModel):
    stage: CandidateStage

class CandidateNoteAdd(BaseModel):
    note: str = Field(..., min_length=1)

class Activity(BaseModel):
    type: str
    message: str
    timestamp: datetime

class CandidateResponse(CandidateBase):
    id: str
    ai_score: Optional[float] = None
    stage: CandidateStage = CandidateStage.applied
    notes: List[str] = []
    matched_jobs: List[str] = []
    activities: List[Activity] = []
    created_at: datetime
    updated_at: Optional[datetime] = None

class AIAnalysisSummary(BaseModel):
    matched_skills: List[str]
    missing_skills: List[str]
    strengths: List[str]
    weaknesses: List[str]
    recommendation: str

class MatchedJobDetails(BaseModel):
    id: str
    title: str
    company: str
    ai_score: Optional[float] = None
    status: str

class CandidateDetailsResponse(CandidateResponse):
    ai_analysis: Optional[AIAnalysisSummary] = None
    matched_jobs_details: List[MatchedJobDetails] = []
