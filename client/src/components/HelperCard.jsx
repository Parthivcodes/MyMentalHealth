import { Link } from "react-router-dom";

export default function HelperCard({ helper }) {
  return (
    <div className="cc-panel h-100 d-flex flex-column">
      <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
        <h3 className="h5 mb-0">{helper.name}</h3>
        <span className="badge text-bg-light border">Verified</span>
      </div>
      <div className="small text-secondary mb-2">
        {helper.kind === "licensed" ? "Licensed therapist" : "Volunteer listener"}
        {" · "}
        {helper.is_free ? "Free" : "Paid"}
        {helper.is_available && " · Available now"}
      </div>
      <p className="small mb-1"><strong>Helps with:</strong> {helper.specialisations.join(", ")}</p>
      <p className="small mb-3"><strong>Speaks:</strong> {helper.languages.join(", ")}</p>
      <Link to={`/helpers/${helper.id}`} className="btn btn-outline-primary btn-sm mt-auto align-self-start">
        View profile
      </Link>
    </div>
  );
}
