import { Router } from "express";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT r.* FROM bookmarks b
       JOIN resources r ON r.id = b.resource_id
       WHERE b.user_id = $1
       ORDER BY r.title`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post("/:resourceId", async (req, res, next) => {
  try {
    await query(
      "INSERT INTO bookmarks (user_id, resource_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [req.user.id, req.params.resourceId]
    );
    res.status(201).json({ message: "Saved." });
  } catch (err) {
    next(err);
  }
});

router.delete("/:resourceId", async (req, res, next) => {
  try {
    await query("DELETE FROM bookmarks WHERE user_id = $1 AND resource_id = $2", [req.user.id, req.params.resourceId]);
    res.json({ message: "Removed." });
  } catch (err) {
    next(err);
  }
});

export default router;
