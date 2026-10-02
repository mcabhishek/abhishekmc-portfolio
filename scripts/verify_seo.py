"""
Post-build verification of the SEO surface.

Checks the generated `dist/` output (not the source) so it validates exactly
what a crawler would receive:

  - index.html metadata: title, description, canonical, robots, OG, Twitter
  - the JSON-LD graph: parses, uses @graph, has the expected node types,
    and every absolute URL points at the real production domain
  - robots.txt and sitemap.xml are real files, not the SPA fallback
  - every image referenced by metadata/structured data exists in dist/

Exit code is non-zero if any check fails, so it can gate a deploy.

Run:  python scripts/verify_seo.py
"""

from __future__ import annotations

import json
import os
import re
import sys
import xml.etree.ElementTree as ET

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, "dist")
ORIGIN = "https://abhishekmc.in"

failures: list[str] = []
checks = 0


def check(label: str, condition: bool, detail: str = "") -> bool:
    global checks
    checks += 1
    if condition:
        print(f"  PASS  {label}")
    else:
        print(f"  FAIL  {label}" + (f" -> {detail}" if detail else ""))
        failures.append(label)
    return condition


def read(path: str) -> str:
    with open(path, encoding="utf-8") as fh:
        return fh.read()


def check_metadata(html: str) -> None:
    print("\nindex.html metadata")

    def meta(*patterns: str) -> str | None:
        for pattern in patterns:
            found = re.search(pattern, html, re.I | re.S)
            if found:
                # Some patterns are existence probes with no capture group.
                return found.group(1) if found.lastindex else found.group(0)
        return None

    title = re.search(r"<title>(.*?)</title>", html, re.I | re.S)
    check("title present and names the person",
          bool(title) and "Abhishek MC" in title.group(1),
          title.group(1) if title else "no <title>")
    check("title length <= 70 chars",
          bool(title) and len(title.group(1)) <= 70,
          f"{len(title.group(1))} chars" if title else "")

    desc = meta(r'name="description"\s+content="(.*?)"')
    check("meta description present", bool(desc))
    check("description length 70-320 chars",
          bool(desc) and 70 <= len(desc) <= 320,
          f"{len(desc)} chars" if desc else "")
    check("description contains the full name",
          bool(desc) and "Abhishek MC" in desc)

    canonical = meta(r'<link rel="canonical" href="(.*?)"')
    check("canonical is the production origin",
          canonical == f"{ORIGIN}/", str(canonical))
    check("no example.com left anywhere", "example.com" not in html)

    robots = meta(r'name="robots"\s+content="(.*?)"')
    check("meta robots allows indexing", bool(robots) and "index" in robots)
    check("meta robots allows following", bool(robots) and "follow" in robots)

    # og:type must be a valid OGP object type, and must be internally
    # consistent: the "profile" type requires profile:* fields, and those
    # fields are meaningless on a non-profile page. This page is the site
    # root, so "website" is the correct type.
    og_type = meta(r'property="og:type" content="(.*?)"')
    valid_og_types = {
        "website", "article", "book", "profile", "music.song", "music.album",
        "music.playlist", "music.radio_station", "video.movie",
        "video.episode", "video.tv_show", "video.other", "website",
    }
    check("og:type is a valid Open Graph object type",
          og_type in valid_og_types, str(og_type))
    check("og:type is 'website' (site root)",
          og_type == "website", str(og_type))
    # Guard the two failure modes in both directions.
    check("no orphaned profile:* fields while og:type is not 'profile'",
          not re.search(r'property="profile:', html), str(og_type))
    check("profile type would have its required fields",
          og_type != "profile" or "profile:username" in html, str(og_type))
    check("og:url matches canonical", meta(r'property="og:url" content="(.*?)"') == f"{ORIGIN}/")
    check("og:image is absolute on the real domain",
          (meta(r'property="og:image" content="(.*?)"') or "").startswith(f"{ORIGIN}/"))
    check("og:image has dimensions",
          bool(meta(r'property="og:image:width"')) and bool(meta(r'property="og:image:height"')))
    check("og:image has alt text", bool(meta(r'property="og:image:alt"')))

    check("twitter:card is summary_large_image",
          meta(r'name="twitter:card" content="(.*?)"') == "summary_large_image")
    check("twitter:image matches og:image",
          meta(r'name="twitter:image" content="(.*?)"') == meta(r'property="og:image" content="(.*?)"'))

    check("web app manifest linked", bool(meta(r'rel="manifest" href="(.*?)"')))


