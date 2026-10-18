import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth, homePath } from "../context/AuthContext.jsx";

const publicLinks = [
  { to: "/resources", label: "Resources" },
  { to: "/breathe", label: "Breathe" },
  { to: "/help", label: "Get help" },
];

const userLinks = [
  { to: "/dashboard", label: "Today" },
  { to: "/community", label: "Community" },
  { to: "/helpers", label: "Find a helper" },
  { to: "/chats", label: "Chats" },
  { to: "/mood", label: "Mood" },
  { to: "/journal", label: "Journal" },
  { to: "/assessments", label: "Check-ins" },
  { to: "/resources", label: "Resources" },
  { to: "/ai", label: "AI support" },
];

const adminLinks = [{ to: "/admin", label: "Admin" }];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  let links = publicLinks;
  if (user?.role === "admin") links = adminLinks;
  else if (user) links = userLinks;

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav className="navbar navbar-expand-xl cc-nav">
      <div className="container">
        <Link to={user ? homePath(user) : "/"} className="navbar-brand cc-brand">
          <span className="cc-brand-mark" aria-hidden="true">✳</span>CalmConnect
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className={`collapse navbar-collapse ${open ? "show" : ""}`} onClick={() => setOpen(false)}>
          <ul className="navbar-nav me-auto">
            {links.map((link) => (
              <li className="nav-item" key={link.to}>
                <NavLink to={link.to} className="nav-link">
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="d-flex align-items-center gap-2">
            {user ? (
              <>
                <NavLink to="/profile" className="nav-link">
                  {user.pen_name}
                </NavLink>
                <button className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">
                  Log in
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

