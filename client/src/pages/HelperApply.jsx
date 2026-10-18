import PageIntro from "../components/PageIntro.jsx";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { errorMessage } from "../api/axios.js";
import CheckboxGroup from "../components/CheckboxGroup.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const emptyForm = {
  kind: "volunteer",
  license_number: "",
  bio: "",
  specialisations: [],
  languages: [],
  gender: "",
  is_free: true,
};

export default function HelperApply() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [options, setOptions] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/options").then(({ data }) => setOptions(data));
    api.get("/helpers/me").then(({ data }) => {
      if (data) setForm({ ...emptyForm, ...data, license_number: data.license_number || "", gender: data.gender || "" });
    });
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/helpers/apply", form);
      await refreshUser();
      navigate("/profile");
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  if (!options) return <div className="container py-5 text-secondary">Loading...</div>;

  return (
    <div className="container py-5" style={{ maxWidth: "40rem" }}>
      <PageIntro eyebrow="MAKE A DIFFERENCE, ONE CONVERSATION AT A TIME" title={<>Apply as a helper</>} />
      <p className="text-secondary mb-4">
        An admin checks every application before it goes live. Approved helpers get a Verified badge.
      </p>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <div className="form-label">I am a</div>
          {options.helperKinds.map((k) => (
            <div className="form-check" key={k.value}>
              <input className="form-check-input" type="radio" name="kind" id={k.value}
                value={k.value} checked={form.kind === k.value} onChange={handleChange} />
              <label className="form-check-label" htmlFor={k.value}>{k.label}</label>
            </div>
          ))}
        </div>

        {form.kind === "licensed" && (
          <div className="mb-3">
            <label htmlFor="license_number" className="form-label">License number</label>
            <input id="license_number" name="license_number" className="form-control"
              value={form.license_number} onChange={handleChange} required />
            <div className="form-text">For psychologists in India, your RCI registration number.</div>
          </div>
        )}

        <CheckboxGroup label="I can help with" name="specialisations" items={options.specialisations}
          selected={form.specialisations} onChange={(list) => setForm({ ...form, specialisations: list })} />

        <CheckboxGroup label="Languages I speak" name="languages" items={options.languages}
          selected={form.languages} onChange={(list) => setForm({ ...form, languages: list })} />

        <div className="mb-3">
          <label htmlFor="gender" className="form-label">Gender</label>
          <select id="gender" name="gender" className="form-select" value={form.gender} onChange={handleChange}>
            <option value="">Choose...</option>
            {options.genders.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="bio" className="form-label">About you</label>
          <textarea id="bio" name="bio" rows="4" className="form-control"
            value={form.bio} onChange={handleChange} required />
        </div>

        <div className="form-check mb-4">
          <input className="form-check-input" type="checkbox" id="is_free" name="is_free"
            checked={form.is_free} onChange={handleChange} />
          <label className="form-check-label" htmlFor="is_free">I offer support for free</label>
        </div>

        <button type="submit" className="btn btn-primary">Send application</button>
      </form>
    </div>
  );
}

