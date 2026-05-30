import asyncio
import httpx
from app.db.mongodb import db

async def verify_hm():
    # We will connect directly to MongoDB via motor to check
    from motor.motor_asyncio import AsyncIOMotorClient
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    database = client["smart_ats"]
    
    # 1. Clear jobs to make it easier to see
    # await database["jobs"].delete_many({})
    
    # Let's make an API call
    async with httpx.AsyncClient() as c:
        # Register recruiter
        res = await c.post("http://127.0.0.1:8000/api/v1/auth/register", json={
            "name": "Recruiter Test",
            "email": "recruiter_hm_test@test.com",
            "password": "password",
            "role": "recruiter"
        })
        res = await c.post("http://127.0.0.1:8000/api/v1/auth/login/json", json={
            "email": "recruiter_hm_test@test.com",
            "password": "password"
        })
        rec_token = res.json().get("access_token")
        
        # Register HM
        res = await c.post("http://127.0.0.1:8000/api/v1/auth/register", json={
            "name": "HM Test",
            "email": "hm_test@test.com",
            "password": "password",
            "role": "hiring_manager"
        })
        res = await c.post("http://127.0.0.1:8000/api/v1/auth/login/json", json={
            "email": "hm_test@test.com",
            "password": "password"
        })
        hm_token = res.json().get("access_token")
        
        hm_user = await c.get("http://127.0.0.1:8000/api/v1/auth/me", headers={"Authorization": f"Bearer {hm_token}"})
        hm_id = hm_user.json()["id"]
        
        # Create Job via API (Recruiter)
        res = await c.post("http://127.0.0.1:8000/api/v1/jobs/", headers={"Authorization": f"Bearer {rec_token}"}, json={
            "title": "Software Engineer (HM Assigned)",
            "company": "Tech Corp",
            "location": "Remote",
            "employment_type": "full_time",
            "description": "Awesome job",
            "assigned_hiring_manager_id": hm_id
        })
        print("Create Job Response:", res.status_code)
        
        if res.status_code == 201:
            job_data = res.json()
            print("Assigned HM ID in returned JSON:", job_data.get("assigned_hiring_manager_id"))
            
            # Check DB Directly
            job_doc = await database["jobs"].find_one({"_id": job_data["id"]}) # Need ObjectId?
            print("Is assigned_hiring_manager_id string?", type(job_data.get("assigned_hiring_manager_id")))
        
        # Now HM requests jobs
        res = await c.get("http://127.0.0.1:8000/api/v1/jobs/", headers={"Authorization": f"Bearer {hm_token}"})
        print("HM Jobs fetched:", len(res.json()))

if __name__ == "__main__":
    asyncio.run(verify_hm())
