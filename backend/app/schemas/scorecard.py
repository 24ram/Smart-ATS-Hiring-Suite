from pydantic import BaseModel, Field
from typing import Dict, Optional, List
from datetime import datetime
from enum import Enum

class Recommendation(str, Enum):
    strong_hire = "strong_hire"
    hire = "hire"
    neutral = "neutral"
    no_hire = "no_hire"
    strong_no_hire = "strong_no_hire"

class ScorecardBase(BaseModel):
    interview_id: str
    candidate_id: str
    evaluator_name: str
    ratings: Dict[str, int] = Field(description="Dynamic key-value pairs for rating categories (1-5)")
    overall_score: float
    feedback_text: str
    recommendation: Recommendation

class ScorecardCreate(ScorecardBase):
    pass

class ScorecardResponse(ScorecardBase):
    id: str
    created_at: datetime
