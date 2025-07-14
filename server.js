const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");

const connectDB = require("./config/db");
const runScanner = require("./services/scannerEngine");
const Control = require("./models/Control"); // ✅ Add Control model

// Routes
const scannerRoutes = require("./routes/scanner");
const controlRoutes = require("./routes/control");
const logsRoute = require("./routes/logs");
const authRoutes = require("./routes/auth"); // ✅ Login system

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ API Routes
app.use("/api/scanner", scannerRoutes);
app.use("/api/control", controlRoutes);
app.use("/api/logs", logsRoute);
app.use("/api/auth", authRoutes); // ✅ Login route

// ✅ Root test route
app.get("/", (req, res) => {
  res.send("Seed Scanner Backend ✅ with Login + Automation");
});

// ✅ Start after Mongo connects
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected");

    // 🧠 Check if scanner was previously running
    let control = await Control.findOne();
    if (!control) {
      // 🔧 Create control record if it doesn't exist
      control = new Control({ isScanning: false });
      await control.save();
    }

    if (control.isScanning) {
      console.log("▶️ Resuming scanner based on saved state...");
      runScanner(); // ✅ Resume background scanner
    } else {
      console.log("⏸️ Scanner not running (based on DB state)");
    }

    // ✅ Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB Error:", err));
