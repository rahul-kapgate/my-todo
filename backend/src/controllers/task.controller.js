// src/controllers/task.controller.js
const { getDb } = require("../config/db");
const { mapTask, isValidTaskId, ObjectId } = require("../models/task.model");

// GET /api/v1/tasks?status=&from_due=&to_due=&include_overdue_for_today=true
async function getTasks(req, res) {
  try {
    const db = await getDb();
    const collection = db.collection("tasks");

    const { status, from_due, to_due, include_overdue_for_today } = req.query;

    const baseQuery = {};
    const orClauses = [];

    // status filter (skip "all" if you send it from frontend)
    if (status && status !== "all") {
      baseQuery.status = status;
    }

    // If we want: today + all past due (not done)
    if (
      from_due &&
      to_due &&
      include_overdue_for_today === "true" &&
      (!status || status === "all") // only when not filtering by a specific status
    ) {
      const from = new Date(from_due);
      const to = new Date(to_due);

      // 1) tasks whose due_date is on the selected day
      orClauses.push({
        due_date: {
          $gte: from,
          $lte: to,
        },
      });

      // 2) tasks whose due_date is before that day AND not done
      orClauses.push({
        due_date: { $lt: from },
        status: { $ne: "done" },
      });
    } else if (from_due || to_due) {
      // normal range filter
      const range = {};
      if (from_due) {
        const from = new Date(from_due);
        if (!isNaN(from.getTime())) {
          range.$gte = from;
        }
      }
      if (to_due) {
        const to = new Date(to_due);
        if (!isNaN(to.getTime())) {
          range.$lte = to;
        }
      }
      if (Object.keys(range).length > 0) {
        baseQuery.due_date = range;
      }
    }

    // Final query: either OR with base conditions, or just baseQuery
    const finalQuery =
      orClauses.length > 0 ? { ...baseQuery, $or: orClauses } : baseQuery;

    const docs = await collection
      .find(finalQuery)
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
