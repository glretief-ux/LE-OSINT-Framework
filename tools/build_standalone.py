#!/usr/bin/env python3
"""Build a single-file copy of the site (dist/le-osint-framework.html).

The single file works when opened straight from disk or a USB stick on an
offline / restricted machine: all libraries are inlined, so the search, run
sheets and Toolbox all work without internet (the links themselves of
course need a connection).

Usage:  python tools/build_standalone.py
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent


def read(p):
    return (ROOT / p).read_text(encoding="utf-8")


def build(fragment=False):
    html = read("index.html")
    css = read("assets/style.css")
    html = html.replace('<link rel="stylesheet" href="assets/style.css">', "<style>\n" + css + "\n</style>")
    html = html.replace('<link rel="stylesheet" href="assets/vendor/leaflet.css">', "<style>\n" + read("assets/vendor/leaflet.css") + "\n</style>")
    cdn = {
        "assets/vendor/exifr.full.umd.js": "https://cdn.jsdelivr.net/npm/exifr@7.1.3/dist/full.umd.js",
    }
    for src in ["assets/vendor/exifr.full.umd.js",
                "data/links.js", "data/playbooks.js", "assets/app.js", "assets/toolbox.js", "data/ports.js", "assets/ports.js", "data/hs.js", "assets/hs.js", "data/shipping-lines.js", "assets/lines.js", "assets/vendor/leaflet.js", "assets/flights.js"]:
        tag = '<script src="%s"></script>' % src
        if fragment and src in cdn:
            html = html.replace(tag, '<script src="%s"></script>' % cdn[src])
            continue
        js = read(src).replace("</script>", "<\\/script>")
        html = html.replace(tag, "<script>\n" + js + "\n</script>")
    # embed the suspect profile page so the single file works offline
    import html as _html
    prof = read("profiler.html")
    html = html.replace('src="profiler.html"', 'srcdoc="' + _html.escape(prof, quote=True) + '"')
    if fragment:
        # page content only (used for hosted previews that add their own skeleton)
        title = re.search(r"<title>.*?</title>", html, re.S).group(0)
        links = "\n".join(re.findall(r'<link rel="stylesheet" href="https://fonts[^>]+>', html))
        style = re.search(r"<style>.*?</style>", html, re.S).group(0)
        body = re.search(r"<!--BODY-START-->(.*)</body>", html, re.S).group(1)
        html = "\n".join([title, links, style, body])
    return html


if __name__ == "__main__":
    import sys
    out = ROOT / "dist"
    out.mkdir(exist_ok=True)
    (out / "le-osint-framework.html").write_text(build(), encoding="utf-8")
    print("Wrote", out / "le-osint-framework.html")
    if len(sys.argv) > 1:
        pathlib.Path(sys.argv[1]).write_text(build(fragment=True), encoding="utf-8")
        print("Wrote fragment", sys.argv[1])
