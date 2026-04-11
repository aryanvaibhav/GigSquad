const db = require("../config/db");

/**
 * APPLY TO GIG (Student)
 */
exports.applyToGig = async (req, res) => {
  try {
    const { gig_id } = req.body;
    const user_id = req.user.id;

    if (!gig_id) {
      return res.status(400).json({ message: "gig_id is required" });
    }

    // Get student profile
    const student = await db.query(
      "SELECT id FROM student_profiles WHERE user_id = $1",
      [user_id]
    );

    if (student.rows.length === 0) {
      return res.status(400).json({ message: "Student profile not found" });
    }

    const student_id = student.rows[0].id;

    // Check gig exists
    const gig = await db.query(
      "SELECT * FROM gigs WHERE id = $1",
      [gig_id]
    );

    if (gig.rows.length === 0) {
      return res.status(404).json({ message: "Gig not found" });
    }

    const gigData = gig.rows[0];

    // Slot check
    if (gigData.filled_slots >= gigData.slots) {
      return res.status(400).json({ message: "Gig is full" });
    }

    // Prevent duplicate
    const existing = await db.query(
      "SELECT * FROM gig_applications WHERE gig_id=$1 AND student_id=$2",
      [gig_id, student_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Already applied" });
    }

    // Insert application
    const result = await db.query(
      `INSERT INTO gig_applications (gig_id, student_id)
       VALUES ($1, $2)
       RETURNING *`,
      [gig_id, student_id]
    );

    return res.status(201).json({
      message: "Applied successfully",
      application: result.rows[0],
    });

  } catch (err) {
    console.error("APPLY ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};


/**
 * GET APPLICANTS (Client)
 */
exports.getApplicants = async (req, res) => {
  try {
    const { gig_id } = req.params;
    const user_id = req.user.id;

    // Role check
    if (req.user.type !== "client") {
      return res.status(403).json({ message: "Only clients allowed" });
    }

    // Verify ownership
    const gig = await db.query(
      `SELECT g.id, cp.user_id
       FROM gigs g
       JOIN client_profiles cp ON g.client_id = cp.id
       WHERE g.id = $1`,
      [gig_id]
    );

    if (gig.rows.length === 0) {
      return res.status(404).json({ message: "Gig not found" });
    }

    if (gig.rows[0].user_id !== user_id) {
      return res.status(403).json({ message: "Not your gig" });
    }

    // Fetch applicants
    const result = await db.query(
      `SELECT 
        ga.id,
        ga.status,
        u.email,
        sp.skills,
        sp.college_name
       FROM gig_applications ga
       JOIN student_profiles sp ON ga.student_id = sp.id
       JOIN users u ON sp.user_id = u.id
       WHERE ga.gig_id = $1`,
      [gig_id]
    );

    return res.json(result.rows);

  } catch (err) {
    console.error("GET APPLICANTS ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};


/**
 * ACCEPT / REJECT APPLICATION (Client)
 */
exports.updateApplicationStatus = async (req, res) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const { id } = req.params;
    const { status } = req.body;
    const user_id = req.user.id;

    // Role check
    if (req.user.type !== "client") {
      throw new Error("Only clients can perform this action");
    }

    // Validate status
    if (!["confirmed", "rejected"].includes(status)) {
      throw new Error("Invalid status");
    }

    // Get application + ownership
    const app = await client.query(
      `SELECT ga.*, g.client_id, cp.user_id
       FROM gig_applications ga
       JOIN gigs g ON ga.gig_id = g.id
       JOIN client_profiles cp ON g.client_id = cp.id
       WHERE ga.id = $1`,
      [id]
    );

    if (app.rows.length === 0) {
      throw new Error("Application not found");
    }

    const application = app.rows[0];

    // Ownership check
    if (application.user_id !== user_id) {
      throw new Error("Not authorized");
    }

    // Prevent double confirmation
    if (application.status === "confirmed") {
      throw new Error("Already confirmed");
    }

    // Lock gig row
    const gig = await client.query(
      "SELECT * FROM gigs WHERE id = $1 FOR UPDATE",
      [application.gig_id]
    );

    const gigData = gig.rows[0];

    // Slot logic
    if (status === "confirmed") {
      if (gigData.filled_slots >= gigData.slots) {
        throw new Error("No slots left");
      }

      await client.query(
        "UPDATE gigs SET filled_slots = filled_slots + 1 WHERE id = $1",
        [application.gig_id]
      );
    }

    // Update application
    const updated = await client.query(
      `UPDATE gig_applications
       SET status = $1,
           confirmed_at = CASE WHEN $1 = 'confirmed' THEN NOW() ELSE confirmed_at END
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    await client.query("COMMIT");

    return res.json({
      message: "Updated successfully",
      application: updated.rows[0],
    });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("UPDATE STATUS ERROR:", err);
    return res.status(400).json({ message: err.message });
  } finally {
    client.release();
  }
};


/**
 * GET MY APPLICATIONS (Student)
 */
exports.getMyApplications = async (req, res) => {
  try {
    const user_id = req.user.id;

    const student = await db.query(
      "SELECT id FROM student_profiles WHERE user_id = $1",
      [user_id]
    );

    if (student.rows.length === 0) {
      return res.json([]);
    }

    const student_id = student.rows[0].id;

    const result = await db.query(
      `SELECT 
        ga.id AS application_id,
        ga.status,
        g.id AS gig_id,
        g.title,
        g.location,
        g.pay_per_day
       FROM gig_applications ga
       JOIN gigs g ON ga.gig_id = g.id
       WHERE ga.student_id = $1`,
      [student_id]
    );

    return res.json(result.rows || []);

  } catch (err) {
    console.error("GET MY APPLICATIONS ERROR:", err);
    return res.status(500).json({
      message: err.message || "Server error"
    });
  }
};