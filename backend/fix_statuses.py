import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

VALID_STATUSES = [
    "applied", "screening", "interview", "technical", 
    "hr", "offer", "offered", "hired", "rejected"
]

MAPPING = {
    "pending": "applied",
    "reviewed": "screening"
}

async def fix():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client.smart_ats
    cursor = db.applications.find({})
    apps = await cursor.to_list(length=None)
    
    found = 0
    migrated = 0
    for app in apps:
        status = app.get("status")
        # lowercase to match case insensitively if it's string
        status_lower = status.lower() if isinstance(status, str) else status
        
        if status_lower not in VALID_STATUSES:
            found += 1
            new_status = MAPPING.get(status_lower, "applied") # default to applied if unknown
            print(f"App {app['_id']}: {status} -> {new_status}")
            await db.applications.update_one({'_id': app['_id']}, {'$set': {'status': new_status}})
            migrated += 1
            
    print(f"Found {found} legacy records, migrated {migrated}.")

asyncio.run(fix())
