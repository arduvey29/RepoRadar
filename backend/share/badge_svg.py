from models import ReportResult

GRADE_FILL = {
    "A": "#4cc38a",
    "B": "#f0b941",
    "C": "#f08a3c",
    "D": "#ff5d5d",
    "F": "#ff5d5d",
}


def render_badge(report: ReportResult) -> str:
    right_label = f"{report.overall_grade} {report.overall_score:.1f}"
    fill = GRADE_FILL.get(report.overall_grade, "#f0b941")
    left_w = 80
    right_w = 14 + len(right_label) * 8
    total = left_w + right_w
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{total}" height="20" '
        f'role="img" aria-label="RepoRadar: {right_label}">'
        '<linearGradient id="s" x2="0" y2="100%">'
        '<stop offset="0" stop-color="#bbb" stop-opacity=".1"/>'
        '<stop offset="1" stop-opacity=".1"/>'
        '</linearGradient>'
        f'<rect width="{total}" height="20" rx="3" fill="#333"/>'
        f'<rect x="{left_w}" width="{right_w}" height="20" rx="3" fill="{fill}"/>'
        f'<rect width="{total}" height="20" rx="3" fill="url(#s)"/>'
        '<g text-anchor="middle" '
        'font-family="Verdana,DejaVu Sans,Geneva,sans-serif" font-size="11">'
        f'<text x="{left_w / 2}" y="14" fill="#fff">RepoRadar</text>'
        f'<text x="{left_w + right_w / 2}" y="14" fill="#0a0a0b">{right_label}</text>'
        '</g>'
        '</svg>'
    )
