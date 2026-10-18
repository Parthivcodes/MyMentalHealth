import { useState } from "react";
import api, { errorMessage } from "../api/axios.js";

export default function ReportButton({ target, startOpen = false }) {
  const [open, setOpen] = useState(startOpen);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/reports", { ...target, reason });
      setMessage(data.message);
      setOpen(false);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  if (message) return <span className="small text-secondary">{message}</span>;

  if (!open) {
    return (
      <button type="button" className="btn btn-link btn-sm text-secondary p-0" onClick={() => setOpen(true)}>
        Report
      </button>
    );
  }

  return (
    <form className="d-flex flex-wrap gap-2 align-items-start mt-2" onSubmit={handleSubmit}>
      <input className="form-control form-control-sm" style={{ maxWidth: "20rem" }} placeholder="What's wrong?"
        value={reason} onChange={(e) => setReason(e.target.value)} required />
      <button type="submit" className="btn btn-outline-danger btn-sm">Send report</button>
      <button type="button" className="btn btn-link btn-sm text-secondary" onClick={() => setOpen(false)}>Cancel</button>
      {error && <div className="text-danger small w-100">{error}</div>}
    </form>
  );
}
