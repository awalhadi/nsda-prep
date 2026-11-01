"""Assert raw annotation counts per type equal content/cbta/expected-counts.json.

A mismatch means a PDF changed or extraction regressed; either way no
highlight may silently go missing. Exit code 1 on any difference.
"""

import collections
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RAW_DIR = ROOT / "content/cbta/.cache/raw"
EXPECTED = ROOT / "content/cbta/expected-counts.json"


def main():
    expected = json.loads(EXPECTED.read_text(encoding="utf-8"))
    actual = {}
    for f in sorted(RAW_DIR.glob("*.json")):
        raw = json.loads(f.read_text(encoding="utf-8"))
        counts = collections.Counter(a["type"] for p in raw["pages"] for a in p["annots"])
        if counts:
            actual[raw["id"]] = dict(counts)

    failures = []
    for src in sorted(set(expected) | set(actual)):
        exp, act = expected.get(src, {}), actual.get(src, {})
        for t in sorted(set(exp) | set(act)):
            if exp.get(t, 0) != act.get(t, 0):
                failures.append(f"{src} {t}: expected {exp.get(t, 0)}, got {act.get(t, 0)}")

    total = sum(c.get("Highlight", 0) for s, c in actual.items() if s.startswith("cblm"))
    if failures:
        print("Annotation count mismatch:\n  " + "\n  ".join(failures), file=sys.stderr)
        sys.exit(1)
    print(f"selftest OK: annotation counts match ({total} CBLM highlights)")


if __name__ == "__main__":
    main()
