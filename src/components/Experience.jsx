import { Briefcase } from "lucide-react";
import Reveal from "./Reveal.jsx";

const FOCUS_AREAS = ["Java Development", "Cloud Computing", "Software Engineering"];

export default function Experience() {
  return (
    <Reveal className="bottom-col">
      <p className="section-label">Experience</p>
      <h2>Currently Seeking Opportunities</h2>

      <article className="experience-card">
        <span className="experience-icon">
          <Briefcase size={18} aria-hidden="true" />
        </span>
        <p>
          Fresh graduate actively seeking internship or entry-level
          opportunities where I can apply my skills and keep learning as an
          engineer.
        </p>
        <ul className="focus-chips" aria-label="Focus areas">
          {FOCUS_AREAS.map((area) => (
            <li key={area}>{area}</li>
          ))}
        </ul>
      </article>
    </Reveal>
  );
}
