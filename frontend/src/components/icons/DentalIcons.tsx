import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

// A simple, consistent tooth silhouette reused as the base shape across icons.
const TOOTH_PATH =
  "M12 3c-1.6 0-2.4.9-3.3.9C7.6 3.9 6.6 3 5.4 3.6 4 4.3 3.6 6.2 3.8 8c.3 2.7 1.4 5 2.2 7.6.5 1.7.9 4.4 2.4 4.4 1.4 0 1.4-2.5 1.9-4 .3-.9.6-1.7 1.7-1.7s1.4.8 1.7 1.7c.5 1.5.5 4 1.9 4 1.5 0 1.9-2.7 2.4-4.4.8-2.6 1.9-4.9 2.2-7.6.2-1.8-.2-3.7-1.6-4.4-1.2-.6-2.2.3-3.3.3-.9 0-1.7-.9-3.3-.9Z";

export function ToothIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d={TOOTH_PATH} />
    </svg>
  );
}

export function FillingIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d={TOOTH_PATH} />
      <circle cx="12" cy="11" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ExtractionIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d={TOOTH_PATH} transform="translate(0 -1) scale(0.85)" />
      <path d="M12 16.5v4.5M9.8 18.8 12 21l2.2-2.2" />
    </svg>
  );
}

export function GumCareIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 9c1.6-2 3.6-3 5.5-3M20 9c-1.6-2-3.6-3-5.5-3" />
      <path d="M4.5 9c.5 2.8 1.2 4.5 2.8 6.2M19.5 9c-.5 2.8-1.2 4.5-2.8 6.2" />
      <path d="M9 15.2c1 .9 2 1.3 3 1.3s2-.4 3-1.3" />
      <circle cx="9" cy="11" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="15" cy="11" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function BracesIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 10c1.5 1 3 1.4 4.5 1.4s2-1 3.5-1 2 1 3.5 1S18.5 11 20 10" />
      <path d="M6 10v2.4M9.5 11.4v2.6M12.5 11.4v2.6M15.5 11.4v2.6M18 10v2.4" />
      <path d="M4 10c.6-2.6 1.3-4.6 2-5.8M20 10c-.6-2.6-1.3-4.6-2-5.8" />
    </svg>
  );
}

export function AlignerIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 9.5C4.5 7 8 5.5 12 5.5s7.5 1.5 7.5 4-3.4 4.5-7.5 4.5-7.5-2-7.5-4.5Z" />
      <path d="M5.5 13.5c.6 2 3.3 3.5 6.5 3.5s5.9-1.5 6.5-3.5" />
    </svg>
  );
}

export function RootCanalIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5c-2.6 0-4.4 1.7-4.4 4 0 3 2 4.6 2 7.3v3.7c0 1.1.6 2 1.4 2s1.3-1 1.3-2 .5-1 .9-1 .9 0 .9 1 .5 2 1.3 2 1.4-.9 1.4-2v-3.7c0-2.7 2-4.3 2-7.3 0-2.3-1.8-4-4.4-4Z" />
      <path d="M9 8.2h6" />
    </svg>
  );
}

export function CrownIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 9.5 7.5 12l4-6 4 6 3.5-2.5-1.3 8.5a1 1 0 0 1-1 .8H6.3a1 1 0 0 1-1-.8L4 9.5Z" />
      <path d="M6 18.5h12" />
    </svg>
  );
}

export function ImplantIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M8.5 4.5h7L18 8l-1 2H7L6 8l2.5-3.5Z" />
      <path d="M9.5 10.5v9M14.5 10.5v9" />
      <path d="M9.5 13h5M9.5 15.5h5M9.5 18h5" />
    </svg>
  );
}

export function SparkleCleanIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d={TOOTH_PATH} transform="translate(-1.5 0) scale(0.78)" />
      <path d="M18 5.5v3M16.5 7h3M18.5 12.5v2.2M17.4 13.6h2.2" />
    </svg>
  );
}

export function WhiteningIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d={TOOTH_PATH} transform="translate(-1.2 1) scale(0.72)" />
      <path d="M18 4v2.4M21 7h-2.4M19.7 4.3l-1.7 1.7" />
    </svg>
  );
}

export function PediatricIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d={TOOTH_PATH} transform="translate(3.2 3) scale(0.6)" />
      <path d="M5 6.5c0-1.4 1-2.5 2.3-2.5S9.5 5.1 9.5 6.5" />
    </svg>
  );
}

