import PageIntro from "../components/PageIntro.jsx";
import { useState } from "react";
import { Link } from "react-router-dom";
import api, { errorMessage } from "../api/axios.js";

export default function AiChat() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState("");

  async function send(e) {
    e.preventDefault();
    if (waiting || !text.trim()) return;

    const updated = [...messages, { role: "user", text: text.trim() }];
    setMessages(updated);
    setText("");
    setError("");
    setWaiting(true);
    try {
      const { data } = await api.post("/ai/chat", { messages: updated });
      setMessages([...updated, { role: "assistant", text: data.reply, crisis: data.crisis }]);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setWaiting(false);
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: "44rem" }}>
      <PageIntro eyebrow="SPACE TO TALK THINGS THROUGH" title="AI wellness assistant" />
      <p className="small text-secondary mb-3">
        An AI that can listen and suggest small things to try. It is not a therapist. Messages here go to Google
        Gemini, aren't end-to-end encrypted and aren't saved, so avoid sharing personal details.
        For a real person, <Link to="/helpers">find a helper</Link>.
      </p>

      <div className="cc-chat mb-3">
        {waiting && <div className="cc-message text-secondary">Thinking...</div>}
        {[...messages].reverse().map((m, i) => (
          <div key={messages.length - i} className={`cc-message ${m.role === "user" ? "is-mine" : ""}`}>
            <div>
              <div style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
              {m.crisis && <Link to="/help" className="small">See where to get help now</Link>}
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <p className="text-secondary text-center my-auto">
            Tell it what's on your mind, for example "I can't focus before my exams".
          </p>
        )}
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <form className="d-flex gap-2" onSubmit={send}>
        <input className="form-control" aria-label="Message to the AI wellness assistant" maxLength={8000} placeholder="Write a message" value={text} onChange={(e) => setText(e.target.value)} />
        <button type="submit" className="btn btn-primary" disabled={waiting || !text.trim()}>Send</button>
      </form>
    </div>
  );
}

