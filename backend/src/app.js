// src/app.js
const express = require("express");
const corsMiddleware = require("./config/cors");
const apiRouter = require("./routes");

const app = express();

// Middlewares
app.use(corsMiddleware);
app.use(express.json());

// Routes
app.use("/api", apiRouter);

module.exports = app;
