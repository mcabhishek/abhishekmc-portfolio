/**
 * Central site configuration.
 * Every personal fact on the site is driven from this file.
 * Leave a field as an empty string when the value is not confirmed yet —
 * the UI renders a placeholder instead of inventing data.
 */
export const SITE_CONFIG = {
  name: "AbhishekMC",
  fullName: "Abhishek MC",
  /**
   * Canonical production origin. No trailing slash — every absolute URL in
   * metadata, the sitemap and the JSON-LD graph is derived from this value.
   */
  siteUrl: "https://abhishekmc.in",
  phone: "+91 6366578849",
  phoneHref: "tel:+916366578849",
  email: "mcabhishek2002@gmail.com",
  github: "https://github.com/mcabhishek",
  githubHandle: "mcabhishek",
  leetcode: "https://leetcode.com/u/Abhimc03/",
  leetcodeHandle: "Abhimc03",
  linkedin: "https://www.linkedin.com/in/abhishek-mc",
  linkedinHandle: "abhishek-mc",
  resume: "",
  mcaCgpa: "",
  bcaCgpa: "",
  role: "Software Developer",
  tagline: "Software • Systems • Security",
  title: "Abhishek MC | Software Developer",
  /*
    Used verbatim for <meta name="description"> and the JSON-LD Person
    description, so the two can never disagree. Wording tracks what the page
    actually shows: the specialisms from the hero/About copy plus the
    projects, skills and research sections. No unsupported employers, dates
    or credentials.
  */
  description:
    "Abhishek MC is a Software Developer specializing in backend development, cloud integration, data security, computer vision, and scalable applications.",
  /*
    Social card copy for og:description / twitter:description.
    Deliberately different from `description`: a link preview has far less
    room than a search result, so it leads with what the page contains
    rather than repeating the meta description.
  */
  socialDescription:
    "Portfolio, projects, research, skills, and professional profile of Abhishek MC.",
};

/**
 * Verified public profile URLs, in the order they appear on the page.
 * These are the only external identities used for the `sameAs` property, so
 * the structured data can never claim a profile the site does not link to.
 */
export const SAME_AS = [
  SITE_CONFIG.github,
  SITE_CONFIG.linkedin,
  SITE_CONFIG.leetcode,
];

/**
 * Structured data for the portfolio, emitted as a single JSON-LD graph.
 *
 * Design rules followed here:
 *  - One `@graph` with stable `@id` anchors, so nodes reference each other
 *    instead of being described twice.
 *  - Every URL is absolute and derived from `SITE_CONFIG.siteUrl`.
 *  - Only facts that are visibly rendered on the page are asserted. No
 *    education dates, CGPAs, job titles at past employers, awards,
 *    publications or performance claims are invented.
 *  - `sameAs` is limited to the profiles the site actually links to.
 */

/** Absolute URL helper — avoids hand-written string concatenation. */
const abs = (path = "") => `${SITE_CONFIG.siteUrl}${path}`;

export const PERSON_ID = abs("/#person");
export const PROFILE_PAGE_ID = abs("/#profilepage");
export const WEBSITE_ID = abs("/#website");

/**
 * Stable, unhashed image URLs. These point at files in `public/`, so the
 * production paths are predictable and survive future rebuilds — a
 * content-hashed Vite asset path would break the structured data reference.
 */
export const PERSON_IMAGE = abs("/images/abhishek-mc.webp");
export const PERSON_IMAGE_SQUARE = abs("/images/abhishek-mc-square.webp");
export const OG_IMAGE = abs("/og-image.jpg");

/**
 * The JSON-LD graph as a plain object. Exported separately from `seoHtml()`
 * so it can be validated or tested in isolation.
 */
export function buildJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: abs("/"),
        name: SITE_CONFIG.fullName,
        alternateName: SITE_CONFIG.name,
        inLanguage: "en",
        publisher: { "@id": PERSON_ID },
      },
      {
        "@type": "ProfilePage",
        "@id": PROFILE_PAGE_ID,
        url: abs("/"),
        name: `${SITE_CONFIG.fullName} | ${SITE_CONFIG.role}`,
        isPartOf: { "@id": WEBSITE_ID },
        "about": { "@id": PERSON_ID },
        "mainEntity": { "@id": PERSON_ID },
        "inLanguage": "en",
      },
      {
        "@type": "Person",
        "@id": PERSON_ID,
        name: SITE_CONFIG.fullName,
        alternateName: [SITE_CONFIG.name, "Abhishek M C"],
        url: abs("/"),
        image: [PERSON_IMAGE, PERSON_IMAGE_SQUARE],
        jobTitle: SITE_CONFIG.role,
        description: SITE_CONFIG.description,
        email: `mailto:${SITE_CONFIG.email}`,
        // schema.org telephone must be a plain number, not a tel: URI.
        telephone: SITE_CONFIG.phone,
        knowsAbout: [
          "Backend Development",
          "Java",
          "Spring Boot",
          "REST APIs",
          "SQL",
          "MySQL",
          "Cloud Integration",
          "Data Security",
          "Computer Vision",
          "Scalable Applications",
          "Embedded Systems",
        ],
        sameAs: SAME_AS,
      },
    ],
  };
}

/**
 * Serialised JSON-LD ready to drop into a `<script type="application/ld+json">`
 * tag. `<` is escaped so the payload can never terminate the script element
 * early, which would otherwise produce invalid markup.
 */
export function buildJsonLdString() {
  return JSON.stringify(buildJsonLd(), null, 2)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

/** The complete `<script>` element for the JSON-LD graph. */
export function seoHtml() {
  return `<script type="application/ld+json">\n${buildJsonLdString()}\n    </script>`;
}

export const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Research", href: "#research" },
  { label: "Education", href: "#education" },
  { label: "Contact", href: "#contact" },
];
