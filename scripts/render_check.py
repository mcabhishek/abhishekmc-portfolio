"""
End-to-end render check of the built site in a real headless browser.

Confirms the progressive-enhancement contract actually holds in a browser:

  1. With JavaScript ON, `.reveal` elements start hidden and then become
     visible when scrolled into view (the animation still works).
  2. With JavaScript OFF, every `.reveal` element is visible immediately
     (nothing is stuck at opacity 0) and the <noscript> fallback is shown.
  3. Exactly one <h1> is present in the rendered DOM.
  4. The hero portrait actually loaded (naturalWidth > 0).

Run:  python scripts/render_check.py
Needs: pip install playwright && playwright install chromium
"""

from __future__ import annotations

import functools
import http.server
import os
import socketserver
import sys
import threading

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, "dist")

failures: list[str] = []


class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def guess_type(self, path):
        p = str(path)
        if p.endswith(".webmanifest"):
            return "application/manifest+json"
        if p.endswith(".webp"):
            return "image/webp"
        return super().guess_type(path)


def check(label, ok, detail=""):
    print(f"  {'PASS' if ok else 'FAIL'}  {label}" + (f" -> {detail}" if detail and not ok else ""))
    if not ok:
        failures.append(label)
    return ok


def main() -> int:
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("playwright not installed - skipping render check.")
        print("Install with:  pip install playwright && playwright install chromium")
        return 0

    if not os.path.exists(os.path.join(DIST, "index.html")):
        print("dist/ not built - run `npm run build` first.")
        return 1

    port = 4185
    handler = functools.partial(Handler, directory=DIST)
    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.TCPServer(("127.0.0.1", port), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    url = f"http://127.0.0.1:{port}/"

    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()

            print("\nRendered page (JavaScript enabled)")
            page = browser.new_page()
            page.goto(url, wait_until="networkidle")
            page.wait_for_timeout(1200)

            # Scroll each reveal into view and confirm it actually transitions
            # from hidden to visible. The hero does not use <Reveal>, so the
            # first wrapper is below the fold and must be scrolled to.
            total = page.eval_on_selector_all(".reveal", "els => els.length")
            check("reveal wrappers present in rendered DOM", total > 0, f"count={total}")

            hidden_before = page.evaluate("""() => {
                const el = document.querySelector('.reveal');
                if (!el) return null;
                el.scrollIntoView({block: 'center'});
                return parseFloat(getComputedStyle(el).opacity);
            }""")
            check("a reveal element is hidden before it is scrolled into view",
                  hidden_before is None or hidden_before < 0.9,
                  f"opacity={hidden_before}")

            page.wait_for_timeout(1200)
            visible_after = page.evaluate("""() => {
                const el = document.querySelector('.reveal');
                return el ? parseFloat(getComputedStyle(el).opacity) : null;
            }""")
            check("that reveal element becomes visible once scrolled into view",
                  visible_after is not None and visible_after > 0.9,
                  f"opacity={visible_after}")

            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            page.wait_for_timeout(1500)
            hidden = page.evaluate("""() => [...document.querySelectorAll('.reveal')]
                .filter(el => parseFloat(getComputedStyle(el).opacity) < 0.9).length""")
            check("no reveal stuck hidden after a full scroll", hidden == 0, f"{hidden} hidden")

            h1s = page.eval_on_selector_all("h1", "els => els.length")
            check("exactly one <h1> in the rendered DOM", h1s == 1, f"count={h1s}")

            h1_text = page.eval_on_selector("h1", "el => el.innerText")
            check("<h1> names the person",
                  "Abhishek MC" in h1_text, repr(h1_text[:80]))
            check("<h1> is the name, not a slogan",
                  h1_text.strip().upper().startswith("ABHISHEK MC"),
                  repr(h1_text[:80]))

            alts = page.eval_on_selector_all(
                "img", "els => els.map(e => e.getAttribute('alt'))")
            check("every rendered <img> has an alt attribute",
                  all(a is not None for a in alts), str(alts))

            hero_loaded = page.eval_on_selector(
                ".portrait-frame img", "el => el.complete && el.naturalWidth > 0")
            check("hero portrait actually loaded", bool(hero_loaded))
            check("hero portrait resolved via the responsive srcset",
                  page.eval_on_selector(".portrait-frame img",
                                        "el => el.currentSrc.includes('/images/abhishek-mc-')"))
            page.screenshot(path=os.path.join(ROOT, "_render_top.png"))
            page.close()

            print("\nRendered page (JavaScript disabled)")
            ctx = browser.new_context(java_script_enabled=False)
            nojs = ctx.new_page()
            nojs.goto(url, wait_until="load")
            nojs.wait_for_timeout(500)

            bad = [1 for el in nojs.locator(".reveal").all()
                   if float(el.evaluate("e => getComputedStyle(e).opacity")) < 0.9]
            check("no reveal stuck hidden without JavaScript", not bad, f"{len(bad)} hidden")

            visible = nojs.locator(".noscript-fallback").is_visible()
            check("noscript fallback is shown without JavaScript", visible)
            if visible:
                text = nojs.locator(".noscript-fallback").inner_text()
                check("noscript identifies Abhishek MC", "Abhishek MC" in text)
            ctx.close()
            browser.close()
    finally:
        httpd.shutdown()

    print()
    if failures:
        print(f"FAILED: {failures}")
        return 1
    print("Render check passed: content is visible with and without JavaScript.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
