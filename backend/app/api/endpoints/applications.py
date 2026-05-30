import os
import uuid
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from app.schemas.application import ApplicationCreate, ApplicationResponse, ApplicationUpdate, HMFeedbackUpdate
from app.schemas.candidate import CandidateCreate
from app.services.application import create_application, get_all_applications, get_applications_by_job, get_application_by_id, update_application_status, update_application_feedback
from app.services.candidate import create_candidate, get_candidate_by_id, add_candidate_activity, update_candidate_match_details
from app.services.job import get_job_by_id
from app.utils.resume_parser import parse_resume
from app.utils.ai_matcher import calculate_match_score
from app.utils.ai_analysis import analyze_candidate_match
from app.api.deps import get_current_user, require_role
from app.schemas.user import UserRole
import re

router = APIRouter()

UPLOAD_DIR = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def submit_application(
    job_id: str = Form(...),
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(None),
    cover_letter: str = Form(None),
    linkedin_url: str = Form(None),
    github_url: str = Form(None),
    portfolio_url: str = Form(None),
    resume: UploadFile = File(...)
) -> Any:
    # 1. Validate Job
    job = await get_job_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # 2. Process Resume
    file_ext = resume.filename.split('.')[-1].lower()
    if file_ext not in ['pdf', 'docx']:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported.")
    
    file_id = str(uuid.uuid4())
    filename = f"{file_id}.{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    content = await resume.read()
    with open(file_path, "wb") as f:
        f.write(content)
        
    resume_text = parse_resume(content, resume.filename)
    
    common_skills = ["python", "javascript", "react", "fastapi", "java", "sql", "aws", "docker", "typescript", "node", "css", "html"]
    found_skills = [s for s in common_skills if s in resume_text.lower()]
    
    # 3. Create Candidate
    candidate_in = CandidateCreate(
        name=name,
        email=email,
        phone=phone,
        skills=found_skills,
        experience=None, 
        resume_url=f"/uploads/{filename}"
    )
    candidate = await create_candidate(candidate_in)
    candidate_id = str(candidate["id"])

    # 4. Run AI Match
    job_text = f"{job['title']} {job.get('description', '')} {' '.join(job.get('requirements', []))}"
    score = calculate_match_score(job_text, resume_text)
    
    job_reqs = job.get('requirements', [])
    if not job_reqs:
        words = re.findall(r'\b\w+\b', job.get('description', ''))
        job_reqs = list(set([w for w in words if len(w) > 3][:10]))
        
    ai_analysis = analyze_candidate_match(found_skills, job_reqs)
    
    # Update candidate with match details
    await update_candidate_match_details(candidate_id, score, job_id, ai_analysis)
    
    # 5. Store Application
    application_in = ApplicationCreate(
        job_id=job_id,
        candidate_id=candidate_id,
        cover_letter=cover_letter,
        linkedin_url=linkedin_url,
        github_url=github_url,
        portfolio_url=portfolio_url
    )
    application = await create_application(application_in, candidate, job, score)
    
    # 6. Add Activity
    await add_candidate_activity(candidate_id, "Application Submitted", f"Applied for {job['title']} via Public Portal. AI Match: {score}%")
    
    return application

@router.get("/", response_model=List[ApplicationResponse])
async def read_applications(
    job_id: Optional[str] = None,
    candidate_id: Optional[str] = None,
    current_user: dict = Depends(require_role([UserRole.recruiter, UserRole.admin, UserRole.hiring_manager]))
) -> Any:
    if job_id:
        return await get_applications_by_job(job_id)
    if candidate_id:
        from app.services.application import get_applications_by_candidate
        return await get_applications_by_candidate(candidate_id)
    return await get_all_applications(current_user=current_user)

@router.patch("/{app_id}/status", response_model=ApplicationResponse)
async def change_application_status(
    app_id: str,
    update_data: ApplicationUpdate,
    current_user: dict = Depends(require_role([UserRole.recruiter, UserRole.admin]))
) -> Any:
    app = await get_application_by_id(app_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    if update_data.status.value in ["offer", "offered", "hired"]:
        if app.get("hm_feedback") != "Hire":
            raise HTTPException(status_code=400, detail="Hiring Manager approval required before moving candidate to Offer/Hired stage.")
        
    updated = await update_application_status(app_id, update_data.status)
    await add_candidate_activity(app["candidate_id"], "Application Status Updated", f"Application marked as {update_data.status.value}")
    
    return updated

@router.put("/{app_id}/feedback", response_model=ApplicationResponse)
async def submit_application_feedback(
    app_id: str,
    feedback_data: HMFeedbackUpdate,
    current_user: dict = Depends(require_role([UserRole.hiring_manager, UserRole.admin]))
) -> Any:
    app = await get_application_by_id(app_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    updated = await update_application_feedback(app_id, feedback_data.feedback.value)
    await add_candidate_activity(app["candidate_id"], "Hiring Manager Feedback", f"Feedback submitted: {feedback_data.feedback.value}")
    
    return updated
