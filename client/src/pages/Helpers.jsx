import PageIntro from "../components/PageIntro.jsx";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { errorMessage } from "../api/axios.js";
import HelperCard from "../components/HelperCard.jsx";

const emptyFilters = { specialisation: "", language: "", gender: "", free: false, available: false };

export default function Helpers() {
  const [options, setOptions] = useState(null);
  const [filters, setFilters] = useState(emptyFilters);
  const [helpers, setHelpers] = useState([]);
  const [suggested, setSuggested] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/options").then(({ data }) => setOptions(data));
    api.get("/helpers/suggested").then(({ data }) => setSuggested(data));
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const params = {};
        if (filters.specialisation) params.specialisation = filters.specialisation;
        if (filters.language) params.language = filters.language;
        if (filters.gender) params.gender = filters.gender;
        if (filters.free) params.free = true;
        if (filters.available) params.available = true;
        const { data } = await api.get("/helpers", { params });
        setHelpers(data);
      } catch (err) {
        setError(errorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [filters]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFilters({ ...filters, [name]: type === "checkbox" ? checked : value });
  }

  if (!options) return <div className="container py-5 text-secondary">Loading...</div>;

  return (
    <div className="container py-5">
      <PageIntro eyebrow="REAL PEOPLE. MEANINGFUL CONNECTION." title="Find a helper" />
      <p className="text-secondary mb-4">
        Every helper here has been checked by our team. Chats with them are end-to-end encrypted.
      </p>

      {suggested?.helpers.length > 0 && (
        <section className="mb-5">
          <h2 className="h5 mb-1">Suggested for you</h2>
          <p className="small text-secondary mb-3">
            Based on your recent check-ins: {suggested.topics.join(", ")}
          </p>
          <div className="row g-3">
            {suggested.helpers.map((h) => (
              <div className="col-md-6 col-lg-4" key={h.id}>
                <HelperCard helper={h} />
              </div>
            ))}
          </div>
        </section>
      )}
      {suggested?.topics.length === 0 && (
        <p className="small text-secondary mb-4">
          <Link to="/assessments">Take a check-in</Link> to get helper suggestions that fit how you're feeling.
        </p>
      )}

      <div className="row g-2 mb-4 align-items-end">
        <div className="col-sm-4 col-lg-3">
          <label htmlFor="specialisation" className="form-label small">Helps with</label>
          <select id="specialisation" name="specialisation" className="form-select" value={filters.specialisation} onChange={handleChange}>
            <option value="">Anything</option>
            {options.specialisations.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="col-sm-4 col-lg-3">
          <label htmlFor="language" className="form-label small">Language</label>
          <select id="language" name="language" className="form-select" value={filters.language} onChange={handleChange}>
            <option value="">Any language</option>
            {options.languages.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div className="col-sm-4 col-lg-2">
          <label htmlFor="gender" className="form-label small">Gender</label>
          <select id="gender" name="gender" className="form-select" value={filters.gender} onChange={handleChange}>
            <option value="">Any</option>
            {options.genders.map((g) => <option key={g}>{g}</option>)}
          </select>
        </div>
        <div className="col-lg-4 d-flex gap-3 pt-2">
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="free" name="free" checked={filters.free} onChange={handleChange} />
            <label className="form-check-label" htmlFor="free">Free only</label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="available" name="available" checked={filters.available} onChange={handleChange} />
            <label className="form-check-label" htmlFor="available">Available now</label>
          </div>
        </div>
      </div>

      {loading && <p className="text-secondary">Loading...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && helpers.length === 0 && (
        <p className="text-secondary">
          No helpers match these filters. Try removing one, or call Tele-MANAS on 14416 if you need to talk now.
        </p>
      )}

      <div className="row g-3">
        {helpers.map((h) => (
          <div className="col-md-6 col-lg-4" key={h.id}>
            <HelperCard helper={h} />
          </div>
        ))}
      </div>
    </div>
  );
}

