import { useCallback, useEffect, useState } from "react";
import { fetchEnquiries, updateEnquiryStatus } from "../../api/enquiries";
import { ApiError } from "../../api/client";
import type { EnquiryRecord, EnquiryStatus } from "../../types";
import { EnquiryStatusBadge } from "./StatusBadge";
import { PhoneIcon, WhatsAppIcon } from "../icons/DentalIcons";
import { formatDateTime, telHref, whatsappHref } from "../../utils/contactLinks";
import tableStyles from "./AdminTable.module.css";

const STATUS_OPTIONS: EnquiryStatus[] = ["New", "Contacted", "FollowUp", "Completed"];

// `refreshKey` is bumped by the dashboard when it notices a new enquiry.
export function EnquiriesPanel({ refreshKey = 0 }: { refreshKey?: number }) {
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    setError(null);
    try {
      const res = await fetchEnquiries(statusFilter || undefined);
      setEnquiries(res.enquiries);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load enquiries.");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (refreshKey > 0) load(true);
  }, [refreshKey, load]);

  async function handleStatusChange(id: string, status: EnquiryStatus) {
    setBusyId(id);
    try {
      await updateEnquiryStatus(id, status);
      await load();
    } catch {
      // surfaced via reload failing silently is acceptable here; keep UI responsive
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className={tableStyles.toolbar}>
        <div className={tableStyles.toolbarField}>
          <label htmlFor="enquiry-status-filter">Status</label>
          <select
            id="enquiry-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === "FollowUp" ? "Follow-up" : s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={tableStyles.tableWrap}>
        {isLoading ? (
          <p className={tableStyles.loadingState}>Loading enquiries...</p>
        ) : error ? (
          <p className={tableStyles.emptyState}>{error}</p>
        ) : enquiries.length === 0 ? (
          <p className={tableStyles.emptyState}>No enquiries found.</p>
        ) : (
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Mobile</th>
                <th>Message</th>
                <th>Callback Time</th>
                <th>Status</th>
                <th>Received</th>
                <th>Reach Out</th>
                <th>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.map((enquiry) => (
                <tr key={enquiry.id} className={enquiry.status === "New" ? tableStyles.rowNew : undefined}>
                  <td data-label="Name">
                    {enquiry.name}
                    {enquiry.status === "New" && <span className={tableStyles.newPill}>New</span>}
                  </td>
                  <td data-label="Mobile" className={tableStyles.nowrap}>
                    {enquiry.mobile}
                  </td>
                  <td data-label="Message">{enquiry.message}</td>
                  <td data-label="Callback Time">{enquiry.callbackTime || "—"}</td>
                  <td data-label="Status">
                    <EnquiryStatusBadge status={enquiry.status} />
                  </td>
                  <td data-label="Received">{formatDateTime(enquiry.createdAt)}</td>
                  <td data-label="Reach Out">
                    <div className={tableStyles.actionsCell}>
                      <a href={telHref(enquiry.mobile)} className="btn btn-secondary btn-sm" aria-label={`Call ${enquiry.name}`}>
                        <PhoneIcon width={15} height={15} /> Call
                      </a>
                      <a
                        href={whatsappHref(enquiry.mobile)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary btn-sm"
                        aria-label={`WhatsApp ${enquiry.name}`}
                      >
                        <WhatsAppIcon width={15} height={15} /> WhatsApp
                      </a>
                    </div>
                  </td>
                  <td data-label="Update Status">
                    <select
                      value={enquiry.status}
                      disabled={busyId === enquiry.id}
                      onChange={(e) => handleStatusChange(enquiry.id, e.target.value as EnquiryStatus)}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s === "FollowUp" ? "Follow-up" : s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
