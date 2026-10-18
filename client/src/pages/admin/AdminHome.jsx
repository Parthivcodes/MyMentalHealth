import PageIntro from "../../components/PageIntro.jsx";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";
import AdminNav from "../../components/AdminNav.jsx";

export default function AdminHome() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/admin/stats").then(({ data }) => setStats(data));
  }, []);

  if (!stats) return <div className="container py-5 text-secondary">Loading...</div>;

  const rows = [
    { label: "Helper applications waiting", value: stats.pending_helpers, link: "/admin/helpers" },
    { label: "Open reports", value: stats.open_reports, link: "/admin/reports" },
    { label: "Verified helpers", value: stats.helpers },
    { label: "Accounts", value: stats.users, link: "/admin/users" },
    { label: "Posts this week", value: stats.posts_this_week },
    { label: "Mood entries this week", value: stats.mood_entries_this_week },
    { label: "Private chats started", value: stats.chats },
  ];

  return (
    <div className="container py-5">
      <PageIntro eyebrow="CARE FOR YOUR COMMUNITY" title="Admin" />
      <AdminNav />

      <div className="cc-panel" style={{ maxWidth: "32rem" }}>
        {rows.map((r) => (
          <div key={r.label} className="d-flex justify-content-between py-2 border-bottom">
            {r.link ? <Link to={r.link}>{r.label}</Link> : <span>{r.label}</span>}
            <strong>{r.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

