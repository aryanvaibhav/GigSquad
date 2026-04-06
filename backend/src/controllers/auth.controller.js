const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

// ================= REGISTER =================
exports.register = async (req, res) => {
  const { email, password, type, phone } = req.body;

  try {
    console.log("REGISTER HIT:", email);

    // validation
    if (!email || !password || !type || !phone) {
      return res.status(400).json({ error: "All fields required" });
    }

    // hash password
    const hashed = await bcrypt.hash(password, 10);

    // insert user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, type, phone) 
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, type, phone`,
      [email, hashed, type, phone]
    );

    console.log("USER INSERTED:", result.rows[0]);

    return res.status(201).json({
      message: "User registered",
      user: result.rows[0],
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);

    if (err.code === "23505") {
      return res.status(400).json({ error: "Email or phone already exists" });
    }

    return res.status(500).json({ error: err.message });
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("LOGIN HIT:", email);

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id, type: user.type },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("LOGIN SUCCESS:", user.email);

    return res.json({ token });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};