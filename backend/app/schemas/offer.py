from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

class OfferStatus(str, Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"

class OfferCreate(BaseModel):
    candidate_id: str
    job_id: str
    application_id: Optional[str] = None
    salary: str
    joining_date: datetime

class OfferUpdate(BaseModel):
    salary: Optional[str] = None
    joining_date: Optional[datetime] = None
    status: Optional[OfferStatus] = None

class OfferResponse(BaseModel):
    id: str
    candidate_id: str
    job_id: str
    application_id: Optional[str] = None
    candidate_name: str
    job_title: str
    salary: str
    joining_date: datetime
    status: OfferStatus
    offer_letter_url: Optional[str] = None
    created_by: str
    created_at: datetime
    updated_at: datetime
    sent_at: Optional[datetime] = None
    viewed_at: Optional[datetime] = None
    responded_at: Optional[datetime] = None
