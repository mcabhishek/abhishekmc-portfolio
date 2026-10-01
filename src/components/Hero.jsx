import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Cloud, Eye, Server, ShieldCheck } from "lucide-react";
import { GithubIcon } from "./BrandIcons.jsx";
import { SITE_CONFIG } from "../config/site.js";
import profileImg from "../assets/abhishek-mc.webp";
import SystemVisual from "./SystemVisual.jsx";

const CAPABILITIES = [
  { label: "Backend Development", Icon: Server },
  { label: "Cloud Integration", Icon: Cloud },
  { label: "Data Security", Icon: ShieldCheck },
  { label: "Computer Vision", Icon: Eye },
];

export default function Hero() {
  const reduceMotion = useReducedMotion();

  const rise = (delay) => ({
    initial: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: reduceMotion ? 0 : 0.6,
      delay: reduceMotion ? 0 : delay,
      ease: [0.22, 0.61, 0.36, 1],
    },
  });

  return (
    <section id="home" className="section hero" aria-labelledby="hero-title">
      <div className="shell hero-grid">
        <div className="hero-copy">
          <motion.p className="pill" {...rise(0.05)}>
            <span className="pill-dot" aria-hidden="true" />
            Software Developer
          </motion.p>

          <motion.h1 id="hero-title" {...rise(0.12)}>
            Building secure systems.
            <span className="hero-title-accent">Solving real problems.</span>
          </motion.h1>

          <motion.p className="hero-lede" {...rise(0.2)}>
            Software developer focused on backend development, cloud
            integration, data security, computer vision, and scalable
            applications.
          </motion.p>

          <motion.div className="hero-actions" {...rise(0.28)}>
            <a className="btn btn-primary" href="#projects">
              Explore Projects
              <ArrowRight size={16} aria-hidden="true" />
            </a>
            <a
              className="btn btn-secondary"
              href={SITE_CONFIG.github}
              target="_blank"
              rel="noreferrer noopener"
            >
              <GithubIcon size={16} aria-hidden="true" />
              GitHub
            </a>
          </motion.div>
        </div>

        <motion.div
          className="hero-visual"
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: reduceMotion ? 0 : 0.7,
            delay: reduceMotion ? 0 : 0.18,
            ease: [0.22, 0.61, 0.36, 1],
          }}
        >
          <div className="portrait">
            <span className="portrait-glow" aria-hidden="true" />
            <span className="portrait-orbit portrait-orbit--outer" aria-hidden="true" />
            <span className="portrait-orbit portrait-orbit--inner" aria-hidden="true" />
            <span className="portrait-tick portrait-tick--top" aria-hidden="true" />
            <span className="portrait-tick portrait-tick--right" aria-hidden="true" />
            <div className="portrait-frame">
              <img
                src={profileImg}
                alt="Abhishek MC — Software Developer"
                width="416"
                height="453"
                fetchPriority="high"
                decoding="async"
              />
            </div>
            <span className="portrait-badge" aria-hidden="true">
              <span className="portrait-badge-dot" />
              available for work
            </span>
          </div>

          <SystemVisual />
        </motion.div>
      </div>

      <motion.div className="shell hero-strip-wrap" {...rise(0.42)}>
        <ul className="hero-strip">
          {CAPABILITIES.map(({ label, Icon }) => (
            <li key={label} className="hero-strip-item">
              <Icon size={17} aria-hidden="true" />
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </motion.div>
    </section>
  );
}
