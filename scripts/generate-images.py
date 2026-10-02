"""
Build every public image asset from the REAL source photograph that already
ships with this repository:

    removed_bg_image.png          (1202x1309 cut-out portrait, transparent)
    src/assets/abhishek-mc.webp   (1000x1089, same cut-out, bundled copy)

Nothing is generated or invented: every output is a crop, resize or
background-composite of the genuine photograph of Abhishek MC.

Run:  python scripts/generate-images.py
"""

from __future__ import annotations

import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(ROOT, "public")
IMAGES = os.path.join(PUBLIC, "images")
ICONS = os.path.join(PUBLIC, "icons")

# Brand tokens mirrored from src/index.css
BG_0 = (5, 8, 15)
BG_2 = (10, 15, 24)
ACCENT = (62, 139, 255)
CYAN = (34, 211, 238)

HIGH_RES = os.path.join(ROOT, "removed_bg_image.png")
BUNDLED = os.path.join(ROOT, "src", "assets", "abhishek-mc.webp")

FONT_BOLD = r"C:\Windows\Fonts\segoeuib.ttf"
FONT_REG = r"C:\Windows\Fonts\segoeui.ttf"

# Head-and-shoulders crop, as fractions of the source image.
# Keeps the whole head with headroom and reads well as a square avatar.
CROP = (0.10, 0.00, 0.90, 0.735)


def ensure_dirs() -> None:
    for path in (IMAGES, ICONS):
        os.makedirs(path, exist_ok=True)


def backdrop(size):
    """The same radial backdrop the site paints behind the cut-out portrait."""
    w, h = size
    base = Image.new("RGB", size, BG_0)
    glow = Image.new("RGB", size, BG_2)
    mask = Image.new("L", size, 0)
    d = ImageDraw.Draw(mask)
    steps = 90
    for i in range(steps, 0, -1):
        t = i / steps
        d.ellipse(
            [w * (0.5 - 0.72 * t), h * (0.30 - 0.72 * t),
             w * (0.5 + 0.72 * t), h * (0.30 + 0.72 * t)],
            fill=int(150 * (1 - t) ** 1.6),
        )
    return Image.composite(glow, base, mask)


