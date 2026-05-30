import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def migrate_offers():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client.smart_ats
    
    # Check current counts
    pipeline = [{"$group": {"_id": "$status", "count": {"$sum": 1}}}]
    cursor = db.offers.aggregate(pipeline)
    counts = await cursor.to_list(length=None)
    
    print("CURRENT STATUS COUNTS:")
    for doc in counts:
        print(f"- {doc['_id']}: {doc['count']}")
        
    print("\nPERFORMING MIGRATION...")
    
    mapping = {
        "draft": "pending",
        "sent": "pending",
        "viewed": "pending",
        "declined": "rejected",
        "expired": "rejected"
    }
    
    migrated_total = 0
    for old_status, new_status in mapping.items():
        result = await db.offers.update_many(
            {"status": old_status},
            {"$set": {"status": new_status}}
        )
        if result.modified_count > 0:
            print(f"Updated {result.modified_count} offers from '{old_status}' to '{new_status}'")
            migrated_total += result.modified_count
            
    print(f"\nTotal legacy offers migrated: {migrated_total}")
    
    # Check final counts
    cursor = db.offers.aggregate(pipeline)
    counts = await cursor.to_list(length=None)
    
    print("\nFINAL STATUS COUNTS:")
    for doc in counts:
        print(f"- {doc['_id']}: {doc['count']}")

if __name__ == "__main__":
    asyncio.run(migrate_offers())
