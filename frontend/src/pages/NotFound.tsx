import { Link } from "react-router-dom";
import { PageMeta } from "../components/PageMeta";

export default function NotFound() {
  return (
    <>
      <PageMeta title="Page Not Found" description="The page you are looking for could not be found." />
      <section className="section" style={{ textAlign: "center", padding: "120px 0" }}>
        <div className="container">
          <h1>Page Not Found</h1>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: 28 }}>
            The page you are looking for doesn't exist or may have moved.
          </p>
          <Link to="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </section>
    </>
  );
}
