// index.js
const app = require("./src/app");
const { PORT } = require("./src/config/env");
const { initDb } = require("./src/config/db");

if (require.main === module) {
  // Try DB connection on startup
  initDb().then(() => {
    console.log("🚀 Starting Express server...");
    app.listen(PORT, () => {
      console.log(`✅ Express API running on http://localhost:${PORT}`);
    });
  });
}

// Vercel export
module.exports = app;
module.exports.default = app;
