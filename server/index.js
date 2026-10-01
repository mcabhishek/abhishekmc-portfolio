/**
 * Contact-form SMTP relay.
 *
 * Receives POST /api/contact from the site and forwards it over Gmail SMTP
 * to the portfolio owner. The SMTP password lives only here (in .env.local,
 * read via `node --env-file`) — it is never shipped to the browser.
 *
 * Run:  npm run server        (requires .env.local)
 */
import express from "express";
import nodemailer from "nodemailer";

const PORT = Number(process.env.PORT || 3001);

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_USER = process.env.SMTP_USER || "";
// Gmail app passwords are shown in groups of 4; ignore any spaces.
const SMTP_PASS = (process.env.SMTP_PASS || "").replace(/\s+/g, "");
const MAIL_TO = process.env.MAIL_TO || SMTP_USER;
const MAIL_FROM = process.env.MAIL_FROM || SMTP_USER;
const ALLOWED_ORIGINS = (
  process.env.ALLOWED_ORIGINS ||
  "http://localhost:5173,http://127.0.0.1:5173"
)
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

if (!SMTP_USER || !SMTP_PASS) {
  console.error(
    "[contact] Missing SMTP_USER / SMTP_PASS. Create .env.local (see .env.example) and run with `npm run server`.",
  );
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

transporter
  .verify()
  .then(() => console.log(`[contact] SMTP ready: ${SMTP_HOST}:${SMTP_PORT} as ${SMTP_USER}`))
  .catch((error) => console.error("[contact] SMTP verify failed:", error.message));

const app = express();
app.use(express.json({ limit: "16kb" }));

/** Minimal CORS: only known origins may call the API cross-origin. */
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, transport: `${SMTP_HOST}:${SMTP_PORT}` });
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const escapeHtml = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

app.post("/api/contact", async (req, res) => {
  const body = req.body || {};
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (name.length < 2 || name.length > 120)
    return res.status(400).json({ ok: false, error: "Please enter your name (2–120 characters)." });
  if (!EMAIL_RE.test(email) || email.length > 254)
    return res.status(400).json({ ok: false, error: "Please enter a valid email address." });
  if (message.length < 5 || message.length > 5000)
    return res.status(400).json({ ok: false, error: "Message must be 5–5000 characters." });

  const subject = `Portfolio contact — ${name}`;
  const text = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n`;
  const html = `
    <h2 style="margin:0 0 8px;font-family:Arial,sans-serif">New portfolio message</h2>
    <p style="font-family:Arial,sans-serif;margin:0 0 4px"><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p style="font-family:Arial,sans-serif;margin:0 0 4px"><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p style="font-family:Arial,sans-serif;margin:12px 0 0;white-space:pre-wrap">${escapeHtml(message)}</p>
  `;

  try {
    await transporter.sendMail({
      from: `"Portfolio Contact" <${MAIL_FROM}>`,
      to: MAIL_TO,
      replyTo: `"${name.replace(/["\\\r\n]/g, "")}" <${email}>`,
      subject,
      text,
      html,
    });
    console.log(`[contact] sent from ${email} (${message.length} chars)`);
    res.json({ ok: true });
  } catch (error) {
    console.error("[contact] send failed:", error.message);
    res.status(502).json({ ok: false, error: "Could not send the message right now. Please try again later." });
  }
});

app.listen(PORT, () => {
  console.log(`[contact] API listening on http://127.0.0.1:${PORT}`);
});
