import { useEffect, useRef } from "react";

/**
 * Progressive-enhancement scroll reveal.
 *
 * The content is visible by default in CSS. The hidden starting state is only
 * applied when JavaScript is actually running — `index.html` sets a `js`
 * class on <html> from an inline script — and it is cleared as soon as the
 * element scrolls into view.
 *
 * Behaviour:
 *   - No JavaScript  -> the `js` class is never added, so content is simply
 *                       visible. Nothing is ever hidden behind an animation.
 *   - Reduced motion -> content is shown immediately, with no transform.
 *   - JS available   -> a one-shot IntersectionObserver reveals the element.
 *
 * There is deliberately **no** user-agent sniffing and **no** bot detection.
 * The visibility rule depends only on whether scripting runs, never on who is
 * requesting, so humans and crawlers receive identical content.
 */
export default function Reveal({
  children,
  className = "",
  delay = 0,
  y = 20,
  id,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) {
      node.dataset.reveal = "shown";
      return undefined;
    }

    node.style.setProperty("--reveal-delay", `${delay}s`);
    node.dataset.reveal = "pending";

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.dataset.reveal = "shown";
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -60px 0px", threshold: 0.01 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      id={id}
      className={`reveal${className ? ` ${className}` : ""}`}
      style={{ "--reveal-y": `${y}px` }}
    >
      {children}
    </div>
  );
}
