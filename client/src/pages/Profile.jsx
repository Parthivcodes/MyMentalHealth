import PageIntro from "../components/PageIntro.jsx";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { errorMessage } from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { lockPrivateKey } from "../crypto.js";

const statusText = {
  pending: "Your helper application is waiting for an admin to review it.",
  approved: "You're a verified helper.",
  rejected: "Your helper application wasn't approved. You can update it and apply again.",
};

export default function Profile() {
  const { user } = useAuth();
  const [application, setApplication] = useState(null);
  const [form, setForm] = useState({ currentPassword: "", newPassword: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user.role === "admin") return;
    api.get("/helpers/me").then(({ data }) => setApplication(data));
  }, [user.role]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function changePassword(e) {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const privateKey = localStorage.getItem("privateKey");
      const encrypted_private_key = privateKey ? await lockPrivateKey(privateKey, form.newPassword) : null;
      const { data } = await api.put("/auth/password", { ...form, encrypted_private_key });
      setMessage(data.message);
      setForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: "40rem" }}>
      <PageIntro eyebrow="YOUR SPACE, YOUR PREFERENCES" title={<>Profile</>} />

      <div className="cc-panel mb-4">
        <div className="text-secondary small">Your pen name in the community</div>
        <div className="fs-4 fw-bold mb-3">{user.pen_name}</div>
        <div className="text-secondary small">Name</div>
        <div className="mb-2">{user.name}</div>
        <div className="text-secondary small">Email</div>
        <div>{user.email}</div>
      </div>

      {user.role !== "admin" && (
        <div className="cc-panel mb-4">
          <h2 className="h5 mb-2">Helping others</h2>
          {application ? (
            <p className="mb-2">{statusText[application.status]}</p>
          ) : (
            <p className="mb-2">Are you a therapist or a trained listener? Apply to support people on CalmConnect.</p>
          )}
          {(!application || application.status === "rejected") && (
            <Link to="/helper/apply" className="btn btn-outline-primary btn-sm">
              {application ? "Update application" : "Apply as a helper"}
            </Link>
          )}
        </div>
      )}

      <form className="cc-panel" onSubmit={changePassword}>
        <h2 className="h5 mb-3">Change password</h2>
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="mb-3">
          <label htmlFor="currentPassword" className="form-label">Current password</label>
          <input id="currentPassword" name="currentPassword" type="password" className="form-control"
            value={form.currentPassword} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label htmlFor="newPassword" className="form-label">New password</label>
          <input id="newPassword" name="newPassword" type="password" className="form-control"
            value={form.newPassword} onChange={handleChange} minLength={6} required />
        </div>
        <button type="submit" className="btn btn-primary">Change password</button>
      </form>
    </div>
  );
}

