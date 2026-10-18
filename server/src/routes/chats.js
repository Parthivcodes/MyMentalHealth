import { Router } from "express";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

// Helpers are shown by their real name, people seeking help only by their pen name.
const chatFields = `
  c.id, c.user_id, c.helper_id, c.created_at,
  CASE WHEN c.user_id = $1 THEN helper.name ELSE seeker.pen_name END AS other_name,
  CASE WHEN c.user_id = $1 THEN helper.public_key ELSE seeker.public_key END AS other_public_key,
  c.helper_id = $1 AS i_am_helper`;

async function findChat(chatId, userId) {
  const { rows } = await query(
    `SELECT ${chatFields}
     FROM chats c
     JOIN users seeker ON seeker.id = c.user_id
     JOIN users helper ON helper.id = c.helper_id
     WHERE c.id = $2 AND (c.user_id = $1 OR c.helper_id = $1)`,
    [userId, chatId]
  );
  return rows[0];
}

router.get("/", async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT ${chatFields},
              (SELECT MAX(created_at) FROM messages m WHERE m.chat_id = c.id) AS last_message_at
       FROM chats c
       JOIN users seeker ON seeker.id = c.user_id
       JOIN users helper ON helper.id = c.helper_id
       WHERE c.user_id = $1 OR c.helper_id = $1
       ORDER BY last_message_at DESC NULLS LAST, c.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const helperId = Number(req.body.helper_id);
    if (helperId === req.user.id) {
      return res.status(400).json({ message: "You can't start a chat with yourself." });
    }

    const helper = await query("SELECT user_id FROM helper_profiles WHERE user_id = $1 AND status = 'approved'", [helperId]);
    if (!helper.rows[0]) return res.status(404).json({ message: "Helper not found." });

    const { rows } = await query(
      `INSERT INTO chats (user_id, helper_id) VALUES ($1, $2)
       ON CONFLICT (user_id, helper_id) DO UPDATE SET user_id = EXCLUDED.user_id
       RETURNING id`,
      [req.user.id, helperId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const chat = await findChat(req.params.id, req.user.id);
    if (!chat) return res.status(404).json({ message: "Chat not found." });
    res.json(chat);
  } catch (err) {
    next(err);
  }
});

router.get("/:id/messages", async (req, res, next) => {
  try {
    const chat = await findChat(req.params.id, req.user.id);
    if (!chat) return res.status(404).json({ message: "Chat not found." });

    const { rows } = await query(
      `SELECT id, sender_id, ciphertext, iv, created_at
       FROM messages
       WHERE chat_id = $1 AND id > $2
       ORDER BY id`,
      [chat.id, Number(req.query.after) || 0]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/messages", async (req, res, next) => {
  try {
    const chat = await findChat(req.params.id, req.user.id);
    if (!chat) return res.status(404).json({ message: "Chat not found." });

    const { ciphertext, iv } = req.body;
    if (!ciphertext || !iv) {
      return res.status(400).json({ message: "Message must be encrypted before sending." });
    }

    const { rows } = await query(
      "INSERT INTO messages (chat_id, sender_id, ciphertext, iv) VALUES ($1, $2, $3, $4) RETURNING id",
      [chat.id, req.user.id, ciphertext, iv]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
