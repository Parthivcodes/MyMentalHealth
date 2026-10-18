import { Router } from "express";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const search = `%${req.query.q || ""}%`;
    const { rows } = await query(
      `SELECT id, title, emotion, LEFT(body, 160) AS preview, created_at, updated_at
       FROM journal_entries
       WHERE user_id = $1 AND (title ILIKE $2 OR body ILIKE $2)
       ORDER BY updated_at DESC`,
      [req.user.id, search]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { title, body, emotion } = req.body;
    if (!title?.trim() || !body?.trim()) {
      return res.status(400).json({ message: "Give your entry a title and write something." });
    }

    const { rows } = await query(
      "INSERT INTO journal_entries (user_id, title, body, emotion) VALUES ($1, $2, $3, $4) RETURNING *",
      [req.user.id, title.trim(), body, emotion || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { rows } = await query("SELECT * FROM journal_entries WHERE id = $1 AND user_id = $2", [req.params.id, req.user.id]);
    if (!rows[0]) return res.status(404).json({ message: "Entry not found." });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { title, body, emotion } = req.body;
    if (!title?.trim() || !body?.trim()) {
      return res.status(400).json({ message: "Give your entry a title and write something." });
    }

    const { rows } = await query(
      `UPDATE journal_entries SET title = $1, body = $2, emotion = $3, updated_at = NOW()
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [title.trim(), body, emotion || null, req.params.id, req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ message: "Entry not found." });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { rowCount } = await query("DELETE FROM journal_entries WHERE id = $1 AND user_id = $2", [req.params.id, req.user.id]);
    if (!rowCount) return res.status(404).json({ message: "Entry not found." });
    res.json({ message: "Entry deleted." });
  } catch (err) {
    next(err);
  }
});

export default router;
