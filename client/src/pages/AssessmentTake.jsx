import PageIntro from "../components/PageIntro.jsx";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { errorMessage } from "../api/axios.js";

export default function AssessmentTake() {
  const { type } = useParams();
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/options").then(({ data }) => {
      setTest(data.assessments[type]);
      setAnswers(data.assessments[type]?.questions.map(() => null) || []);
    });
  }, [type]);

  function choose(questionIndex, choiceIndex) {
    const updated = [...answers];
    updated[questionIndex] = choiceIndex;
    setAnswers(updated);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/assessments", { type, answers });
      setResult(data);
      window.scrollTo(0, 0);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  if (!test) return <div className="container py-5 text-secondary">Loading...</div>;

  if (result) {
    return (
      <div className="container py-5" style={{ maxWidth: "40rem" }}>
        <PageIntro eyebrow="ONE SMALL CHECK-IN" title={<>{test.name}: your result</>} />
        <div className="cc-panel mb-4">
          <div className="text-secondary small">Level</div>
          <div className="fs-3 fw-bold mb-1">{result.level}</div>
          <div className="text-secondary small mb-3">Score {result.score}</div>
          <p className="mb-0">{result.tip}</p>
        </div>
        {["Moderate", "High"].includes(result.level) && (
          <p className="mb-4">
            <Link to="/helpers">See helpers who can support you with this</Link>
          </p>
        )}
        {result.level === "High" && (
          <div className="cc-helpline mb-4">
            Please talk to someone soon. Tele-MANAS is free and open all day: call <strong>14416</strong>.{" "}
            <Link to="/help">More places to get help</Link>
          </div>
        )}
        <p className="small text-secondary">
          This check-in is based on the {test.source}. It shows how you're doing, but it is not a diagnosis.
        </p>
        <Link to="/assessments" className="btn btn-outline-primary">Back to check-ins</Link>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: "44rem" }}>
      <PageIntro eyebrow="ONE SMALL CHECK-IN" title={<>{test.name}</>} />
      <p className="text-secondary mb-4">{test.intro}</p>

      <form onSubmit={handleSubmit}>
        {test.questions.map((question, qi) => (
          <fieldset className="cc-panel mb-3" key={qi}>
            <legend className="fs-6 fw-bold mb-3">{qi + 1}. {question}</legend>
            <div className="d-flex flex-wrap gap-2">
              {test.choices.map((choice, ci) => (
                <div key={ci}>
                  <input type="radio" className="btn-check" name={`q${qi}`} id={`q${qi}-${ci}`}
                    checked={answers[qi] === ci} onChange={() => choose(qi, ci)} />
                  <label className="btn btn-sm btn-outline-primary" htmlFor={`q${qi}-${ci}`}>{choice}</label>
                </div>
              ))}
            </div>
          </fieldset>
        ))}

        {error && <div className="alert alert-danger">{error}</div>}
        <button type="submit" className="btn btn-primary" disabled={answers.includes(null)}>
          See my result
        </button>
      </form>
    </div>
  );
}

