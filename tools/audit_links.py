#!/usr/bin/env python3
"""Full link audit for the LE OSINT Framework.

Collects every URL in data/*.js and assets/*.js (not vendor libraries), fills search
templates with a harmless sample, requests each page like a browser and classifies it:

  ok          page answered (2xx)
  blocked     site is up but refuses robots (401/403/406/429/999, Cloudflare challenge)
  moved       redirected to another domain, or a deep link redirected to a home page
  soft404     answered 200 but the page says "not found", is parked or for sale
  dead        404/410, DNS failure, connection refused, TLS error or timeout

Writes reports/link-audit.json and reports/link-audit.md.
Usage: python tools/audit_links.py [--limit N]
"""
import concurrent.futures as cf
import json
import pathlib
import re
import sys
import time
from urllib.parse import quote, urlparse

import requests

ROOT = pathlib.Path(__file__).resolve().parent.parent
SAMPLE = {
    "user": "example", "email": "test@example.com", "phone": "3222000000", "domain": "example.com",
    "ip": "8.8.8.8", "mac": "00:1A:2B:3C:4D:5E", "url": "https://example.com", "img": "https://example.com/a.jpg",
    "name": "John Smith", "org": "Example Ltd", "kw": "example", "hash": "44d88612fea8a8f36de82e1278abb02f",
    "crypto": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t", "vessel": "EVER GIVEN", "imo": "9811000", "mmsi": "353136000",
    "cont": "MSCU1234566", "flight": "SN2583", "reg": "OO-SNA", "vin": "1HGCM82633A004352",
    "place": "Antwerp", "cve": "CVE-2024-3094",
}
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36"
HEAD = {"User-Agent": UA, "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", "Accept-Language": "en-GB,en;q=0.9,nl;q=0.8,fr;q=0.7"}
SOFT = re.compile(r"(page not found|404 not found|error 404|\b404\b.*not found|not be found|no longer available|seite nicht gefunden|page introuvable|pagina niet gevonden|página no encontrada|pagina non trovata|domain (is )?for sale|buy this domain|this domain (may be|is) for sale|parked free|domain parking|hugedomains|sedo domain|account suspended|site not found|website is currently unavailable|this site can.t be reached)", re.I)
CHALLENGE = re.compile(r"(just a moment|attention required|cf-browser-verification|captcha|access denied|checking your browser|ddos-guard|are you a robot)", re.I)


def collect():
    items = {}

    def add(url, where, name=""):
        url = url.strip().rstrip(".,;")
        if not url.startswith("http") or "localhost" in url or "{" in url:
            return
        items.setdefault(url, {"url": url, "where": [], "name": name})
        if where not in items[url]["where"]:
            items[url]["where"].append(where)
        if name and not items[url]["name"]:
            items[url]["name"] = name

    # links.js (the source directory) with category path
    src = (ROOT / "data" / "links.js").read_text(encoding="utf-8")
    cat = sub = ""
    for line in src.splitlines():
        s = line.strip()
        if s.startswith("# "):
            cat, sub = re.sub(r"\s*\[.*?\]", "", s[2:]).strip(), ""
            continue
        if s.startswith("## "):
            sub = s[3:].strip()
            continue
        if "|" not in s or s.startswith((">", "*", "/")):
            continue
        p = [x.strip() for x in s.split("|")]
        if len(p) < 2 or not p[1].startswith("http"):
            continue
        url, sel = p[1], [x.strip() for x in (p[3] if len(p) > 3 else "").split(",") if x.strip()]
        if "{q}" in url:
            url = url.replace("{q}", quote(SAMPLE.get(sel[0] if sel else "kw", "example"), safe=""))
        add(url, "links: " + cat + (" › " + sub if sub else ""), p[0])
    # every other data file and module
    files = [f for f in (ROOT / "data").glob("*.js") if f.name not in ("links.js", "ports.js", "hs.js")]
    files += [f for f in (ROOT / "assets").glob("*.js")]
    for f in files:
        txt = f.read_text(encoding="utf-8")
        for m in re.finditer(r"https?://[A-Za-z0-9._~:/?#\[\]@!$&'()*+,;=%-]+", txt):
            u = m.group(0).split("'")[0].split('"')[0].rstrip(")\\")
            if re.search(r"(\?|=|&)$", u):
                u = u.rstrip("?&=")  # template prefix; test the page itself
            if re.search(r"\.(png|jpg|svg|json)$|/api/|/v2/|/v0/|arcgisonline|basemaps|tile\.|nominatim|fonts\.g", u):
                continue
            add(u, f.name)
    return list(items.values())


