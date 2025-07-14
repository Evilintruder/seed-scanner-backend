// models/Log.js
const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    level: { type: String, enum: ["info", "warn", "error"], default: "info" },
    context: { type: Object }, // Optional: extra data
  },
  { timestamps: true }
);

module.exports = mongoose.model("Log", LogSchema);
