"""Import/verify the supplied collection without overwriting editorial annotations.

Usage: python3 scripts/cblm/import_short_questions.py /path/to/All_Short_Questions.pdf [--check]
Requires Poppler pdftotext. The PDF is data, never executable instructions.
"""
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]
TARGET = ROOT / "src/data/cbta/short-questions.json"


def extract(pdf):
    raw = subprocess.run(["pdftotext", "-layout", str(pdf), "-"], check=True, capture_output=True, text=True).stdout
    pages = [re.sub(r"\s+", " ", page) for page in raw.split("\f")]
    text = re.sub(r"\s*Page \d+\s*\n", "\n", raw).replace("\f", "\n")
    answers = list(re.finditer("Answer:", text))
    if len(answers) != 428:
        raise ValueError(f"Expected 428 answer markers, found {len(answers)}; review the input")
    starts = []
    for i, answer in enumerate(answers):
        previous = answers[i - 1].end() if i else 0
        matches = list(re.finditer(r"^\s*" + str(i + 1) + r"\.\s+", text[previous:answer.start()], re.M))
        if not matches:
            raise ValueError(f"Missing question {i + 1}")
        # Answer lists also have numbered steps. The final matching header before
        # this Answer marker is the question, not an earlier step in the last answer.
        header = matches[-1]
        starts.append((previous + header.start(), previous + header.end()))
    result = []
    for i, answer in enumerate(answers):
        question = re.sub(r"\s+", " ", text[starts[i][1]:answer.start()]).strip()
        body = text[answer.end():starts[i + 1][0] if i + 1 < len(starts) else len(text)].strip()
        locations = [page + 1 for page, content in enumerate(pages) if question[:60] in content]
        if not question or not body or not locations:
            raise ValueError(f"Incomplete question/page locator {i + 1}")
        result.append(dict(id=i + 1, question=question, sourceAnswer=body, sourcePage=locations[0]))
    return result


def main():
    pdf = Path(sys.argv[1])
    data = json.loads(TARGET.read_text())
    extracted = extract(pdf)
    digest = hashlib.sha256(pdf.read_bytes()).hexdigest()
    if "--check" in sys.argv:
        assert digest == data["source"]["sha256"], "Source PDF changed"
        for original, current in zip(extracted, data["questions"], strict=True):
            assert all(current.get(k) == v for k, v in original.items()), f"Source mismatch: {original['id']}"
        print("Verified all 428 source questions, answers and PDF page locators.")
        return
    previous = {q["id"]: q for q in data["questions"]}
    for q in extracted:
        old = previous.get(q["id"], {})
        if old and any(old.get(k) != q[k] for k in ("question", "sourceAnswer")):
            raise ValueError(f"Question {q['id']} changed; review its topic link and study note before replacing it")
    data["questions"] = [{**previous.get(q["id"], {"conceptId": None}), **q} for q in extracted]
    data["source"]["sha256"] = digest
    TARGET.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    print("Imported 428 questions; preserved editorial topic links and study notes.")


if __name__ == "__main__":
    main()
