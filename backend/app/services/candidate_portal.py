from datetime import datetime
from bson import ObjectId
from fastapi import HTTPException
from app.db.mongodb import db
from app.services.job import get_job_by_id
from app.services.candidate import create_candidate, get_candidate_by_id, add_candidate_activity
from app.schemas.candidate_portal import CandidateProfileUpdate
from app.utils.resume_parser import parse_resume
from app.utils.ai_analysis import analyze_candidate_match
from app.services.email import send_offer_response_email
import os
import uuid

def serialize_mongo_document(document):
    if isinstance(document, list):
        return [serialize_mongo_document(item) for item in document]
    elif isinstance(document, dict):
        return {key: serialize_mongo_document(value) for key, value in document.items()}
    elif isinstance(document, ObjectId):
        return str(document)
    return document

async def get_open_jobs() -> list[dict]:
    cursor = db.db["jobs"].find({"status": "published"}).sort("created_at", -1)

    jobs = await cursor.to_list(length=100)

    for job in jobs:
        job["id"] = str(job["_id"])

    return serialize_mongo_document(jobs)

async def get_job_details(job_id: str) -> dict | None:
    job = await get_job_by_id(job_id)

    if not job:
        return None

    job["id"] = str(job.get("_id", ""))

    return serialize_mongo_document(job)