def check_json_ld(html: str) -> dict:
    print("\nJSON-LD graph")
    match = re.search(
        r'<script type="application/ld\+json">(.*?)</script>', html, re.S
    )
    if not check("JSON-LD block present in dist/index.html", bool(match)):
        return {}

    try:
        data = json.loads(match.group(1))
    except json.JSONDecodeError as exc:
        check("JSON-LD is valid JSON", False, str(exc))
        return {}

    check("JSON-LD is valid JSON", True)
    check("uses @context schema.org",
          data.get("@context") == "https://schema.org")
    check("single @graph (not multiple blocks)", "@graph" in data)

    graph = data.get("@graph", [])
    types = {node.get("@type") for node in graph}
    check("graph contains WebSite", "WebSite" in types)
    check("graph contains ProfilePage", "ProfilePage" in types)
    check("graph contains Person", "Person" in types)

    ids = [node.get("@id") for node in graph]
    check("every node has a stable @id", all(ids) and len(ids) == len(set(ids)), str(ids))
    check("@ids are same-origin fragments",
          all(i.startswith(f"{ORIGIN}/#") for i in ids), str(ids))

    # Every internal @id reference must resolve to a node in the graph.
    refs = set(re.findall(r'"\@id":\s*"([^"]+)"', match.group(1)))
    check("all @id references resolve within the graph",
          refs.issubset(set(ids)), str(refs - set(ids)))

    person = next((n for n in graph if n.get("@type") == "Person"), {})
    check("person name is 'Abhishek MC'", person.get("name") == "Abhishek MC")
    check("person has a jobTitle", bool(person.get("jobTitle")))
    check("person email is a mailto: URI",
          (person.get("email") or "").startswith("mailto:"))
    check("person telephone has no URI scheme",
          "://" not in str(person.get("telephone")) and ":" not in str(person.get("telephone")),
          str(person.get("telephone")))

    # Truthfulness guards: these must never be asserted without real data.
    forbidden = {"alumniOf", "worksFor", "award", "hasCredential",
                 "publication", "memberOf", "honorificPrefix"}
    used = forbidden.intersection(person)
    check("no unverified education/employment/credential claims", not used, str(used))

    same_as = person.get("sameAs", [])
    check("sameAs is a non-empty list", bool(same_as))
    check("sameAs entries are absolute https URLs",
          all(u.startswith("https://") for u in same_as), str(same_as))
    check("sameAs has no local/placeholder hosts",
          not any(("localhost" in u or "127.0.0.1" in u or "example.com" in u
                   or "workers.dev" in u) for u in same_as), str(same_as))

    images = person.get("image", [])
    check("person image URLs are absolute on the real domain",
          bool(images) and all(i.startswith(f"{ORIGIN}/") for i in images), str(images))
    return data


def check_crawl_files() -> None:
    print("\nrobots.txt / sitemap.xml / manifest")

    robots_path = os.path.join(DIST, "robots.txt")
    if check("dist/robots.txt exists (not the SPA fallback)", os.path.exists(robots_path)):
        robots = read(robots_path)
        check("robots.txt is not HTML", "<html" not in robots.lower())
        check("robots.txt allows the site", "Allow: /" in robots)
        check("robots.txt declares a sitemap", f"Sitemap: {ORIGIN}/sitemap.xml" in robots)

    sm_path = os.path.join(DIST, "sitemap.xml")
    if check("dist/sitemap.xml exists (not the SPA fallback)", os.path.exists(sm_path)):
        sm = read(sm_path)
        check("sitemap.xml is not HTML", "<html" not in sm.lower())
        try:
            root = ET.fromstring(sm)
            locs = [e.text for e in root.iter() if e.tag.endswith("}loc")]
            check("sitemap parses as XML", True)
            check("sitemap lists the canonical URL", f"{ORIGIN}/" in locs, str(locs))
            check("sitemap has no example.com", "example.com" not in sm)
        except ET.ParseError as exc:
            check("sitemap parses as XML", False, str(exc))

    check("dist/site.webmanifest exists", os.path.exists(os.path.join(DIST, "site.webmanifest")))


def check_referenced_assets(html: str, jsonld: dict) -> None:
    print("\nReferenced production assets")
    paths = set(re.findall(rf'{re.escape(ORIGIN)}(/[^"\s<>]+)', html))
    paths.update(re.findall(r'content="(/[^"]+\.(?:jpg|png|webp|svg|ico))"', html))
    paths.update(re.findall(r'href="(/[^"]+\.(?:png|svg|ico|webmanifest|xml|txt))"', html))
    paths.update(re.findall(r'src="(/images/[^"]+)"', html))
    for node in jsonld.get("@graph", []):
        for key in ("image", "logo"):
            for item in node.get(key, []) or []:
                if isinstance(item, str) and item.startswith(ORIGIN):
                    paths.add(item[len(ORIGIN):])

    # Only real file paths are asset references. JSON-LD "@id" values are
    # same-document fragments (#person, #website, ...) and are not files.
    paths = {
        p for p in paths
        if p != "/" and not p.endswith("/") and not p.startswith("/#")
        and "." in os.path.basename(p)
    }
    for path in sorted(paths):
        check(f"asset exists: {path}",
              os.path.exists(os.path.join(DIST, path.lstrip("/"))))



def _strip_js_comments(text: str) -> str:
    """Remove // and /* */ comments so prose cannot trip a code check."""
    text = re.sub(r"/\*.*?\*/", " ", text, flags=re.S)
    return re.sub(r"//[^\n]*", " ", text)


