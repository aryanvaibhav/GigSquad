const pool = require("../config/db");

// ================= CREATE GIG =================
exports.createGig = async (req, res) => {
  const userId = req.user.id;
  const { title, location, pay_per_day, slots } = req.body;

  try {
    // get client profile id
    const client = await pool.query(
      "SELECT id FROM client_profiles WHERE user_id = $1",
      [userId]
    );

    if (client.rows.length === 0) {
      return res.status(400).json({ error: "Client profile not found" });
    }

    const clientId = client.rows[0].id;

    const result = await pool.query(
      `INSERT INTO gigs (client_id, title, location, pay_per_day, slots)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [clientId, title, location, pay_per_day, slots]
    );

    res.json({
      message: "Gig created",
      gig: result.rows[0],
    });

  } catch (err) {
    console.error("GIG ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// ================= GET ALL GIGS =================
exports.getGigs = async (req, res) => {
  const { location } = req.query;

  try {
    let query = "SELECT * FROM gigs";
    let values = [];

    if (location) {
      query += " WHERE location ILIKE $1";
      values.push(`%${location}%`);
    }

    const result = await pool.query(query, values);

    res.json(result.rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};