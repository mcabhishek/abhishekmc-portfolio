import { Code } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "./BrandIcons.jsx";
import { NAV_LINKS, SITE_CONFIG } from "../config/site.js";

const FOOTER_NAV = NAV_LINKS.filter((link) =>
  ["#home", "#about", "#projects", "#research", "#contact"].includes(link.href),
);

/* Computed once at module scope — stable across renders. */
const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  const year = CURRENT_YEAR;

  return (
    <footer className="footer">
      <div className="shell footer-top">
        <div className="footer-brand">
          <a className="nav-brand" href="#home">
            Abhishek<span className="nav-brand-accent">MC</span>
          </a>
          <p>{SITE_CONFIG.tagline}</p>
        </div>

        <nav className="footer-nav" aria-label="Footer">
          <ul>
            {FOOTER_NAV.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <ul className="footer-social">
          <li>
            <a
              href={SITE_CONFIG.github}
              target="_blank"
              rel="noreferrer noopener"
            >
              <GithubIcon size={15} aria-hidden="true" />
              GitHub
            </a>
          </li>
          <li>
            <a
              href={SITE_CONFIG.linkedin}
              target="_blank"
              rel="noreferrer noopener"
            >
              <LinkedinIcon size={15} aria-hidden="true" />
              LinkedIn
            </a>
          </li>
          <li>
            <a
              href={SITE_CONFIG.leetcode}
              target="_blank"
              rel="noreferrer noopener"
            >
              <Code size={15} aria-hidden="true" />
              LeetCode
            </a>
          </li>
        </ul>
      </div>

      <div className="shell footer-bottom">
        <p>
          © {year} {SITE_CONFIG.fullName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
