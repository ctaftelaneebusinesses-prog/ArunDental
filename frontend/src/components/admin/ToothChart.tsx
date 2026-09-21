import type { KeyboardEvent } from "react";
import { TOOTH_MARK_LABELS, type ToothMark } from "./examForm";
import styles from "./ToothChart.module.css";

interface ToothChartProps {
  marks: Record<string, ToothMark>;
  // Omit for the read-only (print) version.
  onToothClick?: (id: string) => void;
  // The key can be placed elsewhere on the sheet with <ToothLegend />.
  hideLegend?: boolean;
}

type Jaw = "upper" | "lower";

interface RowDef {
  jaw: Jaw;
  ids: string[];
  widths: number[];
  crownTop: number;
  crownHeight: number;
  rootHeight: number;
  labelY: number;
  small: boolean;
}

const CHART_WIDTH = 620;
const CENTER_X = CHART_WIDTH / 2;
const GAP = 5;

// Widths follow tooth type (molar / premolar / canine / incisor) so the arch looks right.
const ADULT_UPPER_WIDTHS = [40, 40, 40, 30, 30, 28, 26, 26, 26, 26, 28, 30, 30, 40, 40, 40];
const ADULT_LOWER_WIDTHS = [40, 40, 40, 30, 30, 28, 22, 22, 22, 22, 28, 30, 30, 40, 40, 40];
const PRIMARY_UPPER_WIDTHS = [28, 28, 22, 20, 20, 20, 20, 22, 28, 28];
const PRIMARY_LOWER_WIDTHS = [28, 28, 22, 17, 17, 17, 17, 22, 28, 28];

const range = (from: number, to: number) =>
  Array.from({ length: Math.abs(to - from) + 1 }, (_, i) => String(from < to ? from + i : from - i));

const letters = (from: string, to: string) => {
  const a = from.charCodeAt(0);
  const b = to.charCodeAt(0);
  return Array.from({ length: Math.abs(b - a) + 1 }, (_, i) => String.fromCharCode(a < b ? a + i : a - i));
};

// Top to bottom: primary upper (A–J), permanent upper (1–16), permanent lower (32–17), primary lower (T–K).
const ROWS: RowDef[] = [
  { jaw: "upper", ids: letters("A", "J"), widths: PRIMARY_UPPER_WIDTHS, crownTop: 38, crownHeight: 18, rootHeight: 18, labelY: 14, small: true },
  { jaw: "upper", ids: range(1, 16), widths: ADULT_UPPER_WIDTHS, crownTop: 116, crownHeight: 28, rootHeight: 26, labelY: 84, small: false },
  { jaw: "lower", ids: range(32, 17), widths: ADULT_LOWER_WIDTHS, crownTop: 166, crownHeight: 28, rootHeight: 26, labelY: 232, small: false },
  { jaw: "lower", ids: letters("T", "K"), widths: PRIMARY_LOWER_WIDTHS, crownTop: 252, crownHeight: 18, rootHeight: 18, labelY: 301, small: true },
];

const CHART_HEIGHT = 306;

function rootPath(cx: number, halfBase: number, halfTip: number, baseY: number, tipY: number): string {
  const curve = tipY + (tipY > baseY ? 3 : -3);
  return `M${cx - halfBase} ${baseY} L${cx - halfTip} ${tipY} Q${cx} ${curve} ${cx + halfTip} ${tipY} L${cx + halfBase} ${baseY} Z`;
}

interface ToothProps {
  id: string;
  x: number;
  width: number;
  row: RowDef;
  mark?: ToothMark;
  interactive: boolean;
  onClick?: (id: string) => void;
}

