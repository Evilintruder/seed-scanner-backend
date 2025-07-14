const express = require("express");
const router = express.Router();
const Log = require("../models/Log");

// GET /api/logs - fetch latest 100 logs
router.get("/", async (req, res) => {
  try {
    const logs = await Log.find().sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
