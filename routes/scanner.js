// routes/scanner.js
const express = require("express");
const router = express.Router();
const { startScan } = require("../controllers/scannerController");
const ScanResult = require("../models/ScanResult");
const { verifyToken } = require("../middleware/authMiddleware");

// ✅ Start Scan
router.post("/start", startScan);

// ✅ Get Only HITs (balance ≥ 0.00001)
router.get("/hits", verifyToken, async (req, res) => {
  try {
   const hits = await ScanResult.find({ isHit: true }).sort({ createdAt: -1 });
    res.json(hits);
  } catch (err) {
    console.error("Failed to fetch hits:", err);
    res.status(500).json({ error: "Failed to fetch hit results" });
  }
});


// ✅ Get All Results (latest 100)
router.get("/results", verifyToken, async (req, res) => {
  try {
    const results = await ScanResult.find().sort({ createdAt: -1 }).limit(100);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch scan results" });
  }
});

// ✅ Get Only HITs (balance ≥ 0.00001)
router.get("/hits", verifyToken, async (req, res) => {
  try {
    const hits = await ScanResult.find({ hit: true }).sort({ createdAt: -1 });
    res.json(hits);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch hit results" });
  }
});

// ✅ Get latest result
router.get("/latest", verifyToken, async (req, res) => {
  try {
    const latest = await ScanResult.findOne().sort({ createdAt: -1 });
    res.json(latest);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch latest result" });
  }
});

// ✅ Get result by ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const result = await ScanResult.findById(req.params.id);
    if (!result) {
      return res.status(404).json({ error: "Result not found" });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch result" });
  }
});

module.exports = router;
