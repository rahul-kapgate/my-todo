// src/config/db.js
const { MongoClient } = require("mongodb");
const { MONGODB_URI, MONGODB_DB_NAME } = require("./env");

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is not defined. Check your .env file.");
}

const client = new MongoClient(MONGODB_URI, {
  maxPoolSize: 10, // good defaults for Atlas
});

let dbInstance = null;
let isConnecting = false;

/**
 * Connects to MongoDB (if not already connected) and returns the DB instance.
 */
async function getDb() {
  if (dbInstance) {
    return dbInstance;
  }

  if (isConnecting) {
    // If multiple requests come at the same time, wait a bit
    await waitForConnection();
    return dbInstance;
  }

  try {
    isConnecting = true;
    console.log("⏳ Connecting to MongoDB...");

    await client.connect();

    const db = client.db(MONGODB_DB_NAME);

    // Optional but useful: ping command to verify connection
    await db.command({ ping: 1 });

    dbInstance = db;
    console.log("✅ Successfully connected to MongoDB:", MONGODB_DB_NAME);

    return dbInstance;
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err.message);
    // For debugging deeper issues (like TLS):
    console.error(err);
    throw err;
  } finally {
    isConnecting = false;
  }
}

/**
 * Helper: wait until dbInstance is set or connection attempt finishes.
 */
function waitForConnection() {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (!isConnecting || dbInstance) {
        clearInterval(interval);
        resolve();
      }
    }, 50);
  });
}

/**
 * Optional: explicitly initialize DB on server startup.
 */
async function initDb() {
  try {
    await getDb();
  } catch (err) {
    console.error("❌ initDb() failed. API will still start, but DB is not connected.");
  }
}

module.exports = {
  getDb,
  initDb,
  client,
};
