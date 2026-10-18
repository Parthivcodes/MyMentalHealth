import express from "express";
import cors from "cors";
import "dotenv/config";

import options from "./options.js";
import authRoutes from "./routes/auth.js";
import helperRoutes from "./routes/helpers.js";
import postRoutes from "./routes/posts.js";
import reportRoutes from "./routes/reports.js";
import chatRoutes from "./routes/chats.js";
import assessmentRoutes from "./routes/assessments.js";
import moodRoutes from "./routes/mood.js";
import journalRoutes from "./routes/journal.js";
import resourceRoutes from "./routes/resources.js";
import bookmarkRoutes from "./routes/bookmarks.js";
import affirmationRoutes from "./routes/affirmations.js";
import aiRoutes from "./routes/ai.js";
import adminRoutes from "./routes/admin.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.get("/api/options", (req, res) => res.json(options));

app.use("/api/auth", authRoutes);
app.use("/api/helpers", helperRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/mood", moodRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/affirmations", affirmationRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api", (req, res) => res.status(404).json({ message: "Route not found." }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong on the server." });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));

