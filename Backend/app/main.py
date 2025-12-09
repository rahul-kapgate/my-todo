from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

from app.api.routes import tasks
from app.core.config import settings
from app.core.database import db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    db.client = AsyncIOMotorClient(settings.mongodb_uri)
    print("✅ Connected to MongoDB")
    try:
        yield
    finally:
        # Shutdown
        if db.client is not None:
            db.client.close()
            print("🔌 MongoDB connection closed")


app = FastAPI(
    title="Task API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS – adjust origins for your frontend(s)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://my-todo-app-nextjs.netlify.app",
        # your deployed frontend URL here
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tasks.router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    return {"status": "ok", "environment": settings.environment}
