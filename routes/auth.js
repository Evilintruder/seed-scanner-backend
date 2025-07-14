const express = require("express");
const router = express.Router();

const {
  loginUser,
  createUser,
  deleteUser,
  getUsers, // this must match your controller export name
} = require("../controllers/authController");

const {
  verifyToken,
  verifyAdmin,
} = require("../middleware/authMiddleware");

// Login route (public)
router.post("/login", loginUser);

// Admin-only routes
router.post("/create", verifyToken, verifyAdmin, createUser);
router.delete("/delete/:id", verifyToken, verifyAdmin, deleteUser);
router.get("/users", verifyToken, verifyAdmin, getUsers);

module.exports = router;
