# abhishekmc.in

Personal portfolio and professional profile for **Abhishek MC**, software
developer. Single-page React + Vite app, deployed to Cloudflare.

Live URL: <https://abhishekmc.in/>

---

## Stack

| Concern    | Choice                                                    |
| ---------- | --------------------------------------------------------- |
| Build      | Vite 8 + `@vitejs/plugin-react`                            |
| UI         | React 19                                                    |
| Animation  | `framer-motion` (respects `prefers-reduced-motion`)         |
| Icons      | `lucide-react`                                              |
| Lint       | `oxlint`                                                    |
| Contact    | Express + Nodemailer server (`server/index.js`), local only |

---

## Commands

```bash
npm install
npm run dev         # Vite dev server
npm run build       # production build -> dist/
npm run preview     # serve the production build locally
npm run lint        # oxlint

# Optional maintenance scripts (require Python 3 + Pillow)
npm run images      # regenerate public/ images from the source photo
npm run verify:seo  # validate dist/ metadata, JSON-LD, robots, sitemap
npm run verify:a11y # WCAG contrast audit of the design tokens
```

`npm run build` intentionally stays as plain `vite build` so CI and the
Cloudflare deploy pipeline never depend on Python being installed.

---

## Where the content lives

All personal facts are centralised in **`src/config/site.js`**. Nothing in the
components hardcodes a name, handle, email or URL.

That file is also the single source of truth for:

- `SITE_CONFIG.siteUrl` — the canonical production origin
- `SAME_AS` — the external profiles allowed in structured data
- `buildJsonLd()` / `seoHtml()` — the JSON-LD graph

### Structured data

The JSON-LD graph is **not hand-written into `index.html`**. It is generated
from `site.js` by a small Vite plugin (`structuredData()` in
`vite.config.js`) and injected into `index.html` at build time, so the
structured data can never drift from the visible content.

The graph contains three linked nodes with stable fragment IDs:

- `#website` — `WebSite`
- `#profilepage` — `ProfilePage`
- `#person` — `Person`

To change anything, edit `SITE_CONFIG` and rebuild.

---

## Images

All public images are generated from the real photograph in this repository by
`scripts/generate-images.py`. **No imagery is invented or stock.**

| Output                            | Purpose                                |
| --------------------------------- | -------------------------------------- |
| `public/images/abhishek-mc.webp`  | Canonical photo — referenced by JSON-LD |
| `public/images/abhishek-mc-256.webp` | About avatar (2x)                    |
| `public/images/abhishek-mc-416.webp` | Hero portrait (1x)                   |
| `public/images/abhishek-mc-832.webp` | Hero portrait (2x)                   |
| `public/images/abhishek-mc-square.webp` | Square crop for structured data |
| `public/og-image.jpg`             | 1200x630 social preview                 |
| `public/icons/*.png`              | PWA / apple-touch icons                 |

These live in `public/` rather than `src/assets/` **on purpose**: Vite
content-hashes files in `src/assets/`, and a hashed path would break the
stable absolute URL that the JSON-LD `image` property depends on.

Re-run with `npm run images` after changing the source photo.

---

## SEO notes

- `index.html` carries the canonical URL, Open Graph, Twitter card, manifest
  and favicon links.
- `public/robots.txt` and `public/sitemap.xml` are real static files. They are
  the single most important fix here: previously both paths fell through to the
  SPA `index.html` and were served as `text/html`, which search engines treat
  as a soft 404.
- A `<noscript>` block repeats the core identity content, because this is a
  client-rendered app that is otherwise blank without JavaScript.
- The scroll-reveal animation is **progressive enhancement**: content is
  visible by default in CSS, and the hidden start state is scoped to
  `html.js`, a class added by a small inline script. If scripting is
  unavailable the class is never added, so nothing can be left invisible.
  There is no user-agent or bot detection — humans and crawlers get
  identical content.
- The hero portrait is preloaded with the same `srcset`/`sizes` the `<img>`
  uses, because it is the LCP element.
- `og:type` is `website`, not `profile`. This URL is the site root; the OGP
  `profile` type is for platform profile pages and expects `profile:*`
  fields. The person semantics live in the JSON-LD `ProfilePage` / `Person`
  nodes, which is where they belong.

### Verifying after a deploy

```bash
npm run build
npm run verify:seo      # metadata, JSON-LD, indexability, no-cloaking, LCP
npm run verify:served   # real files + correct Content-Type for every SEO route
npm run verify:render   # real browser: content visible with and without JS
```

`verify:render` needs Playwright once:
`pip install playwright && playwright install chromium`

---

## Deployment

The site is a static SPA served by Cloudflare from `dist/`. Wrangler
configuration is **not** committed in this repository, so the exact deploy
command depends on how the Cloudflare project is wired up. Use whichever
matches your setup:

```bash
# Cloudflare Workers (static assets)
npx wrangler deploy

# Cloudflare Pages (if connected to a git provider, push instead)
npx wrangler pages deploy dist
```

After deploying, confirm these return real content rather than the SPA shell:

- `https://abhishekmc.in/robots.txt`
- `https://abhishekmc.in/sitemap.xml`
- `https://abhishekmc.in/og-image.jpg`

---

## Contact form

`server/index.js` is a **local development** SMTP relay for the contact form.
It is not deployed, and `vite.config.js` proxies `/api` to it only in `dev` and
`preview`. Credentials come from `.env.local` (git-ignored); see `.env.example`.

