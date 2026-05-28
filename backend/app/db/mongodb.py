from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
import logging

class MongoDB:
    client: AsyncIOMotorClient = None
    db = None

db = MongoDB()

async def connect_to_mongo():
    logging.info("Connecting to MongoDB...")
    db.client = AsyncIOMotorClient(settings.MONGODB_URL)
    db.db = db.client[settings.DATABASE_NAME]
    logging.info("Connected to MongoDB")

async def close_mongo_connection():
    if db.client is not None:
        logging.info("Closing MongoDB connection...")
        db.client.close()
        logging.info("Closed MongoDB connection")
