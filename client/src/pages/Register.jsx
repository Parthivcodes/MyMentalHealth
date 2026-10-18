import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { errorMessage } from "../api/axios.js";
import { useAuth, homePath } from "../context/AuthContext.jsx";
import { setupKeys } from "../crypto.js";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [wantsToHelp, setWantsToHelp] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", form);
      login(data.token, data.user);
      await setupKeys(form.password);
      navigate(wantsToHelp ? "/helper/apply" : homePath(data.user));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="cc-auth mx-auto">
        <h1 className="h2 mb-4">Create an account</h1>

        <div className="mb-2">How do you want to use CalmConnect?</div>
        <div className="d-grid gap-2 mb-4">
          <button type="button" className={`cc-choice ${!wantsToHelp ? "is-selected" : ""}`} onClick={() => setWantsToHelp(false)}>
            <strong>I'm looking for support</strong>
            <span>Share, track how you feel and talk to a helper.</span>
          </button>
          <button type="button" className={`cc-choice ${wantsToHelp ? "is-selected" : ""}`} onClick={() => setWantsToHelp(true)}>
            <strong>I want to help others</strong>
            <span>For therapists and trained listeners. An admin checks your details first.</span>
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Name</label>
            <input id="name" name="name" className="form-control"
              value={form.name} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input id="email" name="email" type="email" className="form-control"
              value={form.email} onChange={handleChange} required />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="form-label">Password</label>
            <input id="password" name="password" type="password" className="form-control"
              value={form.password} onChange={handleChange} minLength={6} required />
            <div className="form-text">At least 6 characters.</div>
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Creating account..." : wantsToHelp ? "Next: your helper details" : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-secondary">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