function Tooth({ id, x, width, row, mark, interactive, onClick }: ToothProps) {
  const { jaw, crownTop, crownHeight, rootHeight, labelY, small } = row;
  const cx = x + width / 2;
  const upper = jaw === "upper";
  const rootBase = upper ? crownTop : crownTop + crownHeight;
  const rootTip = upper ? crownTop - rootHeight : crownTop + crownHeight + rootHeight;
  const twoRoots = width >= 36;

  const roots = twoRoots
    ? [
        rootPath(x + width * 0.28, width * 0.15, width * 0.05, rootBase, rootTip),
        rootPath(x + width * 0.72, width * 0.15, width * 0.05, rootBase, rootTip),
      ]
    : [rootPath(cx, width * 0.26, width * 0.06, rootBase, rootTip)];

  const top = Math.min(rootTip, crownTop);
  const bottom = Math.max(rootTip, crownTop + crownHeight);
  const rx = Math.min(8, width * 0.24);

  function handleKey(event: KeyboardEvent<SVGGElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick?.(id);
    }
  }

  return (
    <g
      className={`${styles.tooth} ${interactive ? styles.toothInteractive : ""} ${mark === "missing" ? styles.toothMissing : ""}`}
      onClick={interactive ? () => onClick?.(id) : undefined}
      onKeyDown={interactive ? handleKey : undefined}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? `Tooth ${id}${mark ? `, marked ${TOOTH_MARK_LABELS[mark]}` : ""}` : undefined}
    >
      {/* generous invisible target so small teeth are easy to hit */}
      <rect x={x - 1} y={top - 2} width={width + 2} height={bottom - top + 4} fill="transparent" />
      {roots.map((d, i) => (
        <path key={i} d={d} className={`${styles.shape} ${mark === "rct" ? styles.rootFilled : ""}`} />
      ))}
      <rect
        x={x}
        y={crownTop}
        width={width}
        height={crownHeight}
        rx={rx}
        className={`${styles.shape} ${mark === "filling" ? styles.crownFilled : ""}`}
      />
      {mark === "caries" && (
        <circle cx={cx} cy={crownTop + crownHeight / 2} r={Math.min(width * 0.26, crownHeight * 0.3)} className={styles.caries} />
      )}
      {mark === "extraction" && (
        <g className={styles.extraction}>
          <line x1={x - 1} y1={top} x2={x + width + 1} y2={bottom} />
          <line x1={x + width + 1} y1={top} x2={x - 1} y2={bottom} />
        </g>
      )}
      <text x={cx} y={labelY} className={`${styles.label} ${small ? styles.labelSmall : ""}`} textAnchor="middle">
        {id}
      </text>
    </g>
  );
}

export function ToothChart({ marks, onToothClick, hideLegend = false }: ToothChartProps) {
  const interactive = Boolean(onToothClick);

  return (
    <div className={styles.wrap}>
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        className={styles.svg}
        role="group"
        aria-label="Tooth chart: permanent teeth 1 to 32, primary teeth A to T"
      >
        <line x1={CENTER_X} y1={4} x2={CENTER_X} y2={CHART_HEIGHT - 4} className={styles.midline} />
        <text x={8} y={159} className={styles.side}>
          RIGHT
        </text>
        <text x={CHART_WIDTH - 8} y={159} className={styles.side} textAnchor="end">
          LEFT
        </text>

        {ROWS.map((row) => {
          const total = row.widths.reduce((sum, w) => sum + w, 0) + GAP * (row.widths.length - 1);
          let cursor = CENTER_X - total / 2;
          return row.ids.map((id, index) => {
            const width = row.widths[index];
            const x = cursor;
            cursor += width + GAP;
            return (
              <Tooth
                key={id}
                id={id}
                x={x}
                width={width}
                row={row}
                mark={marks[id]}
                interactive={interactive}
                onClick={onToothClick}
              />
            );
          });
        })}
      </svg>

      {!hideLegend && <ToothLegend />}
    </div>
  );
}

export function ToothLegend() {
  return (
    <ul className={styles.legend} aria-label="Chart key">
        <li>
          <span className={`${styles.swatch} ${styles.swatchCaries}`} /> Caries
        </li>
        <li>
          <span className={`${styles.swatch} ${styles.swatchFilling}`} /> Filling
        </li>
        <li>
          <span className={`${styles.swatch} ${styles.swatchRct}`} /> RCT
        </li>
        <li>
          <span className={`${styles.swatch} ${styles.swatchExtraction}`}>&times;</span> Extraction
        </li>
        <li>
          <span className={`${styles.swatch} ${styles.swatchMissing}`} /> Missing
        </li>
    </ul>
  );
}
