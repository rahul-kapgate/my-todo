// src/routes/index.js
const express = require("express");
const healthRoutes = require("./health.routes");
const taskRoutes = require("./task.routes");

const router = express.Router();

router.use(healthRoutes);  // /health
router.use(taskRoutes);    // /v1/tasks

module.exports = router;
