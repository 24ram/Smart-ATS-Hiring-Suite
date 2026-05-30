import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client.smart_ats
    cursor = db.applications.find({})
    apps = await cursor.to_list(length=10)
    for app in apps:
        print(f"ID: {app.get('_id')} {type(app.get('_id'))}")
        print(f"job_id: {app.get('job_id')} {type(app.get('job_id'))}")
        print(f"candidate_id: {app.get('candidate_id')} {type(app.get('candidate_id'))}")

asyncio.run(check())
