// src/config/env.js
const dotenv = require("dotenv");

dotenv.config();

const PORT = process.env.PORT || 8000;
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "task_db";
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is not set in environment variables");
}

module.exports = {
  PORT,
  MONGODB_URI,
  MONGODB_DB_NAME,
  FRONTEND_ORIGIN,
};
