// src/controllers/task.controller.js
const { getDb } = require("../config/db");
const { mapTask, isValidTaskId, ObjectId } = require("../models/task.model");

// GET /api/v1/tasks?status=&from_due=&to_due=
async function getTasks(req, res) {
  try {
    const db = await getDb();
    const collection = db.collection("tasks");

    const { status, from_due, to_due } = req.query;
    const query = {};

    if (status) {
      // "todo" | "in_progress" | "done"
      query.status = status;
    }

    if (from_due || to_due) {
      query.due_date = {};
      if (from_due) {
        query.due_date.$gte = new Date(from_due);
      }
      if (to_due) {
        query.due_date.$lte = new Date(to_due);
      }
    }

    const docs = await collection
      .find(query)
      .sort({ due_date: 1, created_at: -1 })
      .toArray();

    const tasks = docs.map(mapTask);
    res.json(tasks);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ detail: "Internal server error" });
  }
}

// POST /api/v1/tasks
async function createTask(req, res) {
  try {
    const { title, description, status, due_date } = req.body;

    if (!title || typeof title !== "string") {
      return res.status(400).json({ detail: "title is required" });
    }

    const now = new Date();
    const due = due_date ? new Date(due_date) : null;

    const doc = {
      title,
      description: description ?? null,
      status: status || "todo",
      due_date: due,
      created_at: now,
      updated_at: now,
    };

    const db = await getDb();
    const collection = db.collection("tasks");
    const result = await collection.insertOne(doc);

    const task = mapTask({ _id: result.insertedId, ...doc });
    res.status(201).json(task);
  } catch (err) {
    console.error("Error creating task:", err);
    res.status(500).json({ detail: "Internal server error" });
  }
}

// PUT /api/v1/tasks/:id
async function updateTask(req, res) {
  try {
    const { id } = req.params;

    if (!isValidTaskId(id)) {
      return res.status(400).json({ detail: "Invalid task id" });
    }

    const { title, description, status, due_date } = req.body;

    const update = {
      updated_at: new Date(),
    };

    if (title !== undefined) update.title = title;
    if (description !== undefined) update.description = description;
    if (status !== undefined) update.status = status;
    if (due_date !== undefined) {
      update.due_date = due_date ? new Date(due_date) : null;
    }

    const db = await getDb();
    const collection = db.collection("tasks");

    const rawResult = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: "after" }
    );

    // console.log("findOneAndUpdate rawResult:", rawResult);

    // Support both shapes: { value: doc } or just doc
    const updatedDoc =
      rawResult && typeof rawResult === "object" && "value" in rawResult
        ? rawResult.value
        : rawResult;

    if (!updatedDoc) {
      return res.status(404).json({ detail: "Task not found" });
    }

    res.json(mapTask(updatedDoc));
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).json({ detail: "Internal server error" });
  }
}

module.exports = {
  getTasks,
  createTask,
  updateTask,
};
