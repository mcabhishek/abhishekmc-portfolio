import { useState } from "react";
import { ArrowRight, Mail, Phone } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "./BrandIcons.jsx";
import { SITE_CONFIG } from "../config/site.js";
import Reveal from "./Reveal.jsx";

const INITIAL_FORM = { name: "", email: "", message: "" };

export default function Contact() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const [statusKind, setStatusKind] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  /* Sends through the local SMTP relay (npm run server). */
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (sending) return;
    setSending(true);
    setStatusKind("is-pending");
    setStatus("Sending…");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.ok) {
        setStatusKind("is-ok");
        setStatus("Message sent! I will get back to you soon.");
        setForm(INITIAL_FORM);
      } else {
        setStatusKind("is-err");
        setStatus(
          data.error ||
            `Could not send the message. Please email ${SITE_CONFIG.email} directly.`,
        );
      }
    } catch {
      setStatusKind("is-err");
      setStatus(
        `Could not reach the mail server. Start it with "npm run server", or email ${SITE_CONFIG.email} directly.`,
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <section
      id="contact"
      className="section section--alt contact"
      aria-labelledby="contact-title"
    >
      <div className="shell contact-grid">
        <Reveal className="contact-copy">
          <p className="section-label">Contact</p>
          <h2 id="contact-title">Let&apos;s build something meaningful.</h2>
          <p className="section-sub">
            Feel free to reach out for opportunities, collaborations or just
            a technical discussion.
          </p>

          <ul className="contact-list">
            <li>
              <a href={SITE_CONFIG.phoneHref}>
                <span className="contact-icon">
                  <Phone size={15} aria-hidden="true" />
                </span>
                <span>
                  <span className="contact-key">Phone</span>
                  <span className="contact-val">{SITE_CONFIG.phone}</span>
                </span>
              </a>
            </li>
            <li>
              <a href={`mailto:${SITE_CONFIG.email}`}>
                <span className="contact-icon">
                  <Mail size={15} aria-hidden="true" />
                </span>
                <span>
                  <span className="contact-key">Email</span>
                  <span className="contact-val">{SITE_CONFIG.email}</span>
                </span>
              </a>
            </li>
            <li>
              <a href={SITE_CONFIG.github} target="_blank" rel="noreferrer noopener">
                <span className="contact-icon">
                  <GithubIcon size={15} aria-hidden="true" />
                </span>
                <span>
                  <span className="contact-key">GitHub</span>
                  <span className="contact-val">github.com/{SITE_CONFIG.githubHandle}</span>
                </span>
              </a>
            </li>
            <li>
              <a
                href={SITE_CONFIG.linkedin}
                target="_blank"
                rel="noreferrer noopener"
              >
                <span className="contact-icon">
                  <LinkedinIcon size={15} aria-hidden="true" />
                </span>
                <span>
                  <span className="contact-key">LinkedIn</span>
                  <span className="contact-val">
                    linkedin.com/in/{SITE_CONFIG.linkedinHandle}
                  </span>
                </span>
              </a>
            </li>
          </ul>
        </Reveal>

        <Reveal className="contact-form-wrap" delay={0.1}>
          <form className="contact-form" onSubmit={handleSubmit} noValidate={false}>
            <div className="field">
              <label htmlFor="contact-name">Name</label>
              <input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                placeholder="Your name"
                value={form.name}
                onChange={handleChange}
              />
            </div>
            <div className="field">
              <label htmlFor="contact-email">Email</label>
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            <div className="field">
              <label htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                name="message"
                rows="5"
                required
                placeholder="Tell me about the opportunity or idea…"
                value={form.message}
                onChange={handleChange}
              />
            </div>
            <button
              className="btn btn-primary btn-block"
              type="submit"
              disabled={sending}
            >
              {sending ? "Sending…" : "Send Message"}
              <ArrowRight size={16} aria-hidden="true" />
            </button>
            <p
              className={`form-status ${statusKind}`}
              role="status"
              aria-live="polite"
            >
              {status}
            </p>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
