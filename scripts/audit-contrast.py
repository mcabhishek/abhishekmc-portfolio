"""WCAG 2.1 contrast audit for the design tokens in src/index.css.

Parses the real token values out of the stylesheet (no hardcoded colours) and
reports the contrast ratio of every text colour against every background,
including the alternate "midnight" theme.

Run:  python scripts/audit-contrast.py
"""

from __future__ import annotations

import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSS = os.path.join(ROOT, "src", "index.css")


def srgb_to_linear(channel: float) -> float:
    channel /= 255
    return channel / 12.92 if channel <= 0.03928 else ((channel + 0.055) / 1.055) ** 2.4


def luminance(hex_color: str) -> float:
    h = hex_color.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    return (0.2126 * srgb_to_linear(r)
            + 0.7152 * srgb_to_linear(g)
            + 0.0722 * srgb_to_linear(b))


def contrast(fg: str, bg: str) -> float:
    a, b = luminance(fg), luminance(bg)
    hi, lo = max(a, b), min(a, b)
    return (hi + 0.05) / (lo + 0.05)


def grade(ratio: float, large: bool = False) -> str:
    """WCAG grade. 'large' applies the 3:1 threshold for >=18.66px bold/24px."""
    if large:
        return "AAA" if ratio >= 4.5 else ("AA" if ratio >= 3 else "FAIL")
    return "AAA" if ratio >= 7 else ("AA" if ratio >= 4.5 else "FAIL")


def load_tokens() -> tuple[dict, dict]:
    with open(CSS, encoding="utf-8") as fh:
        css = fh.read()

    def block(name: str) -> dict:
        match = re.search(rf":root\s*(?:\[data-theme=\"{name}\"\]\s*)?\{{(.*?)\}}", css, re.S)
        body = match.group(1) if match else ""
        return dict(re.findall(r"(--[\w-]+):\s*(#[0-9a-fA-F]{3,8})\s*;", body))

    return block("dark"), block("midnight")


def main() -> int:
    dark, midnight = load_tokens()
    backgrounds = {
        "bg-0": dark["--bg-0"],
        "bg-1": dark["--bg-1"],
        "bg-2": dark["--bg-2"],
        "midnight": midnight.get("--bg-0", "#000000"),
    }
    foregrounds = {
        "text": dark["--text"],
        "text-2": dark["--text-2"],
        "text-3": dark["--text-3"],
        "accent": dark["--accent"],
        "cyan": dark["--cyan"],
        "white": "#ffffff",
    }

    print("Contrast of every text token against every background")
    print(f"{'token':<8}{'fg':<9}{'bg':<9}{'bg hex':<9}{'ratio':>7}  grade")
    failures = 0
    for fname, fg in foregrounds.items():
        for bname, bg in backgrounds.items():
            ratio = contrast(fg, bg)
            g = grade(ratio)
            if g == "FAIL":
                failures += 1
            print(f"{fname:<8}{fg:<9}{bname:<9}{bg:<9}{ratio:>7.2f}  {g}")

    print("\ntext-3 is used at 9.5-12.5px, so it must clear 4.5:1 (AA, normal text).")
    worst = min(contrast(foregrounds["text-3"], bg) for bg in backgrounds.values())
    print(f"  worst-case text-3 ratio: {worst:.2f} -> "
          f"{'PASS' if worst >= 4.5 else 'FAIL'}")

    return 1 if failures or worst < 4.5 else 0


if __name__ == "__main__":
    raise SystemExit(main())
