import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { createPortal } from "react-dom";
import { fetchPatient, searchPatients } from "../../api/patients";
import type { PatientSummary } from "../../types";
import { CameraCapture } from "../CameraCapture";
import { UploadIcon } from "../icons/DentalIcons";
import { ExamPhotosPage } from "./ExamPhotosPage";
import { ExamSheet } from "./ExamSheet";
import {
  SEX_OPTIONS,
  TOOTH_MARK_LABELS,
  clearDraft,
  createEmptyExam,
  loadDraft,
  saveDraft,
  type ExamValues,
  type ToothMark,
} from "./examForm";
import {
  MAX_EXAM_PHOTOS,
  fileToExamPhoto,
  loadPhotos,
  savePhotos,
  type ExamPhoto,
} from "./examPhotos";
import styles from "./ExaminationFormPanel.module.css";

type Tool = ToothMark | "erase";

const TOOLS: { key: Tool; label: string }[] = [
  { key: "caries", label: TOOTH_MARK_LABELS.caries },
  { key: "filling", label: TOOTH_MARK_LABELS.filling },
  { key: "rct", label: TOOTH_MARK_LABELS.rct },
  { key: "extraction", label: TOOTH_MARK_LABELS.extraction },
  { key: "missing", label: TOOTH_MARK_LABELS.missing },
  { key: "erase", label: "Erase" },
];

interface ExaminationFormPanelProps {
  // Set from the Appointments tab's "Examination Form" action so this patient's
  // details load automatically without the admin having to search for them.
  examRequest?: { id: string; ts: number } | null;
}

