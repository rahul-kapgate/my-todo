// backend-express/index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ObjectId } = require("mongodb");

dotenv.config();

const app = express();

// ---------- CORS ----------
const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_ORIGIN, // e.g. https://your-frontend.vercel.app
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());

// ---------- MongoDB connection ----------
const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || "task_db";

if (!mongoUri) {
  console.error("❌ MONGODB_URI is not set in environment variables");
}

const client = new MongoClient(mongoUri, {
  // good defaults for Atlas in 2025
  maxPoolSize: 10,
});

let dbInstance = null;

async function getDb() {
  if (!dbInstance) {
    await client.connect();
    dbInstance = client.db(dbName);
    console.log("✅ Connected to MongoDB:", dbName);
  }
  return dbInstance;
}

function mapTask(doc) {
  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description ?? null,
    status: doc.status,
    due_date: doc.due_date ?? null,
    created_at: doc.created_at,
    updated_at: doc.updated_at,
  };
}

// ---------- Health check ----------
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "task-backend-express" });
});

// ---------- GET /api/v1/tasks (with filters) ----------
app.get("/api/v1/tasks", async (req, res) => {
  try {
    const db = await getDb();
    const collection = db.collection("tasks");

    const { status, from_due, to_due } = req.query;

    const query = {};

    if (status) {
      query.status = status; // "todo" | "in_progress" | "done"
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
});

// ---------- POST /api/v1/tasks ----------
app.post("/api/v1/tasks", async (req, res) => {
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
});

// ---------- PUT /api/v1/tasks/:id ----------
app.put("/api/v1/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
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

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: "after" }
    );

    if (!result.value) {
      return res.status(404).json({ detail: "Task not found" });
    }

    res.json(mapTask(result.value));
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).json({ detail: "Internal server error" });
  }
});

// ---------- Local dev server (ignored by Vercel) ----------
const PORT = process.env.PORT || 8000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Express API running on http://localhost:${PORT}`);
  });
}

// For Vercel: export the Express app as the default export
module.exports = app;
module.exports.default = app;
