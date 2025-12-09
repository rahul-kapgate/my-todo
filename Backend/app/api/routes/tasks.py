from typing import List
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_db
from app.repositories.task_repository import TaskRepository
from app.schemas.task import TaskCreate, TaskUpdate, TaskOut, TaskStatus

router = APIRouter(prefix="/tasks", tags=["tasks"])


def get_task_repository(db: AsyncIOMotorDatabase = Depends(get_db)) -> TaskRepository:
    return TaskRepository(db)


@router.get(
    "/",
    response_model=List[TaskOut],
    summary="List all tasks",
    description=(
        "List tasks with optional filters:\n"
        "- **status**: todo / in_progress / done\n"
        "- **from_due**: ISO datetime, tasks due on/after this\n"
        "- **to_due**: ISO datetime, tasks due on/before this"
    ),
)
async def list_tasks(
    status: TaskStatus | None = Query(
        default=None,
        description="Filter by status",
    ),
    from_due: datetime | None = Query(
        default=None,
        description="Return tasks with due_date on or after this datetime (ISO 8601).",
    ),
    to_due: datetime | None = Query(
        default=None,
        description="Return tasks with due_date on or before this datetime (ISO 8601).",
    ),
    repo: TaskRepository = Depends(get_task_repository),
):
    return await repo.list_tasks(status=status, from_due=from_due, to_due=to_due)

@router.get("/{task_id}", response_model=TaskOut)
async def get_task(task_id: str, repo: TaskRepository = Depends(get_task_repository)):
    task = await repo.get_task(task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    return task


@router.post("/", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_in: TaskCreate,
    repo: TaskRepository = Depends(get_task_repository),
):
    return await repo.create_task(task_in)


@router.put("/{task_id}", response_model=TaskOut)
async def update_task(
    task_id: str,
    task_in: TaskUpdate,
    repo: TaskRepository = Depends(get_task_repository),
):
    task = await repo.update_task(task_id, task_in)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or invalid id",
        )
    return task


