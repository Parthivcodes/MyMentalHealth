import PageIntro from "../components/PageIntro.jsx";
import { useEffect, useState } from "react";
import api, { errorMessage } from "../api/axios.js";
import MoodChart from "../components/MoodChart.jsx";

const today = new Date().toLocaleDateString("en-CA");
const emptyForm = { mood: null, stress: null, energy: null, sleep_hours: "", note: "" };

function RatingRow({ label, name, value, labels, onChange }) {
  return (
    <div className="mb-3">
      <div className="form-label">{label}</div>
      <div className="d-flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n}>
            <input type="radio" className="btn-check" name={name} id={`${name}-${n}`}
              checked={value === n} onChange={() => onChange(name, n)} />
            <label className="btn btn-sm btn-outline-primary" htmlFor={`${name}-${n}`}>
              {labels ? labels[n - 1] : n}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Mood() {
  const [moodLabels, setMoodLabels] = useState(null);
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const { data } = await api.get("/mood?days=30");
    setEntries(data);
    const todays = data.find((e) => e.entry_date === today);
    if (todays) {
      setForm({ ...todays, sleep_hours: todays.sleep_hours ?? "", note: todays.note ?? "" });
    }
  }

  useEffect(() => {
    api.get("/options").then(({ data }) => setMoodLabels(data.moodLabels));
    load();
  }, []);

  function setRating(name, value) {
    setForm({ ...form, [name]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      await api.post("/mood", { ...form, entry_date: today });
      setMessage("Saved. You can update today's entry any time.");
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <div className="container py-5">
      <PageIntro eyebrow="YOUR FEELINGS MATTER" title="Mood" />

      <div className="row g-4">
        <div className="col-lg-5">
          <form className="cc-panel" onSubmit={handleSubmit}>
            <h2 className="h5 mb-3">How is today going?</h2>
            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            <RatingRow label="Mood" name="mood" value={form.mood} labels={moodLabels} onChange={setRating} />
            <RatingRow label="Stress (1 = calm, 5 = very stressed)" name="stress" value={form.stress} onChange={setRating} />
            <RatingRow label="Energy (1 = drained, 5 = full of energy)" name="energy" value={form.energy} onChange={setRating} />

            <div className="mb-3">
              <label htmlFor="sleep_hours" className="form-label">Hours of sleep last night</label>
              <input id="sleep_hours" type="number" min="0" max="24" step="0.5" className="form-control" style={{ maxWidth: "8rem" }}
                value={form.sleep_hours} onChange={(e) => setForm({ ...form, sleep_hours: e.target.value })} />
            </div>
            <div className="mb-3">
              <label htmlFor="note" className="form-label">Anything on your mind? (optional)</label>
              <textarea id="note" rows="2" className="form-control"
                value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={!form.mood || !form.stress || !form.energy}>
              Save today
            </button>
          </form>
        </div>

        <div className="col-lg-7">
          <div className="cc-panel">
            <h2 className="h5 mb-3">Last 30 days</h2>
            {entries.length === 0 ? (
              <p className="text-secondary mb-0">Your chart will appear here after your first entry.</p>
            ) : (
              <MoodChart entries={entries} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

