import { Router } from "express";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import options from "../options.js";

const router = Router();

router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const { rows } = await query(
      "SELECT id, type, score, level, taken_at FROM assessments WHERE user_id = $1 ORDER BY taken_at DESC",
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { type, answers } = req.body;
    const test = options.assessments[type];
    const maxAnswer = test ? test.choices.length - 1 : 0;

    if (!test || answers?.length !== test.questions.length || answers.some((a) => !(a >= 0 && a <= maxAnswer))) {
      return res.status(400).json({ message: "Please answer every question." });
    }

    let score = 0;
    answers.forEach((answer, i) => {
      score += test.reversed.includes(i) ? maxAnswer - answer : answer;
    });
    const result = test.levels.find((l) => score <= l.max);

    const { rows } = await query(
      "INSERT INTO assessments (user_id, type, score, level) VALUES ($1, $2, $3, $4) RETURNING *",
      [req.user.id, type, score, result.level]
    );
    res.status(201).json({ ...rows[0], tip: result.tip });
  } catch (err) {
    next(err);
  }
});

export default router;
