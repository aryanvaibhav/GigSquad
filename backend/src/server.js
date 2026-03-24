const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const authMiddleware = require("./middleware/auth.middleware");

const app = express();

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());

// ================= ROOT ROUTE =================
app.get("/", (req, res) => {
  res.send("GigSquad API running");
});

// ================= AUTH ROUTES =================
app.use("/api/v1/auth", authRoutes);

// ================= PROTECTED ROUTE =================
app.get("/api/v1/protected", authMiddleware, (req, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user,
  });
});

// ================= DATABASE CONNECTION =================
pool.connect()
  .then(() => console.log("Database connected"))
  .catch(err => console.error("DB Error:", err));

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});