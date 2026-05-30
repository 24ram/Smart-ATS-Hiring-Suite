from typing import List, Dict

def analyze_candidate_match(candidate_skills: List[str], job_requirements: List[str]) -> Dict:
    c_skills_lower = set(s.lower() for s in candidate_skills)
    j_reqs_lower = set(s.lower() for s in job_requirements)
    
    matched = list(c_skills_lower.intersection(j_reqs_lower))
    missing = list(j_reqs_lower.difference(c_skills_lower))
    
    matched_orig = [s for s in job_requirements if s.lower() in matched]
    missing_orig = [s for s in job_requirements if s.lower() in missing]
    
    strengths = []
    if len(matched_orig) > len(job_requirements) / 2 if job_requirements else True:
        strengths.append("Strong technical alignment with core requirements.")
    
    frontend_skills = {"react", "javascript", "typescript", "vue", "angular", "html", "css"}
    if any(s in frontend_skills for s in matched):
        strengths.append("Strong frontend development background.")
        
    backend_skills = {"python", "node", "java", "fastapi", "django", "express", "sql"}
    if any(s in backend_skills for s in matched):
        strengths.append("Solid backend technical foundation.")
        
    if not strengths:
        strengths.append("General professional experience.")

    weaknesses = []
    if len(missing_orig) > len(job_requirements) / 2 and job_requirements:
        weaknesses.append("Missing several core technical skills.")
        
    cloud_skills = {"aws", "docker", "kubernetes", "gcp", "azure", "ci/cd"}
    if any(s in cloud_skills for s in missing):
        weaknesses.append("Missing cloud deployment experience.")
        
    if not weaknesses:
        weaknesses.append("No major technical weaknesses identified.")

    match_percentage = len(matched_orig) / len(job_requirements) if job_requirements else 0.0
    
    if match_percentage > 0.8:
        recommendation = "Excellent fit for the role. Strong match on technical requirements. Proceed to interview."
    elif match_percentage > 0.5:
        recommendation = "Good fit for the role, but may need training on some missing skills."
    elif job_requirements:
        recommendation = "Does not meet the core technical requirements for this role."
    else:
        recommendation = "Need more job requirements to evaluate fit."

    return {
        "matched_skills": matched_orig,
        "missing_skills": missing_orig,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "recommendation": recommendation
    }
