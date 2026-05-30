from pydantic import BaseModel, EmailStr
from datetime import datetime

class CandidateRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class CandidateLogin(BaseModel):
    email: EmailStr
    password: str

class CandidateToken(BaseModel):
    access_token: str
    token_type: str = "bearer"

class CandidateUserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    candidate_id: str | None = None
    created_at: datetime
