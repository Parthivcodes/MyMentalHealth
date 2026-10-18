import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { errorMessage } from "../api/axios.js";
import ReportButton from "../components/ReportButton.jsx";
import CrisisNotice, { hasCrisisWords } from "../components/CrisisNotice.jsx";

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [options, setOptions] = useState(null);
  const [post, setPost] = useState(null);
  const [reply, setReply] = useState("");
  const [showCrisis, setShowCrisis] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try {
      const { data } = await api.get(`/posts/${id}`);
      setPost(data);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  useEffect(() => {
    api.get("/options").then(({ data }) => setOptions(data));
    load();
  }, [id]);

  async function toggleReaction(type) {
    const { data } = await api.post(`/posts/${id}/reactions`, { type });
    setPost({ ...post, my_reactions: data });
  }

  async function sendReply() {
    setError("");
    try {
      await api.post(`/posts/${id}/comments`, { body: reply });
      setReply("");
      setShowCrisis(false);
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  function handleReply(e) {
    e.preventDefault();
    if (!showCrisis && hasCrisisWords(reply, options.crisisWords)) {
      setShowCrisis(true);
      return;
    }
    sendReply();
  }

  async function deletePost() {
    await api.delete(`/posts/${id}`);
    navigate("/community");
  }

  if (error && !post) return <div className="container py-5"><div className="alert alert-danger">{error}</div></div>;
  if (!post || !options) return <div className="container py-5 text-secondary">Loading...</div>;

  const reactionLabel = (type) => options.reactions.find((r) => r.type === type)?.label;

  return (
    <div className="container py-5" style={{ maxWidth: "48rem" }}>
      <Link to="/community" className="small">Back to community</Link>

      <article className="cc-panel mt-3 mb-4">
        <div className="small text-secondary mb-1">
          {post.circle} · {post.pen_name} · {new Date(post.created_at).toLocaleDateString()}
        </div>
        <h1 className="h3 mb-3">{post.title}</h1>
        <p style={{ whiteSpace: "pre-wrap" }}>{post.body}</p>

        <div className="d-flex flex-wrap gap-2 mb-2">
          {options.reactions.map((r) => (
            <button key={r.type} onClick={() => toggleReaction(r.type)}
              className={`btn btn-sm ${post.my_reactions.includes(r.type) ? "btn-primary" : "btn-outline-primary"}`}>
              {r.label}
            </button>
          ))}
        </div>
        {post.is_mine && post.received_reactions.length > 0 && (
          <p className="small text-secondary mb-2">
            People sent you: {post.received_reactions.map(reactionLabel).join(", ")}
          </p>
        )}

        <div className="d-flex gap-3 mt-3">
          {post.is_mine && !confirmDelete && (
            <button className="btn btn-link btn-sm text-danger p-0" onClick={() => setConfirmDelete(true)}>Delete post</button>
          )}
          {confirmDelete && (
            <span className="small">
              Delete this post for good?{" "}
              <button className="btn btn-danger btn-sm ms-2" onClick={deletePost}>Delete</button>
              <button className="btn btn-link btn-sm" onClick={() => setConfirmDelete(false)}>Keep it</button>
            </span>
          )}
          {!post.is_mine && <ReportButton target={{ post_id: post.id }} />}
        </div>
      </article>

      <h2 className="h5 mb-3">Replies</h2>
      {post.comments.length === 0 && <p className="text-secondary">No replies yet. A kind word can mean a lot.</p>}

      <div className="d-grid gap-2 mb-4">
        {post.comments.map((c) => (
          <div className="cc-panel py-3" key={c.id}>
            <div className="small text-secondary mb-1">
              {c.pen_name} · {new Date(c.created_at).toLocaleDateString()}
            </div>
            <p className="mb-1" style={{ whiteSpace: "pre-wrap" }}>{c.body}</p>
            {!c.is_mine && <ReportButton target={{ comment_id: c.id }} />}
          </div>
        ))}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {showCrisis && <CrisisNotice onContinue={sendReply} />}

      <form onSubmit={handleReply}>
        <label htmlFor="reply" className="form-label">Write a reply</label>
        <textarea id="reply" rows="3" className="form-control mb-2" value={reply}
          onChange={(e) => setReply(e.target.value)} required />
        {!showCrisis && <button type="submit" className="btn btn-primary">Reply</button>}
      </form>
    </div>
  );
}
