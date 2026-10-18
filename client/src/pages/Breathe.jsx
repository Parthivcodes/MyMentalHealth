import PageIntro from "../components/PageIntro.jsx";
import BreathingCircle from "../components/BreathingCircle.jsx";

export default function Breathe() {
  return (
    <div className="container py-5 text-center">
      <PageIntro eyebrow="A MOMENT TO COME BACK TO YOU" title={<>Box breathing</>} />
      <p className="text-secondary mb-5">Follow the circle. Two or three minutes is enough to slow things down.</p>
      <BreathingCircle />
    </div>
  );
}

