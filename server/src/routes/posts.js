import { Router } from "express";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import options from "../options.js";

const router = Router();

router.use(requireAuth);

async function postIsVisible(id) {
  const { rows } = await query("SELECT id FROM posts WHERE id = $1 AND NOT is_hidden", [id]);
  return rows.length > 0;
}

router.get("/", async (req, res, next) => {
  try {
    const params = [];
    let circleFilter = "";
    if (req.query.circle) {
      params.push(req.query.circle);
      circleFilter = "AND p.circle = $1";
    }

    const { rows } = await query(
      `SELECT p.id, p.circle, p.title, LEFT(p.body, 220) AS preview, p.created_at, u.pen_name,
              (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id AND NOT c.is_hidden)::int AS comment_count
       FROM posts p
       JOIN users u ON u.id = p.user_id
       WHERE NOT p.is_hidden ${circleFilter}
       ORDER BY p.created_at DESC`,
      params
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { circle, title, body } = req.body;
    if (!options.circles.includes(circle) || !title?.trim() || !body?.trim()) {
      return res.status(400).json({ message: "Choose a circle and write a title and a message." });
    }

    const { rows } = await query(
      "INSERT INTO posts (user_id, circle, title, body) VALUES ($1, $2, $3, $4) RETURNING id",
      [req.user.id, circle, title.trim(), body.trim()]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const postResult = await query(
      `SELECT p.id, p.circle, p.title, p.body, p.created_at, p.user_id, p.is_hidden, u.pen_name
       FROM posts p
       JOIN users u ON u.id = p.user_id
       WHERE p.id = $1`,
      [req.params.id]
    );
    const post = postResult.rows[0];
    if (!post || (post.is_hidden && req.user.role !== "admin")) {
      return res.status(404).json({ message: "This post doesn't exist or was removed." });
    }

    const comments = await query(
      `SELECT c.id, c.body, c.created_at, u.pen_name, c.user_id = $2 AS is_mine
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.post_id = $1 AND NOT c.is_hidden
       ORDER BY c.created_at`,
      [post.id, req.user.id]
    );
    const reactions = await query("SELECT user_id, type FROM reactions WHERE post_id = $1", [post.id]);

    const { user_id, ...rest } = post;
    res.json({
      ...rest,
      is_mine: user_id === req.user.id,
      comments: comments.rows,
      my_reactions: reactions.rows.filter((r) => r.user_id === req.user.id).map((r) => r.type),
      received_reactions: [...new Set(reactions.rows.map((r) => r.type))],
    });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { rowCount } = await query(
      "DELETE FROM posts WHERE id = $1 AND (user_id = $2 OR $3)",
      [req.params.id, req.user.id, req.user.role === "admin"]
    );
    if (!rowCount) return res.status(404).json({ message: "Post not found." });
    res.json({ message: "Post deleted." });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/comments", async (req, res, next) => {
  try {
    const { body } = req.body;
    if (!body?.trim()) {
      return res.status(400).json({ message: "Write something before sending." });
    }
    if (!(await postIsVisible(req.params.id))) {
      return res.status(404).json({ message: "This post doesn't exist or was removed." });
    }

    const { rows } = await query(
      "INSERT INTO comments (post_id, user_id, body) VALUES ($1, $2, $3) RETURNING id",
      [req.params.id, req.user.id, body.trim()]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/reactions", async (req, res, next) => {
  try {
    const { type } = req.body;
    if (!options.reactions.some((r) => r.type === type)) {
      return res.status(400).json({ message: "Unknown reaction." });
    }
    if (!(await postIsVisible(req.params.id))) {
      return res.status(404).json({ message: "This post doesn't exist or was removed." });
    }

    const removed = await query(
      "DELETE FROM reactions WHERE post_id = $1 AND user_id = $2 AND type = $3",
      [req.params.id, req.user.id, type]
    );
    if (removed.rowCount === 0) {
      await query("INSERT INTO reactions (post_id, user_id, type) VALUES ($1, $2, $3)", [req.params.id, req.user.id, type]);
    }

    const { rows } = await query(
      "SELECT type FROM reactions WHERE post_id = $1 AND user_id = $2",
      [req.params.id, req.user.id]
    );
    res.json(rows.map((r) => r.type));
  } catch (err) {
    next(err);
  }
});

export default router;
