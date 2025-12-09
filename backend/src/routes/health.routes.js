// src/routes/health.routes.js
const express = require("express");
const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok", service: "task-backend-express" });
});

module.exports = router;
