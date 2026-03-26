const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "gigsquad",
  password: "Aryan@123",   // 🔥 put directly here
  port: 5432,
});

module.exports = pool;