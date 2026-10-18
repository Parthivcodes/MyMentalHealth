import { Link, Navigate } from "react-router-dom";
import { useAuth, homePath } from "../context/AuthContext.jsx";
import BreathingCircle from "../components/BreathingCircle.jsx";
import WellnessArt from "../components/WellnessArt.jsx";

const features = [
  { number: "01", title: "Understand your everyday", text: "Track your mood, stress and sleep. Notice patterns and make a little more room for yourself.", to: "/mood", label: "Explore mood tracking", art: "mood" },
  { number: "02", title: "A little space for your thoughts", text: "Let it out in your private journal. Tag your feelings and come back whenever you need to.", to: "/journal", label: "Explore your journal", art: "journal" },
];
const services = [
  ["01", "Someone who listens", "Find verified therapists and trained listeners, and talk through encrypted private chats.", "/helpers"],
  ["02", "A community that understands", "Share under a pen name, join conversations and give each other a little encouragement.", "/community"],
  ["03", "Check in with yourself", "Explore short stress and anxiety questionnaires and keep track of your check-ins.", "/assessments"],
  ["04", "Support between the moments", "Explore wellness resources or talk things through with the Gemini-powered AI assistant.", "/ai"],
];

export default function Home() {
  const { user } = useAuth();
  if (user) return <Navigate to={homePath(user)} replace />;
  return (
    <div className="cc-home">
      <section className="cc-landing-hero container">
        <div className="cc-hero-heading">
          <p className="cc-eyebrow">A LITTLE SUPPORT. A LITTLE MORE YOU.</p>
          <h1>Embark on your mental<br className="d-none d-lg-block" /> wellness journey.</h1>
          <span className="cc-status"><span /> Ready to listen</span>
        </div>
        <div className="row align-items-center cc-hero-bottom">
          <div className="col-lg-7"><WellnessArt /></div>
          <div className="col-lg-5 cc-hero-copy">
            <div className="cc-people cc-photo-people" aria-hidden="true"><span /><span /><span /><span>♡</span></div>
            <p>Welcome to CalmConnect, your space to pause and feel heard. Understand your feelings, connect with others, and take small steps towards a calmer you.</p>
            <div className="d-flex align-items-center flex-wrap gap-4 mt-4">
              <Link to="/register" className="btn btn-primary cc-pill">Start your journey <span className="cc-arrow">↗</span></Link>
              <a href="#wellness" className="cc-text-link">Explore the space ↘</a>
            </div>
            <p className="cc-hero-note">At your pace. On your terms.</p>
          </div>
        </div>
        <div className="cc-hero-foot"><span>YOUR WELLBEING, ONE DAY AT A TIME</span><a href="#wellness" aria-label="Explore wellness tools">↓</a><span>A SPACE TO SIMPLY BE.</span></div>
      </section>
      <section id="wellness" className="container cc-wellness">
        <div className="cc-section-heading"><div><p className="cc-eyebrow">SMALL STEPS, MEANINGFUL CHANGE</p><h2>Art and science<br />of mental wellness.</h2></div><span className="cc-spark" aria-hidden="true">✳</span></div>
        <div className="row g-4">{features.map((feature) => <div className="col-md-6" key={feature.number}>
          <article className="cc-feature-card">
            <span className="cc-card-tab">{feature.number} / YOUR SPACE</span>
            <div className={`cc-feature-art cc-art-${feature.art}`} aria-hidden="true">
              
            </div>
            <h3>{feature.title}</h3><p>{feature.text}</p>
            <Link to={feature.to} className="cc-card-link">{feature.label}<span className="cc-arrow">↗</span></Link>
          </article>
        </div>)}</div>
      </section>
      <section className="container cc-services">
        <div className="cc-section-heading"><div><p className="cc-eyebrow">SUPPORT THAT FITS YOUR LIFE</p><h2>Tailored spaces for<br />your well-being.</h2></div><span className="cc-status"><span /> Always a place for you</span></div>
        <div className="row g-5">
          <div className="col-lg-5"><div className="cc-pause-card"><span className="cc-eyebrow">LET'S TAKE A BREATH</span><BreathingCircle /><div><h3>Come back to the moment.</h3><p>A gentle pause can be a good place to start.</p><Link to="/breathe" className="cc-text-link">Try a breathing exercise ↗</Link></div></div></div>
          <div className="col-lg-7"><div className="cc-service-list">{services.map(([number, title, text, to]) => <Link to={to} key={number} className="cc-service"><span className="cc-service-number">/{number}</span><div><h3>{title}</h3><p>{text}</p></div><span className="cc-arrow">↗</span></Link>)}</div></div>
        </div>
      </section>
      <section className="container cc-join"><div><p className="cc-eyebrow">MAKE ROOM FOR CONNECTION</p><h2>You don't have to<br />figure it all out alone.</h2><p>Start with a check-in. A conversation. A single breath.</p><Link to="/register" className="btn btn-primary cc-pill">Find your starting point <span className="cc-arrow">↗</span></Link></div><span className="cc-join-flower" aria-hidden="true">✳</span></section>
      <section className="container cc-helper-invite"><div><h2>Here to support others?</h2><p>Therapists and trained listeners can apply to become a verified helper.</p></div><Link to="/register" className="btn btn-outline-primary cc-pill">Join as a helper ↗</Link></section>
      <section className="container pb-5"><div className="cc-helpline"><strong>Having a hard time right now?</strong> Find immediate support and people you can talk to. <Link to="/help">Get help now ↗</Link></div></section>
    </div>
  );
}

