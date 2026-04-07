const pool = require("../config/db");

// ================= CREATE STUDENT PROFILE =================
exports.createStudentProfile = async (req, res) => {
  const userId = req.user.id;
  const { college_name, year, skills } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO student_profiles 
       (user_id, college_name, year, skills) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [userId, college_name, year, skills]
    );

    res.json({
      message: "Student profile created",
      profile: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= CREATE CLIENT PROFILE =================
exports.createClientProfile = async (req, res) => {
  const userId = req.user.id;
  const { company_name } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO client_profiles 
       (user_id, company_name) 
       VALUES ($1, $2) 
       RETURNING *`,
      [userId, company_name]
    );

    res.json({
      message: "Client profile created",
      profile: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};