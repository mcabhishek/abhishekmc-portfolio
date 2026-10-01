import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, Moon, Sun, X } from "lucide-react";
import { GithubIcon } from "./BrandIcons.jsx";
import { NAV_LINKS, SITE_CONFIG } from "../config/site.js";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState("home");
  const [midnight, setMidnight] = useState(false);
  const reduceMotion = useReducedMotion();

  /* Compact glass effect once the page leaves the top. */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Track the section currently in view for the active nav state. */
  useEffect(() => {
    const sections = NAV_LINKS.map((link) =>
      document.querySelector(link.href),
    ).filter(Boolean);
    if (!sections.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.6] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  /* Close the mobile menu on Escape. */
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const toggleTheme = () => {
    const next = !midnight;
    setMidnight(next);
    document.documentElement.dataset.theme = next ? "midnight" : "dark";
  };

  return (
    <header className={`nav${scrolled ? " nav--scrolled" : ""}`}>
      <div className="shell nav-inner">
        <a className="nav-brand" href="#home" aria-label={`${SITE_CONFIG.name} — home`}>
          Abhishek<span className="nav-brand-accent">MC</span>
        </a>

        <nav className="nav-links" aria-label="Primary">
          <ul>
            {NAV_LINKS.map((link) => {
              const isActive = activeId === link.href.slice(1);
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={isActive ? "is-active" : undefined}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="nav-actions">
          <a
            className="btn btn-ghost btn-icon"
            href={SITE_CONFIG.github}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="GitHub profile"
          >
            <GithubIcon size={16} aria-hidden="true" />
            <span className="btn-icon-label">GitHub</span>
          </a>
          <button
            type="button"
            className="btn btn-ghost nav-theme"
            onClick={toggleTheme}
            aria-label={
              midnight
                ? "Switch to standard dark theme"
                : "Switch to midnight black theme"
            }
          >
            {midnight ? (
              <Sun size={16} aria-hidden="true" />
            ) : (
              <Moon size={16} aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            className="btn btn-ghost nav-burger"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? (
              <X size={18} aria-hidden="true" />
            ) : (
              <Menu size={18} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="mobile-menu"
            className="nav-mobile"
            aria-label="Mobile"
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: reduceMotion ? 0 : 0.22 }}
          >
            <ul>
              {NAV_LINKS.map((link, index) => (
                <motion.li
                  key={link.href}
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.25,
                    delay: reduceMotion ? 0 : 0.04 * index,
                  }}
                >
                  <a
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={
                      activeId === link.href.slice(1) ? "page" : undefined
                    }
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <a
              className="btn btn-primary nav-mobile-cta"
              href={SITE_CONFIG.github}
              target="_blank"
              rel="noreferrer noopener"
              onClick={() => setMenuOpen(false)}
            >
              <GithubIcon size={15} aria-hidden="true" />
              GitHub
            </a>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
