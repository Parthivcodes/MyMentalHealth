import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import options from "../options.js";

const router = Router();

const crisisReply =
  "I'm really sorry you're going through this. Please talk to someone right now: call Tele-MANAS on 14416 " +
  "(free, any time) or 112 in an emergency. You can also open Find a helper to chat with a verified helper.";

router.post("/chat", requireAuth, async (req, res, next) => {
  try {
    if (!Array.isArray(req.body.messages) || req.body.messages.some((message) =>
      !message || !["user", "assistant"].includes(message.role) ||
      typeof message.text !== "string" || !message.text.trim() || message.text.length > 8000
    )) {
      return res.status(400).json({ message: "Send valid messages of up to 8,000 characters each." });
    }
    const messages = req.body.messages.slice(-10);
    const last = messages[messages.length - 1];
    if (!last || last.role !== "user" || !last.text?.trim()) {
      return res.status(400).json({ message: "Write a message first." });
    }

    const lower = last.text.toLowerCase();
    if (options.crisisWords.some((word) => lower.includes(word))) {
      return res.json({ reply: crisisReply, crisis: true });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ message: "The AI assistant isn't set up yet. Add GEMINI_API_KEY to server/.env." });
    }

    const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        signal: AbortSignal.timeout(30000),
        headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: options.aiInstructions }] },
          contents: messages.map((m) => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.text }] })),
        }),
      }
    );

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.filter((part) => !part.thought && part.text).map((part) => part.text).join("\n");
    if (!response.ok || !reply) {
      console.error("Gemini request failed:", response.status);
      if (response.status === 429) {
        return res.status(503).json({ message: "The AI assistant is busy. Please try again in a minute." });
      }
      return res.status(502).json({ message: "The AI assistant couldn't answer right now. Please try again." });
    }

    res.json({ reply });
  } catch (err) {
    if (err.name === "TimeoutError" || err.name === "AbortError") {
      return res.status(504).json({ message: "The AI assistant took too long to respond. Please try again." });
    }
    next(err);
  }
});

export default router;
