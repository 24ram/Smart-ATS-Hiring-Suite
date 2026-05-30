import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

async def migrate():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client.smart_ats
    
    # pending -> applied
    cursor = db.applications.find({'status': 'pending'})
    apps = await cursor.to_list(length=None)
    for app in apps:
        await db.applications.update_one({'_id': app['_id']}, {'$set': {'status': 'applied'}})
    
    # reviewed -> screening
    cursor2 = db.applications.find({'status': 'reviewed'})
    apps2 = await cursor2.to_list(length=None)
    for app in apps2:
        await db.applications.update_one({'_id': app['_id']}, {'$set': {'status': 'screening'}})
        
    print(f'Migrated {len(apps)} pending -> applied, {len(apps2)} reviewed -> screening.')
    
    cursor3 = db.applications.find({})
    apps3 = await cursor3.to_list(length=None)
    
    count = 0
    for app in apps3:
        updates = {}
        if 'candidate_name' not in app or 'job_title' not in app:
            candidate = await db.candidates.find_one({'_id': ObjectId(app['candidate_id'])})
            job = await db.jobs.find_one({'_id': ObjectId(app['job_id'])})
            
            if candidate:
                updates['candidate_name'] = candidate.get('name', 'Unknown')
                updates['candidate_email'] = candidate.get('email', '')
            if job:
                updates['job_title'] = job.get('title', 'Unknown Job')
                
            if updates:
                await db.applications.update_one({'_id': app['_id']}, {'$set': updates})
                count += 1
                
    print(f'Backfilled {count} applications with denormalized data.')

asyncio.run(migrate())