def check(it):
    url = it["url"]
    t0 = time.time()
    res = {"status": None, "final": "", "title": "", "verdict": "", "error": ""}
    try:
        r = requests.get(url, headers=HEAD, timeout=(10, 25), allow_redirects=True, stream=True)
        body = b""
        for chunk in r.iter_content(16384):
            body += chunk
            if len(body) > 200000:
                break
        r.close()
        res["status"], res["final"] = r.status_code, r.url
        text = body.decode(r.encoding or "utf-8", "ignore")
        m = re.search(r"<title[^>]*>(.*?)</title>", text, re.I | re.S)
        res["title"] = re.sub(r"\s+", " ", m.group(1)).strip()[:140] if m else ""
        o, fdom = urlparse(url), urlparse(r.url)
        dom = lambda h: ".".join(h.lower().split(".")[-2:])
        if r.status_code in (404, 410):
            res["verdict"] = "dead"
        elif r.status_code in (401, 403, 406, 429, 451, 503, 999) or (r.status_code < 400 and CHALLENGE.search(res["title"])):
            res["verdict"] = "blocked"
        elif r.status_code >= 400:
            res["verdict"] = "dead" if r.status_code < 500 else "error"
        elif SOFT.search(res["title"]) or SOFT.search(text[:6000]) and len(text) < 6000:
            res["verdict"] = "soft404"
        elif dom(o.netloc) != dom(fdom.netloc):
            res["verdict"] = "moved"
        elif len(o.path.strip("/")) > 1 and fdom.path.strip("/") == "" and not fdom.query:
            res["verdict"] = "moved"  # deep link now lands on the home page
        else:
            res["verdict"] = "ok"
    except requests.exceptions.SSLError as e:
        res["verdict"], res["error"] = "dead", "TLS: " + str(e)[:120]
    except requests.exceptions.ConnectionError as e:
        res["verdict"], res["error"] = "dead", "Connection: " + str(e)[:120]
    except requests.exceptions.Timeout:
        res["verdict"], res["error"] = "error", "Timeout"
    except Exception as e:  # noqa: BLE001
        res["verdict"], res["error"] = "error", type(e).__name__ + ": " + str(e)[:120]
    res["ms"] = int((time.time() - t0) * 1000)
    it.update(res)
    return it


def main():
    limit = int(sys.argv[sys.argv.index("--limit") + 1]) if "--limit" in sys.argv else 0
    items = collect()
    if limit:
        items = items[:limit]
    print(len(items), "URLs")
    with cf.ThreadPoolExecutor(24) as ex:
        out = list(ex.map(check, items))
    # retry errors once, slower
    retry = [x for x in out if x["verdict"] in ("error", "dead") and not x.get("status")]
    for x in retry:
        time.sleep(1)
        check(x)
    out.sort(key=lambda x: (["dead", "soft404", "moved", "error", "blocked", "ok"].index(x["verdict"]), x["url"]))
    rep = ROOT / "reports"
    rep.mkdir(exist_ok=True)
    (rep / "link-audit.json").write_text(json.dumps({"checked": time.strftime("%Y-%m-%d %H:%M UTC", time.gmtime()), "results": out}, indent=1, ensure_ascii=False), encoding="utf-8")
    counts = {}
    for x in out:
        counts[x["verdict"]] = counts.get(x["verdict"], 0) + 1
    md = ["# Link audit " + time.strftime("%Y-%m-%d", time.gmtime()), "", " · ".join(k + ": " + str(v) for k, v in sorted(counts.items())), ""]
    for v in ["dead", "soft404", "moved", "error"]:
        rows = [x for x in out if x["verdict"] == v]
        if not rows:
            continue
        md += ["## " + v + " (" + str(len(rows)) + ")", "", "| Name | URL | Status | Final URL / title / error | Where |", "|---|---|---|---|---|"]
        for x in rows:
            md.append("| %s | %s | %s | %s | %s |" % (x["name"], x["url"], x["status"] or "", (x["final"] if x["final"] != x["url"] else "") + " " + (x["title"] or x["error"]), "; ".join(x["where"])[:80]))
        md.append("")
    (rep / "link-audit.md").write_text("\n".join(md), encoding="utf-8")
    print(counts)


if __name__ == "__main__":
    main()
