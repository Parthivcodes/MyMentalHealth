import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { errorMessage } from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function HelperProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [helper, setHelper] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/helpers/${id}`)
      .then(({ data }) => setHelper(data))
      .catch((err) => setError(errorMessage(err)));
  }, [id]);

  async function startChat() {
    try {
      const { data } = await api.post("/chats", { helper_id: helper.id });
      navigate(`/chats/${data.id}`);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  if (error && !helper) return <div className="container py-5"><div className="alert alert-danger">{error}</div></div>;
  if (!helper) return <div className="container py-5 text-secondary">Loading...</div>;

  return (
    <div className="container py-5" style={{ maxWidth: "44rem" }}>
      <Link to="/helpers" className="small">Back to helpers</Link>

      <div className="cc-panel mt-3">
        <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
          <h1 className="h3 mb-0">{helper.name}</h1>
          <span className="badge text-bg-light border">Verified</span>
        </div>
        <p className="text-secondary mb-3">
          {helper.kind === "licensed" ? "Licensed therapist" : "Volunteer listener"}
          {" · "}
          {helper.is_free ? "Free" : "Paid"}
          {" · "}
          {helper.is_available ? "Available now" : "Not online right now"}
        </p>

        <p style={{ whiteSpace: "pre-wrap" }}>{helper.bio}</p>

        <p className="mb-1"><strong>Helps with:</strong> {helper.specialisations.join(", ")}</p>
        <p className="mb-1"><strong>Speaks:</strong> {helper.languages.join(", ")}</p>
        {helper.gender && <p className="mb-3"><strong>Gender:</strong> {helper.gender}</p>}

        {error && <div className="alert alert-danger">{error}</div>}

        {helper.id !== user.id && (
          <>
            <button className="btn btn-primary mt-2" onClick={startChat}>Start a private chat</button>
            <p className="small text-secondary mt-2 mb-0">
              {helper.name} will see your pen name, <strong>{user.pen_name}</strong>, not your real name.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
