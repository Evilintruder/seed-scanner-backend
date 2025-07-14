// models/ScanResult.js
const mongoose = require("mongoose");

const ScanResultSchema = new mongoose.Schema(
  {
    seedPhrase: { type: String, required: true },
    addresses: { type: Object }, // { btc: "...", eth: "...", etc }
    balances: { type: Object },  // { btc: "0.00", eth: "0.0123", etc }
    isHit: { type: Boolean, default: false }, // if any balance ≥ 0.00001
  },
  { timestamps: true }
);

module.exports = mongoose.model("ScanResult", ScanResultSchema);
