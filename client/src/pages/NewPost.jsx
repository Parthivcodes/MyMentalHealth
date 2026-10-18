import PageIntro from "../components/PageIntro.jsx";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { errorMessage } from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import CrisisNotice, { hasCrisisWords } from "../components/CrisisNotice.jsx";

export default function NewPost() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [options, setOptions] = useState(null);
  const [form, setForm] = useState({ circle: "", title: "", body: "" });
  const [showCrisis, setShowCrisis] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/options").then(({ data }) => setOptions(data));
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function publish() {
    setError("");
    try {
      const { data } = await api.post("/posts", form);
      navigate(`/community/${data.id}`);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!showCrisis && hasCrisisWords(`${form.title} ${form.body}`, options.crisisWords)) {
      setShowCrisis(true);
      return;
    }
    publish();
  }

  if (!options) return <div className="container py-5 text-secondary">Loading...</div>;

  return (
    <div className="container py-5" style={{ maxWidth: "40rem" }}>
      <PageIntro eyebrow="YOUR VOICE BELONGS HERE" title={<>New post</>} />
      <p className="text-secondary mb-4">
        You'll post as <strong>{user.pen_name}</strong>. Nobody here will see your real name.
      </p>

      {error && <div className="alert alert-danger">{error}</div>}
      {showCrisis && <CrisisNotice onContinue={publish} />}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="circle" className="form-label">Circle</label>
          <select id="circle" name="circle" className="form-select" value={form.circle} onChange={handleChange} required>
            <option value="">Choose a circle...</option>
            {options.circles.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="title" className="form-label">Title</label>
          <input id="title" name="title" className="form-control" maxLength={200}
            value={form.title} onChange={handleChange} required />
        </div>
        <div className="mb-4">
          <label htmlFor="body" className="form-label">What's on your mind?</label>
          <textarea id="body" name="body" rows="6" className="form-control"
            value={form.body} onChange={handleChange} required />
        </div>
        {!showCrisis && <button type="submit" className="btn btn-primary">Post</button>}
      </form>
    </div>
  );
}

