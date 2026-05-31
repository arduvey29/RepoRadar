from PIL import Image, ImageDraw, ImageFont
from io import BytesIO
import math
from models import ReportResult

# Mirrors frontend src/lib/grade.ts accent colors
GRADE_COLORS = {
    "A": (76, 195, 138),
    "B": (240, 185, 65),
    "C": (240, 138, 60),
    "D": (255, 93, 93),
    "F": (255, 93, 93),
}

W, H = 1200, 630
BG = (10, 10, 11)
PANEL = (15, 15, 18)
GRID = (40, 40, 46)
TEXT = (232, 232, 234)
MUTED = (138, 138, 147)
DIM = (110, 110, 118)

# Spoke order matches the frontend radar (top, going clockwise)
SPOKE_ORDER = ["code_quality", "docs", "deps", "tests", "ci", "security"]
SPOKE_LABEL = {
    "code_quality": "Code",
    "docs": "Docs",
    "deps": "Deps",
    "tests": "Tests",
    "ci": "CI",
    "security": "Security",
}


def _load_fonts():
    candidates = [
        ("arialbd.ttf", "arial.ttf"),
        ("Arial Bold.ttf", "Arial.ttf"),
        ("DejaVuSans-Bold.ttf", "DejaVuSans.ttf"),
    ]
    for bold, regular in candidates:
        try:
            return (
                ImageFont.truetype(bold, 96),
                ImageFont.truetype(bold, 44),
                ImageFont.truetype(regular, 28),
                ImageFont.truetype(regular, 22),
            )
        except OSError:
            continue
    d = ImageFont.load_default()
    return d, d, d, d


def _hex_point(cx: float, cy: float, r: float, axis_index: int) -> tuple[float, float]:
    angle = math.radians(-90 + axis_index * 60)
    return cx + r * math.cos(angle), cy + r * math.sin(angle)


def _draw_radar(draw: ImageDraw.ImageDraw, cx: int, cy: int, R: int,
                scores_by_key: dict[str, float], accent: tuple[int, int, int]) -> None:
    # 4 concentric grid rings
    for ring in range(1, 5):
        r = R * ring / 4
        polygon = [_hex_point(cx, cy, r, i) for i in range(6)]
        draw.polygon(polygon, outline=GRID, width=2)

    # Spokes
    for i in range(6):
        end = _hex_point(cx, cy, R, i)
        draw.line([(cx, cy), end], fill=GRID, width=1)

    # Data polygon (with semi-transparent fill via overlay)
    points = []
    for i, key in enumerate(SPOKE_ORDER):
        score = scores_by_key.get(key, 0.0)
        r = R * max(0.0, min(1.0, score / 10.0))
        points.append(_hex_point(cx, cy, r, i))

    # Fill via a second image to get transparency
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    overlay_draw.polygon(points, fill=(*accent, 70), outline=accent)
    draw._image.paste(overlay, (0, 0), overlay)

    # Outline + dots on top (paste lost the outline opacity)
    draw.polygon(points, outline=accent, width=3)
    for p in points:
        x, y = p
        draw.ellipse((x - 5, y - 5, x + 5, y + 5), fill=accent)

    # Axis labels
    try:
        font = ImageFont.truetype("arial.ttf", 22)
    except OSError:
        font = ImageFont.load_default()
    for i, key in enumerate(SPOKE_ORDER):
        lx, ly = _hex_point(cx, cy, R + 36, i)
        label = f"{SPOKE_LABEL[key]} {scores_by_key.get(key, 0):.1f}"
        bbox = draw.textbbox((0, 0), label, font=font)
        w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
        draw.text((lx - w / 2, ly - h / 2), label, fill=DIM, font=font)


def render(report: ReportResult) -> bytes:
    accent = GRADE_COLORS.get(report.overall_grade, (240, 185, 65))
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)

    font_grade, font_repo, font_med, font_sm = _load_fonts()

    scores = {dim.key: dim.score for dim in report.dimensions}
    _draw_radar(d, cx=370, cy=H // 2 + 10, R=200, scores_by_key=scores, accent=accent)

    # Right-side text column
    col_x = 700
    d.text((col_x, 70), "RepoRadar", fill=accent, font=font_med)

    repo = report.repo_name or ""
    if len(repo) > 28:
        repo = repo[:27] + "…"
    d.text((col_x, 130), repo, fill=TEXT, font=font_repo)

    # Big score + grade pill
    score_text = f"{report.overall_score:.1f}"
    d.text((col_x, 210), score_text, fill=accent, font=font_grade)
    score_bbox = d.textbbox((col_x, 210), score_text, font=font_grade)
    pill_x = score_bbox[2] + 20
    pill_y = score_bbox[1] + 30
    grade_text = f"Grade {report.overall_grade}"
    grade_bbox = d.textbbox((0, 0), grade_text, font=font_med)
    pad = 16
    pw = grade_bbox[2] - grade_bbox[0] + pad * 2
    ph = grade_bbox[3] - grade_bbox[1] + pad
    d.rounded_rectangle((pill_x, pill_y, pill_x + pw, pill_y + ph),
                        radius=ph // 2, fill=PANEL, outline=accent, width=2)
    d.text((pill_x + pad, pill_y + pad // 2 - 2), grade_text, fill=accent, font=font_med)

    d.text((col_x, 340), "Repository health · 6 dimensions", fill=MUTED, font=font_sm)

    # Verdict, wrapped to ~50 chars per line, max 3 lines
    verdict = (report.verdict or "").strip()
    if verdict:
        lines = _wrap(verdict, max_chars=52, max_lines=3)
        ty = 410
        for line in lines:
            d.text((col_x, ty), line, fill=TEXT, font=font_sm)
            ty += 38

    d.text((col_x, H - 60), "reporadar.app", fill=MUTED, font=font_sm)

    buf = BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def _wrap(text: str, max_chars: int, max_lines: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    cur = ""
    for w in words:
        candidate = f"{cur} {w}".strip()
        if len(candidate) <= max_chars:
            cur = candidate
        else:
            if cur:
                lines.append(cur)
            cur = w
            if len(lines) == max_lines - 1:
                # Stuff the rest into the final line, truncate with ellipsis if needed
                rest = " ".join([cur] + words[words.index(w) + 1:])
                if len(rest) > max_chars:
                    rest = rest[:max_chars - 1].rstrip() + "…"
                lines.append(rest)
                return lines
    if cur and len(lines) < max_lines:
        lines.append(cur)
    return lines
