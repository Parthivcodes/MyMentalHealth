import PageIntro from "../../components/PageIntro.jsx";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { errorMessage } from "../../api/axios.js";
import AdminNav from "../../components/AdminNav.jsx";

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      const { data } = await api.get("/admin/reports");
      setReports(data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function resolve(id, hide) {
    await api.patch(`/admin/reports/${id}`, { hide });
    load();
  }

  return (
    <div className="container py-5">
      <PageIntro eyebrow="CARE FOR YOUR COMMUNITY" title="Admin" />
      <AdminNav />

      {loading && <p className="text-secondary">Loading...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && reports.length === 0 && <p className="text-secondary">No open reports.</p>}

      <div className="d-grid gap-3" style={{ maxWidth: "48rem" }}>
        {reports.map((r) => (
          <div className="cc-panel" key={r.id}>
            <div className="small text-secondary mb-2">
              Reported by {r.reporter} on {new Date(r.created_at).toLocaleDateString()}
            </div>
            <p className="mb-2"><strong>Reason:</strong> {r.reason}</p>

            <div className="cc-quote mb-3">
              {r.post_id && (
                <>
                  <div className="small mb-1">Post: <Link to={`/community/${r.post_id}`}>{r.post_title}</Link></div>
                  <div className="text-body">{r.post_body}</div>
                </>
              )}
              {r.comment_id && (
                <>
                  <div className="small mb-1">Reply on <Link to={`/community/${r.comment_post_id}`}>this post</Link></div>
                  <div className="text-body">{r.comment_body}</div>
                </>
              )}
              {r.chat_id && <div className="text-body" style={{ whiteSpace: "pre-wrap" }}>{r.evidence}</div>}
            </div>

            <div className="d-flex gap-2">
              {!r.chat_id && (
                <button className="btn btn-danger btn-sm" onClick={() => resolve(r.id, true)}>Hide it</button>
              )}
              <button className="btn btn-outline-primary btn-sm" onClick={() => resolve(r.id, false)}>
                {r.chat_id ? "Mark as reviewed" : "Keep it"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

