import PageIntro from "../components/PageIntro.jsx";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { errorMessage } from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Chats() {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/chats")
      .then(({ data }) => setChats(data))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));

    if (user.role === "helper") {
      api.get("/helpers/me").then(({ data }) => setAvailable(data.is_available));
    }
  }, [user.role]);

  async function toggleAvailable() {
    const { data } = await api.patch("/helpers/me/availability", { is_available: !available });
    setAvailable(data.is_available);
  }

  return (
    <div className="container py-5" style={{ maxWidth: "44rem" }}>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <PageIntro eyebrow="GOOD CONVERSATIONS START HERE" title="Chats" />
        <Link to="/ai" className="btn btn-outline-primary btn-sm">Ask the AI assistant</Link>
      </div>

      {user.role === "helper" && (
        <div className="cc-panel mb-4">
          <div className="form-check form-switch mb-1">
            <input className="form-check-input" type="checkbox" role="switch" id="available"
              checked={available} onChange={toggleAvailable} />
            <label className="form-check-label fw-bold" htmlFor="available">
              {available ? "You're available to chat" : "You're not available right now"}
            </label>
          </div>
          <p className="small text-secondary mb-0">
            People looking for help can filter for helpers who are available now.
          </p>
        </div>
      )}

      {loading && <p className="text-secondary">Loading...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && chats.length === 0 && (
        <p className="text-secondary">
          {user.role === "helper"
            ? "No one has started a chat with you yet."
            : <>No chats yet. <Link to="/helpers">Find a helper</Link> to start one.</>}
        </p>
      )}

      <div className="d-grid gap-2">
        {chats.map((c) => (
          <Link to={`/chats/${c.id}`} className="cc-panel py-3 d-flex justify-content-between text-decoration-none text-reset" key={c.id}>
            <div>
              <div className="fw-bold">{c.other_name}</div>
              <div className="small text-secondary">{c.i_am_helper ? "Asked you for support" : "Your helper"}</div>
            </div>
            <div className="small text-secondary">
              {c.last_message_at ? new Date(c.last_message_at).toLocaleString() : "No messages yet"}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

