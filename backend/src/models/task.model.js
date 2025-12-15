// src/models/task.model.js
const { ObjectId } = require("mongodb");

const PRIORITIES = ["low", "medium", "high"]; // optional, used for validation/defaults

function mapTask(doc) {
  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description ?? null,
    status: doc.status,
    priority: doc.priority ?? "medium", // ✅ added
    due_date: doc.due_date ?? null,
    created_at: doc.created_at,
    updated_at: doc.updated_at,
  };
}

function isValidTaskId(id) {
  return ObjectId.isValid(id);
}

// optional helper if you want validation in routes/controllers
function isValidPriority(priority) {
  return PRIORITIES.includes(priority);
}

module.exports = {
  mapTask,
  isValidTaskId,
  isValidPriority, // optional
  PRIORITIES,      // optional
  ObjectId,
};
