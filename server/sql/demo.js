// Adds demo accounts and activity so the app looks real in a demo. Run after npm run db:setup.
// Every demo account uses the password demo1234.
import bcrypt from "bcryptjs";
import pool from "../src/db.js";
import { makePenName } from "../src/routes/auth.js";

const password = await bcrypt.hash("demo1234", 10);

async function addUser(name, email) {
  const { rows } = await pool.query(
    "INSERT INTO users (name, email, password_hash, pen_name) VALUES ($1, $2, $3, $4) RETURNING id",
    [name, email, password, await makePenName()]
  );
  return rows[0].id;
}

async function addHelper(name, email, profile, status = "approved") {
  const id = await addUser(name, email);
  await pool.query(
    `INSERT INTO helper_profiles (user_id, kind, license_number, bio, specialisations, languages, gender, is_free, is_available, status, approved_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [id, profile.kind, profile.license || null, profile.bio, profile.helps, profile.languages, profile.gender,
      profile.free, profile.available, status, status === "approved" ? new Date() : null]
  );
  if (status === "approved") await pool.query("UPDATE users SET role = 'helper' WHERE id = $1", [id]);
  return id;
}

async function addPost(userId, circle, title, body, daysAgo) {
  const { rows } = await pool.query(
    "INSERT INTO posts (user_id, circle, title, body, created_at) VALUES ($1, $2, $3, $4, NOW() - $5 * INTERVAL '1 day') RETURNING id",
    [userId, circle, title, body, daysAgo]
  );
  return rows[0].id;
}

async function addComment(postId, userId, body) {
  await pool.query("INSERT INTO comments (post_id, user_id, body) VALUES ($1, $2, $3)", [postId, userId, body]);
}

async function react(postId, userId, type) {
  await pool.query("INSERT INTO reactions (post_id, user_id, type) VALUES ($1, $2, $3)", [postId, userId, type]);
}

try {
  await addHelper("Dr. Ananya Rao", "ananya@demo.com", {
    kind: "licensed", license: "RCI A-12345", gender: "Female", free: true, available: true,
    helps: ["Anxiety", "Stress", "Exam stress"], languages: ["English", "Hindi"],
    bio: "Clinical psychologist with eight years of experience working with college students. I focus on anxiety, exam pressure and building routines that actually stick.",
  });
  await addHelper("Kunal Desai", "kunal@demo.com", {
    kind: "volunteer", gender: "Male", free: true, available: true,
    helps: ["Loneliness", "Relationships", "Exam stress"], languages: ["English", "Gujarati", "Hindi"],
    bio: "Final-year psychology student and trained peer listener with my college wellness cell. Happy to just listen.",
  });
  await addHelper("Dr. Farah Khan", "farah@demo.com", {
    kind: "licensed", license: "RCI B-67890", gender: "Female", free: false, available: false,
    helps: ["Depression", "Grief", "Family", "Sleep"], languages: ["English", "Hindi", "Bengali"],
    bio: "Counselling psychologist. I work with grief, low mood and family conflict, using CBT-based approaches.",
  });
  await addHelper("Vikram Joshi", "vikram@demo.com", {
    kind: "volunteer", gender: "Male", free: true, available: false,
    helps: ["Stress", "Sleep"], languages: ["English", "Marathi"],
    bio: "Certified in psychological first aid. I volunteer on weekends.",
  }, "pending");

  const asha = await addUser("Asha Patel", "asha@demo.com");
  const kabir = await addUser("Kabir Shah", "kabir@demo.com");
  const meera = await addUser("Meera Iyer", "meera@demo.com");
  const rohan = await addUser("Rohan Verma", "rohan@demo.com");

  const exams = await addPost(asha, "Exam stress", "Boards are next week and I can't sleep",
    "Every night I lie awake going over formulas. I know I have studied, but I keep thinking I will blank out in the exam hall. Does anyone else get this?", 2);
  await addComment(exams, kabir, "Same before my 12th boards. Writing the formulas on one sheet the night before and then stopping helped me a lot.");
  await addComment(exams, meera, "You've prepared more than you think. The breathing page before bed actually helps me.");
  await react(exams, kabir, "relate");
  await react(exams, meera, "strength");
  await react(exams, rohan, "relate");

  const city = await addPost(kabir, "Loneliness", "Moved to a new city for college",
    "It's been two months and I still eat lunch alone most days. Everyone already seems to have their group.", 4);
  await addComment(city, rohan, "Felt exactly this in first year. Joining one club, even a small one, changed things for me.");
  await react(city, asha, "relate");
  await react(city, meera, "thanks");

  const family = await addPost(meera, "Family", "Parents want engineering, I want design",
    "How do I talk to them about it without it turning into a fight every time?", 6);
  await addComment(family, asha, "Maybe show them what design jobs actually look like and pay? It helped with my parents.");
  await react(family, kabir, "strength");

  await addPost(rohan, "Anxiety", "Heart races before presentations",
    "Even small class presentations make my hands shake. Any tips that actually work?", 1);
  await addPost(asha, "General", "Small win today",
    "Went for a walk instead of scrolling for an hour. Felt a lot better than I expected.", 0);

  const moods = [2, 2, 3, 2, 3, 3, 2, 3, 4, 3, 3, 2, 3, 4, 4, 3, 4, 3, 4, 4, 3, 4, 4, 5, 4, 3, 4, 4, 5, 4];
  for (let i = 0; i < moods.length; i++) {
    const daysAgo = moods.length - 1 - i;
    if (daysAgo === 0) continue;
    await pool.query(
      `INSERT INTO mood_entries (user_id, entry_date, mood, stress, energy, sleep_hours)
       VALUES ($1, CURRENT_DATE - $2::int, $3, $4, $5, $6)`,
      [asha, daysAgo, moods[i], 6 - moods[i], Math.min(5, moods[i] + (i % 2)), 5 + (moods[i] % 4)]
    );
  }

  const entries = [
    ["Mock test went badly", "Physics was a disaster. Talked to Kabir after and felt a little better. Need to redo the optics chapter.", "Sad", 9],
    ["Good walk", "Went for a walk after dinner instead of studying late. Slept properly for once.", "Calm", 5],
    ["Grateful list", "Mom's food, the breathing exercise, finishing the chemistry revision.", "Grateful", 2],
  ];
  for (const [title, body, emotion, daysAgo] of entries) {
    await pool.query(
      `INSERT INTO journal_entries (user_id, title, body, emotion, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW() - $5 * INTERVAL '1 day', NOW() - $5 * INTERVAL '1 day')`,
      [asha, title, body, emotion, daysAgo]
    );
  }

  await pool.query(
    `INSERT INTO assessments (user_id, type, score, level, taken_at) VALUES
       ($1, 'GAD7', 13, 'Moderate', NOW() - INTERVAL '3 days'),
       ($1, 'PSS10', 22, 'Moderate', NOW() - INTERVAL '3 days'),
       ($1, 'GAD7', 16, 'High', NOW() - INTERVAL '20 days')`,
    [asha]
  );

  await pool.query(
    "INSERT INTO bookmarks (user_id, resource_id) SELECT $1, id FROM resources WHERE title IN ('Box breathing in four steps', 'Why sleep matters before exams')",
    [asha]
  );

  await pool.query(
    "INSERT INTO reports (reporter_id, post_id, reason) VALUES ($1, $2, 'Not sure this belongs in Family')",
    [rohan, family]
  );

  console.log("Demo data added. Log in as asha@demo.com / demo1234 (helpers: ananya@demo.com, kunal@demo.com).");
} catch (err) {
  console.error("Demo data failed:", err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
