from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize the model globally so it's loaded once
logger.info("Loading sentence-transformers model...")
model = SentenceTransformer('all-MiniLM-L6-v2')
logger.info("Model loaded successfully.")

def calculate_match_score(job_text: str, resume_text: str) -> float:
    """
    Calculates semantic match score between a job description and a resume.
    Returns a percentage out of 100.
    """
    if not job_text or not resume_text:
        return 0.0
        
    try:
        # Encode sentences to get their embeddings
        job_embedding = model.encode([job_text])
        resume_embedding = model.encode([resume_text])
        
        # Calculate cosine similarity
        similarity = cosine_similarity(job_embedding, resume_embedding)[0][0]
        
        # Convert to percentage (similarity is between -1 and 1)
        score = float(max(0, similarity) * 100)
        return round(score, 2)
    except Exception as e:
        logger.error(f"Error calculating match score: {e}")
        return 0.0
