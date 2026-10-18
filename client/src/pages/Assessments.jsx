import PageIntro from "../components/PageIntro.jsx";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";

export default function Assessments() {
  const [tests, setTests] = useState({});
  const [history, setHistory] = useState([]);

  useEffect(() => {
    api.get("/options").then(({ data }) => setTests(data.assessments));
    api.get("/assessments").then(({ data }) => setHistory(data));
  }, []);

  return (
    <div className="container py-5" style={{ maxWidth: "48rem" }}>
      <PageIntro eyebrow="PAUSE. REFLECT. UNDERSTAND." title="Check-ins" />
      <p className="text-secondary mb-4">
        Short, well-known questionnaires that show how you're doing right now. They are not a diagnosis.
      </p>

      <div className="row g-3 mb-5">
        {Object.entries(tests).map(([type, test]) => (
          <div className="col-sm-6" key={type}>
            <div className="cc-panel h-100 d-flex flex-column">
              <h2 className="h5 mb-1">{test.name}</h2>
              <p className="small text-secondary">
                {test.questions.length} questions · based on the {test.source}
              </p>
              <Link to={`/assessments/${type}`} className="btn btn-primary btn-sm mt-auto align-self-start">
                Start
              </Link>
            </div>
          </div>
        ))}
      </div>

      <h2 className="h5 mb-3">Your past results</h2>
      {history.length === 0 ? (
        <p className="text-secondary">You haven't taken a check-in yet.</p>
      ) : (
        <div className="cc-panel p-0 table-responsive">
          <table className="table mb-0">
            <thead>
              <tr>
                <th>Date</th>
                <th>Check-in</th>
                <th>Score</th>
                <th>Level</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id}>
                  <td>{new Date(h.taken_at).toLocaleDateString()}</td>
                  <td>{tests[h.type]?.name}</td>
                  <td>{h.score}</td>
                  <td>{h.level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

