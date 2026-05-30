import asyncio
from app.core.security import create_access_token
from jose import jwt
from app.core.config import settings

async def test_jwt_generation():
    # 1. Simulate Recruiter Login
    print("Testing Recruiter Login JWT...")
    recruiter_token = create_access_token(
        subject="recruiter_123",
        role="recruiter"
    )
    recruiter_payload = jwt.decode(recruiter_token, settings.SECRET_KEY, algorithms=["HS256"])
    print("Recruiter Payload:")
    print(recruiter_payload)
    print("Role is present:", "role" in recruiter_payload and recruiter_payload["role"] == "recruiter")

    # 2. Simulate Candidate Login
    print("\nTesting Candidate Login JWT...")
    candidate_token = create_access_token(
        subject="candidate_456",
        role="candidate"
    )
    candidate_payload = jwt.decode(candidate_token, settings.SECRET_KEY, algorithms=["HS256"])
    print("Candidate Payload:")
    print(candidate_payload)
    print("Role is present:", "role" in candidate_payload and candidate_payload["role"] == "candidate")

if __name__ == "__main__":
    asyncio.run(test_jwt_generation())
