import PageIntro from "../components/PageIntro.jsx";
import { useEffect, useState } from "react";
import api, { errorMessage } from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Resources() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [resources, setResources] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/options").then(({ data }) => setCategories(data.resourceCategories));
    if (user) api.get("/bookmarks").then(({ data }) => setSavedIds(data.map((r) => r.id)));
  }, [user]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const params = category && category !== "Saved" ? { category } : {};
        const { data } = await api.get("/resources", { params });
        setResources(data);
      } catch (err) {
        setError(errorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [category]);

  async function toggleSaved(id) {
    if (savedIds.includes(id)) {
      await api.delete(`/bookmarks/${id}`);
      setSavedIds(savedIds.filter((x) => x !== id));
    } else {
      await api.post(`/bookmarks/${id}`);
      setSavedIds([...savedIds, id]);
    }
  }

  const filters = user ? ["", "Saved", ...categories] : ["", ...categories];
  const shown = category === "Saved" ? resources.filter((r) => savedIds.includes(r.id)) : resources;

  return (
    <div className="container py-5">
      <PageIntro eyebrow="A LITTLE KNOWLEDGE, A LITTLE CLARITY" title="Resources" />

      <div className="d-flex flex-wrap gap-2 mb-4">
        {filters.map((c) => (
          <button
            key={c || "all"}
            className={`btn btn-sm ${c === category ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setCategory(c)}
          >
            {c || "All"}
          </button>
        ))}
      </div>

      {loading && <p className="text-secondary">Loading...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && !error && shown.length === 0 && (
        <p className="text-secondary">{category === "Saved" ? "You haven't saved anything yet." : "Nothing in this category yet."}</p>
      )}

      <div className="d-grid gap-3" style={{ maxWidth: "46rem" }}>
        {shown.map((r) => (
          <article className="cc-panel" key={r.id}>
            <div className="d-flex justify-content-between gap-2 mb-1">
              <div className="small text-secondary text-capitalize">{r.type} · {r.category}</div>
              {user && (
                <button className="btn btn-link btn-sm p-0" onClick={() => toggleSaved(r.id)}>
                  {savedIds.includes(r.id) ? "Saved" : "Save"}
                </button>
              )}
            </div>
            <h2 className="h5 mb-2">
              {r.url ? <a href={r.url} target="_blank" rel="noreferrer">{r.title}</a> : r.title}
            </h2>
            {r.body && <p className="mb-0">{r.body}</p>}
          </article>
        ))}
      </div>
    </div>
  );
}

