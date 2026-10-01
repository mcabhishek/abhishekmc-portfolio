import { motion, useReducedMotion } from "framer-motion";

/**
 * Shared scroll-reveal wrapper. Motion is fully disabled when the user
 * prefers reduced motion.
 */
export default function Reveal({
  children,
  className = "",
  delay = 0,
  y = 20,
  id,
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      id={id}
      className={className}
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: reduceMotion ? 0 : 0.55,
        delay: reduceMotion ? 0 : delay,
        ease: [0.22, 0.61, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
