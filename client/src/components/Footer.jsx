import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="cc-footer">
      <div className="container">
        <p className="mb-1">
          CalmConnect is a self-help tool. It does not replace a doctor, counsellor or therapist.
        </p>
        <p className="mb-1">
          Need to talk to someone now? Call Tele-MANAS on <strong>14416</strong> (free, any time) or{" "}
          <Link to="/help">see more helplines</Link>. In an emergency, call <strong>112</strong>.
        </p>
        <p className="mb-0">
          <Link to="/privacy">Privacy and terms</Link>
        </p>
      </div>
    </footer>
  );
}
