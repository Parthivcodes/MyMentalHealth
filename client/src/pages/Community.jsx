import PageIntro from "../components/PageIntro.jsx";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { errorMessage } from "../api/axios.js";

export default function Community() {
  const [circles, setCircles] = useState([]);
  const [circle, setCircle] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/options").then(({ data }) => setCircles(data.circles));
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/posts", { params: circle ? { circle } : {} });
        setPosts(data);
      } catch (err) {
        setError(errorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [circle]);

  return (
    <div className="container py-5">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-2">
        <PageIntro eyebrow="YOU BELONG HERE" title="Community" />
        <Link to="/community/new" className="btn btn-primary">New post</Link>
      </div>
      <p className="text-secondary mb-4">
        Everyone here uses a pen name. Reply with care, or send a supportive reaction.
      </p>

      <div className="d-flex flex-wrap gap-2 mb-4">
        {["", ...circles].map((c) => (
          <button key={c || "all"} onClick={() => setCircle(c)}
            className={`btn btn-sm ${c === circle ? "btn-primary" : "btn-outline-primary"}`}>
            {c || "All circles"}
          </button>
        ))}
      </div>

      {loading && <p className="text-secondary">Loading...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && !error && posts.length === 0 && (
        <p className="text-secondary">No posts here yet. You could be the first to share.</p>
      )}

      <div className="d-grid gap-3" style={{ maxWidth: "48rem" }}>
        {posts.map((p) => (
          <Link to={`/community/${p.id}`} className="cc-panel d-block text-decoration-none text-reset" key={p.id}>
            <div className="small text-secondary mb-1">
              {p.circle} · {p.pen_name} · {new Date(p.created_at).toLocaleDateString()}
            </div>
            <h2 className="h5 mb-1">{p.title}</h2>
            <p className="mb-2 text-secondary">{p.preview}</p>
            <div className="small text-secondary">
              {p.comment_count === 1 ? "1 reply" : `${p.comment_count} replies`}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

