#!/usr/bin/env python3
"""Generate raster social assets for Natal Chart Browser by Flat18.

This script composes the final OG/social images and favicon set from the
generated raster source art stored in public/social/_sources/.
"""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
SOURCE_DIR = PUBLIC / "social" / "_sources"

OG_PATH = PUBLIC / "og-image.png"
SOCIAL_SQUARE_PATH = PUBLIC / "social-natal-chart-flat18.png"
APPLE_TOUCH_ICON_PATH = PUBLIC / "apple-touch-icon.png"
FAVICON_16_PATH = PUBLIC / "favicon-16x16.png"
FAVICON_32_PATH = PUBLIC / "favicon-32x32.png"
ANDROID_192_PATH = PUBLIC / "android-chrome-192x192.png"
ANDROID_512_PATH = PUBLIC / "android-chrome-512x512.png"
FAVICON_ICO_PATH = PUBLIC / "favicon.ico"
MANIFEST_PATH = PUBLIC / "site.webmanifest"

WHEEL_SOURCE = SOURCE_DIR / "astrology-wheel-source.png"
ICON_SOURCE = SOURCE_DIR / "astrology-icon-source.png"

SIZE_OG = (1200, 630)
SIZE_SQUARE = (1080, 1080)
SIZE_ICON = (1024, 1024)

CREAM = (246, 239, 228, 255)
CREAM_2 = (252, 249, 243, 255)
CHARCOAL = (21, 24, 34, 255)
CHARCOAL_SOFT = (74, 78, 92, 255)
MUTED = (94, 101, 116, 255)
GOLD = (184, 144, 87, 255)
GOLD_SOFT = (210, 179, 127, 255)
LINE = (214, 205, 188, 255)
LINE_SOFT = (224, 217, 203, 255)
WHITE = (255, 255, 255, 255)


def first_existing_path(candidates: list[str]) -> str | None:
    for candidate in candidates:
        path = Path(candidate)
        if path.exists():
            return str(path)
    return None


SERIF_BOLD = first_existing_path([
    "/System/Library/Fonts/Supplemental/Georgia Bold.ttf",
    "/System/Library/Fonts/Times New Roman Bold.ttf",
    "/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf",
])

SERIF_REGULAR = first_existing_path([
    "/System/Library/Fonts/Supplemental/Georgia.ttf",
    "/System/Library/Fonts/Times New Roman.ttf",
    "/System/Library/Fonts/Supplemental/Times New Roman.ttf",
])

SANS_BOLD = first_existing_path([
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/System/Library/Fonts/Helvetica.ttc",
    "/System/Library/Fonts/Supplemental/Arial Black.ttf",
])

SANS_REGULAR = first_existing_path([
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/System/Library/Fonts/Helvetica.ttc",
    "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
])


def font(path: str | None, size: int, index: int = 0) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    if path:
        try:
            return ImageFont.truetype(path, size=size, index=index)
        except Exception:
            pass
    return ImageFont.load_default()


def create_canvas(size: tuple[int, int], background: tuple[int, int, int, int]) -> Image.Image:
    return Image.new("RGBA", size, background)


def add_glow(base: Image.Image, center: tuple[int, int], radius: int, color: tuple[int, int, int, int], blur: int) -> None:
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    left = center[0] - radius
    top = center[1] - radius
    right = center[0] + radius
    bottom = center[1] + radius
    draw.ellipse((left, top, right, bottom), fill=color)
    layer = layer.filter(ImageFilter.GaussianBlur(blur))
    base.alpha_composite(layer)


def add_line(base: Image.Image, xy: tuple[int, int, int, int], color: tuple[int, int, int, int], width: int = 1) -> None:
    draw = ImageDraw.Draw(base)
    draw.line(xy, fill=color, width=width)


