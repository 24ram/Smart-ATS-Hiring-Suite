from datetime import datetime
from bson import ObjectId
from app.db.mongodb import db
from app.schemas.scorecard import ScorecardCreate
from app.schemas.interview import InterviewStatus
from app.services.candidate import add_candidate_activity

async def create_scorecard(scorecard_in: ScorecardCreate) -> dict:
    scorecard_dict = scorecard_in.model_dump()
    scorecard_dict["created_at"] = datetime.utcnow()
    
    # Save scorecard
    result = await db.db["scorecards"].insert_one(scorecard_dict)
    
    # Mark interview as completed
    await db.db["interviews"].update_one(
        {"_id": ObjectId(scorecard_in.interview_id)},
        {"$set": {"status": InterviewStatus.completed.value, "updated_at": datetime.utcnow()}}
    )
    
    # Add activity to candidate timeline
    rec_text = scorecard_in.recommendation.value.replace("_", " ").title()
    await add_candidate_activity(
        scorecard_in.candidate_id,
        "Scorecard Submitted",
        f"Scorecard submitted by {scorecard_in.evaluator_name}. Recommendation: {rec_text} (Score: {scorecard_in.overall_score:.1f}/5)"
    )
    
    return await get_scorecard_by_id(str(result.inserted_id))

async def get_scorecard_by_id(scorecard_id: str) -> dict | None:
    try:
        scorecard = await db.db["scorecards"].find_one({"_id": ObjectId(scorecard_id)})
        if scorecard:
            scorecard["id"] = str(scorecard["_id"])
        return scorecard
    except Exception:
        return None

async def get_scorecards_by_candidate(candidate_id: str) -> list[dict]:
    cursor = db.db["scorecards"].find({"candidate_id": candidate_id}).sort("created_at", -1)
    scorecards = await cursor.to_list(length=100)
    for s in scorecards:
        s["id"] = str(s["_id"])
    return scorecards
