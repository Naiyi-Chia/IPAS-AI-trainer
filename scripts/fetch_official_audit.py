"""Download public inputs used by the app for the Issue #43 audit (no pip packages).

Usage: python scripts/fetch_official_audit.py tmp/official-audit
Downloads are test inputs only; no production dependency is added.
"""
import concurrent.futures
import pathlib
import re
import sys
import urllib.parse
import urllib.request

root = pathlib.Path(__file__).resolve().parents[1]
target = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "tmp/official-audit")
target.mkdir(parents=True, exist_ok=True)
html = (root / "index.html").read_text(encoding="utf-8")
base = re.search(r'const OFFICIAL_PDF_BASE = "([^"]+)', html)[1]
papers = re.findall(r'\{id:"([^"]+)"[^\n]+file:"([^"]+)"', html)
urls = [(paper + ".pdf", base + urllib.parse.quote(name)) for paper, name in papers]
urls += [
    ("pdf.js", "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"),
    ("pdf.worker.js", "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"),
    ("mirror.html", re.search(r'const OFFICIAL_STRUCTURED_MIRROR = "([^"]+)', html)[1]),
]


def download(item):
    name, url = item
    with urllib.request.urlopen(url, timeout=60) as response:
        data = response.read()
    if name.endswith(".pdf") and not data.startswith(b"%PDF-"):
        raise ValueError(f"Not a PDF: {name}")
    (target / name).write_bytes(data)
    return f"{name}: {len(data)} bytes"


with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    for result in pool.map(download, urls):
        print(result)