def square_crop(img, size):
    """Head-and-shoulders square crop of the real photograph."""
    w, h = img.size
    l, t, r, b = CROP
    region = img.crop((int(w * l), int(h * t), int(w * r), int(h * b)))
    side = min(region.size)
    region = region.crop(
        ((region.width - side) // 2, 0, (region.width - side) // 2 + side, side)
    )
    return region.resize((size, size), Image.LANCZOS)


def save_webp(img, name, quality=82):
    path = os.path.join(IMAGES, name)
    img.save(path, "WEBP", quality=quality, method=6)
    print(f"  {name:<32} {img.size[0]}x{img.size[1]}  {os.path.getsize(path)/1024:6.1f} KB")


def save_png(img, path):
    img.save(path, "PNG", optimize=True)
    print(f"  {os.path.basename(path):<32} {img.size[0]}x{img.size[1]}  {os.path.getsize(path)/1024:6.1f} KB")


def build_profile(img):
    """Public copies of the real photograph with stable, unhashed URLs."""
    print("Profile photograph (public/images)")

    # Canonical asset -> the stable production URL the JSON-LD points at.
    save_webp(img.copy(), "abhishek-mc.webp", quality=86)

    # Responsive variants for <img srcset>. The hero portrait renders at up to
    # 360 CSS px, so 416w covers 1x and 832w covers 2x.
    for width, name in ((416, "abhishek-mc-416.webp"), (832, "abhishek-mc-832.webp")):
        height = round(img.height * width / img.width)
        save_webp(img.resize((width, height), Image.LANCZOS), name, quality=82)

    # The About avatar renders at 128 CSS px -> 256w is its 2x asset.
    save_webp(img.resize((256, round(img.height * 256 / img.width)), Image.LANCZOS),
              "abhishek-mc-256.webp", quality=80)

    # Square representation on the site backdrop, for structured data.
    flat = backdrop((720, 720)).convert("RGBA")
    flat.alpha_composite(square_crop(img, 720))
    save_webp(flat.convert("RGB"), "abhishek-mc-square.webp", quality=86)


def build_og(img):
    """1200x630 Open Graph / Twitter card built from the same photograph."""
    print("Social preview (public/og-image.jpg)")
    W, H, ph = 1200, 630, 520
    card = backdrop((W, H)).convert("RGBA")
    grid = ImageDraw.Draw(card)
    for x in range(0, W, 30):
        grid.line([(x, 0), (x, H)], fill=(16, 24, 38), width=1)
    for y in range(0, H, 140):
        grid.line([(0, y), (W, y)], fill=(16, 24, 38), width=1)

    px, py = W - ph - 66, (H - ph) // 2
    ring = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    rd = ImageDraw.Draw(ring)
    rd.ellipse([px - 16, py - 16, px + ph + 16, py + ph + 16], fill=ACCENT + (38,))
    rd.ellipse([px - 3, py - 3, px + ph + 3, py + ph + 3], outline=(120, 170, 255, 150), width=2)
    card.alpha_composite(ring)
    card.alpha_composite(square_crop(img, ph), (px, py))

    td = ImageDraw.Draw(card)
    tx = 84
    td.rounded_rectangle([tx, 150, tx + 10, 158], radius=4, fill=ACCENT)
    td.text((tx + 28, 136), "SOFTWARE DEVELOPER",
            font=ImageFont.truetype(FONT_BOLD, 27), fill=ACCENT)
    td.text((tx - 4, 188), "Abhishek MC",
            font=ImageFont.truetype(FONT_BOLD, 82), fill=(255, 255, 255))

    sub = ImageFont.truetype(FONT_REG, 31)
    td.text((tx, 302), "Backend  \u00b7  Cloud integration  \u00b7  Data security",
            font=sub, fill=(151, 163, 184))
    td.text((tx, 346), "Computer vision  \u00b7  Research", font=sub, fill=(151, 163, 184))
    td.text((tx, 424), "abhishekmc.in",
            font=ImageFont.truetype(FONT_BOLD, 27), fill=CYAN)

    out = os.path.join(PUBLIC, "og-image.jpg")
    card.convert("RGB").save(out, "JPEG", quality=88, optimize=True, progressive=True)
    print(f"  {'og-image.jpg':<32} {W}x{H}  {os.path.getsize(out)/1024:6.1f} KB")


def source():
    """Prefer the 1202x1309 master, fall back to the bundled WebP."""
    for candidate in (HIGH_RES, BUNDLED):
        if os.path.exists(candidate):
            return Image.open(candidate).convert("RGBA")
    raise SystemExit("No source photograph found.")


def build_icon(size, padding_ratio):
    """Redraw the existing public/favicon.svg 'A' mark at an arbitrary size.

    The geometry below is taken verbatim from public/favicon.svg, so the
    generated PNG icons keep the exact visual identity already in use.
    """
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    inset = size * padding_ratio
    d.rounded_rectangle(
        [inset, inset, size - inset, size - inset],
        radius=size * 0.22, fill=BG_0 + (255,)
    )

    inner = size - 2 * inset

    def P(x, y):
        return (inset + x / 64 * inner, inset + y / 64 * inner)

    # Same path as favicon.svg, scaled into the padded tile.
    outer = [P(32, 11), P(53, 53), P(42.6, 53), P(38.6, 44.4),
             P(25.4, 44.4), P(21.4, 53), P(11, 53)]
    counter = [P(32, 24), P(27.6, 34), P(36.4, 34)]
    d.polygon(outer, fill=ACCENT + (255,))
    d.polygon(counter, fill=BG_0 + (255,))
    d.ellipse([P(45, 11), P(53, 19)], fill=CYAN + (255,))
    return img


def build_icons():
    print("Icons (public/icons + apple-touch-icon)")
    for size, name, pad in (
        (192, "icon-192.png", 0.06),
        (512, "icon-512.png", 0.06),
        (512, "icon-maskable-512.png", 0.17),  # safe zone for Android masks
    ):
        save_png(build_icon(size, pad), os.path.join(ICONS, name))

    save_png(build_icon(180, 0.06), os.path.join(PUBLIC, "apple-touch-icon.png"))
    save_png(build_icon(32, 0.0), os.path.join(PUBLIC, "favicon-32x32.png"))


def main():
    ensure_dirs()
    img = source()
    used = HIGH_RES if os.path.exists(HIGH_RES) else BUNDLED
    print(f"Source: {os.path.basename(used)} {img.size[0]}x{img.size[1]}\n")
    build_profile(img)
    build_og(img)
    build_icons()
    print("\nDone. All assets derived from the real photograph.")


if __name__ == "__main__":
    main()
