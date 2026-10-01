import { motion, useReducedMotion } from "framer-motion";
import { Cloud, Database, Laptop, Network, Server, ShieldCheck } from "lucide-react";

const NODES = [
  { id: "client", label: "Client", Icon: Laptop },
  { id: "api", label: "REST API", Icon: Network },
  { id: "backend", label: "Backend", Icon: Server },
  { id: "security", label: "Security", Icon: ShieldCheck },
  { id: "database", label: "Database", Icon: Database },
  { id: "cloud", label: "Cloud", Icon: Cloud },
];

/**
 * Vertical request-flow diagram: stacked nodes joined by thin arrows,
 * built entirely from HTML/CSS + Lucide icons (no screenshots).
 */
export default function SystemVisual() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="system" aria-label="System architecture diagram">
      <div className="system-head">
        <span className="system-dot" aria-hidden="true" />
        <span className="system-title">request flow</span>
      </div>
      <ol className="system-list">
        {NODES.map((node, index) => (
          <motion.li
            key={node.id}
            className="system-item"
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.4,
              delay: reduceMotion ? 0 : 0.35 + index * 0.09,
            }}
          >
            <div className="system-node">
              <node.Icon size={14} aria-hidden="true" />
              <span>{node.label}</span>
              <span className="system-node-index" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            {index < NODES.length - 1 && (
              <span className="system-link" aria-hidden="true">
                <span className="system-link-line" />
                <span className="system-link-pulse" />
                <span className="system-link-arrow" />
              </span>
            )}
          </motion.li>
        ))}
      </ol>
      <div className="system-foot" aria-hidden="true">
        <span>latency</span>
        <span className="system-foot-value">low</span>
      </div>
    </div>
  );
}
