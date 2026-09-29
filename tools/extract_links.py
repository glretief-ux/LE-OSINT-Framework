#!/usr/bin/env python3
"""Extract every URL from data/links.js for the weekly link check.

Search templates ({q}) are filled with a harmless sample value so the
checker tests the real search page, not a broken literal.
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SAMPLE = {
    "user": "example", "email": "test@example.com", "phone": "3222000000", "domain": "example.com",
    "ip": "8.8.8.8", "mac": "00:1A:2B:3C:4D:5E", "url": "https://example.com", "img": "https://example.com/a.jpg",
    "name": "John Smith", "org": "Example Ltd", "kw": "example", "hash": "44d88612fea8a8f36de82e1278abb02f",
    "crypto": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t", "vessel": "EVER GIVEN", "imo": "9811000", "mmsi": "353136000",
    "cont": "MSCU1234566", "flight": "SN2583", "reg": "OO-SNA", "vin": "1HGCM82633A004352",
    "place": "Antwerp", "cve": "CVE-2024-3094",
}

src = (ROOT / "data" / "links.js").read_text(encoding="utf-8")
urls = []
for line in src.splitlines():
    if "|" not in line or line.strip().startswith(("#", ">", "*", "/")):
        continue
    parts = [p.strip() for p in line.split("|")]
    if len(parts) < 2 or not parts[1].startswith("http"):
        continue
    url = parts[1]
    sel = [s.strip() for s in (parts[3] if len(parts) > 3 else "").split(",") if s.strip()]
    if "{q}" in url:
        from urllib.parse import quote
        url = url.replace("{q}", quote(SAMPLE.get(sel[0] if sel else "kw", "example"), safe=""))
    urls.append(url)

out = ROOT / "links.txt"
out.write_text("\n".join(sorted(set(urls))) + "\n", encoding="utf-8")
print(f"{len(set(urls))} unique URLs written to {out}")
