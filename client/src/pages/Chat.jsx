import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { errorMessage } from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { chatKey, decryptMessage, encryptMessage } from "../crypto.js";
import ReportButton from "../components/ReportButton.jsx";

export default function Chat() {
  const { id } = useParams();
  const { user } = useAuth();
  const [chat, setChat] = useState(null);
  const [key, setKey] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [reporting, setReporting] = useState(false);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState("");

  const lastId = messages.length ? messages[messages.length - 1].id : 0;

  useEffect(() => {
    async function open() {
      try {
        const { data } = await api.get(`/chats/${id}`);
        setChat(data);
        const myKey = localStorage.getItem("privateKey");
        if (myKey && data.other_public_key) setKey(await chatKey(myKey, data.other_public_key));
      } catch (err) {
        setError(errorMessage(err));
      }
    }
    open();
  }, [id]);

  async function fetchNew(after) {
    const { data } = await api.get(`/chats/${id}/messages`, { params: { after } });
    if (data.length === 0) return;

    const decrypted = [];
    for (const m of data) {
      decrypted.push({ ...m, text: await decryptMessage(key, m) });
    }
    setMessages((old) => [...old, ...decrypted.filter((m) => !old.some((o) => o.id === m.id))]);
  }

  useEffect(() => {
    if (!key) return;
    fetchNew(lastId);
    const timer = setInterval(() => fetchNew(lastId), 3000);
    return () => clearInterval(timer);
  }, [key, lastId]);

  async function send(e) {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await api.post(`/chats/${id}/messages`, await encryptMessage(key, text.trim()));
      setText("");
      fetchNew(lastId);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  function toggleSelected(messageId) {
    if (selected.includes(messageId)) setSelected(selected.filter((x) => x !== messageId));
    else setSelected([...selected, messageId]);
  }

  const evidence = messages
    .filter((m) => selected.includes(m.id))
    .map((m) => `${m.sender_id === user.id ? "Reporter" : chat.other_name}: ${m.text}`)
    .join("\n");

  if (error && !chat) return <div className="container py-5"><div className="alert alert-danger">{error}</div></div>;
  if (!chat) return <div className="container py-5 text-secondary">Loading...</div>;

  return (
    <div className="container py-5" style={{ maxWidth: "44rem" }}>
      <Link to="/chats" className="small">Back to chats</Link>
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mt-3 mb-1">
        <h1 className="h3 mb-0">{chat.other_name}</h1>
        {!reporting && (
          <button className="btn btn-link btn-sm text-secondary p-0" onClick={() => setReporting(true)}>Report this chat</button>
        )}
      </div>
      <p className="small text-secondary mb-3">
        End-to-end encrypted. Only you and {chat.other_name} can read these messages.
      </p>

      {!localStorage.getItem("privateKey") && (
        <div className="alert alert-warning">Your secure chat key isn't on this device. Log out and log in again to read your messages.</div>
      )}
      {localStorage.getItem("privateKey") && !chat.other_public_key && (
        <div className="alert alert-warning">{chat.other_name} hasn't set up secure chat yet. They will when they next log in.</div>
      )}

      {reporting && (
        <div className="cc-helpline mb-3">
          <p className="mb-2">Tick the messages you want an admin to see. Admins can't read anything else in this chat.</p>
          {selected.length > 0 && <ReportButton target={{ chat_id: chat.id, evidence }} startOpen />}
          <button className="btn btn-link btn-sm p-0 mt-2" onClick={() => { setReporting(false); setSelected([]); }}>Done</button>
        </div>
      )}

      <div className="cc-chat mb-3">
        {[...messages].reverse().map((m) => (
          <div key={m.id} className={`cc-message ${m.sender_id === user.id ? "is-mine" : ""}`}>
            {reporting && (
              <input type="checkbox" className="form-check-input me-2" checked={selected.includes(m.id)}
                onChange={() => toggleSelected(m.id)} aria-label="Include in report" />
            )}
            <div>
              <div style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
              <div className="cc-message-time">
                {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        ))}
        {key && messages.length === 0 && <p className="text-secondary text-center my-auto">Say hello. Take your time.</p>}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <form className="d-flex gap-2" onSubmit={send}>
        <input className="form-control" placeholder="Write a message" value={text}
          onChange={(e) => setText(e.target.value)} disabled={!key} />
        <button type="submit" className="btn btn-primary" disabled={!key || !text.trim()}>Send</button>
      </form>
    </div>
  );
}
