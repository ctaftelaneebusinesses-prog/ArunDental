import { useId, useLayoutEffect, useRef } from "react";
import { clinicInfo } from "../../config/clinicInfo";
import { ToothIcon } from "../icons/DentalIcons";
import { ArchChart } from "./ArchChart";
import { ToothChart, ToothLegend } from "./ToothChart";
import {
  QUAD_FIELDS,
  SEX_OPTIONS,
  TEXT_FINDINGS,
  formatDisplayDate,
  type ExamValues,
  type Quad,
} from "./examForm";
import styles from "./ExamSheet.module.css";

interface ExamSheetProps {
  values: ExamValues;
  // Present = editable form on screen. Absent = read-only version used for printing.
  onChange?: (patch: Partial<ExamValues>) => void;
  onToothClick?: (id: string) => void;
}

const LINE_HEIGHT = 28;

function AutoTextarea({ id, value, onChange, minRows }: { id: string; value: string; onChange: (v: string) => void; minRows: number }) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Grow with the text so nothing is ever clipped when the sheet is printed.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    };
    fit();
    // Text re-wraps when the screen width changes (rotation, window resize).
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [value]);

  return (
    <textarea
      id={id}
      ref={ref}
      className={styles.ruled}
      rows={minRows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  type?: "text" | "date" | "tel" | "number";
  className?: string;
  options?: string[];
}

function Field({ label, value, onChange, type = "text", className = "", options }: FieldProps) {
  const id = useId();
  const shown = type === "date" ? formatDisplayDate(value) : value;

  return (
    <div className={`${styles.field} ${className}`}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {onChange ? (
        options ? (
          <select id={id} className={styles.input} value={value} onChange={(e) => onChange(e.target.value)}>
            <option value=""> </option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={id}
            className={styles.input}
            type={type}
            inputMode={type === "tel" ? "numeric" : undefined}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        )
      ) : (
        <span className={styles.value}>{shown}</span>
      )}
    </div>
  );
}

function BlockField({ label, value, onChange, minRows }: { label: string; value: string; onChange?: (value: string) => void; minRows: number }) {
  const id = useId();
  return (
    <div className={styles.block}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {onChange ? (
        <AutoTextarea id={id} value={value} onChange={onChange} minRows={minRows} />
      ) : (
        <div className={`${styles.ruled} ${styles.ruledStatic}`} style={{ minHeight: minRows * LINE_HEIGHT }}>
          {value}
        </div>
      )}
    </div>
  );
}

const QUAD_CELLS = [
  { key: "ur", label: "Upper right" },
  { key: "ul", label: "Upper left" },
  { key: "lr", label: "Lower right" },
  { key: "ll", label: "Lower left" },
] as const;

function QuadBox({ label, value, onChange }: { label: string; value: Quad; onChange?: (next: Quad) => void }) {
  return (
    <div className={styles.quadRow}>
      <span className={styles.label}>{label}</span>
      <div className={styles.quad} role="group" aria-label={`${label} by quadrant`}>
        {QUAD_CELLS.map((cell) =>
          onChange ? (
            <input
              key={cell.key}
              className={styles.quadCell}
              value={value[cell.key]}
              aria-label={`${label}, ${cell.label}`}
              onChange={(e) => onChange({ ...value, [cell.key]: e.target.value })}
            />
          ) : (
            <span key={cell.key} className={styles.quadCell}>
              {value[cell.key]}
            </span>
          ),
        )}
      </div>
    </div>
  );
}

export function ExamLetterhead() {
  return (
    <header className={styles.letterhead}>
      <div className={styles.brand}>
        <ToothIcon width={46} height={46} strokeWidth={1.4} className={styles.brandMark} aria-hidden="true" />
        <div>
          <div className={styles.brandName}>{clinicInfo.name}</div>
          <div className={styles.brandTag}>
            {clinicInfo.doctorName}, {clinicInfo.qualification}
          </div>
        </div>
      </div>
      <address className={styles.address}>
        {clinicInfo.addressLine1}
        <br />
        {clinicInfo.addressLine2}
        <br />
        Ph: {clinicInfo.phoneDisplay}
      </address>
    </header>
  );
}

export function ExamSheet({ values, onChange, onToothClick }: ExamSheetProps) {
  const set = onChange
    ? (patch: Partial<ExamValues>) => onChange(patch)
    : undefined;
  const text = (key: keyof ExamValues) => (set ? (v: string) => set({ [key]: v } as Partial<ExamValues>) : undefined);

  return (
    <div className={styles.sheet}>
      <ExamLetterhead />

      <h2 className={styles.title}>DENTAL EXAMINATION FORM</h2>

      <div className={styles.rowTwo}>
        <Field label="OP No.:" value={values.opNumber} onChange={text("opNumber")} className={styles.grow} />
        <Field label="Date:" value={values.date} onChange={text("date")} type="date" className={styles.narrow} />
      </div>
      <div className={styles.rowTwo}>
        <Field label="Name:" value={values.name} onChange={text("name")} className={styles.grow} />
        <Field label="Age:" value={values.age} onChange={text("age")} type="number" className={styles.tiny} />
        <Field label="Sex:" value={values.sex} onChange={text("sex")} options={SEX_OPTIONS} className={styles.small} />
      </div>
      <div className={styles.rowTwo}>
        <Field label="Address:" value={values.address} onChange={text("address")} className={styles.grow} />
        <Field label="Mobile:" value={values.mobile} onChange={text("mobile")} type="tel" className={styles.narrow} />
      </div>

      <BlockField label="Chief Complaint:" value={values.chiefComplaint} onChange={text("chiefComplaint")} minRows={2} />
      <BlockField label="Medical History:" value={values.medicalHistory} onChange={text("medicalHistory")} minRows={1} />
      <BlockField label="Dental History:" value={values.dentalHistory} onChange={text("dentalHistory")} minRows={1} />

      <h3 className={styles.heading}>CLINICAL FINDINGS:</h3>
      <div className={styles.findings}>
        <div className={styles.chart}>
          <ArchChart marks={values.teeth} onToothClick={onToothClick} />
          <ToothChart marks={values.teeth} onToothClick={onToothClick} hideLegend />
        </div>
        <div className={styles.findingsList}>
          {TEXT_FINDINGS.map((item) => (
            <Field
              key={item.key}
              label={item.label}
              value={values[item.key]}
              onChange={text(item.key)}
              className={styles.findingRow}
            />
          ))}
          {QUAD_FIELDS.map((item) => (
            <QuadBox
              key={item.key}
              label={item.label}
              value={values[item.key]}
              onChange={set ? (next) => set({ [item.key]: next } as Partial<ExamValues>) : undefined}
            />
          ))}
          <ToothLegend />
        </div>
      </div>

      <h3 className={styles.heading}>DIAGNOSIS &amp; TREATMENT PLAN:</h3>
      <BlockField label="" value={values.diagnosisPlan} onChange={text("diagnosisPlan")} minRows={3} />

      <footer className={styles.signature}>
        <span className={styles.signLine} />
        <span>
          {clinicInfo.doctorName}, {clinicInfo.qualification}
        </span>
      </footer>
    </div>
  );
}
