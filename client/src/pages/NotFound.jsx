import PageIntro from "../components/PageIntro.jsx";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container py-5">
      <PageIntro eyebrow="LET US HELP YOU FIND YOUR WAY" title={<>Page not found</>} />
      <p className="text-secondary">
        This address doesn't match any page. <Link to="/">Go to the home page</Link>
      </p>
    </div>
  );
}

