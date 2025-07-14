const mongoose = require("mongoose");

const ControlSchema = new mongoose.Schema({
  isScanning: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Control", ControlSchema);
