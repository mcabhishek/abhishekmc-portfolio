import { Cloud, Download, Eye, Server, ShieldCheck } from "lucide-react";
import { SITE_CONFIG } from "../config/site.js";
import profileImg from "../assets/abhishek-mc.webp";
import Reveal from "./Reveal.jsx";

const PILLARS = [
  { num: "01", title: "Backend Engineering", Icon: Server },
  { num: "02", title: "Cloud Integration", Icon: Cloud },
  { num: "03", title: "Data Security", Icon: ShieldCheck },
  { num: "04", title: "Computer Vision", Icon: Eye },
];

export default function About() {
  const resumeHref = SITE_CONFIG.resume || null;

  return (
    <section id="about" className="section section--alt about" aria-labelledby="about-title">
      <div className="shell about-grid">
        <Reveal className="about-copy">
          <div className="about-avatar">
            <img
              src={profileImg}
              alt="Abhishek MC — Software Developer"
              width="416"
              height="453"
              loading="lazy"
              decoding="async"
            />
          </div>

          <p className="section-label">About</p>
          <h2 id="about-title">
            A passionate developer
            <span className="heading-accent">who loves building.</span>
          </h2>

          <p className="about-text">
            I am Abhishek MC, a software developer working across backend
            development, cloud integration and data security. My core stack
            is Java with Spring Boot, REST APIs and SQL databases, and I
            enjoy engineering scalable applications that stay secure and
            dependable under real-world load.
          </p>
          <p className="about-text">
            Alongside backend systems, I explore computer vision and
            embedded problem solving, which keeps my approach to software
            engineering grounded in both theory and hands-on execution. I
            care about clean structure, thoughtful design and solving
            problems end to end.
          </p>
          <p className="about-text about-text--note">
            As a fresh graduate, I am actively seeking internship and
            entry-level opportunities where I can contribute, learn and
            grow as an engineer.
          </p>

          {resumeHref ? (
            <a className="btn btn-secondary" href={resumeHref} download>
              <Download size={16} aria-hidden="true" />
              Download Resume
            </a>
          ) : (
            <button
              type="button"
              className="btn btn-secondary"
              disabled
              aria-disabled="true"
              title="Resume PDF has not been uploaded yet"
            >
              <Download size={16} aria-hidden="true" />
              Download Resume
            </button>
          )}
        </Reveal>

        <div className="about-pillars">
          {PILLARS.map(({ num, title, Icon }, index) => (
            <Reveal key={num} delay={0.08 * index}>
              <article className="pillar-card">
                <div className="pillar-top">
                  <span className="pillar-num">{num}</span>
                  <Icon size={20} aria-hidden="true" />
                </div>
                <h3>{title}</h3>
                <span className="pillar-line" aria-hidden="true" />
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
