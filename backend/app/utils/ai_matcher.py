from collections import Counter

def calculate_match_score(job_text: str, resume_text: str) -> float:
    if not job_text or not resume_text:
        return 0.0

    job_words = set(job_text.lower().split())
    resume_words = set(resume_text.lower().split())

    if not job_words:
        return 0.0

    matches = len(job_words.intersection(resume_words))
    score = (matches / len(job_words)) * 100

    return round(score, 2)