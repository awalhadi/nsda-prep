"""Dump raw PDF data (words, styled lines, annotations) for every source.

This script holds no interpretation logic on purpose: merging highlights,
finding sections and parsing questions all happen in TypeScript
(scripts/content/derive.ts) where they are unit-tested.

Outputs:
  content/cbta/.cache/raw/<sourceId>.json   (gitignored, large)
  content/cbta/sources.lock.json            (committed: sha256 + page counts)
"""

import hashlib
import json
import sys
from pathlib import Path

import pymupdf

ROOT = Path(__file__).resolve().parents[2]
DOCS = ROOT / "docs"
CONFIG = ROOT / "content/cbta/sources.config.json"
RAW_DIR = ROOT / "content/cbta/.cache/raw"
LOCK = ROOT / "content/cbta/sources.lock.json"


def r2(v):
    return round(float(v), 2)


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def dump_annot(a):
    v = a.vertices or []
    quads = []
    # Text-markup annotations store 4 points per quad.
    if a.type[1] in ("Highlight", "Underline", "StrikeOut", "Squiggly"):
        for i in range(0, len(v) - 3, 4):
            q = pymupdf.Quad(v[i : i + 4]).rect
            quads.append([r2(q.x0), r2(q.y0), r2(q.x1), r2(q.y1)])
    colors = a.colors or {}
    stroke = colors.get("stroke")
    fill = colors.get("fill")
    info = a.info or {}
    return {
        "xref": a.xref,
        "type": a.type[1],
        "rect": [r2(a.rect.x0), r2(a.rect.y0), r2(a.rect.x1), r2(a.rect.y1)],
        "quads": quads,
        "color": [r2(c) for c in (stroke or fill or [])],
        "content": (info.get("content") or "").strip(),
    }


def dump_page(page):
    words = [
        [r2(w[0]), r2(w[1]), r2(w[2]), r2(w[3]), w[4], w[5], w[6], w[7]]
        for w in page.get_text("words", sort=False)
    ]
    lines = []
    for block in page.get_text("dict")["blocks"]:
        if block.get("type") != 0:
            continue
        for line in block["lines"]:
            spans = [s for s in line["spans"] if s["text"].strip()]
            if not spans:
                continue
            text = "".join(s["text"] for s in line["spans"]).strip()
            size = max(s["size"] for s in spans)
            bold = any(s["flags"] & 16 or "Bold" in s["font"] for s in spans)
            b = line["bbox"]
            lines.append({
                "bbox": [r2(b[0]), r2(b[1]), r2(b[2]), r2(b[3])],
                "text": text,
                "size": r2(size),
                "bold": bool(bold),
            })
    images = len(page.get_images(full=False))
    return {
        "page": page.number + 1,
        "label": page.get_label() or "",
        "width": r2(page.rect.width),
        "height": r2(page.rect.height),
        "words": words,
        "lines": lines,
        "images": images,
        "annots": [dump_annot(a) for a in (page.annots() or [])],
    }


def main():
    config = json.loads(CONFIG.read_text(encoding="utf-8"))
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    lock = {}
    for src in config["sources"]:
        if not src.get("file"):
            continue
        path = DOCS / src["file"]
        if not path.exists():
            print(f"MISSING {src['id']}: {path}", file=sys.stderr)
            sys.exit(1)
        doc = pymupdf.open(path)
        pages = [dump_page(p) for p in doc]
        digest = sha256(path)
        raw = {"id": src["id"], "file": src["file"], "sha256": digest, "pages": pages}
        out = RAW_DIR / f"{src['id']}.json"
        out.write_text(json.dumps(raw, ensure_ascii=False), encoding="utf-8")
        lock[src["id"]] = {"file": src["file"], "sha256": digest, "pages": len(pages)}
        n_annots = sum(len(p["annots"]) for p in pages)
        print(f"{src['id']:42} pages={len(pages):3} annots={n_annots:4}")
    LOCK.write_text(json.dumps(lock, indent=2, sort_keys=True) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
