import { Building2, Calendar, FileText, Users } from "lucide-react";
import Reveal from "./Reveal.jsx";

const PAPER = {
  title: ["Hybrid Intelligence for Decentralized", "Coordination in Swarm Robotics"],
  authors: "Abhishek M C, Ajitha S",
  conference:
    "2nd National Level Student Research Conference (SRC-2025)",
  venue: "Dayananda Sagar College of Arts, Science & Commerce",
  date: "14 March 2025",
};

export default function Research() {
  return (
    <Reveal className="research">
      <p className="section-label">Research</p>
      <h2 id="research-title">Research &amp; Publication</h2>

      <article className="research-card">
        <header className="research-card-head">
          <span className="research-icon">
            <FileText size={20} aria-hidden="true" />
          </span>
          <div>
            <p className="research-kind">Conference Paper</p>
            <h3>
              {PAPER.title[0]}
              <br />
              {PAPER.title[1]}
            </h3>
          </div>
        </header>

        <dl className="research-meta">
          <div>
            <dt>
              <Users size={14} aria-hidden="true" />
              Authors
            </dt>
            <dd>{PAPER.authors}</dd>
          </div>
          <div>
            <dt>
              <FileText size={14} aria-hidden="true" />
              Conference
            </dt>
            <dd>{PAPER.conference}</dd>
          </div>
          <div>
            <dt>
              <Building2 size={14} aria-hidden="true" />
              Venue
            </dt>
            <dd>{PAPER.venue}</dd>
          </div>
          <div>
            <dt>
              <Calendar size={14} aria-hidden="true" />
              Date
            </dt>
            <dd>{PAPER.date}</dd>
          </div>
        </dl>
      </article>
    </Reveal>
  );
}
