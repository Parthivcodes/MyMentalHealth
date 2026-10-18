import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

export default function Layout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("cc-in-view");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll(".cc-home > section:not(:first-child)").forEach((section) => {
      section.classList.add("cc-reveal");
      observer.observe(section);
    });
    return () => observer.disconnect();
  }, [pathname]);
  return (
    <div className={`cc-shell ${pathname === "/" ? "cc-shell-home" : "cc-shell-inner"} d-flex flex-column min-vh-100`}>
      <Navbar />
      <main className="flex-grow-1 cc-main" id="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
