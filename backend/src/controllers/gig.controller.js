const pool = require("../config/db");

// ================= CREATE GIG =================
exports.createGig = async (req, res) => {
  const userId = req.user.id;
  const { title, location, pay_per_day, slots } = req.body;

  try {
    // 🔥 VALIDATIONS

    if (!title || !location || !pay_per_day || !slots) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // ✅ Ensure pay is valid number
    if (isNaN(pay_per_day) || pay_per_day <= 0) {
      return res.status(400).json({
        message: "Pay must be a positive number",
      });
    }

    // ✅ Ensure slots is INTEGER
    if (!Number.isInteger(slots) || slots < 1) {
      return res.status(400).json({
        message: "Slots must be a positive integer",
      });
    }

    // 🔍 Get client profile
    const client = await pool.query(
      "SELECT id FROM client_profiles WHERE user_id = $1",
      [userId]
    );

    if (client.rows.length === 0) {
      return res.status(400).json({
        message: "Client profile not found",
      });
    }

    const clientId = client.rows[0].id;

    // 🔥 Insert gig
    const result = await pool.query(
      `INSERT INTO gigs 
      (client_id, created_by, title, location, pay_per_day, total_slots, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'published')
      RETURNING *`,
      [clientId, userId, title, location, pay_per_day, slots]
    );

    res.status(201).json({
      message: "Gig created successfully",
      gig: result.rows[0],
    });

  } catch (err) {
    console.error("CREATE GIG ERROR:", err);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// ================= GET ALL GIGS =================
exports.getAllGigs = async (req, res) => {
  try {
    const { search, location, page, limit } = req.query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    let query = `
      SELECT * FROM gigs 
      WHERE status = 'published'
    `;

    let values = [];
    let index = 1;

    // 🔍 Search filter
    if (search) {
      query += ` AND LOWER(title) LIKE LOWER($${index})`;
      values.push(`%${search}%`);
      index++;
    }

    // 📍 Location filter
    if (location) {
      query += ` AND LOWER(location) LIKE LOWER($${index})`;
      values.push(`%${location}%`);
      index++;
    }

    // 📄 Pagination
    const offset = (pageNum - 1) * limitNum;

    query += ` ORDER BY created_at DESC`;
    query += ` LIMIT $${index} OFFSET $${index + 1}`;

    values.push(limitNum, offset);

    const result = await pool.query(query, values);

    res.json({
      gigs: result.rows,
      page: pageNum,
      limit: limitNum,
    });

  } catch (err) {
    console.error("GET GIGS ERROR:", err);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};