def wrap_text(draw: ImageDraw.ImageDraw, text: str, text_font: ImageFont.ImageFont, max_width: int) -> list[str]:
    lines: list[str] = []
    for paragraph in text.splitlines() or [""]:
        if not paragraph.strip():
            lines.append("")
            continue
        words = paragraph.split()
        current = words[0]
        for word in words[1:]:
            candidate = f"{current} {word}"
            if draw.textlength(candidate, font=text_font) <= max_width:
                current = candidate
            else:
                lines.append(current)
                current = word
        lines.append(current)
    return lines


def draw_multiline_text(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    text: str,
    text_font: ImageFont.ImageFont,
    fill: tuple[int, int, int, int],
    max_width: int,
    line_gap: int = 10,
) -> int:
    lines = wrap_text(draw, text, text_font, max_width)
    y = xy[1]
    bbox = draw.textbbox((0, 0), "Ag", font=text_font)
    line_height = bbox[3] - bbox[1]
    for line in lines:
        draw.text((xy[0], y), line, font=text_font, fill=fill)
        y += line_height + line_gap
    return y


def draw_chip(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    text: str,
    text_font: ImageFont.ImageFont,
    fill: tuple[int, int, int, int] = WHITE,
    outline: tuple[int, int, int, int] = LINE_SOFT,
    text_fill: tuple[int, int, int, int] = CHARCOAL,
    padding: tuple[int, int] = (18, 12),
) -> tuple[int, int]:
    text_box = draw.textbbox((0, 0), text, font=text_font)
    text_w = text_box[2] - text_box[0]
    text_h = text_box[3] - text_box[1]
    width = text_w + padding[0] * 2
    height = text_h + padding[1] * 2
    box = (xy[0], xy[1], xy[0] + width, xy[1] + height)
    draw.rounded_rectangle(box, radius=height // 2, fill=fill, outline=outline, width=1)
    draw.text((xy[0] + padding[0], xy[1] + padding[1] - 1), text, font=text_font, fill=text_fill)
    return width, height


def draw_feature_panel(
    base: Image.Image,
    box: tuple[int, int, int, int],
    kicker: str,
    title: str,
    body: str,
    kicker_font: ImageFont.ImageFont,
    title_font: ImageFont.ImageFont,
    body_font: ImageFont.ImageFont,
) -> None:
    add_panel_shadow(base, box, radius=24, opacity=20)
    draw = ImageDraw.Draw(base)
    draw.rounded_rectangle(box, radius=24, fill=WHITE, outline=LINE_SOFT, width=1)
    draw.text((box[0] + 24, box[1] + 18), kicker, font=kicker_font, fill=(120, 113, 98, 255))
    draw.text((box[0] + 24, box[1] + 46), title, font=title_font, fill=CHARCOAL)
    draw_multiline_text(draw, (box[0] + 24, box[1] + 76), body, body_font, MUTED, box[2] - box[0] - 48, line_gap=8)


def paste_fit(base: Image.Image, source: Image.Image, box: tuple[int, int, int, int], opacity: int = 255) -> None:
    fitted = ImageOps.fit(source.convert("RGBA"), (box[2] - box[0], box[3] - box[1]), method=Image.Resampling.LANCZOS)
    if opacity < 255:
        alpha = fitted.getchannel("A").point(lambda value: value * opacity // 255)
        fitted.putalpha(alpha)
    base.alpha_composite(fitted, (box[0], box[1]))


def add_panel_shadow(base: Image.Image, box: tuple[int, int, int, int], radius: int = 32, opacity: int = 32) -> None:
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    inset = 8
    shadow_box = (box[0] + inset, box[1] + inset + 10, box[2] + inset, box[3] + inset + 10)
    draw.rounded_rectangle(shadow_box, radius=radius, fill=(0, 0, 0, opacity))
    layer = layer.filter(ImageFilter.GaussianBlur(18))
    base.alpha_composite(layer)


def compose_wide_card() -> Image.Image:
    canvas = create_canvas(SIZE_OG, CREAM)
    draw = ImageDraw.Draw(canvas)

    add_glow(canvas, (940, 112), 340, (255, 250, 242, 130), 100)
    add_glow(canvas, (156, 520), 260, (220, 183, 122, 52), 120)
    add_glow(canvas, (1020, 500), 180, (255, 239, 210, 40), 80)

    for offset in (0, 1, 2):
        add_line(canvas, (76, 74 + offset * 22, 500, 74 + offset * 22), (214, 205, 188, 120), 1)
    add_line(canvas, (600, 36, 600, 590), (214, 205, 188, 110), 1)

    wheel = Image.open(WHEEL_SOURCE).convert("RGBA")
    wheel_box = (610, 18, 1172, 610)
    add_panel_shadow(canvas, wheel_box, radius=36, opacity=28)
    paste_fit(canvas, wheel, wheel_box)

    icon = Image.open(ICON_SOURCE).convert("RGBA")
    paste_fit(canvas, icon, (986, 34, 1106, 154))

    kicker_font = font(SANS_BOLD, 18)
    body_font = font(SANS_REGULAR, 26)
    body_font_small = font(SANS_REGULAR, 22)
    title_font = font(SERIF_BOLD, 78)
    chip_font = font(SANS_BOLD, 18)
    url_font = font(SANS_BOLD, 20)

    draw.ellipse((60, 60, 72, 72), fill=CHARCOAL)
    draw.text((92, 56), "NATAL CHART BROWSER BY FLAT18", font=kicker_font, fill=CHARCOAL)

    draw.multiline_text((72, 112), "Natal Charts\nGenerator", font=title_font, fill=CHARCOAL, spacing=-10)

    subtitle = "Precise birth charts with relationship compare, daily timing, and share/export tools."
    draw_multiline_text(draw, (74, 315), subtitle, body_font, MUTED, 470, line_gap=12)

    chip_y = 423
    chip_x = 74
    for label in ["Local-first", "Partner compare", "PDF export"]:
        width, _ = draw_chip(draw, (chip_x, chip_y), label, chip_font)
        chip_x += width + 12

    draw.text((74, 566), "natal-chart.flat18.app", font=url_font, fill=CHARCOAL_SOFT)

    return canvas


def compose_square_card() -> Image.Image:
    canvas = create_canvas(SIZE_SQUARE, CREAM)
    draw = ImageDraw.Draw(canvas)

    add_glow(canvas, (816, 166), 300, (255, 250, 242, 120), 100)
    add_glow(canvas, (146, 890), 280, (220, 183, 122, 56), 120)
    add_glow(canvas, (926, 840), 220, (255, 239, 210, 36), 80)

    add_line(canvas, (76, 96, 408, 96), (214, 205, 188, 120), 1)
    add_line(canvas, (76, 188, 368, 188), (214, 205, 188, 95), 1)
    add_line(canvas, (680, 108, 1000, 108), (214, 205, 188, 120), 1)
    add_line(canvas, (772, 980, 1004, 980), (214, 205, 188, 100), 1)

    wheel = Image.open(WHEEL_SOURCE).convert("RGBA")
    wheel_box = (498, 92, 1040, 634)
    add_panel_shadow(canvas, wheel_box, radius=40, opacity=26)
    paste_fit(canvas, wheel, wheel_box)

    icon = Image.open(ICON_SOURCE).convert("RGBA")
    paste_fit(canvas, icon, (896, 52, 1018, 174))

    kicker_font = font(SANS_BOLD, 18)
    title_font = font(SERIF_BOLD, 72)
    body_font = font(SANS_REGULAR, 24)
    chip_font = font(SANS_BOLD, 18)
    url_font = font(SANS_BOLD, 18)

    draw.ellipse((60, 60, 72, 72), fill=CHARCOAL)
    draw.text((92, 56), "NATAL CHART BROWSER BY FLAT18", font=kicker_font, fill=CHARCOAL)

    draw.multiline_text((72, 120), "Natal Chart\nBrowser", font=title_font, fill=CHARCOAL, spacing=-8)

    subtitle = "Precise birth charts with relationship compare, daily timing, and share/export tools."
    draw_multiline_text(draw, (74, 335), subtitle, body_font, MUTED, 420, line_gap=10)

    chip_y = 480
    chip_x = 74
    for label in ["Local-first", "Daily timing"]:
        width, _ = draw_chip(draw, (chip_x, chip_y), label, chip_font)
        chip_x += width + 12

    chip_x = 74
    chip_y = 532
    for label in ["Partner compare", "PDF export"]:
        width, _ = draw_chip(draw, (chip_x, chip_y), label, chip_font)
        chip_x += width + 12

    panel_label_font = font(SANS_BOLD, 13)
    panel_title_font = font(SERIF_BOLD, 26)
    panel_body_font = font(SANS_REGULAR, 18)

    draw_feature_panel(
        canvas,
        (74, 650, 444, 764),
        "CALCULATION",
        "Swiss Ephemeris",
        "Real sky positions, houses, and aspects computed in the browser.",
        panel_label_font,
        panel_title_font,
        panel_body_font,
    )

    draw_feature_panel(
        canvas,
        (74, 784, 444, 898),
        "SHARING",
        "Export assets",
        "Image, GIF, reel, and PDF outputs for a clean launch-ready share path.",
        panel_label_font,
        panel_title_font,
        panel_body_font,
    )

    draw.text((74, 964), "natal-chart.flat18.app", font=url_font, fill=CHARCOAL_SOFT)

    return canvas


def resize_icon(source: Image.Image, size: int) -> Image.Image:
    icon = ImageOps.fit(source.convert("RGBA"), (size, size), method=Image.Resampling.LANCZOS)
    if size <= 32:
        icon = icon.filter(ImageFilter.UnsharpMask(radius=1, percent=130, threshold=2))
    return icon


def write_manifest() -> None:
    manifest = {
        "name": "Natal Chart Browser by Flat18",
        "short_name": "Natal Chart",
        "start_url": "/",
        "scope": "/",
        "display": "standalone",
        "background_color": "#f6efe4",
        "theme_color": "#f6efe4",
        "icons": [
            {"src": "/android-chrome-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
            {"src": "/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
        ],
    }
    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")


def ensure_sources() -> None:
    missing = [str(path) for path in (WHEEL_SOURCE, ICON_SOURCE) if not path.exists()]
    if missing:
        raise FileNotFoundError(f"Missing source images: {', '.join(missing)}")


def main() -> None:
    ensure_sources()
    PUBLIC.mkdir(parents=True, exist_ok=True)

    wide = compose_wide_card()
    square = compose_square_card()

    wide.save(OG_PATH, format="PNG")
    square.save(SOCIAL_SQUARE_PATH, format="PNG")

    icon_source = Image.open(ICON_SOURCE).convert("RGBA")
    resize_icon(icon_source, 16).save(FAVICON_16_PATH, format="PNG")
    resize_icon(icon_source, 32).save(FAVICON_32_PATH, format="PNG")
    resize_icon(icon_source, 180).save(APPLE_TOUCH_ICON_PATH, format="PNG")
    resize_icon(icon_source, 192).save(ANDROID_192_PATH, format="PNG")
    resize_icon(icon_source, 512).save(ANDROID_512_PATH, format="PNG")
    icon_source.save(FAVICON_ICO_PATH, format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])

    write_manifest()

    print(json.dumps(
        {
            "og": str(OG_PATH.relative_to(ROOT)),
            "square": str(SOCIAL_SQUARE_PATH.relative_to(ROOT)),
            "favicon": str(FAVICON_ICO_PATH.relative_to(ROOT)),
            "manifest": str(MANIFEST_PATH.relative_to(ROOT)),
        },
        indent=2,
    ))


if __name__ == "__main__":
    main()
