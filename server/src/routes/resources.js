import { Router } from "express";
import { query } from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import options from "../options.js";

const router = Router();

const types = ["article", "video", "link"];

function checkResource(data) {
  const { title, type, category, url, body } = data;
  if (!title?.trim() || !types.includes(type) || !options.resourceCategories.includes(category)) {
    return "Give a title, a type and a category.";
  }
  if (type === "article" ? !body?.trim() : !url?.trim()) {
    return type === "article" ? "Write the article text." : "Add the link.";
  }
  return null;
}

router.get("/", async (req, res, next) => {
  try {
    const { category, type } = req.query;
    const conditions = [];
    const params = [];

    if (category) {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }
    if (type) {
      params.push(type);
      conditions.push(`type = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const { rows } = await query(`SELECT * FROM resources ${where} ORDER BY created_at DESC`, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const problem = checkResource(req.body);
    if (problem) return res.status(400).json({ message: problem });

    const { title, type, category, url, body } = req.body;
    const { rows } = await query(
      "INSERT INTO resources (title, type, category, url, body) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [title.trim(), type, category, url || null, body || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const problem = checkResource(req.body);
    if (problem) return res.status(400).json({ message: problem });

    const { title, type, category, url, body } = req.body;
    const { rows } = await query(
      "UPDATE resources SET title = $1, type = $2, category = $3, url = $4, body = $5 WHERE id = $6 RETURNING *",
      [title.trim(), type, category, url || null, body || null, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: "Resource not found." });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { rowCount } = await query("DELETE FROM resources WHERE id = $1", [req.params.id]);
    if (!rowCount) return res.status(404).json({ message: "Resource not found." });
    res.json({ message: "Resource deleted." });
  } catch (err) {
    next(err);
  }
});

export default router;
