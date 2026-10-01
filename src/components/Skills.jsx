import { useState } from "react";
import { Code, Cpu, Database, Server, Target, Wrench } from "lucide-react";
import { SKILL_GROUPS } from "../data/skills.js";
import Reveal from "./Reveal.jsx";

const GROUP_ICONS = {
  code: Code,
  cpu: Cpu,
  server: Server,
  database: Database,
  wrench: Wrench,
  target: Target,
};

const VISIBLE_BY_DEFAULT = 4;

export default function Skills() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section id="skills" className="section skills" aria-labelledby="skills-title">
      <div className="shell">
        <Reveal className="section-head">
          <div className="section-head-copy">
            <p className="section-label">Skills</p>
            <h2 id="skills-title">Technical Stack</h2>
            <p className="section-sub">
              Technologies and tools I work with and continuously explore.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            aria-controls="skills-grid"
          >
            {expanded ? "Show Essentials" : "View All Skills"}
          </button>
        </Reveal>

        <div className="skills-grid" id="skills-grid">
          {SKILL_GROUPS.map((group, index) => {
            const Icon = GROUP_ICONS[group.icon] ?? Code;
            const hiddenCount = group.items.length - VISIBLE_BY_DEFAULT;
            return (
              <Reveal key={group.id} delay={0.05 * index}>
                <article className="skill-card">
                  <header className="skill-card-head">
                    <span className="skill-card-icon">
                      <Icon size={15} aria-hidden="true" />
                    </span>
                    <h3>{group.title}</h3>
                    <span className="skill-card-count">
                      {String(group.items.length).padStart(2, "0")}
                    </span>
                  </header>
                  <ul className="skill-chips">
                    {group.items.map((item, chipIndex) => {
                      const collapsible =
                        !expanded && chipIndex >= VISIBLE_BY_DEFAULT;
                      return (
                        <li
                          key={item}
                          className={
                            collapsible ? "skill-chip is-collapsed" : "skill-chip"
                          }
                        >
                          <span className="skill-chip-dot" aria-hidden="true" />
                          {item}
                        </li>
                      );
                    })}
                    {!expanded && hiddenCount > 0 && (
                      <li className="skill-chip skill-chip--more">
                        +{hiddenCount} more
                      </li>
                    )}
                  </ul>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
