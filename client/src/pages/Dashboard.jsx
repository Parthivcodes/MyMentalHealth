import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import MoodChart from "../components/MoodChart.jsx";
import PageIntro from "../components/PageIntro.jsx";

function dateString(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toLocaleDateString("en-CA");
}

function countStreak(entries) {
  const logged = entries.map((e) => e.entry_date);
  let day = logged.includes(dateString(0)) ? 0 : 1;
  let streak = 0;
  while (logged.includes(dateString(day))) {
    streak++;
    day++;
  }
  return streak;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [affirmation, setAffirmation] = useState(null);
  const [mood, setMood] = useState([]);
  const [journal, setJournal] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [tests, setTests] = useState({});
  const [suggested, setSuggested] = useState([]);
  const [chats, setChats] = useState([]);
  const [saved, setSaved] = useState([]);

  useEffect(() => {
    api.get("/affirmations/today").then(({ data }) => setAffirmation(data));
    api.get("/mood?days=30").then(({ data }) => setMood(data));
    api.get("/journal").then(({ data }) => setJournal(data.slice(0, 3)));
    api.get("/assessments").then(({ data }) => setCheckins(data));
    api.get("/options").then(({ data }) => setTests(data.assessments));
    api.get("/helpers/suggested").then(({ data }) => setSuggested(data.helpers));
    api.get("/chats").then(({ data }) => setChats(data.slice(0, 3)));
    api.get("/bookmarks").then(({ data }) => setSaved(data.slice(0, 4)));
  }, []);

  const loggedToday = mood.some((e) => e.entry_date === dateString(0));
  const streak = countStreak(mood);
  const latestCheckins = Object.keys(tests)
    .map((type) => checkins.find((c) => c.type === type))
    .filter(Boolean);

  return (
    <div className="container py-5 cc-dashboard">
      <PageIntro eyebrow="YOUR EVERYDAY, A LITTLE LIGHTER" title={<>Hi, {user.name.split(" ")[0]}.<br />Make space for yourself.</>}>
        {affirmation && <p className="cc-daily-affirmation">{affirmation.text}</p>}
        <Link to="/mood" className="btn btn-primary cc-pill">Your daily check-in <span className="cc-arrow">↗</span></Link>
      </PageIntro>
      <div className="cc-daily-shortcuts">
        {[["01", "Mood", "Notice how you feel", "/mood"], ["02", "Journal", "Let your thoughts unfold", "/journal"], ["03", "Breathe", "Find a moment of calm", "/breathe"], ["04", "Connect", "You can talk about it", "/helpers"]].map(([number, title, subtitle, to]) =>
          <Link to={to} key={to}><span className="cc-eyebrow">/{number}</span><h2>{title}</h2><p>{subtitle}</p><span className="cc-arrow">↗</span></Link>
        )}
      </div>

      {!loggedToday && (
        <div className="cc-helpline d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
          <span>You haven't logged how today is going yet.</span>
          <Link to="/mood" className="btn btn-primary btn-sm">Log today's mood</Link>
        </div>
      )}

      <div className="row g-4">
        <div className="col-lg-8 d-grid gap-4 align-content-start">
          <section className="cc-panel cc-chart-panel">
            <div className="d-flex flex-wrap justify-content-between align-items-baseline gap-2 mb-3">
              <h2 className="h5 mb-0">Your last two weeks</h2>
              {streak > 0 && (
                <span className="small">
                  <strong className="cc-streak">{streak}-day</strong> logging streak
                </span>
              )}
            </div>
            {mood.length > 0 ? (
              <MoodChart entries={mood.slice(-14)} />
            ) : (
              <p className="text-secondary mb-0">Log your mood for a few days and your chart will show up here.</p>
            )}
          </section>

          <section className="cc-panel cc-journal-panel">
            <div className="d-flex justify-content-between align-items-baseline mb-3">
              <h2 className="h5 mb-0">Recent journal entries</h2>
              <Link to="/journal/new" className="small">Write an entry</Link>
            </div>
            {journal.length === 0 && <p className="text-secondary mb-0">Nothing written yet.</p>}
            {journal.map((e) => (
              <Link to={`/journal/${e.id}`} key={e.id} className="d-block py-2 border-top text-decoration-none text-reset">
                <span className="fw-bold">{e.title}</span>
                <span className="small text-secondary">
                  {" · "}{new Date(e.updated_at).toLocaleDateString()}{e.emotion && ` · ${e.emotion}`}
                </span>
              </Link>
            ))}
          </section>
        </div>

        <div className="col-lg-4 d-grid gap-4 align-content-start">
          <section className="cc-panel cc-checkin-panel">
            <h2 className="h5 mb-3">Latest check-ins</h2>
            {latestCheckins.length === 0 && (
              <p className="text-secondary mb-2">No check-ins yet.</p>
            )}
            {latestCheckins.map((c) => (
              <div key={c.id} className="d-flex justify-content-between py-1">
                <span>{tests[c.type].name}</span>
                <strong>{c.level}</strong>
              </div>
            ))}
            <Link to="/assessments" className="small d-inline-block mt-2">Take a check-in</Link>
          </section>

          <section className="cc-panel">
            <h2 className="h5 mb-3">{chats.length > 0 ? "Your chats" : "Talk to someone"}</h2>
            {chats.map((c) => (
              <Link to={`/chats/${c.id}`} key={c.id} className="d-block py-1">{c.other_name}</Link>
            ))}
            {chats.length === 0 && suggested.map((h) => (
              <Link to={`/helpers/${h.id}`} key={h.id} className="d-block py-1">{h.name}</Link>
            ))}
            {chats.length === 0 && suggested.length === 0 && (
              <p className="text-secondary mb-2">Verified therapists and listeners are here when you need them.</p>
            )}
            <div className="d-flex flex-wrap gap-3 mt-2 small">
              <Link to="/helpers">Find a helper</Link>
              <Link to="/ai">Ask the AI assistant</Link>
            </div>
          </section>

          {saved.length > 0 && (
            <section className="cc-panel">
              <h2 className="h5 mb-3">Saved resources</h2>
              {saved.map((r) => (
                <div key={r.id} className="py-1">
                  {r.url ? <a href={r.url} target="_blank" rel="noreferrer">{r.title}</a> : <Link to="/resources">{r.title}</Link>}
                </div>
              ))}
            </section>
          )}

          {user.role === "user" && !user.helper_status && (
            <section className="cc-panel">
              <h2 className="h5 mb-1">Want to help others?</h2>
              <p className="small text-secondary mb-2">Therapists and trained listeners can apply to become verified helpers.</p>
              <Link to="/helper/apply" className="small">Become a helper</Link>
            </section>
          )}
          {user.helper_status === "pending" && (
            <p className="small text-secondary mb-0">Your helper application is waiting for review.</p>
          )}
        </div>
      </div>
    </div>
  );
}
