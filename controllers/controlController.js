const Control = require("../models/Control");

// Toggle scan state (no req.body needed)
exports.toggleScan = async (req, res) => {
  try {
    let control = await Control.findOne();

    if (!control) {
      control = new Control({ isScanning: true });
    } else {
      control.isScanning = !control.isScanning;
    }

    await control.save();

    res.json({ success: true, isScanning: control.isScanning });
  } catch (error) {
    console.error("Error toggling scan:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Explicitly stop scan
exports.stopScan = async (req, res) => {
  try {
    let control = await Control.findOne();

    if (!control) {
      control = new Control({ isScanning: false });
    } else {
      control.isScanning = false;
    }

    await control.save();

    res.json({ success: true, isScanning: false });
  } catch (error) {
    console.error("Error stopping scan:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Get scan status
exports.getScanStatus = async (req, res) => {
  try {
    const control = await Control.findOne();
    const isScanning = control ? control.isScanning : false;
    res.status(200).json({ isScanning });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch scan status" });
  }
};
