import type { KeyboardEvent } from "react";
import { TOOTH_MARK_LABELS, type ToothMark } from "./examForm";
import styles from "./ArchChart.module.css";

// The two "bite view" arch diagrams from the paper form: permanent teeth (8 per
// quadrant) and the smaller child arches (5 per quadrant). Every tooth is keyed
// by the same universal id the front-view chart uses (1-32, A-T), so marking a
// tooth on either chart marks it on both.

interface ArchChartProps {
  marks: Record<string, ToothMark>;
  // Omit for the read-only (print) version.
  onToothClick?: (id: string) => void;
}

interface ArchSpec {
  ids: string[];
  // Quadrant tooth number shown inside each circle (1 = centre incisor).
  labels: number[];
  jaw: "upper" | "lower";
  cx: number;
  cy: number;
  a: number; // half width of the horseshoe
  b: number; // depth of the horseshoe
  radiusFor: (n: number) => number;
  caption: string;
  small: boolean;
}

interface Placed {
  id: string;
  label: number;
  x: number;
  y: number;
  r: number;
}

const GAP = 3;

const range = (from: number, to: number) =>
  Array.from({ length: Math.abs(to - from) + 1 }, (_, i) => String(from < to ? from + i : from - i));
const letters = (from: string, to: string) => {
  const a = from.charCodeAt(0);
  const b = to.charCodeAt(0);
  return Array.from({ length: Math.abs(b - a) + 1 }, (_, i) => String.fromCharCode(a < b ? a + i : a - i));
};

const adultRadius = (n: number) => (n >= 6 ? 11 : n >= 4 ? 9.5 : n === 3 ? 9 : 8);
const childRadius = (n: number) => (n >= 4 ? 9 : n === 3 ? 8 : 7.5);

// Left to right as you look at the chart: patient's right side first.
const ADULT_LABELS = [8, 7, 6, 5, 4, 3, 2, 1, 1, 2, 3, 4, 5, 6, 7, 8];
const CHILD_LABELS = [5, 4, 3, 2, 1, 1, 2, 3, 4, 5];

// Adult group is centred at x=145; child group at x=379.
const ADULT_B = 88;
const CHILD_B = 56;
const ADULT_TOP_CY = ADULT_B + 11;
const ADULT_BOTTOM_CY = ADULT_TOP_CY + 11 + 14 + 11;
const CHILD_TOP_CY = CHILD_B + 9;
const CHILD_BOTTOM_CY = CHILD_TOP_CY + 9 + 12 + 9;
const CHILD_OFFSET_Y = (ADULT_BOTTOM_CY + ADULT_B + 11 - (CHILD_BOTTOM_CY + CHILD_B + 9)) / 2;

const VIEW_WIDTH = 456;
const VIEW_HEIGHT = ADULT_BOTTOM_CY + ADULT_B + 11;

const ARCHES: ArchSpec[] = [
  { ids: range(1, 16), labels: ADULT_LABELS, jaw: "upper", cx: 145, cy: ADULT_TOP_CY, a: 132, b: ADULT_B, radiusFor: adultRadius, caption: "UPPER", small: false },
  { ids: range(32, 17), labels: ADULT_LABELS, jaw: "lower", cx: 145, cy: ADULT_BOTTOM_CY, a: 132, b: ADULT_B, radiusFor: adultRadius, caption: "LOWER", small: false },
  { ids: letters("A", "J"), labels: CHILD_LABELS, jaw: "upper", cx: 379, cy: CHILD_TOP_CY + CHILD_OFFSET_Y, a: 66, b: CHILD_B, radiusFor: childRadius, caption: "UPPER", small: true },
  { ids: letters("T", "K"), labels: CHILD_LABELS, jaw: "lower", cx: 379, cy: CHILD_BOTTOM_CY + CHILD_OFFSET_Y, a: 66, b: CHILD_B, radiusFor: childRadius, caption: "LOWER", small: true },
];

