import jwt from "jsonwebtoken";
import { query } from "../db.js";

// The role is read from the database on every request, so an approved helper
// gets access straight away without logging in again.
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Please log in to continue." });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Your session has expired. Please log in again." });
  }

  try {
    const { rows } = await query("SELECT id, role FROM users WHERE id = $1", [payload.id]);
    if (!rows[0]) {
      return res.status(401).json({ message: "This account no longer exists." });
    }
    req.user = rows[0];
    next();
  } catch (err) {
    next(err);
  }
}

export function requireAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Only admins can do this." });
  }
  next();
}
