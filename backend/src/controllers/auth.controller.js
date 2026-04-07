const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/**
 * REGISTER USER (Student / Client)
 */
exports.register = async (req, res) => {
  try {
    const { email, phone, password, type } = req.body;

    // 🔹 Basic validation
    if (!email || !phone || !password || !type) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!["student", "client"].includes(type)) {
      return res.status(400).json({ message: "Invalid user type" });
    }

    // 🔹 Check if user already exists
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

    // 🔹 Start transaction (IMPORTANT)
    const client = await db.connect();

    try {
      await client.query("BEGIN");

      // 1️⃣ Create user
      const userResult = await client.query(
        `INSERT INTO users (email, phone, password_hash, type)
         VALUES ($1, $2, $3, $4)
         RETURNING id, type`,
        [email, phone, hashedPassword, type]
      );

      const user = userResult.rows[0];

      // 2️⃣ AUTO CREATE PROFILE (CRITICAL FIX)
      if (type === "student") {
        // Prevent duplicate profile (safety)
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

      // 3️⃣ Generate JWT
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
      throw err;
    } finally {
      client.release();
    }

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({
      message: err.message || "Server error",
    });
  }
};

/**
 * LOGIN USER
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔹 Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // 🔹 Find user
    const result = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];

    // 🔹 Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
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