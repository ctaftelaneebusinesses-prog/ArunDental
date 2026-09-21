import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageMeta } from "../components/PageMeta";
import { useAuth } from "../context/AuthContext";
import { fetchDashboardSummary } from "../api/dashboard";
import { StatCard } from "../components/admin/StatCard";
import { AppointmentsPanel } from "../components/admin/AppointmentsPanel";
import { PatientsPanel } from "../components/admin/PatientsPanel";
import { EnquiriesPanel } from "../components/admin/EnquiriesPanel";
import {
  CalendarCheckIcon,
  ChatHeartIcon,
  ExperienceIcon,
  ShieldCheckIcon,
} from "../components/icons/DentalIcons";
import type { DashboardSummary } from "../types";
import styles from "./AdminDashboard.module.css";

type Tab = "overview" | "patients" | "enquiries";

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview & Appointments" },
  { key: "patients", label: "Patients" },
  { key: "enquiries", label: "Enquiries" },
];

// How often the dashboard checks for new bookings / enquiries while it is open.
const POLL_INTERVAL_MS = 15_000;

interface Notice {
  text: string;
  tab: Tab;
}

function pluralise(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : `${count} ${plural}`;
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [appointmentsRefresh, setAppointmentsRefresh] = useState(0);
  const [enquiriesRefresh, setEnquiriesRefresh] = useState(0);
  // Totals from the previous poll; null until the first poll so opening the
  // dashboard never announces old records as "new".
  const lastTotals = useRef<{ appointments: number; enquiries: number } | null>(null);

  const refreshSummary = useCallback(async () => {
    try {
      const next = await fetchDashboardSummary();
      setSummary(next);

      const previous = lastTotals.current;
      if (previous) {
        const newAppointments = next.totalAppointments - previous.appointments;
        const newEnquiries = next.totalEnquiries - previous.enquiries;
        if (newAppointments > 0) setAppointmentsRefresh((n) => n + 1);
        if (newEnquiries > 0) setEnquiriesRefresh((n) => n + 1);

        if (newAppointments > 0) {
          setNotice({
            text: `${pluralise(newAppointments, "A new appointment has", "new appointments have")} just been booked.`,
            tab: "overview",
          });
        } else if (newEnquiries > 0) {
          setNotice({
            text: `${pluralise(newEnquiries, "A new enquiry has", "new enquiries have")} just arrived.`,
            tab: "enquiries",
          });
        }
      }
      lastTotals.current = { appointments: next.totalAppointments, enquiries: next.totalEnquiries };
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
  const newEnquiries = summary?.newEnquiries ?? 0;
  const attentionCount = pendingAppointments + newEnquiries;

  async function handleLogout() {
    await logout();
    navigate("/admin/login", { replace: true });
  }

  return (
    <>
      <PageMeta
        title={attentionCount > 0 ? `(${attentionCount}) Admin Dashboard` : "Admin Dashboard"}
        description="Clinic administration dashboard."
        path="/admin"
      />

      <div className={styles.page}>
        <header className={styles.topbar}>
          <div className="container">
            <div className={styles.topbarInner}>
              <div>
                <p className={styles.eyebrow}>Clinic Administration</p>
                <h1 className={styles.heading}>Admin Dashboard</h1>
              </div>
              <div className={styles.userBox}>
                <span>{user?.name}</span>
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleLogout}>
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="container">
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

          <nav className={styles.tabs} aria-label="Dashboard sections">
            {TABS.map((t) => {
              const badge = t.key === "overview" ? pendingAppointments : t.key === "enquiries" ? newEnquiries : 0;
              return (
                <button
                  key={t.key}
                  type="button"
                  className={`${styles.tabBtn} ${tab === t.key ? styles.tabBtnActive : ""}`}
                  onClick={() => setTab(t.key)}
                >
                  {t.label}
                  {badge > 0 && (
                    <span className={styles.tabBadge} aria-label={`${badge} awaiting attention`}>
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {tab === "overview" && (
            <div className={styles.overview}>
              <div className={styles.statsGrid}>
                <StatCard label="Today's OP" value={summary?.todaysOp ?? "—"} icon={<CalendarCheckIcon width={22} height={22} />} />
                <StatCard
                  label="Upcoming Appointments"
                  value={summary?.upcomingAppointments ?? "—"}
                  icon={<ExperienceIcon width={22} height={22} />}
                />
                <StatCard label="New Patients" value={summary?.newPatients ?? "—"} icon={<ShieldCheckIcon width={22} height={22} />} />
                <StatCard
                  label="Pending Enquiries"
                  value={summary?.pendingEnquiries ?? "—"}
                  icon={<ChatHeartIcon width={22} height={22} />}
                />
              </div>
              <h2 className={styles.sectionTitle}>Appointments</h2>
              <AppointmentsPanel refreshKey={appointmentsRefresh} />
            </div>
          )}

          {tab === "patients" && (
            <div className={styles.panelSection}>
              <h2 className={styles.sectionTitle}>Patient Management</h2>
              <PatientsPanel />
            </div>
          )}

          {tab === "enquiries" && (
            <div className={styles.panelSection}>
              <h2 className={styles.sectionTitle}>Enquiries</h2>
              <EnquiriesPanel refreshKey={enquiriesRefresh} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