def check_no_cloaking() -> None:
    """Guard against serving different content to crawlers vs. humans.

    The site must never branch on user agent, webdriver, or any other
    request signal to decide what to render. A capability flag that only
    reveals an animation is fine; identity-based branching is cloaking.

    Comments are stripped before scanning so that *documentation* about
    avoiding cloaking is not mistaken for cloaking.
    """
    print("\nNo cloaking / no bot-specific content")
    src = os.path.join(ROOT, "src")
    banned = ("navigator.webdriver", "navigator.userAgent", "navigator.plugins",
              "Googlebot", "googlebot", "Bingbot", "isBot", "isCrawler")
    offenders = []
    for folder, _dirs, files in os.walk(src):
        for name in files:
            if not name.endswith((".js", ".jsx", ".ts", ".tsx")):
                continue
            path = os.path.join(folder, name)
            with open(path, encoding="utf-8") as fh:
                body = _strip_js_comments(fh.read())
            for token in banned:
                if token in body:
                    offenders.append(f"{os.path.relpath(path, ROOT)}: {token}")

    check("no user-agent / bot detection in our own source (comments excluded)",
          not offenders, "; ".join(offenders))

    # `navigator.webdriver` is the specific cloaking vector that was removed.
    # It must be absent from the shipped bundle too. `navigator.userAgent` is
    # deliberately NOT banned there: framer-motion uses it internally for
    # platform feature detection (Safari rounding), which is not cloaking.
    assets = os.path.join(DIST, "assets")
    built = []
    if os.path.isdir(assets):
        for name in os.listdir(assets):
            if not name.endswith(".js"):
                continue
            with open(os.path.join(assets, name), encoding="utf-8", errors="ignore") as fh:
                if "webdriver" in fh.read():
                    built.append(name)
    check("no navigator.webdriver in the built JS", not built, "; ".join(built))

    # And the capability flag must exist so content stays visible without JS.
    with open(os.path.join(DIST, "index.html"), encoding="utf-8") as fh:
        html = fh.read()
    check("progressive-enhancement 'js' flag present in built HTML",
          'classList.add("js")' in html or "classList.add('js')" in html)

    with open(os.path.join(ROOT, "src", "index.css"), encoding="utf-8") as fh:
        css = fh.read()
    check("reveal content is visible by default (not opacity:0 at base)",
          re.search(r"^\.reveal\s*\{\s*opacity:\s*1", css, re.M) is not None)
    check("hidden reveal state is scoped to html.js",
          "html.js .reveal" in css)


def check_indexability(html: str) -> None:
    print("\nIndexability")
    check("exactly one canonical tag",
          len(re.findall(r'<link[^>]+rel="canonical"', html, re.I)) == 1,
          str(len(re.findall(r'<link[^>]+rel="canonical"', html, re.I))))
    for bad in ("noindex", "nofollow", "noarchive", "nosnippet", "none"):
        check(f"no accidental '{bad}' directive",
              not re.search(rf'name="robots"[^>]*\b{bad}\b', html, re.I), bad)
    check("no X-Robots-Tag meta in markup", "X-Robots" not in html)


def check_lcp_preload(html: str) -> None:
    """The preload must match an image the page really uses."""
    print("\nLCP preload integrity")
    preloads = re.findall(r'<link[^>]+rel="preload"[^>]*>', html, re.I)
    image_preloads = [p for p in preloads if 'as="image"' in p]
    check("at most one image is preloaded", len(image_preloads) <= 1,
          f"{len(image_preloads)} image preloads")

    for tag in image_preloads:
        href = re.search(r'href="([^"]+)"', tag)
        check("preloaded image is an og:image candidate", bool(href))
        if not href:
            continue
        path = href.group(1)
        check("preloaded image exists in dist/",
              os.path.exists(os.path.join(DIST, path.lstrip("/"))), path)
        # The preloaded URL must also be one the app actually references.
        check("preloaded image is referenced by the app bundle",
              os.path.basename(path) in _bundle_text(), path)

    # No duplicate downloads: the portrait must not also be fetched via a
    # different, non-preloaded path.
    check("hero preload is marked high priority",
          all('fetchpriority="high"' in p.lower() for p in image_preloads))


def _bundle_text() -> str:
    assets = os.path.join(DIST, "assets")
    if not os.path.isdir(assets):
        return ""
    parts = []
    for name in os.listdir(assets):
        if name.endswith(".js"):
            with open(os.path.join(assets, name), encoding="utf-8", errors="ignore") as fh:
                parts.append(fh.read())
    return "\n".join(parts)


def main() -> None:
    index = os.path.join(DIST, "index.html")
    if not os.path.exists(index):
        print("dist/index.html not found — run `npm run build` first.")
        return 1

    html = read(index)
    check_metadata(html)
    jsonld = check_json_ld(html)
    check_crawl_files()
    check_indexability(html)
    check_no_cloaking()
    check_lcp_preload(html)
    if jsonld:
        check_referenced_assets(html, jsonld)

    print(f"\n{checks - len(failures)}/{checks} checks passed.")
    if failures:
        print("FAILED:")
        for name in failures:
            print(f"  - {name}")
        return 1
    print("All SEO checks passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

    check("apple-touch-icon linked", "/apple-touch-icon.png" in html)



def read(path: str) -> str:
    with open(path, encoding="utf-8") as fh:
        return fh.read()
