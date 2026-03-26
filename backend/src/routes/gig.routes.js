const express = require("express");
const router = express.Router();
const gig = require("../controllers/gig.controller");
const authMiddleware = require("../middleware/auth.middleware");

// create gig (client only)
router.post("/", authMiddleware, gig.createGig);

// get all gigs (public/student)
router.get("/", gig.getGigs);

module.exports = router;