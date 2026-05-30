import asyncio
from app.db.mongodb import connect_to_mongo
from app.services.application import get_all_applications

async def test():
    await connect_to_mongo()
    apps = await get_all_applications()
    print(f"Total apps returned by function: {len(apps)}")
    if apps:
        print(apps[0])

asyncio.run(test())
