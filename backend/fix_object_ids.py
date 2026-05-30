import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client.smart_ats
    cursor = db.applications.find({})
    apps = await cursor.to_list(length=None)
    for app in apps:
        updates = {}
        if type(app.get('candidate_id')) != str:
            updates['candidate_id'] = str(app.get('candidate_id'))
        if type(app.get('job_id')) != str:
            updates['job_id'] = str(app.get('job_id'))
        if updates:
            print(f"Updating {app['_id']} with {updates}")
            await db.applications.update_one({'_id': app['_id']}, {'$set': updates})
    print("Done")

asyncio.run(check())
