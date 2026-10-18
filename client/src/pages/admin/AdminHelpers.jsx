import PageIntro from "../../components/PageIntro.jsx";
import { useEffect, useState } from "react";
import api, { errorMessage } from "../../api/axios.js";
import AdminNav from "../../components/AdminNav.jsx";

const tabs = ["pending", "approved", "rejected"];

export default function AdminHelpers() {
  const [status, setStatus] = useState("pending");
  const [helpers, setHelpers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/admin/helpers?status=${status}`);
      setHelpers(data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [status]);

  async function decide(userId, newStatus) {
    try {
      await api.patch(`/admin/helpers/${userId}`, { status: newStatus });
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <div className="container py-5">
      <PageIntro eyebrow="CARE FOR YOUR COMMUNITY" title="Admin" />
      <AdminNav />

      <div className="d-flex gap-2 mb-4">
        {tabs.map((t) => (
          <button key={t} onClick={() => setStatus(t)}
            className={`btn btn-sm ${t === status ? "btn-primary" : "btn-outline-primary"}`}>
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading && <p className="text-secondary">Loading...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && helpers.length === 0 && <p className="text-secondary">No {status} applications.</p>}

      <div className="d-grid gap-3" style={{ maxWidth: "48rem" }}>
        {helpers.map((h) => (
          <div className="cc-panel" key={h.user_id}>
            <div className="d-flex flex-wrap justify-content-between gap-2 mb-2">
              <div>
                <div className="fw-bold">{h.name}</div>
                <div className="text-secondary small">{h.email}</div>
              </div>
              <div className="text-secondary small">Applied {new Date(h.applied_at).toLocaleDateString()}</div>
            </div>

            <p className="mb-2">{h.bio}</p>

            <div className="small mb-3">
              <div><strong>Type:</strong> {h.kind === "licensed" ? "Licensed therapist" : "Volunteer listener"}</div>
              {h.license_number && <div><strong>License:</strong> {h.license_number}</div>}
              <div><strong>Helps with:</strong> {h.specialisations.join(", ")}</div>
              <div><strong>Languages:</strong> {h.languages.join(", ")}</div>
              {h.gender && <div><strong>Gender:</strong> {h.gender}</div>}
              <div><strong>Fee:</strong> {h.is_free ? "Free" : "Paid"}</div>
            </div>

            <div className="d-flex gap-2">
              {status !== "approved" && (
                <button className="btn btn-primary btn-sm" onClick={() => decide(h.user_id, "approved")}>Approve</button>
              )}
              {status !== "rejected" && (
                <button className="btn btn-outline-danger btn-sm" onClick={() => decide(h.user_id, "rejected")}>
                  {status === "approved" ? "Remove verification" : "Reject"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

