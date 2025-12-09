// src/config/cors.js
const cors = require("cors");
const { FRONTEND_ORIGIN } = require("./env");

const allowedOrigins = ["http://localhost:3000"];

if (FRONTEND_ORIGIN && !allowedOrigins.includes(FRONTEND_ORIGIN)) {
  allowedOrigins.push(FRONTEND_ORIGIN);
}

const corsMiddleware = cors({
  origin: allowedOrigins,
  credentials: true,
});

module.exports = corsMiddleware;
