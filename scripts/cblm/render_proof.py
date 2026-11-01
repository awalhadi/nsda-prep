"""Render proof images: merged passages outlined over the real PDF highlights.

For each CBLM, renders the 2 pages with the most passages plus every page
flagged for manual checking. Each passage gets a red outline and a number, so
a reviewer can confirm the extraction lines up with the yellow/green areas.

Input:  content/cbta/.cache/proof-spec.json (written by scripts/content/derive.ts)
Output: content/cbta/.cache/proof/<sourceId>-p<page>.png  (gitignored)
"""

import json
from pathlib import Path

import pymupdf

ROOT = Path(__file__).resolve().parents[2]
SPEC = ROOT / "content/cbta/.cache/proof-spec.json"
OUT = ROOT / "content/cbta/.cache/proof"
RED = (0.85, 0.1, 0.1)


def main():
    spec = json.loads(SPEC.read_text(encoding="utf-8"))
    OUT.mkdir(parents=True, exist_ok=True)
    for old in OUT.glob("*.png"):
        old.unlink()
    total = 0
    for src_id, s in sorted(spec.items()):
        doc = pymupdf.open(ROOT / "docs" / s["file"])
        pages = s["pages"]
        busiest = sorted(pages, key=lambda p: (-len(pages[p]), int(p)))[:2]
        chosen = sorted({int(p) for p in busiest} | set(s["doubtPages"]))
        for pno in chosen:
            page = doc[pno - 1]
            for n, passage in enumerate(pages.get(str(pno), []), start=1):
                for i, b in enumerate(passage["boxes"]):
                    r = pymupdf.Rect(b) + (-1.5, -1.5, 1.5, 1.5)
                    page.draw_rect(r, color=RED, width=0.9)
                    if i == 0:
                        page.insert_text((r.x0 - 9, r.y0 + 7), str(n), fontsize=7, color=RED)
            pix = page.get_pixmap(dpi=110)
            pix.save(OUT / f"{src_id}-p{pno}.png")
            total += 1
    print(f"proof: {total} page image(s) in {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
