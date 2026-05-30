from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

class InterviewStatus(str, Enum):
    scheduled = "scheduled"
    completed = "completed"
    cancelled = "cancelled"

class InterviewBase(BaseModel):
    candidate_id: str
    job_id: str
    application_id: Optional[str] = None
    interviewer_name: str
    scheduled_at: datetime
    meeting_link: str

class InterviewCreate(InterviewBase):
    pass

class InterviewUpdate(BaseModel):
    status: InterviewStatus

class InterviewResponse(InterviewBase):
    id: str
    status: InterviewStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
