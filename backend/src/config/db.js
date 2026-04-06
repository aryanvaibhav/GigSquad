const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
});

console.log("DB URL:", process.env.DATABASE_URL);

module.exports = pool;