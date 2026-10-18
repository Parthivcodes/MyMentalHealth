import PageIntro from "../../components/PageIntro.jsx";
import { useEffect, useState } from "react";
import api, { errorMessage } from "../../api/axios.js";
import AdminNav from "../../components/AdminNav.jsx";

const emptyForm = { title: "", type: "article", category: "", url: "", body: "" };

export default function AdminResources() {
  const [categories, setCategories] = useState([]);
  const [resources, setResources] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    const { data } = await api.get("/resources");
    setResources(data);
  }

  useEffect(() => {
    api.get("/options").then(({ data }) => setCategories(data.resourceCategories));
    load();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function startEdit(r) {
    setEditingId(r.id);
    setForm({ title: r.title, type: r.type, category: r.category, url: r.url || "", body: r.body || "" });
    window.scrollTo(0, 0);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      if (editingId) await api.put(`/resources/${editingId}`, form);
      else await api.post("/resources", form);
      cancelEdit();
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function remove(id) {
    await api.delete(`/resources/${id}`);
    load();
  }

  return (
    <div className="container py-5">
      <PageIntro eyebrow="CARE FOR YOUR COMMUNITY" title="Admin" />
      <AdminNav />

      <form className="cc-panel mb-4" style={{ maxWidth: "48rem" }} onSubmit={handleSubmit}>
        <h2 className="h5 mb-3">{editingId ? "Edit resource" : "Add a resource"}</h2>
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="mb-3">
          <label htmlFor="title" className="form-label">Title</label>
          <input id="title" name="title" className="form-control" value={form.title} onChange={handleChange} required />
        </div>
        <div className="row g-3 mb-3">
          <div className="col-sm-6">
            <label htmlFor="type" className="form-label">Type</label>
            <select id="type" name="type" className="form-select" value={form.type} onChange={handleChange}>
              <option value="article">Article (written here)</option>
              <option value="video">Video link</option>
              <option value="link">Website link</option>
            </select>
          </div>
          <div className="col-sm-6">
            <label htmlFor="category" className="form-label">Category</label>
            <select id="category" name="category" className="form-select" value={form.category} onChange={handleChange} required>
              <option value="">Choose...</option>
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        {form.type === "article" ? (
          <div className="mb-3">
            <label htmlFor="body" className="form-label">Article text</label>
            <textarea id="body" name="body" rows="5" className="form-control" value={form.body} onChange={handleChange} required />
          </div>
        ) : (
          <div className="mb-3">
            <label htmlFor="url" className="form-label">Link</label>
            <input id="url" name="url" type="url" className="form-control" value={form.url} onChange={handleChange} required />
          </div>
        )}
        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary">{editingId ? "Save changes" : "Add resource"}</button>
          {editingId && <button type="button" className="btn btn-link" onClick={cancelEdit}>Cancel</button>}
        </div>
      </form>

      <div className="cc-panel p-0 table-responsive">
        <table className="table mb-0 align-middle">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Category</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {resources.map((r) => (
              <tr key={r.id}>
                <td>{r.title}</td>
                <td className="text-capitalize">{r.type}</td>
                <td>{r.category}</td>
                <td className="text-end text-nowrap">
                  <button className="btn btn-link btn-sm" onClick={() => startEdit(r)}>Edit</button>
                  <button className="btn btn-link btn-sm text-danger" onClick={() => remove(r.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

