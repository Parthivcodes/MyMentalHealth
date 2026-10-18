import { useEffect, useState } from "react";

const SECONDS_PER_STEP = 4;
const steps = ["Breathe in", "Hold", "Breathe out", "Hold"];

export default function BreathingCircle() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const stepIndex = Math.floor(elapsed / SECONDS_PER_STEP) % steps.length;
  const secondsLeft = SECONDS_PER_STEP - (elapsed % SECONDS_PER_STEP);

  return (
    <div className="cc-breath">
      <div className="cc-breath-circle" />
      <div className="cc-breath-text">
        <span className="cc-breath-label" aria-live="polite">{steps[stepIndex]}</span>
        <span className="cc-breath-count" aria-hidden="true">{secondsLeft}</span>
      </div>
    </div>
  );
}
