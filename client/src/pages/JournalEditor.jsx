import PageIntro from "../components/PageIntro.jsx";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { errorMessage } from "../api/axios.js";

export default function JournalEditor() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const [emotions, setEmotions] = useState([]);
  const [form, setForm] = useState({ title: "", body: "", emotion: "" });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/options").then(({ data }) => setEmotions(data.emotions));
    if (!isNew) {
      api
        .get(`/journal/${id}`)
        .then(({ data }) => setForm({ title: data.title, body: data.body, emotion: data.emotion || "" }))
        .catch((err) => setError(errorMessage(err)));
    }
  }, [id]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      if (isNew) await api.post("/journal", form);
      else await api.put(`/journal/${id}`, form);
      navigate("/journal");
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function deleteEntry() {
    await api.delete(`/journal/${id}`);
    navigate("/journal");
  }

  return (
    <div className="container py-5" style={{ maxWidth: "44rem" }}>
      <Link to="/journal" className="small">Back to journal</Link>
      <PageIntro eyebrow="LET YOUR THOUGHTS UNFOLD" title={<>{isNew ? "New entry" : "Edit entry"}</>} />

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="title" className="form-label">Title</label>
          <input id="title" name="title" className="form-control" maxLength={200}
            value={form.title} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <div className="form-label">How are you feeling?</div>
          <div className="d-flex flex-wrap gap-2">
            {emotions.map((em) => (
              <button type="button" key={em} onClick={() => setForm({ ...form, emotion: form.emotion === em ? "" : em })}
                className={`btn btn-sm ${form.emotion === em ? "btn-primary" : "btn-outline-primary"}`}>
                {em}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="body" className="form-label">Write freely</label>
          <textarea id="body" name="body" rows="12" className="form-control"
            value={form.body} onChange={handleChange} required />
        </div>

        <div className="d-flex flex-wrap align-items-center gap-3">
          <button type="submit" className="btn btn-primary">Save</button>
          {!isNew && !confirmDelete && (
            <button type="button" className="btn btn-link text-danger" onClick={() => setConfirmDelete(true)}>
              Delete entry
            </button>
          )}
          {confirmDelete && (
            <span className="small">
              Delete this entry for good?
              <button type="button" className="btn btn-danger btn-sm ms-2" onClick={deleteEntry}>Delete</button>
              <button type="button" className="btn btn-link btn-sm" onClick={() => setConfirmDelete(false)}>Keep it</button>
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

