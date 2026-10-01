import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Aperture, ArrowDown, ChevronDown, Link2, Lock, Cog } from "lucide-react";

const CARD_ICONS = {
  lock: Lock,
  link: Link2,
  cog: Cog,
  aperture: Aperture,
};

export default function ProjectCard({ project, index }) {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const Icon = CARD_ICONS[project.icon] ?? Lock;
  const detailsId = `${project.id}-details`;

  return (
    <article className="project-card">
      <div className="project-visual">
        <header className="project-visual-head">
          <span className="project-visual-icon">
            <Icon size={14} aria-hidden="true" />
          </span>
          <span className="project-visual-label">pipeline</span>
          <span className="project-visual-index" aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
        </header>
        <ol className="pipeline">
          {project.pipeline.map((step, stepIndex) => (
            <li key={step} className="pipeline-step">
              <span className="pipeline-node">{step}</span>
              {stepIndex < project.pipeline.length - 1 && (
                <span className="pipeline-arrow" aria-hidden="true">
                  <ArrowDown size={11} />
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>

      <div className="project-body">
        <h3>{project.title}</h3>
        <p className="project-desc">{project.description}</p>

        <ul className="tag-list" aria-label="Technologies used">
          {project.tech.map((tech) => (
            <li key={tech} className="tag">
              {tech}
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="project-details-btn"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={detailsId}
        >
          {open ? "Hide Details" : "View Details"}
          <ChevronDown
            size={14}
            aria-hidden="true"
            className={open ? "is-open" : undefined}
          />
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id={detailsId}
              className="project-highlights"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, height: "auto" }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.3 }}
            >
              <ul>
                {project.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </article>
  );
}