export function ExaminationFormPanel({ examRequest }: ExaminationFormPanelProps = {}) {
  const [values, setValues] = useState<ExamValues>(() => loadDraft() ?? createEmptyExam());
  const [tool, setTool] = useState<Tool>("caries");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PatientSummary[]>([]);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [printRoot, setPrintRoot] = useState<HTMLElement | null>(null);
  const [photos, setPhotos] = useState<ExamPhoto[]>(() => loadPhotos());
  const [photoMessage, setPhotoMessage] = useState<string | null>(null);
  const [photosNotKept, setPhotosNotKept] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const skipFirstSave = useRef(true);
  const skipFirstPhotoSave = useRef(true);

  // The print copy lives outside the app root so printing shows only the form.
  // The body class scopes that rule to this screen, so other pages still print normally.
  useEffect(() => {
    const el = document.createElement("div");
    el.className = styles.printRoot;
    document.body.appendChild(el);
    document.body.classList.add("exam-print-active");
    setPrintRoot(el);
    return () => {
      el.remove();
      document.body.classList.remove("exam-print-active");
    };
  }, []);

  useEffect(() => {
    if (skipFirstSave.current) {
      skipFirstSave.current = false;
      return;
    }
    const timeout = window.setTimeout(() => {
      saveDraft(values);
      setSavedAt(new Date());
    }, 500);
    return () => window.clearTimeout(timeout);
  }, [values]);

  useEffect(() => {
    if (skipFirstPhotoSave.current) {
      skipFirstPhotoSave.current = false;
      return;
    }
    const timeout = window.setTimeout(() => setPhotosNotKept(!savePhotos(photos)), 500);
    return () => window.clearTimeout(timeout);
  }, [photos]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timeout = window.setTimeout(() => {
      searchPatients({ q: query.trim() })
        .then((res) => {
          setResults(res.patients.slice(0, 6));
          setLookupError(null);
        })
        .catch(() => setLookupError("Could not search patients. Please try again."));
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [query]);

  const patch = useCallback((change: Partial<ExamValues>) => {
    setValues((current) => ({ ...current, ...change }));
  }, []);

  const handleToothClick = useCallback(
    (id: string) => {
      setValues((current) => {
        const teeth = { ...current.teeth };
        if (tool === "erase" || teeth[id] === tool) {
          delete teeth[id];
        } else {
          teeth[id] = tool;
        }
        return { ...current, teeth };
      });
    },
    [tool],
  );

  const loadPatientById = useCallback(async (id: string) => {
    setLookupError(null);
    try {
      const { patient } = await fetchPatient(id);
      setValues((current) => ({
        ...current,
        opNumber: patient.opNumber,
        name: patient.name,
        age: patient.age != null ? String(patient.age) : "",
        sex: patient.gender && SEX_OPTIONS.includes(patient.gender) ? patient.gender : "",
        address: patient.address,
        mobile: patient.mobile,
        chiefComplaint: patient.dentalProblem ?? current.chiefComplaint,
        dentalHistory: patient.previousTreatment ?? current.dentalHistory,
      }));
      setQuery("");
      setResults([]);
    } catch {
      setLookupError("Could not load that patient. Please try again.");
    }
  }, []);

  // Jumped here from the Appointments tab's "Examination Form" action — load
  // that patient right away. `ts` (not just the id) is the dependency so
  // clicking the same patient's action again re-triggers this even though the
  // id hasn't changed.
  useEffect(() => {
    if (examRequest) void loadPatientById(examRequest.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examRequest?.id, examRequest?.ts]);

  async function addPhotoFiles(files: File[]) {
    setPhotoMessage(null);
    const room = MAX_EXAM_PHOTOS - photos.length;
    if (room <= 0) {
      setPhotoMessage(`You can attach up to ${MAX_EXAM_PHOTOS} photos.`);
      return;
    }

    const added: ExamPhoto[] = [];
    let skipped = 0;
    for (const file of files.slice(0, room)) {
      const result = await fileToExamPhoto(file);
      if (typeof result === "string") skipped += 1;
      else added.push(result);
    }
    if (added.length > 0) setPhotos((current) => [...current, ...added]);

    const notes: string[] = [];
    if (skipped > 0) notes.push(`${skipped} file${skipped === 1 ? " was" : "s were"} skipped (use JPEG, PNG or WEBP under 10 MB).`);
    if (files.length > room) notes.push(`Only ${MAX_EXAM_PHOTOS} photos can be attached.`);
    if (notes.length > 0) setPhotoMessage(notes.join(" "));
  }

  function handlePhotoInput(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = ""; // allow picking the same file again
    if (files.length > 0) void addPhotoFiles(files);
  }

  function handleClear() {
    if (!window.confirm("Clear the whole form (including any photos) and start a new one?")) return;
    setValues(createEmptyExam());
    setPhotos([]);
    setPhotoMessage(null);
    clearDraft();
    setSavedAt(null);
  }

  return (
    <div>
      <div className={styles.toolbar}>
        <div className={styles.lookup}>
          <label htmlFor="exam-patient-search" className={styles.toolLabel}>
            Fill from a registered patient
          </label>
          <input
            id="exam-patient-search"
            type="search"
            placeholder="Search by name, mobile or OP number"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
          {(results.length > 0 || lookupError) && (
            <ul className={styles.results} role="listbox" aria-label="Matching patients">
              {lookupError && <li className={styles.resultsError}>{lookupError}</li>}
              {results.map((patient) => (
                <li key={patient.id}>
                  <button type="button" onClick={() => loadPatientById(patient.id)}>
                    <strong>{patient.name}</strong>
                    <span>
                      {patient.opNumber} · {patient.mobile}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.actions}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleClear}>
            New / Clear
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => window.print()}>
            Print Form
          </button>
        </div>
      </div>

      <div className={styles.tools} role="radiogroup" aria-label="Tooth chart marking tool">
        <span className={styles.toolLabel}>Tooth chart: pick a mark, then click teeth</span>
        <div className={styles.toolButtons}>
          {TOOLS.map((item) => (
            <button
              key={item.key}
              type="button"
              role="radio"
              aria-checked={tool === item.key}
              className={`${styles.toolBtn} ${tool === item.key ? styles.toolBtnActive : ""}`}
              onClick={() => setTool(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.photoBar}>
        <div>
          <span className={styles.toolLabel}>Photos (optional)</span>
          <p className={styles.photoHelp}>
            Only if you need them. Attached photos print on a second page after the form; leave this empty to print the form alone.
          </p>
        </div>
        <div className={styles.photoActions}>
          <label htmlFor="exam-photo-input" className="btn btn-secondary btn-sm" style={{ cursor: "pointer" }}>
            <UploadIcon width={16} height={16} /> Add photos
          </label>
          <input
            id="exam-photo-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="visually-hidden"
            onChange={handlePhotoInput}
          />
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowCamera(true)}>
            Take photo
          </button>
          {photos.length > 0 && (
            <span className={styles.photoCount}>
              {photos.length} of {MAX_EXAM_PHOTOS}
            </span>
          )}
        </div>
      </div>
      {photoMessage && (
        <p className={styles.photoMessage} role="status">
          {photoMessage}
        </p>
      )}

      <div className={styles.paper}>
        <ExamSheet values={values} onChange={patch} onToothClick={handleToothClick} />
        {photos.length > 0 && (
          <ExamPhotosPage
            values={values}
            photos={photos}
            onCaptionChange={(id, caption) =>
              setPhotos((current) => current.map((p) => (p.id === id ? { ...p, caption } : p)))
            }
            onRemove={(id) => setPhotos((current) => current.filter((p) => p.id !== id))}
          />
        )}
      </div>

      <p className={styles.hint}>
        {savedAt
          ? `Draft saved on this computer at ${savedAt.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}.`
          : "Your typing is saved automatically on this computer until you clear the form."}{" "}
        Nothing is sent to the server. Use Print Form, then choose A4 in the print window.
        {photosNotKept && " These photos are too large to keep after a refresh, so print before closing this page."}
      </p>

      {showCamera && (
        <CameraCapture
          onCapture={(file) => {
            setShowCamera(false);
            void addPhotoFiles([file]);
          }}
          onClose={() => setShowCamera(false)}
        />
      )}

      {printRoot &&
        createPortal(
          <>
            <ExamSheet values={values} />
            {photos.length > 0 && <ExamPhotosPage values={values} photos={photos} />}
          </>,
          printRoot,
        )}
    </div>
  );
}
