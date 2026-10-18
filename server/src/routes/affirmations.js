import { Router } from "express";
import { query } from "../db.js";

const router = Router();

// Same affirmation for everyone all day, a new one each day.
router.get("/today", async (req, res, next) => {
  try {
    const day = Math.floor(Date.now() / 86400000);
    const { rows } = await query(
      "SELECT text FROM affirmations ORDER BY id OFFSET $1 % GREATEST((SELECT COUNT(*) FROM affirmations), 1) LIMIT 1",
      [day]
    );
    res.json(rows[0] || null);
  } catch (err) {
    next(err);
  }
});

export default router;
