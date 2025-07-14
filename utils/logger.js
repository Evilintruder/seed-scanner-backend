// utils/logger.js
const Log = require("../models/Log");

const logScan = async (message, level = "info", context = {}) => {
  const timestamp = new Date().toISOString();

  // Ensure level is a string before calling .toUpperCase()
  const safeLevel = typeof level === "string" ? level.toLowerCase() : "info";

  console.log(`[${timestamp}] [${safeLevel}] ${message}`);

  try {
    await Log.create({ message, level: safeLevel, context });
  } catch (err) {
    console.error("Failed to log to DB:", err.message);
  }
};

module.exports = { logScan };
