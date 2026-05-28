from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class JobStatus(str, Enum):
    draft = "draft"
    published = "published"
    closed = "closed"

class EmploymentType(str, Enum):
    full_time = "full_time"
    part_time = "part_time"
    contract = "contract"
    internship = "internship"

class JobBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=100)
    company: str = Field(..., min_length=2, max_length=100)
    location: str
    employment_type: EmploymentType
    description: str
    requirements: List[str] = []
    salary_range: Optional[str] = None
    status: JobStatus = JobStatus.published

class JobCreate(JobBase):
    pass

class JobUpdate(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[EmploymentType] = None
    description: Optional[str] = None
    requirements: Optional[List[str]] = None
    salary_range: Optional[str] = None
    status: Optional[JobStatus] = None

class JobResponse(JobBase):
    id: str
    created_by: str
    created_at: datetime
