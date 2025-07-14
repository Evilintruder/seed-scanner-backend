const express = require("express");
const router = express.Router();
const {
  toggleScan,
  stopScan,
  getScanStatus,
} = require("../controllers/controlController");

router.post("/toggle", toggleScan);     // Toggles scan ON/OFF
router.post("/stop", stopScan);         // Explicitly stop scan
router.get("/status", getScanStatus);   // Get current status

module.exports = router;
