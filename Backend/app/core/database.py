from typing import AsyncGenerator

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from .config import settings


class DataBase:
    client: AsyncIOMotorClient | None = None


db = DataBase()


def get_client() -> AsyncIOMotorClient:
    if db.client is None:
        raise RuntimeError("MongoDB client is not initialized")
    return db.client


def get_db() -> AsyncIOMotorDatabase:
    client = get_client()
    return client[settings.mongodb_db_name]
