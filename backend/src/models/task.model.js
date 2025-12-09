// src/models/task.model.js
const { ObjectId } = require("mongodb");

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

function isValidTaskId(id) {
  return ObjectId.isValid(id);
}

module.exports = {
  mapTask,
  isValidTaskId,
  ObjectId,
};
