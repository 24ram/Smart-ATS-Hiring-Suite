import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client.smart_ats
    cursor = db.applications.find({})
    apps = await cursor.to_list(length=10)
    for app in apps:
        print(f"ID: {app.get('_id')} created_at: {type(app.get('created_at'))}")

asyncio.run(check())
