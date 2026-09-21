import { FormEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { PageMeta } from "../components/PageMeta";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";
import { clinicInfo } from "../config/clinicInfo";
import styles from "./AdminLogin.module.css";

export default function AdminLogin() {
  const { user, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoading && user) {
    const redirectTo = (location.state as { from?: string } | null)?.from ?? "/admin";
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to sign in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <PageMeta
        title="Admin Login"
        description="Secure staff login for Dr. Arun Dental Care."
        path="/admin/login"
      />

      <section className={styles.section}>
        <div className={`container ${styles.wrap}`}>
          <div className={`card ${styles.card}`}>
            <span className="eyebrow">Staff Access</span>
            <h1 className={styles.heading}>Admin Login</h1>
            <p className={styles.subheading}>{clinicInfo.name} clinic administration</p>

            <form onSubmit={handleSubmit} noValidate>
              {error && (
                <div className="alert alert-error" role="alert">
                  {error}
                </div>
              )}

              <div className="field">
                <label htmlFor="admin-email">Email</label>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="admin-password">Password</label>
                <input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
