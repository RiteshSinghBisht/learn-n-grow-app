from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "play-assets"
OUT_DIR.mkdir(exist_ok=True)
OUT_PATH = OUT_DIR / "feature-graphic.png"

WIDTH = 1024
HEIGHT = 500


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/SFNS.ttf",
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def add_shadow(base: Image.Image, box: tuple[int, int, int, int], radius: int = 28, blur: int = 18, opacity: int = 70) -> Image.Image:
    shadow = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(shadow)
    x1, y1, x2, y2 = box
    draw.rounded_rectangle((x1 + 10, y1 + 14, x2 + 10, y2 + 14), radius=radius, fill=(12, 20, 16, opacity))
    shadow = shadow.filter(ImageFilter.GaussianBlur(blur))
    return Image.alpha_composite(base, shadow)


def circle_crop(image: Image.Image, size: int, crop_box: tuple[int, int, int, int] | None = None) -> Image.Image:
    src = image.convert("RGBA")
    if crop_box:
        src = src.crop(crop_box)
    else:
        side = min(src.size)
        left = (src.width - side) // 2
        top = (src.height - side) // 2
        src = src.crop((left, top, left + side, top + side))

    src = src.resize((size, size), Image.LANCZOS)
    mask = Image.new("L", (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.ellipse((0, 0, size, size), fill=255)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(src, (0, 0), mask)
    return out


def add_chip(draw: ImageDraw.ImageDraw, x: int, y: int, text: str, font: ImageFont.ImageFont) -> int:
    bbox = draw.textbbox((0, 0), text, font=font)
    chip_w = bbox[2] - bbox[0] + 32
    draw.rounded_rectangle((x, y, x + chip_w, y + 40), radius=20, fill=(255, 255, 255, 34), outline=(255, 255, 255, 64))
    draw.text((x + 16, y + 9), text, font=font, fill=(245, 247, 244, 255))
    return chip_w


def add_tutor_card(
    canvas: Image.Image,
    box: tuple[int, int, int, int],
    avatar: Image.Image,
    title: str,
    subtitle: str,
    accent_fill: tuple[int, int, int, int],
    accent_outline: tuple[int, int, int, int],
    title_font: ImageFont.ImageFont,
    subtitle_font: ImageFont.ImageFont,
) -> Image.Image:
    canvas = add_shadow(canvas, box, radius=28, blur=20, opacity=55)
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle(box, radius=28, fill=accent_fill, outline=accent_outline, width=2)

    x1, y1, x2, y2 = box
    avatar_x = x1 + 20
    avatar_y = y1 + (y2 - y1 - avatar.height) // 2
    canvas.alpha_composite(avatar, (avatar_x, avatar_y))

    text_x = avatar_x + avatar.width + 18
    title_y = y1 + 24
    subtitle_y = title_y + 34

    draw.text((text_x, title_y), title, font=title_font, fill=(20, 35, 26, 255))
    draw.text((text_x, subtitle_y), subtitle, font=subtitle_font, fill=(74, 92, 80, 255))
    return canvas


def main() -> None:
    bg = Image.new("RGBA", (WIDTH, HEIGHT), "#f6f0e8")
    draw = ImageDraw.Draw(bg)

    # Soft background accents.
    accents = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    ad = ImageDraw.Draw(accents)
    ad.ellipse((700, -80, 1120, 300), fill=(18, 118, 69, 34))
    ad.ellipse((760, 180, 1140, 560), fill=(225, 147, 62, 26))
    ad.ellipse((-100, 290, 220, 620), fill=(36, 87, 61, 22))
    accents = accents.filter(ImageFilter.GaussianBlur(36))
    bg = Image.alpha_composite(bg, accents)

    # Main left panel.
    panel_box = (36, 34, 622, 466)
    bg = add_shadow(bg, panel_box, radius=42, blur=26, opacity=70)
    draw = ImageDraw.Draw(bg)
    draw.rounded_rectangle(panel_box, radius=42, fill=(28, 74, 53, 255))

    # Green glow in panel.
    glow = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse((300, 10, 720, 360), fill=(82, 183, 114, 42))
    gd.ellipse((-40, 260, 340, 620), fill=(255, 255, 255, 16))
    glow = glow.filter(ImageFilter.GaussianBlur(40))
    bg = Image.alpha_composite(bg, glow)
    draw = ImageDraw.Draw(bg)

    logo_card = (74, 70, 186, 182)
    draw.rounded_rectangle(logo_card, radius=30, fill=(245, 239, 230, 255))
    logo = Image.open(ROOT / "logo.png").convert("RGBA")
    logo_box = logo.getbbox()
    if logo_box:
        logo = logo.crop(logo_box)
    logo.thumbnail((74, 74), Image.LANCZOS)
    bg.alpha_composite(logo, (94, 89))

    font_brand = load_font(24, bold=True)
    font_title = load_font(58, bold=True)
    font_sub = load_font(28)
    font_card_title = load_font(24, bold=True)
    font_card_sub = load_font(18)
    font_small = load_font(22)

    draw.text((74, 214), "LEARN N GROW", font=font_brand, fill=(215, 229, 220, 255))
    draw.text((74, 250), "Practice English", font=font_title, fill=(250, 251, 249, 255))
    draw.text((74, 314), "with confidence", font=font_title, fill=(250, 251, 249, 255))
    draw.text((74, 394), "Voice and grammar coaching with\nfriendly AI tutors.", font=font_sub, fill=(222, 232, 226, 255), spacing=8)

    # Right section title.
    draw.text((678, 72), "Meet your tutors", font=font_brand, fill=(31, 77, 55, 255))
    draw.text((678, 106), "Learn with guided conversation and correction.", font=font_small, fill=(78, 94, 84, 255))

    fluent = Image.open(ROOT / "fluent-bot.png")
    khushi = Image.open(ROOT / "khushi-bot.png")
    fluent_avatar = circle_crop(fluent, 90, crop_box=(260, 120, 620, 480))
    khushi_avatar = circle_crop(khushi, 90)

    bg = add_tutor_card(
        bg,
        (672, 156, 954, 252),
        fluent_avatar,
        "Fluent",
        "Grammar coach",
        (255, 255, 255, 255),
        (220, 226, 220, 255),
        font_card_title,
        font_card_sub,
    )
    bg = add_tutor_card(
        bg,
        (712, 286, 994, 382),
        khushi_avatar,
        "Khushi",
        "Speaking partner",
        (233, 244, 237, 255),
        (183, 212, 192, 255),
        font_card_title,
        font_card_sub,
    )

    draw = ImageDraw.Draw(bg)
    draw.text((678, 426), "Daily AI English practice", font=font_small, fill=(89, 103, 94, 255))

    bg.convert("RGB").save(OUT_PATH, format="PNG", optimize=True)
    print(OUT_PATH)


if __name__ == "__main__":
    main()
