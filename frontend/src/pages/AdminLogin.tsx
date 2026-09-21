import { FormEvent, useState, type KeyboardEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { PageMeta } from "../components/PageMeta";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";
import { clinicInfo } from "../config/clinicInfo";
import {
  ArrowRightIcon,
  CalendarCheckIcon,
  ShieldCheckIcon,
  ToothIcon,
  UsersIcon,
} from "../components/icons/DentalIcons";
import { AlertIcon, EyeIcon, EyeOffIcon, GlobeIcon, LockIcon, MailIcon } from "../components/admin/AdminIcons";
import styles from "./AdminLogin.module.css";

const FEATURES = [
  { icon: CalendarCheckIcon, text: "Appointments & OP bookings" },
  { icon: UsersIcon, text: "Patient records at a glance" },
  { icon: ToothIcon, text: "Dental examination forms" },
] as const;

export default function AdminLogin() {
  const { user, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoading && user) {
    const redirectTo = (location.state as { from?: string } | null)?.from ?? "/admin";
    return <Navigate to={redirectTo} replace />;
  }

  function trackCapsLock(event: KeyboardEvent<HTMLInputElement>) {
    setCapsLock(event.getModifierState("CapsLock"));
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
      <PageMeta title="Admin Login" description="Secure staff login for Dr. Arun Dental Care." path="/admin/login" />

      <main className={styles.page}>
        {/* ---------- Brand panel ---------- */}
        <section className={styles.brand}>
          <div className={styles.glow} aria-hidden="true" />
          <div className={styles.dots} aria-hidden="true" />
          <span className={`${styles.ring} ${styles.ring1}`} aria-hidden="true" />
          <span className={`${styles.ring} ${styles.ring2}`} aria-hidden="true" />

          <div className={styles.brandTop}>
            <span className={styles.logo}>
              <img src="/assets/brand/logo.png" alt="" width={44} height={44} />
            </span>
            <span>
              <strong>{clinicInfo.name}</strong>
              <small>{clinicInfo.location}</small>
            </span>
          </div>

          <div className={styles.brandBody}>
            <span className={styles.brandEyebrow}>Clinic administration</span>
            <h1 className={styles.brandTitle}>Everything your clinic needs, in one calm dashboard.</h1>
            <ul className={styles.features}>
              {FEATURES.map((feature, index) => (
                <li key={feature.text} style={{ animationDelay: `${300 + index * 120}ms` }}>
                  <span className={styles.featureIcon}>
                    <feature.icon width={20} height={20} />
                  </span>
                  {feature.text}
                </li>
              ))}
            </ul>
          </div>

          <p className={styles.brandFoot}>
            <ShieldCheckIcon width={16} height={16} /> Authorised staff only
          </p>
        </section>

        {/* ---------- Sign-in form ---------- */}
        <section className={styles.formSide}>
          <div className={styles.formBlob} aria-hidden="true" />
          <div className={styles.card}>
            <span className={styles.lockBadge}>
              <LockIcon width={28} height={28} />
            </span>
            <h2 className={styles.heading}>Welcome back</h2>
            <p className={styles.subheading}>Sign in to manage {clinicInfo.name}.</p>

            <form onSubmit={handleSubmit} noValidate>
              {error && (
                <div className={styles.error} role="alert">
                  <AlertIcon width={18} height={18} />
                  {error}
                </div>
              )}

              <div className={styles.field}>
                <label htmlFor="admin-email">Email</label>
                <div className={styles.inputWrap}>
                  <MailIcon width={20} height={20} className={styles.inputIcon} />
                  <input
                    id="admin-email"
                    type="email"
                    autoComplete="username"
                    placeholder="you@clinic.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="admin-password">Password</label>
                <div className={styles.inputWrap}>
                  <LockIcon width={20} height={20} className={styles.inputIcon} />
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyUp={trackCapsLock}
                    onKeyDown={trackCapsLock}
                    onBlur={() => setCapsLock(false)}
                    required
                  />
                  <button
                    type="button"
                    className={styles.eye}
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOffIcon width={20} height={20} /> : <EyeIcon width={20} height={20} />}
                  </button>
                </div>
                {capsLock && (
                  <p className={styles.caps}>
                    <AlertIcon width={14} height={14} /> Caps Lock is on
                  </p>
                )}
              </div>

              <button type="submit" className={styles.submit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className={styles.spinner} aria-hidden="true" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRightIcon width={20} height={20} />
                  </>
                )}
              </button>
            </form>

            <Link to="/" className={styles.back}>
              <GlobeIcon width={16} height={16} /> Back to website
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
