import os
import uuid
import re
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from app.schemas.candidate import CandidateResponse, CandidateCreate
from app.services.candidate import create_candidate, get_candidates, get_candidate_by_id, delete_candidate, update_candidate_score
from app.services.job import get_job_by_id
from app.api.deps import get_current_user, require_role
from app.schemas.user import UserRole
from app.utils.resume_parser import parse_resume
from app.utils.ai_matcher import calculate_match_score
from app.utils.ai_analysis import analyze_candidate_match
from app.schemas.candidate import CandidateDetailsResponse, MatchedJobDetails

router = APIRouter()

UPLOAD_DIR = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=CandidateResponse, status_code=status.HTTP_201_CREATED)
async def upload_candidate_resume(
    file: UploadFile = File(...),
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(None),
    current_user: dict = Depends(require_role([UserRole.recruiter, UserRole.admin, UserRole.hiring_manager]))
) -> Any:
    # Validate extension
    file_ext = file.filename.split('.')[-1].lower()
    if file_ext not in ['pdf', 'docx']:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported.")
    
    # Save file
    file_id = str(uuid.uuid4())
    filename = f"{file_id}.{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)
        
    # Extract text to find rudimentary skills or save
    text = parse_resume(content, file.filename)
    
    # Very basic skill extraction (for demo purposes)
    common_skills = ["python", "javascript", "react", "fastapi", "java", "sql", "aws", "docker"]
    found_skills = [s for s in common_skills if s in text.lower()]
    
    # Create candidate
    candidate_in = CandidateCreate(
        name=name,
        email=email,
        phone=phone,
        skills=found_skills,
        experience=None, # In real world, use NLP to extract experience
        resume_url=f"/uploads/{filename}"
    )
    
    candidate = await create_candidate(candidate_in)
    return candidate

@router.get("/", response_model=List[CandidateResponse])
async def read_candidates(
    skip: int = 0,
    limit: int = 100,
    current_user: dict = Depends(get_current_user)
) -> Any:
    return await get_candidates(skip=skip, limit=limit, current_user=current_user)

@router.get("/{candidate_id}", response_model=CandidateResponse)
async def read_candidate(
    candidate_id: str,
    current_user: dict = Depends(get_current_user)
) -> Any:
    candidate = await get_candidate_by_id(candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate

@router.get("/{candidate_id}/details", response_model=CandidateDetailsResponse)
async def read_candidate_details(
    candidate_id: str,
    current_user: dict = Depends(get_current_user)
) -> Any:
    candidate = await get_candidate_by_id(candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    matched_jobs_details = []
    matched_jobs_ids = candidate.get("matched_jobs", [])
    
    for jid in matched_jobs_ids:
        job = await get_job_by_id(jid)
        if job:
            matched_jobs_details.append({
                "id": str(job["_id"]),
                "title": job.get("title", "Unknown"),
                "company": job.get("company", "Unknown"),
                "ai_score": candidate.get("ai_score"), # This is a simplification; you might want job-specific scores in a real app
                "status": job.get("status", "open")
            })
            
    candidate["matched_jobs_details"] = matched_jobs_details
    return candidate

@router.delete("/{candidate_id}", status_code=status.HTTP_200_OK)
async def delete_existing_candidate(
    candidate_id: str,
    current_user: dict = Depends(require_role([UserRole.recruiter, UserRole.admin]))
):
    candidate = await get_candidate_by_id(candidate_id)

    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    # Remove uploaded resume file
    if candidate.get("resume_url"):
        filepath = os.path.join(
            os.getcwd(),
            candidate["resume_url"].lstrip('/')
        )

        if os.path.exists(filepath):
            os.remove(filepath)

    await delete_candidate(candidate_id)

    return {"message": "Candidate deleted successfully"}

@router.post("/match/{job_id}/{candidate_id}")
async def match_candidate_to_job(
    job_id: str,
    candidate_id: str,
    current_user: dict = Depends(require_role([UserRole.recruiter, UserRole.admin, UserRole.hiring_manager]))
) -> Any:
    job = await get_job_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    candidate = await get_candidate_by_id(candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    if not candidate.get("resume_url"):
        raise HTTPException(status_code=400, detail="Candidate has no resume uploaded.")
        
    filepath = os.path.join(os.getcwd(), candidate["resume_url"].lstrip('/'))
    if not os.path.exists(filepath):
        raise HTTPException(status_code=400, detail="Resume file not found.")
        
    with open(filepath, "rb") as f:
        content = f.read()
        
    resume_text = parse_resume(content, filepath)
    
    # Job text compilation
    job_text = f"{job['title']} {job['description']} {' '.join(job.get('requirements', []))}"
    
    score = calculate_match_score(job_text, resume_text)
    
    # Run AI Analysis
    job_reqs = job.get('requirements', [])
    if not job_reqs:
        # Fallback if requirements are not structured
        import re
        words = re.findall(r'\b\w+\b', job.get('description', ''))
        job_reqs = list(set([w for w in words if len(w) > 3][:10]))
        
    candidate_skills = candidate.get('skills', [])
    
    ai_analysis = analyze_candidate_match(candidate_skills, job_reqs)
    
    # Update candidate's ai_score, matched_jobs, and ai_analysis
    from app.services.candidate import update_candidate_match_details, add_candidate_activity
    await update_candidate_match_details(candidate_id, score, job_id, ai_analysis)
    
    await add_candidate_activity(candidate_id, "AI Match Executed", f"Matched against job: {job['title']} with {score}% score.")
    
    return {
        "candidate_id": candidate_id,
        "job_id": job_id,
        "match_score": score,
        "ai_analysis": ai_analysis
    }

@router.patch("/{candidate_id}/stage", response_model=CandidateResponse)
async def update_stage(
    candidate_id: str,
    stage_update: dict,
    current_user: dict = Depends(require_role([UserRole.recruiter, UserRole.admin]))
) -> Any:
    from app.schemas.candidate import CandidateStage
    stage_val = stage_update.get("stage")
    if not stage_val:
        raise HTTPException(status_code=400, detail="Stage is required")
    
    try:
        stage_enum = CandidateStage(stage_val)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid stage")

    candidate = await get_candidate_by_id(candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    from app.services.candidate import update_candidate_stage, add_candidate_activity
    result = await update_candidate_stage(candidate_id, stage_enum)
    await add_candidate_activity(candidate_id, "Stage Changes", f"Moved to stage: {stage_enum.value}")
    return await get_candidate_by_id(candidate_id)

@router.post("/{candidate_id}/notes", response_model=CandidateResponse)
async def add_note(
    candidate_id: str,
    note_data: dict,
    current_user: dict = Depends(require_role([UserRole.recruiter, UserRole.admin, UserRole.hiring_manager]))
) -> Any:
    note = note_data.get("note")
    if not note:
        raise HTTPException(status_code=400, detail="Note content is required")

    candidate = await get_candidate_by_id(candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    from app.services.candidate import add_candidate_note
    return await add_candidate_note(candidate_id, note, current_user.get("name", "Unknown User"))
