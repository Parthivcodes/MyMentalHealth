import { Link } from "react-router-dom";

export function hasCrisisWords(text, words) {
  const lower = text.toLowerCase();
  return words.some((word) => lower.includes(word));
}

export default function CrisisNotice({ onContinue }) {
  return (
    <div className="cc-helpline mb-3">
      <p className="fw-bold mb-1">It sounds like you're going through something really hard.</p>
      <p className="mb-3">
        You don't have to face this alone. Tele-MANAS is free and open all day: call <strong>14416</strong>.
        In an emergency, call <strong>112</strong>.
      </p>
      <div className="d-flex flex-wrap gap-2">
        <Link to="/help" className="btn btn-primary btn-sm">See where to get help</Link>
        <button type="button" className="btn btn-outline-primary btn-sm" onClick={onContinue}>Post anyway</button>
      </div>
    </div>
  );
}
