const express = require("express");
const router = express.Router();

const {
  applyToGig,
  getApplicants,
  updateApplicationStatus,
} = require("../controllers/application.controller");

const authMiddleware = require("../middleware/auth.middleware");

router.post("/", authMiddleware, applyToGig);
router.get("/:gig_id", authMiddleware, getApplicants);
router.patch("/:id", authMiddleware, updateApplicationStatus);

module.exports = router;