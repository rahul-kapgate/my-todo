// src/routes/task.routes.js
const express = require("express");
const {
  getTasks,
  createTask,
  updateTask,
} = require("../controllers/task.controller");

const router = express.Router();

router.get("/v1/tasks", getTasks);
router.post("/v1/tasks", createTask);
router.put("/v1/tasks/:id", updateTask);

module.exports = router;
