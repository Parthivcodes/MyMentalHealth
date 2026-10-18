import PageIntro from "../../components/PageIntro.jsx";
import { useEffect, useState } from "react";
import api, { errorMessage } from "../../api/axios.js";
import AdminNav from "../../components/AdminNav.jsx";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/admin/users")
      .then(({ data }) => setUsers(data))
      .catch((err) => setError(errorMessage(err)));
  }, []);

  return (
    <div className="container py-5">
      <PageIntro eyebrow="CARE FOR YOUR COMMUNITY" title="Admin" />
      <AdminNav />

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="cc-panel p-0 table-responsive">
        <table className="table mb-0 align-middle">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Pen name</th>
              <th>Role</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.pen_name}</td>
                <td className="text-capitalize">{u.role}</td>
                <td>{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

