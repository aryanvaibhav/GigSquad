const express = require("express");
const router = express.Router();
const profile = require("../controllers/profile.controller");
const authMiddleware = require("../middleware/auth.middleware");

// student profile
router.post("/student", authMiddleware, profile.createStudentProfile);

// client profile
router.post("/client", authMiddleware, profile.createClientProfile);

module.exports = router;