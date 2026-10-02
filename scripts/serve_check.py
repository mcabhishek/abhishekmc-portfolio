"""
Serve `dist/` over HTTP and assert the routes a crawler actually requests.

This is the check that catches the real production bug: on a static SPA host,
`/robots.txt` and `/sitemap.xml` fall through to the SPA rewrite and come back
as `text/html`. Search engines treat that as a soft 404 and silently stop
crawling. This script proves each route returns its real file with the correct
Content-Type.

Usage:  python scripts/serve_check.py [port]
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

# route -> (expected content-type prefix, must not be the SPA shell)
ROUTES = {
    "/": ("text/html", True),
    "/robots.txt": ("text/plain", False),
    "/sitemap.xml": ("application/xml", False),
    "/site.webmanifest": ("", False),
    "/og-image.jpg": ("image/jpeg", False),
    "/favicon.svg": ("image/svg", False),
    "/favicon-32x32.png": ("image/png", False),
    "/apple-touch-icon.png": ("image/png", False),
    "/icons/icon-192.png": ("image/png", False),
    "/icons/icon-512.png": ("image/png", False),
    "/images/abhishek-mc.webp": ("image/", False),
    "/images/abhishek-mc-square.webp": ("image/", False),
    "/images/abhishek-mc-416.webp": ("image/", False),
    "/images/abhishek-mc-832.webp": ("image/", False),
    "/images/abhishek-mc-256.webp": ("image/", False),
}

failures: list[str] = []


class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):  # silence request logging
        pass

    def guess_type(self, path):
        ctype = super().guess_type(path)
        # SimpleHTTPRequestHandler maps .webmanifest to octet-stream.
        if str(path).endswith(".webmanifest"):
            return "application/manifest+json"
        if str(path).endswith(".webp"):
            return "image/webp"
        if str(path).endswith(".xml"):
            return "application/xml"
        if str(path).endswith(".txt"):
            return "text/plain"
        return ctype


def main() -> int:
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 4178
    if not os.path.exists(os.path.join(DIST, "index.html")):
        print("dist/index.html not found - run `npm run build` first.")
        return 1

    handler = functools.partial(Handler, directory=DIST)
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("127.0.0.1", port), handler) as httpd:
        thread = threading.Thread(target=httpd.serve_forever, daemon=True)
        thread.start()
        try:
            import urllib.request

            print(f"Serving dist/ on http://127.0.0.1:{port}\n")
            print(f"{'route':<34}{'status':<8}{'type':<28}{'bytes':>9}")
            for route, (expected, is_shell) in ROUTES.items():
                url = f"http://127.0.0.1:{port}{route}"
                try:
                    with urllib.request.urlopen(url, timeout=10) as resp:
                        ctype = resp.headers.get("Content-Type", "")
                        body = resp.read()
                        status = resp.status
                except Exception as exc:  # noqa: BLE001
                    print(f"{route:<34}{'ERROR':<8}{str(exc)[:26]:<28}")
                    failures.append(route)
                    continue

                problems = []
                if expected and not ctype.startswith(expected):
                    problems.append(f"type {ctype!r} != {expected!r}")
                if not is_shell and b"<html" in body[:400].lower():
                    problems.append("served the SPA shell")
                if not body:
                    problems.append("empty body")

                flag = "FAIL" if problems else "ok"
                print(f"{route:<34}{status:<8}{ctype:<28}{len(body):>9}  {flag}")
                for problem in problems:
                    print(f"    -> {problem}")
                    failures.append(route)
        finally:
            httpd.shutdown()

    print()
    if failures:
        print(f"FAILED routes: {sorted(set(failures))}")
        return 1
    print(f"All {len(ROUTES)} routes serve the correct file with the correct type.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