// Places the teeth along a half-ellipse, spaced by their own size so the big
// molars take more of the curve than the incisors.
function placeArch(spec: ArchSpec): Placed[] {
  const samples = 400;
  const points: { x: number; y: number }[] = [];
  const cumulative = [0];
  for (let i = 0; i <= samples; i++) {
    const theta = Math.PI - (Math.PI * i) / samples;
    const x = spec.cx + spec.a * Math.cos(theta);
    const y = spec.cy + (spec.jaw === "upper" ? -1 : 1) * spec.b * Math.sin(theta);
    points.push({ x, y });
    if (i > 0) {
      cumulative.push(cumulative[i - 1] + Math.hypot(x - points[i - 1].x, y - points[i - 1].y));
    }
  }
  const arcLength = cumulative[samples];

  const slots = spec.labels.map((label) => spec.radiusFor(label) * 2 + GAP);
  const total = slots.reduce((sum, s) => sum + s, 0);

  let start = 0;
  return spec.ids.map((id, index) => {
    const centre = ((start + slots[index] / 2) / total) * arcLength;
    start += slots[index];
    let lo = 0;
    let hi = samples;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cumulative[mid] < centre) lo = mid + 1;
      else hi = mid;
    }
    const p = points[Math.min(lo, samples)];
    return { id, label: spec.labels[index], x: p.x, y: p.y, r: spec.radiusFor(spec.labels[index]) };
  });
}

const PLACED = ARCHES.map((spec) => ({ spec, teeth: placeArch(spec) }));

function ArchTooth({
  tooth,
  small,
  mark,
  interactive,
  onClick,
}: {
  tooth: Placed;
  small: boolean;
  mark?: ToothMark;
  interactive: boolean;
  onClick?: (id: string) => void;
}) {
  const { id, label, x, y, r } = tooth;

  function handleKey(event: KeyboardEvent<SVGGElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick?.(id);
    }
  }

  const markClass =
    mark === "caries"
      ? styles.caries
      : mark === "filling"
        ? styles.filling
        : mark === "rct"
          ? styles.rct
          : mark === "missing"
            ? styles.missing
            : "";

  return (
    <g
      className={`${styles.tooth} ${interactive ? styles.toothInteractive : ""}`}
      onClick={interactive ? () => onClick?.(id) : undefined}
      onKeyDown={interactive ? handleKey : undefined}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? `Tooth ${id}${mark ? `, marked ${TOOTH_MARK_LABELS[mark]}` : ""}` : undefined}
    >
      <circle cx={x} cy={y} r={r} className={`${styles.circle} ${markClass}`} />
      <text x={x} y={y} className={`${styles.number} ${small ? styles.numberSmall : ""}`} textAnchor="middle" dominantBaseline="central">
        {label}
      </text>
      {mark === "extraction" && (
        <g className={styles.extraction}>
          <line x1={x - r} y1={y - r} x2={x + r} y2={y + r} />
          <line x1={x + r} y1={y - r} x2={x - r} y2={y + r} />
        </g>
      )}
    </g>
  );
}

export function ArchChart({ marks, onToothClick }: ArchChartProps) {
  const interactive = Boolean(onToothClick);

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      className={styles.svg}
      role="group"
      aria-label="Bite-view charts of the upper and lower arches, permanent and child teeth"
    >
      {PLACED.map(({ spec, teeth }) => (
        <g key={`${spec.small ? "child" : "adult"}-${spec.jaw}`}>
          {/* caption sits inside the horseshoe, towards its open side */}
          <text
            x={spec.cx}
            y={spec.cy + (spec.jaw === "upper" ? -spec.b * 0.42 : spec.b * 0.42)}
            className={`${styles.caption} ${spec.small ? styles.captionSmall : ""}`}
            textAnchor="middle"
            dominantBaseline="central"
          >
            {spec.caption}
          </text>
          {teeth.map((tooth) => (
            <ArchTooth
              key={tooth.id}
              tooth={tooth}
              small={spec.small}
              mark={marks[tooth.id]}
              interactive={interactive}
              onClick={onToothClick}
            />
          ))}
        </g>
      ))}
    </svg>
  );
}
