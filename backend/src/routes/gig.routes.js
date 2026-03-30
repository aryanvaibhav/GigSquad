const express = require("express");
const router = express.Router();

// ✅ IMPORT FULL CONTROLLER OBJECT
const gigController = require("../controllers/gig.controller");

// ✅ ROUTES (safe access)
router.post("/", gigController.createGig);
router.get("/", gigController.getAllGigs);

module.exports = router;

console.log("Controller:", gigController);