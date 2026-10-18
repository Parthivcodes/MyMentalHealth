import { Router } from "express";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { post_id, comment_id, chat_id, reason, evidence } = req.body;
    if (!reason?.trim() || (!post_id && !comment_id && !chat_id)) {
      return res.status(400).json({ message: "Tell us what's wrong so an admin can check it." });
    }

    await query(
      "INSERT INTO reports (reporter_id, post_id, comment_id, chat_id, reason, evidence) VALUES ($1, $2, $3, $4, $5, $6)",
      [req.user.id, post_id || null, comment_id || null, chat_id || null, reason.trim(), evidence || null]
    );
    res.status(201).json({ message: "Thanks. An admin will review this." });
  } catch (err) {
    next(err);
  }
});

export default router;
