from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

model = None

def get_model():
    global model
    if model is None:
        logger.info("Loading sentence-transformers model...")
        model = SentenceTransformer('all-MiniLM-L6-v2')
        logger.info("Model loaded successfully.")
    return model

def calculate_match_score(job_text: str, resume_text: str) -> float:
    if not job_text or not resume_text:
        return 0.0

    try:
        current_model = get_model()

        job_embedding = current_model.encode([job_text])
        resume_embedding = current_model.encode([resume_text])

        similarity = cosine_similarity(job_embedding, resume_embedding)[0][0]

        score = float(max(0, similarity) * 100)
        return round(score, 2)

    except Exception as e:
        logger.error(f"Error calculating match score: {e}")
        return 0.0