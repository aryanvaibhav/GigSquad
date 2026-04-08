require("dotenv").config();

const express = require("express");
const cors = require("cors");

const pool = require("./config/db");

const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes");
const gigRoutes = require("./routes/gig.routes");
const applicationRoutes = require("./routes/application.routes");

const authMiddleware = require("./middleware/auth.middleware");

const app = express();

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());

// ================= ROOT =================
app.get("/", (req, res) => {
  res.send("GigSquad API running");
});

// ================= ROUTES =================
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/gigs", gigRoutes);
app.use("/api/v1/applications", applicationRoutes);

// ================= PROTECTED TEST =================
app.get("/api/v1/protected", authMiddleware, (req, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user,
  });
});

// ================= DB CONNECTION (SAFE FIX) =================

// ✅ Use query instead of connect (auto release)
pool.query("SELECT 1")
  .then(() => console.log("Database connected"))
  .catch((err) => console.error("DB Error:", err.message));

// ✅ Prevent crash on unexpected DB errors
pool.on("error", (err) => {
  console.error("Unexpected DB error:", err.message);
});

// ================= SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});