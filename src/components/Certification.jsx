import { Award } from "lucide-react";
import Reveal from "./Reveal.jsx";

export default function Certification() {
  return (
    <Reveal className="bottom-col">
      <p className="section-label">Certification</p>
      <h2>Certification</h2>

      <article className="cert-card">
        <div className="cert-visual" aria-hidden="true">
          <span className="cert-corner cert-corner--tl" />
          <span className="cert-corner cert-corner--tr" />
          <span className="cert-corner cert-corner--bl" />
          <span className="cert-corner cert-corner--br" />
          <Award size={26} />
          <span className="cert-seal-line" />
        </div>
        <div className="cert-body">
          <h3>Privacy and Security in Online Social Media</h3>
          <p className="cert-issuer">NPTEL</p>
        </div>
      </article>
    </Reveal>
  );
}
