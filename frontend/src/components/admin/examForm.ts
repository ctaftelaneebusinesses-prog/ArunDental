// Data model for the printable Dental Examination Form (admin dashboard).

export type ToothMark = "caries" | "filling" | "rct" | "missing" | "extraction";

// Palmer-style quadrant entry: tooth numbers for each quadrant of the mouth.
// `ur`/`ul` = upper right/left, `lr`/`ll` = lower right/left.
export interface Quad {
  ur: string;
  ul: string;
  lr: string;
  ll: string;
}

export interface ExamValues {
  date: string; // YYYY-MM-DD
  opNumber: string;
  name: string;
  age: string;
  sex: string;
  address: string;
  mobile: string;
  chiefComplaint: string;
  medicalHistory: string;
  dentalHistory: string;
  gingivitis: string;
  dentalCaries: string;
  malocclusion: string;
  missing: string;
  fillings: Quad;
  rct: Quad;
  extraction: Quad;
  fpd: Quad;
  diagnosisPlan: string;
  // Universal numbering: "1"–"32" permanent teeth, "A"–"T" primary teeth.
  teeth: Record<string, ToothMark>;
}

export const QUAD_FIELDS = [
  { key: "fillings", label: "Fillings" },
  { key: "rct", label: "RCT" },
  { key: "extraction", label: "Extraction" },
  { key: "fpd", label: "FPD" },
] as const;

export const TEXT_FINDINGS = [
  { key: "gingivitis", label: "Gingivitis" },
  { key: "dentalCaries", label: "Dental Caries" },
  { key: "malocclusion", label: "Malocclusion" },
  { key: "missing", label: "Missing" },
] as const;

export const TOOTH_MARK_LABELS: Record<ToothMark, string> = {
  caries: "Caries",
  filling: "Filling",
  rct: "RCT",
  missing: "Missing",
  extraction: "Extraction",
};

export const SEX_OPTIONS = ["Male", "Female", "Other"];

const emptyQuad = (): Quad => ({ ur: "", ul: "", lr: "", ll: "" });

function todayIso(): string {
  return new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in the local timezone
}

export function createEmptyExam(): ExamValues {
  return {
    date: todayIso(),
    opNumber: "",
    name: "",
    age: "",
    sex: "",
    address: "",
    mobile: "",
    chiefComplaint: "",
    medicalHistory: "",
    dentalHistory: "",
    gingivitis: "",
    dentalCaries: "",
    malocclusion: "",
    missing: "",
    fillings: emptyQuad(),
    rct: emptyQuad(),
    extraction: emptyQuad(),
    fpd: emptyQuad(),
    diagnosisPlan: "",
    teeth: {},
  };
}

export function formatDisplayDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return year && month && day ? `${day}/${month}/${year}` : iso;
}

// Unsent work is kept in this browser so an accidental refresh doesn't lose a
// half-typed form. It never leaves the device.
const DRAFT_KEY = "arun-dental-exam-draft-v1";

export function loadDraft(): ExamValues | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ExamValues>;
    const base = createEmptyExam();
    return {
      ...base,
      ...parsed,
      fillings: { ...base.fillings, ...parsed.fillings },
      rct: { ...base.rct, ...parsed.rct },
      extraction: { ...base.extraction, ...parsed.extraction },
      fpd: { ...base.fpd, ...parsed.fpd },
      teeth: { ...parsed.teeth },
    };
  } catch {
    return null;
  }
}

export function saveDraft(values: ExamValues): void {
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
  } catch {
    // Storage blocked or full — the form still works, it just won't be remembered.
  }
}

export function clearDraft(): void {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}
