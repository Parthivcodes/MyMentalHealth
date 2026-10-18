// Recreates every table and adds sample data. Deletes existing data.
import fs from "fs";
import bcrypt from "bcryptjs";
import pool from "../src/db.js";
import { makePenName } from "../src/routes/auth.js";

const schema = fs.readFileSync(new URL("./schema.sql", import.meta.url), "utf8");
const seed = fs.readFileSync(new URL("./seed.sql", import.meta.url), "utf8");

try {
  await pool.query(schema);
  await pool.query(seed);

  const email = process.env.ADMIN_EMAIL || "admin@calmconnect.local";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    "INSERT INTO users (name, email, password_hash, role, pen_name) VALUES ($1, $2, $3, 'admin', $4)",
    ["Admin", email, hash, await makePenName()]
  );

  console.log(`Database ready. Admin login: ${email} / ${password}`);
} catch (err) {
  console.error("Database setup failed:", err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
