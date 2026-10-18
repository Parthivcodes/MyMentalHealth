import pg from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const isLocal = /localhost|127\.0\.0\.1/.test(connectionString || "");

pg.types.setTypeParser(1082, (value) => value);

const pool = new pg.Pool({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: true },
});

export const query = (text, params) => pool.query(text, params);

export default pool;
