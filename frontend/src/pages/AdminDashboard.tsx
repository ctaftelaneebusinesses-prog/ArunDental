import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageMeta } from "../components/PageMeta";
import { useAuth } from "../context/AuthContext";
import { fetchDashboardSummary } from "../api/dashboard";
import { StatCard } from "../components/admin/StatCard";
import { AppointmentsPanel } from "../components/admin/AppointmentsPanel";
import { PatientsPanel } from "../components/admin/PatientsPanel";
import { ExaminationFormPanel } from "../components/admin/ExaminationFormPanel";
import { GlobeIcon, LogOutIcon } from "../components/admin/AdminIcons";
import {
  CalendarCheckIcon,
  ExperienceIcon,
  ShieldCheckIcon,
  ToothIcon,
  UsersIcon,
} from "../components/icons/DentalIcons";
import { clinicInfo } from "../config/clinicInfo";
import type { DashboardSummary } from "../types";
import styles from "./AdminDashboard.module.css";

type Tab = "overview" | "patients" | "examination";

const TABS: { key: Tab; label: string; icon: typeof ToothIcon }[] = [
  { key: "overview", label: "Overview & Appointments", icon: CalendarCheckIcon },
  { key: "patients", label: "Patients", icon: UsersIcon },
  { key: "examination", label: "Examination Form", icon: ToothIcon },
];

// How often the dashboard checks for new bookings while it is open.
const POLL_INTERVAL_MS = 15_000;

interface Notice {
  text: string;
  tab: Tab;
}

