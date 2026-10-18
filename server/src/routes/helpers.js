import { Router } from "express";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import options from "../options.js";

const router = Router();

router.use(requireAuth);

const helperFields = `u.id, u.name, h.kind, h.bio, h.specialisations, h.languages, h.gender, h.is_free, h.is_available`;

router.get("/", async (req, res, next) => {
  try {
    const { specialisation, language, gender, free, available } = req.query;
    const conditions = ["h.status = 'approved'"];
    const params = [];

    if (specialisation) {
      params.push(specialisation);
      conditions.push(`$${params.length} = ANY(h.specialisations)`);
    }
    if (language) {
      params.push(language);
      conditions.push(`$${params.length} = ANY(h.languages)`);
    }
    if (gender) {
      params.push(gender);
      conditions.push(`h.gender = $${params.length}`);
    }
    if (free === "true") conditions.push("h.is_free");
    if (available === "true") conditions.push("h.is_available");

    const { rows } = await query(
      `SELECT ${helperFields}
       FROM helper_profiles h
       JOIN users u ON u.id = h.user_id
       WHERE ${conditions.join(" AND ")}
       ORDER BY h.is_available DESC, u.name`,
      params
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get("/suggested", async (req, res, next) => {
  try {
    const { rows: latest } = await query(
      `SELECT DISTINCT ON (type) type, level
       FROM assessments
       WHERE user_id = $1
       ORDER BY type, taken_at DESC`,
      [req.user.id]
    );

    const topics = latest
      .filter((a) => ["Moderate", "High"].includes(a.level))
      .map((a) => options.assessments[a.type].suggests);

    if (topics.length === 0) return res.json({ topics: [], helpers: [] });

    const { rows } = await query(
      `SELECT ${helperFields}
       FROM helper_profiles h
       JOIN users u ON u.id = h.user_id
       WHERE h.status = 'approved' AND h.specialisations && $1 AND u.id <> $2
       ORDER BY h.is_available DESC, u.name
       LIMIT 3`,
      [topics, req.user.id]
    );
    res.json({ topics, helpers: rows });
  } catch (err) {
    next(err);
  }
});

router.get("/me", async (req, res, next) => {
  try {
    const { rows } = await query("SELECT * FROM helper_profiles WHERE user_id = $1", [req.user.id]);
    res.json(rows[0] || null);
  } catch (err) {
    next(err);
  }
});

router.patch("/me/availability", async (req, res, next) => {
  try {
    const { rows } = await query(
      "UPDATE helper_profiles SET is_available = $1 WHERE user_id = $2 AND status = 'approved' RETURNING is_available",
      [req.body.is_available === true, req.user.id]
    );
    if (!rows[0]) return res.status(403).json({ message: "Only approved helpers can change availability." });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post("/apply", async (req, res, next) => {
  try {
    if (req.user.role !== "user") {
      return res.status(400).json({ message: "Only regular accounts can apply as a helper." });
    }

    const { kind, license_number, bio, specialisations, languages, gender, is_free } = req.body;

    if (!kind || !bio || !specialisations?.length || !languages?.length) {
      return res.status(400).json({ message: "Type, bio, at least one specialisation and one language are required." });
    }
    if (kind === "licensed" && !license_number) {
      return res.status(400).json({ message: "Licensed therapists must give a license number." });
    }

    const { rows } = await query(
      `INSERT INTO helper_profiles (user_id, kind, license_number, bio, specialisations, languages, gender, is_free)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (user_id) DO UPDATE SET
         kind = $2, license_number = $3, bio = $4, specialisations = $5, languages = $6,
         gender = $7, is_free = $8, status = 'pending', applied_at = NOW()
       RETURNING *`,
      [req.user.id, kind, license_number || null, bio, specialisations, languages, gender || null, is_free !== false]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT ${helperFields}
       FROM helper_profiles h
       JOIN users u ON u.id = h.user_id
       WHERE h.user_id = $1 AND h.status = 'approved'`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: "Helper not found." });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
