const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/**
 * ================= REGISTER =================
 */
exports.register = async (req, res) => {
  const client = await db.connect();

  try {
    const { email, phone, password, type } = req.body;

    // 🔹 Validation
    if (!email || !phone || !password || !type) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!["student", "client"].includes(type)) {
      return res.status(400).json({ message: "Invalid user type" });
    }

    // 🔹 Check existing user
    const existingUser = await db.query(
      "SELECT id FROM users WHERE email = $1 OR phone = $2",
      [email, phone]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: "User already exists with this email or phone",
      });
    }

    // 🔹 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    await client.query("BEGIN");

    // 🔹 Create user
    const userResult = await client.query(
      `INSERT INTO users (email, phone, password_hash, type)
       VALUES ($1, $2, $3, $4)
       RETURNING id, type`,
      [email, phone, hashedPassword, type]
    );

    const user = userResult.rows[0];

    // 🔥 AUTO CREATE PROFILE (CRITICAL)
    if (type === "student") {
      await client.query(
        `INSERT INTO student_profiles (user_id)
         VALUES ($1)
         ON CONFLICT (user_id) DO NOTHING`,
        [user.id]
      );
    }

    if (type === "client") {
      await client.query(
        `INSERT INTO client_profiles (user_id, company_name)
         VALUES ($1, $2)
         ON CONFLICT (user_id) DO NOTHING`,
        [user.id, "New Company"]
      );
    }

    await client.query("COMMIT");

    // 🔹 Generate JWT
    const token = jwt.sign(
      { id: user.id, type: user.type },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        type: user.type,
      },
    });

  } catch (err) {
    await client.query("ROLLBACK");

    console.error("REGISTER ERROR:", err);

    return res.status(500).json({
      message: err.message || "Server error",
    });
  } finally {
    client.release();
  }
};

/**
 * ================= LOGIN =================
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔹 Validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required",
      });
    }

    // 🔹 Find user
    const result = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const user = result.rows[0];

    // 🔹 Compare password
    const isMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // 🔹 Generate token
    const token = jwt.sign(
      { id: user.id, type: user.type },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        type: user.type,
      },
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);

    return res.status(500).json({
      message: err.message || "Server error",
    });
  }
};