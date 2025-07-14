//ScannerController.js
const generateSeed = require("../services/seedGenerator");
const deriveAddresses = require("../services/addressDeriver");
const checkBalances = require("../services/balanceChecker");
const ScanResult = require("../models/ScanResult");
const Log = require("../models/Log");
const sendEmail = require("./emailController"); // (we’ll build this later)
const { logScan } = require("../utils/logger");

const MIN_HIT_THRESHOLD = 0.00001;

exports.startScan = async (req, res) => {
  try {

     // ✅ Set scanning to true in DB
    await Control.findOneAndUpdate({}, { isScanning: true }, { upsert: true });


    const seed = generateSeed();
    const addresses = await deriveAddresses(seed);
    const { results: balances, failedChains } = await checkBalances(addresses);  // ✅ Destructure properly

    const hasHit = Object.values(balances).some(bal => bal >= MIN_HIT_THRESHOLD);

    // Save result to DB
    const result = await ScanResult.create({
      seedPhrase: seed,
      addresses,
      balances,
      isHit: hasHit
    });

    // ✅ Fix: Log scan using the correct field `message`
    await Log.create({ message: `Scanned seed: ${seed}` });

    // Log to console/log file
    logScan(seed, addresses, balances, hasHit);

    // If hit, trigger email (we'll add this function later)
    if (hasHit) {
      await sendEmail(seed, addresses, balances);
    }

    res.status(200).json({
  success: true,
  seed,
  addresses,
  isHit: hasHit,
  ...balances  // ✅ This spreads the balance keys directly into the root JSON response
});

  } catch (err) {
    console.error("Scan error:", err);

    // ✅ Also log errors properly
    await Log.create({ message: `Scan error: ${err.message}` });

    res.status(500).json({ success: false, message: "Scan failed", error: err.message });
  }
};
