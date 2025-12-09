from datetime import datetime
from typing import List, Optional

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.schemas.task import TaskCreate, TaskUpdate, TaskOut, TaskStatus


class TaskRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["tasks"]

    @staticmethod
    def _doc_to_task(doc: dict) -> TaskOut:
        return TaskOut(
            id=str(doc["_id"]),
            title=doc["title"],
            description=doc.get("description"),
            status=doc["status"],
            due_date=doc.get("due_date"),
            created_at=doc["created_at"],
            updated_at=doc["updated_at"],
        )

    async def list_tasks(
        self,
        status: Optional[TaskStatus] = None,
        from_due: Optional[datetime] = None,
        to_due: Optional[datetime] = None,
    ) -> List[TaskOut]:
        query: dict = {}

        if status is not None:
            query["status"] = status

        if from_due is not None or to_due is not None:
            due_range: dict = {}
            if from_due is not None:
                due_range["$gte"] = from_due
            if to_due is not None:
                due_range["$lte"] = to_due
            query["due_date"] = due_range

        cursor = self.collection.find(query).sort("created_at", -1)

        tasks: list[TaskOut] = []
        async for doc in cursor:
            tasks.append(self._doc_to_task(doc))
        return tasks

    async def get_task(self, task_id: str) -> Optional[TaskOut]:
        if not ObjectId.is_valid(task_id):
            return None
        doc = await self.collection.find_one({"_id": ObjectId(task_id)})
        return self._doc_to_task(doc) if doc else None

    async def create_task(self, task_in: TaskCreate) -> TaskOut:
        now = datetime.utcnow()
        payload = {
            **task_in.model_dump(),
            "created_at": now,
            "updated_at": now,
        }
        result = await self.collection.insert_one(payload)
        doc = await self.collection.find_one({"_id": result.inserted_id})
        return self._doc_to_task(doc)

    async def update_task(self, task_id: str, task_in: TaskUpdate) -> Optional[TaskOut]:
        if not ObjectId.is_valid(task_id):
            return None

        update_data = {k: v for k, v in task_in.model_dump().items() if v is not None}
        if not update_data:
            doc = await self.collection.find_one({"_id": ObjectId(task_id)})
            return self._doc_to_task(doc) if doc else None

        update_data["updated_at"] = datetime.utcnow()

        doc = await self.collection.find_one_and_update(
            {"_id": ObjectId(task_id)},
            {"$set": update_data},
            return_document=True,
        )
        return self._doc_to_task(doc) if doc else None
