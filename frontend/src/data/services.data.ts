// Single source of truth for the services shown on the Home and Services
// pages. Edit this file only to add, remove, rename or temporarily disable
// a treatment across the whole site.
//
// This list is intentionally an exact match to the clinic's own
// "Our Specializations" signage board (photographed on-site, Sep 2026) —
// 16 items, nothing added beyond what the clinic itself lists. Do not split
// items or introduce sub-categories the sign doesn't have.
//
// `image` points at a treatment-specific photo under
// frontend/public/assets/services/ (provided by the clinic). Every entry
// has its own distinct photo — none of these images are reused anywhere
// else on the site, by design.

export type ServiceIconKey =
  | "tooth"
  | "filling"
  | "extraction"
  | "gum"
  | "braces"
  | "aligner"
  | "rootcanal"
  | "crown"
  | "implant"
  | "clean"
  | "whitening"
  | "pediatric"
  | "laser"
  | "xray"
  | "magnifier";

export interface ServiceItem {
  slug: string;
  name: string;
  description: string;
  icon: ServiceIconKey;
  image: string;
  available: boolean;
}

export interface ServiceCategory {
  slug: string;
  title: string;
  items: ServiceItem[];
}

/**
 * A service item annotated with its parent category slug — needed to look up
 * the translated name/description at `services.categories.<categorySlug>.items.<slug>`
 * in the i18n locale files (see frontend/src/i18n/locales).
 */
export interface ServiceWithCategory extends ServiceItem {
  categorySlug: string;
}

export const serviceCategories: ServiceCategory[] = [
  {
    slug: "our-specializations",
    title: "Our Specializations",
    items: [
      {
        slug: "general-dentistry",
        name: "General Dentistry",
        description: "Comprehensive dental care for routine check-ups, diagnosis and everyday oral health.",
        icon: "tooth",
        image: "/assets/services/general-dentistry.webp",
        available: true,
      },
      {
        slug: "conservative-restorative-dentistry",
        name: "Conservative & Restorative Dentistry",
        description: "Restoring the strength, shape and function of damaged or decayed teeth.",
        icon: "crown",
        image: "/assets/services/restorative.webp",
        available: true,
      },
      {
        slug: "dental-implants",
        name: "Dental Implants",
        description: "Long-term tooth replacement anchored securely for a natural look and feel.",
        icon: "implant",
        image: "/assets/services/dental-implants.webp",
        available: true,
      },
      {
        slug: "root-canal-treatment",
        name: "Root Canal Treatment",
        description: "Relieving pain and saving infected teeth through careful root canal therapy.",
        icon: "rootcanal",
        image: "/assets/services/root-canal.webp",
        available: true,
      },
      {
        slug: "orthodontic-braces-aligners",
        name: "Orthodontic Braces & Aligners",
        description: "Braces and clear aligners to gradually straighten teeth and correct bite issues.",
        icon: "braces",
        image: "/assets/services/orthodontics.webp",
        available: true,
      },
      {
        slug: "smile-designing",
        name: "Smile Designing",
        description: "A personalised plan to enhance the appearance of your smile.",
        icon: "whitening",
        image: "/assets/services/smile-designing.webp",
        available: true,
      },
      {
        slug: "flap-surgery",
        name: "Flap Surgery",
        description: "Surgical treatment for advanced gum disease, to protect teeth and supporting bone.",
        icon: "gum",
        image: "/assets/services/flap-surgery.webp",
        available: true,
      },
      {
        slug: "laser-dentistry",
        name: "Laser Dentistry",
        description: "Modern laser-assisted treatment for greater precision and patient comfort.",
        icon: "laser",
        image: "/assets/services/laser-dentistry.webp",
        available: true,
      },
      {
        slug: "pediatric-dentistry",
        name: "Pediatric Dentistry",
        description: "Gentle, friendly dental care designed for young patients.",
        icon: "pediatric",
        image: "/assets/services/pediatric.webp",
        available: true,
      },
      {
        slug: "full-mouth-rehabilitation",
        name: "Full Mouth Rehabilitation",
        description: "Comprehensive restoration of all teeth for patients with extensive dental wear or damage.",
        icon: "crown",
        image: "/assets/services/conservative.webp",
        available: true,
      },
      {
        slug: "complete-dentures",
        name: "Complete Dentures",
        description: "Full removable dentures to replace all missing teeth and restore function.",
        icon: "crown",
        image: "/assets/services/dentures.webp",
        available: true,
      },
      {
        slug: "removable-fixed-denture",
        name: "Removable & Fixed Denture",
        description: "Partial dentures, removable or fixed, to replace some missing teeth.",
        icon: "crown",
        image: "/assets/services/implant-restoration.webp",
        available: true,
      },
      {
        slug: "digital-xray",
        name: "Digital X-Ray (RVG)",
        description: "Fast, low-radiation digital imaging to accurately diagnose dental issues.",
        icon: "xray",
        image: "/assets/services/digital-xray.webp",
        available: true,
      },
      {
        slug: "teeth-bleaching",
        name: "Teeth Bleaching",
        description: "Safe professional whitening treatment to brighten your smile.",
        icon: "whitening",
        image: "/assets/services/teeth-whitening.webp",
        available: true,
      },
      {
        slug: "oral-pathology-diagnosis",
        name: "Oral Pathology & Diagnosis",
        description: "Assessment and diagnosis of conditions affecting the mouth and oral tissues.",
        icon: "magnifier",
        image: "/assets/services/oral-pathology.webp",
        available: true,
      },
      {
        slug: "oral-medicine-radiology",
        name: "Oral Medicine & Radiology",
        description: "Specialised imaging and medical evaluation to support accurate diagnosis and treatment.",
        icon: "magnifier",
        image: "/assets/services/oral-radiology.webp",
        available: true,
      },
    ],
  },
];

// A representative spread for the Home page teaser (icons only — see Home.tsx,
// which deliberately does not reuse any Services page photo).
export const featuredServiceSlugs = [
  "general-dentistry",
  "root-canal-treatment",
  "dental-implants",
  "orthodontic-braces-aligners",
  "smile-designing",
  "digital-xray",
];

export function getAllServices(): ServiceWithCategory[] {
  return serviceCategories.flatMap((category) =>
    category.items.map((item) => ({ ...item, categorySlug: category.slug }))
  );
}

export function getFeaturedServices(): ServiceWithCategory[] {
  const all = getAllServices();
  return featuredServiceSlugs
    .map((slug) => all.find((item) => item.slug === slug))
    .filter((item): item is ServiceWithCategory => Boolean(item));
}