function pluralise(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : `${count} ${plural}`;
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [appointmentsRefresh, setAppointmentsRefresh] = useState(0);
  // Set when "Examination Form" is clicked on a specific appointment; tells the
  // Examination Form tab which patient to load. `ts` forces the load effect to
  // re-run even if the same patient is opened twice in a row.
  const [examRequest, setExamRequest] = useState<{ id: string; ts: number } | null>(null);
  const handleExamine = useCallback((patientId: string) => {
    setExamRequest({ id: patientId, ts: Date.now() });
    setTab("examination");
  }, []);
  // Totals from the previous poll; null until the first poll so opening the
  // dashboard never announces old records as "new".
  const lastTotals = useRef<{ appointments: number } | null>(null);

  const refreshSummary = useCallback(async () => {
    try {
      const next = await fetchDashboardSummary();
      setSummary(next);

      const previous = lastTotals.current;
      if (previous) {
        const newAppointments = next.totalAppointments - previous.appointments;
        if (newAppointments > 0) {
          setAppointmentsRefresh((n) => n + 1);
          setNotice({
            text: `${pluralise(newAppointments, "A new appointment has", "new appointments have")} just been booked.`,
            tab: "overview",
          });
        }
      }
      lastTotals.current = { appointments: next.totalAppointments };
    } catch {
      // Keep whatever is on screen; the next poll will try again.
    }
  }, []);

  useEffect(() => {
    refreshSummary();
  }, [tab, refreshSummary]);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (!document.hidden) refreshSummary();
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [refreshSummary]);

  const pendingAppointments = summary?.pendingAppointments ?? 0;
  const attentionCount = pendingAppointments;

  async function handleLogout() {
    await logout();
    navigate("/admin/login", { replace: true });
  }

  // "Dr. Arun" should greet as "Dr. Arun", not just "Dr."
  const fullName = user?.name?.trim() ?? "";
  const firstName = /^dr\.?\s/i.test(fullName) ? fullName : fullName.split(" ")[0] || "there";
  const initial = (user?.name ?? "A").trim().charAt(0).toUpperCase();
  const dateLabel = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <PageMeta
        title={attentionCount > 0 ? `(${attentionCount}) Admin Dashboard` : "Admin Dashboard"}
        description="Clinic administration dashboard."
        path="/admin"
      />

      <div className={styles.page}>
        {/* ---------- Header band ---------- */}
        <header className={styles.topbar}>
          <div className={styles.glow} aria-hidden="true" />
          <div className={styles.dots} aria-hidden="true" />

          <div className={`container ${styles.topbarInner}`}>
            <div className={styles.brandRow}>
              <div className={styles.brand}>
                <span className={styles.logo}>
                  <img src="/assets/brand/logo.png" alt="" width={38} height={38} />
                </span>
                <span>
                  <strong>{clinicInfo.name}</strong>
                  <small>Clinic Administration</small>
                </span>
              </div>

              <div className={styles.actions}>
                <Link to="/" className={styles.ghostBtn}>
                  <GlobeIcon width={16} height={16} />
                  <span>View website</span>
                </Link>
                <div className={styles.userChip}>
                  <span className={styles.avatar}>{initial}</span>
                  <span className={styles.userName}>{user?.name}</span>
                </div>
                <button type="button" className={styles.logoutBtn} onClick={handleLogout} aria-label="Log out">
                  <LogOutIcon width={18} height={18} />
                  <span>Log Out</span>
                </button>
              </div>
            </div>

            <div className={styles.welcome}>
              <div>
                <p className={styles.date}>{dateLabel}</p>
                <h1 className={styles.heading}>
                  {greeting()}, <span>{firstName}</span>
                </h1>
              </div>
              <div className={styles.attention}>
                <button
                  type="button"
                  className={`${styles.attentionChip} ${pendingAppointments > 0 ? styles.attentionOn : ""}`}
                  onClick={() => setTab("overview")}
                >
                  <strong>{pendingAppointments}</strong> pending appointments
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className={`container ${styles.content}`}>
          {/* ---------- Floating tab bar ---------- */}
          <nav className={styles.tabs} aria-label="Dashboard sections">
            {TABS.map((t) => {
              const badge = t.key === "overview" ? pendingAppointments : 0;
              return (
                <button
                  key={t.key}
                  type="button"
                  className={`${styles.tabBtn} ${tab === t.key ? styles.tabBtnActive : ""}`}
                  onClick={() => setTab(t.key)}
                  aria-current={tab === t.key ? "page" : undefined}
                >
                  <t.icon width={18} height={18} />
                  <span>{t.label}</span>
                  {badge > 0 && (
                    <span className={styles.tabBadge} aria-label={`${badge} awaiting attention`}>
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {notice && (
            <div className={styles.notice} role="status">
              <span className={styles.noticeDot} aria-hidden="true" />
              <span className={styles.noticeText}>{notice.text}</span>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setTab(notice.tab);
                  setNotice(null);
                }}
              >
                View
              </button>
              <button type="button" className={styles.noticeClose} onClick={() => setNotice(null)} aria-label="Dismiss">
                &times;
              </button>
            </div>
          )}

          <div key={tab} className={styles.tabPanel}>
            {tab === "overview" && (
              <div className={styles.overview}>
                <div className={styles.statsGrid}>
                  <StatCard
                    index={0}
                    tone="blue"
                    label="Today's OP"
                    value={summary?.todaysOp ?? "—"}
                    icon={<CalendarCheckIcon width={24} height={24} />}
                  />
                  <StatCard
                    index={1}
                    tone="teal"
                    label="Upcoming Appointments"
                    value={summary?.upcomingAppointments ?? "—"}
                    icon={<ExperienceIcon width={24} height={24} />}
                  />
                  <StatCard
                    index={2}
                    tone="violet"
                    label="New Patients"
                    value={summary?.newPatients ?? "—"}
                    icon={<ShieldCheckIcon width={24} height={24} />}
                  />
                </div>
                <h2 className={styles.sectionTitle}>Appointments</h2>
                <AppointmentsPanel refreshKey={appointmentsRefresh} onExamine={handleExamine} />
              </div>
            )}

            {tab === "patients" && (
              <div className={styles.panelSection}>
                <h2 className={styles.sectionTitle}>Patient Management</h2>
                <PatientsPanel />
              </div>
            )}

            {tab === "examination" && (
              <div className={styles.panelSection}>
                <h2 className={styles.sectionTitle}>Dental Examination Form</h2>
                <ExaminationFormPanel examRequest={examRequest} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
