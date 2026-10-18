import { NavLink } from "react-router-dom";

const links = [
  { to: "/admin", label: "Overview", end: true },
  { to: "/admin/helpers", label: "Helper applications" },
  { to: "/admin/reports", label: "Reports" },
  { to: "/admin/resources", label: "Resources" },
  { to: "/admin/users", label: "Users" },
];

export default function AdminNav() {
  return (
    <ul className="nav nav-pills mb-4">
      {links.map((link) => (
        <li className="nav-item" key={link.to}>
          <NavLink to={link.to} end={link.end} className="nav-link">
            {link.label}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}