async def apply_for_job(job_id: str, current_candidate_user: dict) -> dict:
    job = await get_job_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    candidate_user_id = current_candidate_user["id"]
    email = current_candidate_user["email"]
    name = current_candidate_user["name"]
    
    # 1. Check if application already exists
    existing_app = await db.db["applications"].find_one({
        "job_id": job_id,
        "email": email
    })
    
    if existing_app:
        raise HTTPException(status_code=400, detail="You have already applied for this job")
        
    # 2. Get or create Candidate profile
    candidate_profile_id = current_candidate_user.get("candidate_id")
    
    if not candidate_profile_id:
        # Check if candidate profile already exists by email
        existing_candidate = await db.db["candidates"].find_one({"email": email})
        if existing_candidate:
            candidate_profile_id = str(existing_candidate["_id"])
        else:
            # Create a new candidate profile
            candidate_dict = {
                "name": name,
                "email": email,
                "phone": "",
                "experience": "",
                "skills": [],
                "resume_url": "",
                "stage": "applied",
                "ai_score": None,
                "ai_analysis": None,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            res = await db.db["candidates"].insert_one(candidate_dict)
            candidate_profile_id = str(res.inserted_id)
            
        # Link candidate_user to candidate profile
        await db.db["candidate_users"].update_one(
            {"_id": ObjectId(candidate_user_id)},
            {"$set": {"candidate_id": candidate_profile_id}}
        )
    
    # 3. Create Application record
    now = datetime.utcnow()
    application_dict = {
        "job_id": job_id,
        "job_title": job.get("title"),
        "candidate_id": candidate_profile_id,
        "name": name,
        "email": email,
        "status": "applied",
        "created_at": now,
        "updated_at": now
    }
    app_res = await db.db["applications"].insert_one(application_dict)
    application_id = str(app_res.inserted_id)
    
    # 4. Add activity
    await add_candidate_activity(candidate_profile_id, "Application Submitted", f"Applied for {job.get('title')}")
    
    return {
        "id": application_id,
        "message": "Application successful"
    }

async def get_candidate_applications(current_candidate_user: dict) -> list[dict]:
    email = current_candidate_user["email"]

    cursor = db.db["applications"].find({"email": email}).sort("created_at", -1)
    applications = await cursor.to_list(length=100)

    clean_applications = []

    for app in applications:
        app["id"] = str(app["_id"])
        
        status = app.get("status", "")
        status_str = status.lower() if isinstance(status, str) else str(status)
        if status_str == "pending":
            app["status"] = "applied"
        elif status_str == "reviewed":
            app["status"] = "screening"
        elif not status:
            app["status"] = "applied"
            
        clean_applications.append(app)

    return serialize_mongo_document(clean_applications)

async def get_candidate_profile(current_candidate_user: dict) -> dict:
    candidate_profile_id = current_candidate_user.get("candidate_id")
    if not candidate_profile_id:
        return {
            "name": current_candidate_user.get("name"),
            "email": current_candidate_user.get("email"),
            "phone": "",
            "skills": [],
            "experience": "",
            "resume_url": "",
            "linkedin_url": "",
            "github_url": ""
        }
        
    candidate = await get_candidate_by_id(candidate_profile_id)
    if candidate:
        # Add candidate_user level fields if necessary
        return serialize_mongo_document(candidate)
        
    return {}

async def update_candidate_profile(current_candidate_user: dict, update_data: CandidateProfileUpdate) -> dict:
    candidate_profile_id = current_candidate_user.get("candidate_id")
    
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    update_dict["updated_at"] = datetime.utcnow()
    
    if not candidate_profile_id:
        # Create profile
        candidate_dict = {
            "name": current_candidate_user.get("name"),
            "email": current_candidate_user.get("email"),
            "phone": "",
            "skills": [],
            "experience": "",
            "resume_url": "",
            "stage": "applied",
            "ai_score": None,
            "ai_analysis": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        candidate_dict.update(update_dict)
        res = await db.db["candidates"].insert_one(candidate_dict)
        candidate_profile_id = str(res.inserted_id)
        
        await db.db["candidate_users"].update_one(
            {"_id": ObjectId(current_candidate_user["id"])},
            {"$set": {"candidate_id": candidate_profile_id}}
        )
    else:
        # Update existing
        await db.db["candidates"].update_one(
            {"_id": ObjectId(candidate_profile_id)},
            {"$set": update_dict}
        )
        
    return await get_candidate_profile({"candidate_id": candidate_profile_id})

async def upload_candidate_resume_portal(current_candidate_user: dict, content: bytes, filename: str) -> dict:
    # Validate extension
    file_ext = filename.split('.')[-1].lower()
    
    UPLOAD_DIR = os.path.join(os.getcwd(), "uploads")
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    file_id = str(uuid.uuid4())
    save_filename = f"{file_id}.{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, save_filename)
    
    with open(file_path, "wb") as f:
        f.write(content)
        
    resume_url = f"/uploads/{save_filename}"
    
    # Analyze Resume
    text = parse_resume(content, filename)
    common_skills = ["python", "javascript", "react", "fastapi", "java", "sql", "aws", "docker", "typescript", "node", "html", "css", "c++", "c#", "azure"]
    found_skills = list(set([s for s in common_skills if s in text.lower()]))
    
    # Generic AI Analysis (No specific job)
    ai_analysis = analyze_candidate_match(found_skills, [])
    
    # Generic AI Score (0 since no job is compared, recruiter matching calculates real score)
    ai_score = 0.0
    
    # Basic experience extraction (fallback)
    experience_summary = text[:300] + "..." if len(text) > 300 else text
    
    update_dict = {
        "resume_url": resume_url,
        "skills": found_skills,
        "experience": experience_summary,
        "ai_score": ai_score,
        "ai_analysis": ai_analysis,
        "updated_at": datetime.utcnow()
    }
    
    candidate_profile_id = current_candidate_user.get("candidate_id")
    if not candidate_profile_id:
        # Create candidate
        candidate_dict = {
            "name": current_candidate_user.get("name"),
            "email": current_candidate_user.get("email"),
            "phone": "",
            "stage": "applied",
            "created_at": datetime.utcnow()
        }
        candidate_dict.update(update_dict)
        res = await db.db["candidates"].insert_one(candidate_dict)
        candidate_profile_id = str(res.inserted_id)
        
        await db.db["candidate_users"].update_one(
            {"_id": ObjectId(current_candidate_user["id"])},
            {"$set": {"candidate_id": candidate_profile_id}}
        )
    else:
        await db.db["candidates"].update_one(
            {"_id": ObjectId(candidate_profile_id)},
            {"$set": update_dict}
        )
        await add_candidate_activity(candidate_profile_id, "Resume Uploaded", "Candidate uploaded a new resume and AI analysis was refreshed.")
        
    return await get_candidate_profile({"candidate_id": candidate_profile_id})

async def get_candidate_interviews(current_candidate_user: dict) -> list[dict]:
    candidate_profile_id = current_candidate_user.get("candidate_id")
    if not candidate_profile_id:
        return []
        
    cursor = db.db["interviews"].find({"candidate_id": candidate_profile_id}).sort("scheduled_at", 1)
    interviews = await cursor.to_list(length=100)
    
    for iv in interviews:
        iv["id"] = str(iv["_id"])
        job = await get_job_by_id(iv["job_id"])
        iv["job_title"] = job["title"] if job else "Unknown Job"
        
    return serialize_mongo_document(interviews)

async def get_candidate_offers(current_candidate_user: dict) -> list[dict]:
    candidate_profile_id = current_candidate_user.get("candidate_id")
    if not candidate_profile_id:
        return []
        
    cursor = db.db["offers"].find({"candidate_id": candidate_profile_id}).sort("created_at", -1)
    offers = await cursor.to_list(length=100)
    
    for offer in offers:
        offer["id"] = str(offer["_id"])
        job = await get_job_by_id(offer["job_id"])
        offer["job_title"] = job["title"] if job else "Unknown Job"
        
        # Map legacy statuses defensively
        status = offer.get("status", "")
        if not status:
            offer["status"] = "pending"
        else:
            s = status.lower()
            if s in ["draft", "sent", "viewed"]:
                offer["status"] = "pending"
            elif s in ["declined", "expired"]:
                offer["status"] = "rejected"
            elif s not in ["pending", "accepted", "rejected"]:
                offer["status"] = "pending"
        
    return serialize_mongo_document(offers)

async def update_candidate_offer_status(current_candidate_user: dict, offer_id: str, status: str) -> dict:
    candidate_profile_id = current_candidate_user.get("candidate_id")
    if not candidate_profile_id:
        raise HTTPException(status_code=400, detail="Profile not linked")
        
    offer = await db.db["offers"].find_one({"_id": ObjectId(offer_id), "candidate_id": candidate_profile_id})
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
        
    await db.db["offers"].update_one(
        {"_id": ObjectId(offer_id)},
        {"$set": {"status": status, "updated_at": datetime.utcnow()}}
    )
    
    if status.lower() == "accepted":
        from app.services.application import update_application_status
        from app.schemas.application import ApplicationStatus
        if offer.get("application_id"):
            await update_application_status(offer["application_id"], ApplicationStatus.hired)
        else:
            # Try to find the application by candidate and job
            app_doc = await db.db["applications"].find_one({"candidate_id": candidate_profile_id, "job_id": offer.get("job_id")})
            if app_doc:
                await update_application_status(str(app_doc["_id"]), ApplicationStatus.hired)
    
    candidate_name = current_candidate_user.get("name", "Candidate")
    job = await get_job_by_id(offer.get("job_id", ""))
    job_title = job["title"] if job else "Unknown Role"
    
    await add_candidate_activity(candidate_profile_id, f"Offer {status.capitalize()}", f"Candidate has {status} the offer for {job_title}")
    
    # Notify recruiter
    recruiter_email = offer.get("created_by", "recruiter@smartats.com")
    # For safety if created_by isn't an email
    if "@" not in recruiter_email:
        recruiter_email = "admin@smartats.com"
        
    await send_offer_response_email(recruiter_email, candidate_name, job_title, status)
    
    return {"message": f"Offer {status} successfully"}