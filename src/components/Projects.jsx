import { PROJECTS } from "../data/projects.js";
import ProjectCard from "./ProjectCard.jsx";
import Reveal from "./Reveal.jsx";

export default function Projects() {
  return (
    <section
      id="projects"
      className="section section--alt projects"
      aria-labelledby="projects-title"
    >
      <div className="shell">
        <Reveal className="section-head">
          <div className="section-head-copy">
            <p className="section-label">Projects</p>
            <h2 id="projects-title">Selected Projects</h2>
            <p className="section-sub">
              Systems built across security, backend engineering, computer
              vision, and embedded computing.
            </p>
          </div>
        </Reveal>

        <div className="projects-grid">
          {PROJECTS.map((project, index) => (
            <Reveal key={project.id} delay={0.07 * index}>
              <ProjectCard project={project} index={index} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
