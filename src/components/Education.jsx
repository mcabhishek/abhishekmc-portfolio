import { SITE_CONFIG } from "../config/site.js";
import { EDUCATION } from "../data/education.js";
import Reveal from "./Reveal.jsx";

export default function Education() {
  return (
    <Reveal className="education">
      <p className="section-label">Education</p>
      <h2 className="education-title">Education</h2>

      <ol className="timeline">
        {EDUCATION.map((entry) => {
          const cgpa =
            entry.cgpaKey && SITE_CONFIG[entry.cgpaKey]
              ? SITE_CONFIG[entry.cgpaKey]
              : null;
          return (
            <li key={entry.id} className="timeline-item">
              <span className="timeline-marker" aria-hidden="true" />
              <div className="timeline-body">
                <h3>{entry.degree}</h3>
                <p>{entry.institution}</p>
                {cgpa && <span className="timeline-cgpa">CGPA {cgpa}</span>}
              </div>
            </li>
          );
        })}
      </ol>
    </Reveal>
  );
}
