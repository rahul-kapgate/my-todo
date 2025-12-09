from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class TaskStatus(str, Enum):
    todo = "todo"
    in_progress = "in_progress"
    done = "done"


class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    status: TaskStatus = TaskStatus.todo
    due_date: Optional[datetime] = None   # 👈 important


class TaskCreate(TaskBase):
    """Payload for creating a task."""
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    status: Optional[TaskStatus] = None
    due_date: Optional[datetime] = None   # 👈 allow updating


class TaskOut(TaskBase):
    id: str
    created_at: datetime
    updated_at: datetime
