import { Router } from "express";
import { query } from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/stats", async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT
         (SELECT COUNT(*) FROM users WHERE role <> 'admin')::int AS users,
         (SELECT COUNT(*) FROM helper_profiles WHERE status = 'approved')::int AS helpers,
         (SELECT COUNT(*) FROM helper_profiles WHERE status = 'pending')::int AS pending_helpers,
         (SELECT COUNT(*) FROM reports WHERE status = 'open')::int AS open_reports,
         (SELECT COUNT(*) FROM posts WHERE created_at > NOW() - INTERVAL '7 days')::int AS posts_this_week,
         (SELECT COUNT(*) FROM mood_entries WHERE entry_date > CURRENT_DATE - 7)::int AS mood_entries_this_week,
         (SELECT COUNT(*) FROM chats)::int AS chats`
    );
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.get("/users", async (req, res, next) => {
  try {
    const { rows } = await query(
      "SELECT id, name, email, role, pen_name, created_at FROM users ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get("/helpers", async (req, res, next) => {
  try {
    const status = req.query.status || "pending";
    const { rows } = await query(
      `SELECT h.*, u.name, u.email
       FROM helper_profiles h
       JOIN users u ON u.id = h.user_id
       WHERE h.status = $1
       ORDER BY h.applied_at`,
      [status]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.patch("/helpers/:userId", async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be approved or rejected." });
    }

    const approvedAt = status === "approved" ? new Date() : null;
    const { rows } = await query(
      "UPDATE helper_profiles SET status = $1, approved_at = $2 WHERE user_id = $3 RETURNING *",
      [status, approvedAt, req.params.userId]
    );
    if (!rows[0]) return res.status(404).json({ message: "Application not found." });

    const role = status === "approved" ? "helper" : "user";
    await query("UPDATE users SET role = $1 WHERE id = $2 AND role <> 'admin'", [role, req.params.userId]);

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.get("/reports", async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT r.id, r.reason, r.evidence, r.created_at, r.post_id, r.comment_id, r.chat_id,
              reporter.pen_name AS reporter,
              p.title AS post_title, p.body AS post_body,
              c.body AS comment_body, c.post_id AS comment_post_id
       FROM reports r
       JOIN users reporter ON reporter.id = r.reporter_id
       LEFT JOIN posts p ON p.id = r.post_id
       LEFT JOIN comments c ON c.id = r.comment_id
       WHERE r.status = 'open'
       ORDER BY r.created_at`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.patch("/reports/:id", async (req, res, next) => {
  try {
    const { rows } = await query(
      "UPDATE reports SET status = 'resolved' WHERE id = $1 RETURNING post_id, comment_id",
      [req.params.id]
    );
    const report = rows[0];
    if (!report) return res.status(404).json({ message: "Report not found." });

    if (req.body.hide && report.post_id) {
      await query("UPDATE posts SET is_hidden = TRUE WHERE id = $1", [report.post_id]);
    }
    if (req.body.hide && report.comment_id) {
      await query("UPDATE comments SET is_hidden = TRUE WHERE id = $1", [report.comment_id]);
    }

    res.json({ message: "Report resolved." });
  } catch (err) {
    next(err);
  }
});

export default router;
