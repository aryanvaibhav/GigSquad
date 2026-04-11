const express = require("express");
const router = express.Router();

const {
  applyToGig,
  getApplicants,
  updateApplicationStatus,
  getMyApplications
} = require("../controllers/application.controller");

const authMiddleware = require("../middleware/auth.middleware");

// ✅ APPLY
router.post("/", authMiddleware, applyToGig);

// ✅ STUDENT: MY APPLICATIONS (PUT THIS ABOVE :gig_id)
router.get("/me", authMiddleware, getMyApplications);

// ✅ CLIENT: GET APPLICANTS
router.get("/:gig_id", authMiddleware, getApplicants);

// ✅ CLIENT: UPDATE STATUS
router.patch('/status/:id', authMiddleware, updateApplicationStatus);

module.exports = router;