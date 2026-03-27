const db = require("../config/db");

/**
 * Apply to a gig
 */
exports.applyToGig = async (req, res) => {
  try {
    const { gig_id } = req.body;
    const user_id = req.user.id; // from JWT middleware

    // 1. Get student profile
    const student = await db.query(
      "SELECT id FROM student_profiles WHERE user_id = $1",
      [user_id]
    );

    if (student.rows.length === 0) {
      return res.status(400).json({ message: "Student profile not found" });
    }

    const student_id = student.rows[0].id;

    // 2. Prevent duplicate application
    const existing = await db.query(
      "SELECT * FROM gig_applications WHERE gig_id=$1 AND student_id=$2",
      [gig_id, student_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Already applied" });
    }

    // 3. Insert application
    const result = await db.query(
      `INSERT INTO gig_applications (gig_id, student_id)
       VALUES ($1, $2)
       RETURNING *`,
      [gig_id, student_id]
    );

    res.status(201).json({
      message: "Applied successfully",
      application: result.rows[0],
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * Get applicants for a gig (client)
 */
exports.getApplicants = async (req, res) => {
  try {
    const { gig_id } = req.params;

    const result = await db.query(`
      SELECT ga.*, sp.skills, u.email
      FROM gig_applications ga
      JOIN student_profiles sp ON ga.student_id = sp.id
      JOIN users u ON sp.user_id = u.id
      WHERE ga.gig_id = $1
    `, [gig_id]);

    res.json(result.rows);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * Accept / Reject application
 */
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // confirmed / rejected

    const result = await db.query(
      `UPDATE gig_applications
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    res.json({
      message: "Updated successfully",
      application: result.rows[0],
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};