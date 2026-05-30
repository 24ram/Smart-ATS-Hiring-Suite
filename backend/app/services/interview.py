from datetime import datetime
from bson import ObjectId
from app.db.mongodb import db
from app.schemas.interview import InterviewCreate, InterviewStatus
from app.services.email import send_interview_invitation_email
from app.services.candidate import get_candidate_by_id
from app.services.job import get_job_by_id

async def create_interview(interview_in: InterviewCreate) -> dict:
    interview_dict = interview_in.model_dump()
    interview_dict["created_at"] = datetime.utcnow()
    interview_dict["updated_at"] = interview_dict["created_at"]
    interview_dict["status"] = InterviewStatus.scheduled
    
    result = await db.db["interviews"].insert_one(interview_dict)
    
    # Trigger email notification
    candidate = await get_candidate_by_id(interview_in.candidate_id)
    job = await get_job_by_id(interview_in.job_id)
    
    # Update application status
    from app.services.application import update_application_status
    app_query = {"candidate_id": interview_in.candidate_id, "job_id": interview_in.job_id}
    if interview_in.application_id:
        app_query["_id"] = ObjectId(interview_in.application_id)
        
    app_record = await db.db["applications"].find_one(app_query)
    if app_record:
        await update_application_status(str(app_record["_id"]), "interview")
    
    if candidate and job and candidate.get("email"):
        await send_interview_invitation_email(
            to_email=candidate["email"],
            candidate_name=candidate.get("name", "Candidate"),
            job_title=job.get("title", "Unknown Job"),
            interviewer_name=interview_in.interviewer_name,
            scheduled_at=interview_in.scheduled_at.strftime("%Y-%m-%d %H:%M:%S") if isinstance(interview_in.scheduled_at, datetime) else str(interview_in.scheduled_at),
            meeting_link=interview_in.meeting_link
        )
        
    return await get_interview_by_id(str(result.inserted_id))

async def get_interview_by_id(interview_id: str) -> dict | None:
    try:
        interview = await db.db["interviews"].find_one({"_id": ObjectId(interview_id)})
        if interview:
            interview["id"] = str(interview["_id"])
        return interview
    except Exception:
        return None

async def get_interviews(candidate_id: str = None) -> list[dict]:
    query = {}
    if candidate_id:
        query["candidate_id"] = candidate_id
        
    cursor = db.db["interviews"].find(query).sort("scheduled_at", 1)
    interviews = await cursor.to_list(length=100)
    for i in interviews:
        i["id"] = str(i["_id"])
    return interviews

async def update_interview_status(interview_id: str, status: InterviewStatus) -> dict | None:
    await db.db["interviews"].update_one(
        {"_id": ObjectId(interview_id)},
        {"$set": {"status": status, "updated_at": datetime.utcnow()}}
    )
    return await get_interview_by_id(interview_id)

async def get_interview_analytics() -> dict:
    total = await db.db["interviews"].count_documents({})
    upcoming = await db.db["interviews"].count_documents({"status": "scheduled"})
    completed = await db.db["interviews"].count_documents({"status": "completed"})
    return {"total": total, "upcoming": upcoming, "completed": completed}
