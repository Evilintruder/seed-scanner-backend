// services/scannerEngine.js
const Control = require("../models/Control");
const ScanResult = require("../models/ScanResult");
const Log = require("../models/Log");
const sendEmail = require("../controllers/emailController");
const generateSeed = require("./seedGenerator");
const deriveAddresses = require("./addressDeriver");
const checkBalances = require("./balanceChecker");
const logger = require("../utils/logger").logScan;

const BATCH_SIZE = 10;

const runScanner = async () => {
  while (true) {
    try {
      const control = await Control.findOne();
      if (control?.isScanning) {
        for (let i = 0; i < BATCH_SIZE; i++) {
          const seed = generateSeed();
          const addresses = await deriveAddresses(seed);
          addresses._seed = seed;

          const { results: balances, failedChains } = await checkBalances(addresses, seed);

          const hitFound = Object.values(balances).some(
            (val) => !isNaN(val) && parseFloat(val) >= 0.00001
          );

          const resultText = `
🧠 Seed Phrase:
"${seed}"

📬 Wallet Addresses:
${Object.entries(addresses)
  .filter(([k]) => k !== "_seed")
  .map(([coin, addr]) => `${coin}: ${addr}`)
  .join("\n")}

📊 Balances:
${Object.entries(balances)
  .map(([coin, bal]) => `${coin}: ${bal}`)
  .join("\n")}
          `.trim();

          // ✅ SAVE RESULT
          try {
            await ScanResult.create({
              seedPhrase: seed,
              addresses,
              balances,
              isHit: hitFound, // ✅ correct field name!
              plainResult: resultText,
            });

            await logger(
              `✅ Scanned & saved seed - ${hitFound ? "🔥 HIT FOUND!" : "❌ No hit"}`
            );
          } catch (err) {
            console.error("❌ Failed to save scan result:", err);
            await logger("❌ DB Save Error: " + err.message, "error");
          }

          // ✅ Send email if hit
          if (hitFound) {
            try {
              await sendEmail.sendEmailAlert("🔥 HIT FOUND - Seed Scanner", resultText);
            } catch (err) {
              console.error("❌ Failed to send email:", err.message);
              await logger("❌ Email Send Error: " + err.message, "error");
            }
          }
        }
      } else {
        await new Promise((res) => setTimeout(res, 5000)); // wait if stopped
      }

      await new Promise((res) => setTimeout(res, 1000)); // small delay per loop
    } catch (err) {
      console.error("❌ Scanner Error:", err);
      await logger(`❌ Scanner Loop Error: ${err.message}`, "error");
      await new Promise((res) => setTimeout(res, 3000));
    }
  }
};

module.exports = runScanner;
