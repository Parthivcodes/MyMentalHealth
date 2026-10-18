import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios.js";

const AuthContext = createContext(null);

function readSavedUser() {
  const saved = localStorage.getItem("user");
  return saved ? JSON.parse(saved) : null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSavedUser);

  useEffect(() => {
    if (!localStorage.getItem("token")) return;
    refreshUser().catch(() => logout());
  }, []);

  function saveUser(user) {
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  }

  function refreshUser() {
    return api.get("/auth/me").then(({ data }) => saveUser(data));
  }

  function login(token, user) {
    localStorage.setItem("token", token);
    saveUser(user);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("privateKey");
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, login, logout, refreshUser }}>{children}</AuthContext.Provider>;
}

export function homePath(user) {
  return user?.role === "admin" ? "/admin" : "/dashboard";
}

export function useAuth() {
  return useContext(AuthContext);
}
