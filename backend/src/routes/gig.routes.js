const express = require("express");
const router = express.Router();

const gigController = require("../controllers/gig.controller");
const auth = require("../middleware/auth.middleware"); // 👈 ADD THIS

// ✅ APPLY MIDDLEWARE HERE
router.post("/", auth, gigController.createGig);

router.get("/", gigController.getAllGigs);

module.exports = router;