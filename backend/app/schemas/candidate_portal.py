from pydantic import BaseModel
from typing import Optional, List

class CandidateProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    skills: Optional[List[str]] = None
    experience: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