export function CalendarCheckIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="5.5" width="16" height="14.5" rx="2.2" />
      <path d="M4 9.5h16M8 3.5v3.5M16 3.5v3.5" />
      <path d="M9 14.2l2 2 4-4.2" />
    </svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6.6 3.5h3l1.4 4-2 1.6a12.3 12.3 0 0 0 5.9 5.9l1.6-2 4 1.4v3a1.6 1.6 0 0 1-1.7 1.6A16.6 16.6 0 0 1 5 5.2 1.6 1.6 0 0 1 6.6 3.5Z" />
    </svg>
  );
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.02 2c-5.5 0-9.97 4.47-9.97 9.97 0 1.76.46 3.44 1.34 4.94L2 22l5.24-1.37a9.9 9.9 0 0 0 4.78 1.22h.01c5.5 0 9.97-4.47 9.97-9.97C22 6.47 17.53 2 12.02 2Zm5.85 14.1c-.25.7-1.24 1.29-2.02 1.45-.54.11-1.24.2-3.6-.77-3.02-1.25-4.96-4.3-5.11-4.5-.15-.2-1.22-1.62-1.22-3.09 0-1.47.76-2.19 1.03-2.49.27-.3.6-.37.8-.37.2 0 .4 0 .58.01.19.01.44-.07.68.53.25.6.85 2.08.92 2.23.07.15.12.33.02.53-.1.2-.15.32-.3.5-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.3.76 1.26 1.63 2.04 1.12 1 2.06 1.31 2.36 1.46.3.15.47.13.65-.08.18-.2.75-.87.95-1.17.2-.3.4-.25.68-.15.27.1 1.75.83 2.05.98.3.15.5.22.57.35.07.13.07.72-.18 1.42Z" />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" />
    </svg>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21.5s7-6.4 7-11.8A7 7 0 0 0 5 9.7c0 5.4 7 11.8 7 11.8Z" />
      <circle cx="12" cy="9.7" r="2.4" />
    </svg>
  );
}

export function ShieldCheckIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5 5 6v5.6c0 4.6 3 8 7 9.4 4-1.4 7-4.8 7-9.4V6l-7-2.5Z" />
      <path d="M9 12l2 2 4-4.4" />
    </svg>
  );
}

export function ChatHeartIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 5.5h16v10H9l-3.5 3.5V15.5H4Z" />
      <path d="M12 8.6c.6-.9 1.9-1 2.5-.2.6.8.2 1.7-1.1 2.7l-1.4 1-1.4-1c-1.3-1-1.7-1.9-1.1-2.7.6-.8 1.9-.7 2.5.2Z" />
    </svg>
  );
}

export function ComfortIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 15.5v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2" />
      <path d="M4 15.5h16v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2Z" />
      <circle cx="9" cy="8" r="1.6" />
    </svg>
  );
}

export function ExperienceIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M6 20.5c0-3.3 2.7-5.7 6-5.7s6 2.4 6 5.7" />
    </svg>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8.2" r="3" />
      <circle cx="5.6" cy="9.6" r="2.2" />
      <circle cx="18.4" cy="9.6" r="2.2" />
      <path d="M6.6 19.5c0-3 2.4-5 5.4-5s5.4 2 5.4 5" />
      <path d="M2.8 17.6c0-2 1.3-3.4 3.2-3.6M21.2 17.6c0-2-1.3-3.4-3.2-3.6" />
    </svg>
  );
}

export function HeartIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 20.2S3.8 15 3.8 9.1a4.3 4.3 0 0 1 8.2-1.8 4.3 4.3 0 0 1 8.2 1.8c0 5.9-8.2 11.1-8.2 11.1Z" />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 12h15M13 6.5l6 5.5-6 5.5" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 6.5h16M4 12h16M4 17.5h16" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 5l14 14M19 5 5 19" />
    </svg>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2.75l3.09 6.26 6.91 1.01-5 4.87 1.18 6.87L12 18.02l-6.18 3.25L7 14.4l-5-4.87 6.91-1.01L12 2.75Z" />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

export function DirectionsIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M21 12 12 3 3 12l9 9 9-9Z" />
      <path d="M9 12h6M12 9l3 3-3 3" />
    </svg>
  );
}

export function LaserIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="6" cy="18" r="2.2" />
      <path d="M8.3 15.7 18 6M14 6h5v5" />
    </svg>
  );
}

export function XrayIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="1.6" />
      <path d="M8 4.5v15M16 4.5v15M3.5 12h17" />
    </svg>
  );
}

export function MagnifierIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M19.5 19.5 15.2 15.2" />
    </svg>
  );
}

export function UploadIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 15.5V4.5M8 8.3l4-4 4 4" />
      <path d="M4.5 15.5v3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}
