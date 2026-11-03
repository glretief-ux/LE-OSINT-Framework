/* Byte's brain for the LE OSINT Investigation Desk.
   Byte (byte.js) answers FAQs from a keyword list. This file adds two hooks to BYTE_CONFIG:
     brain(q, ctx)          runs first: understands selectors (container, IMO, AWB, flight, VIN ...) and
                            data questions ("how many shipping lines", "port code for Antwerp" ...)
     brainFallback(q, ctx)  runs when no FAQ matched: looks for matching sources in the link database
   Everything is answered from data already in this site (data/*.js, the link database). Nothing is sent
   anywhere. Byte cannot read live tracking status itself (carrier sites do not allow other sites to pull
   their data); it identifies the carrier and opens the right tracking page.
   ctx = { A: make an action button, close: close the chat, ask: ask Byte another question } */
(function () {
  "use strict";
  var C = window.BYTE_CONFIG;
  if (!C) return;
  var W = window, X = null;

  /* ---------------------------------------------------------------- helpers */
  function O() { return W.LE_OSINT || {}; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]; }); }
  function N(s) { return " " + String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim() + " "; }
  function nf(x) { return Number(x).toLocaleString("en"); }
  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  function P(h) { return "<p>" + h + "</p>"; }
  function UL(a) { return "<ul>" + a.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul>"; }
  function R(html, acts) { return { html: html, acts: acts || [] }; }
  function act(label, fn) { return X.A(label, fn); }
  function sh(s, n) { s = String(s || ""); return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, "") + "..." : s; }
  function openUrl(u) { try { var w = W.open(u, "_blank", "noopener"); if (!w) W.location.href = u; } catch (e) { W.location.href = u; } }
  function later(fn) { X.close(true); setTimeout(fn, 100); }
  function goView(v, after) { return function () { later(function () { if (O().showView) O().showView(v); if (after) setTimeout(after, 160); }); }; }
  function toBar(v, t) { return function () { later(function () { if (O().setSelector) O().setSelector(v, t || ""); var i = document.getElementById("cmd-input"); if (i) { try { i.focus({ preventScroll: true }); } catch (e) { /* ignore */ } } }); }; }
  function fill(u, v) { return u.split("{q}").join(encodeURIComponent(v)); }
  function setInput(id, v) { var e = document.getElementById(id); if (e) { e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); e.dispatchEvent(new Event("change", { bubbles: true })); } }
  function setPlural(n, w) { return nf(n) + " " + w + (n === 1 ? "" : "s"); }

  /* ---------------------------------------------------------------- data access (built on first use) */
  var _lines, _ports, _cty, _ccName;
  var TYPE_SHORT = { C: "global container", R: "regional container", F: "feeder / short-sea", V: "ro-ro / vehicle", Q: "reefer / fruit", P: "ferry / ro-pax freight", M: "multipurpose / project" };
  function lines() {
    if (_lines) return _lines;
    var D = W.LE_LINES;
    _lines = !D ? [] : D.rows.map(function (r, i) {
      return { i: i, n: r[0], aka: r[1] || "", scac: r[2] ? r[2].split(/\s+/) : [], pre: r[3] ? r[3].split(/\s+/) : [], ty: r[4], al: r[5], cc: r[6], web: r[7], trk: r[8], stt: r[9], note: r[10] || "" };
    });
    return _lines;
  }
  var ALIAS = { "uk": "GB", "great britain": "GB", "britain": "GB", "england": "GB", "usa": "US", "u s": "US", "america": "US", "holland": "NL", "uae": "AE", "emirates": "AE", "south korea": "KR", "korea": "KR", "russia": "RU", "ivory coast": "CI", "turkey": "TR", "turkiye": "TR", "czechia": "CZ", "czech republic": "CZ", "vietnam": "VN", "burma": "MM" };
  function countries() {
    if (_cty) return _cty;
    var seen = {}, list = []; _ccName = {};
    function add(name, cc) { var k = N(name).trim(); if (!k) return; if (!_ccName[cc]) _ccName[cc] = name; if (seen[k]) return; seen[k] = 1; list.push([k, cc]); }
    if (W.LE_VISAS && W.LE_VISAS.countries) W.LE_VISAS.countries.forEach(function (c) { add(c[1], c[0]); });
    if (W.LE_PORTS && W.LE_PORTS.names) Object.keys(W.LE_PORTS.names).forEach(function (cc) { add(W.LE_PORTS.names[cc], cc); });
    Object.keys(ALIAS).forEach(function (k) { add(k, ALIAS[k]); });
    list.sort(function (a, b) { return b[0].length - a[0].length; });
    return (_cty = list);
  }
  function findCountry(n) {
    var l = countries();
    for (var i = 0; i < l.length; i++) { if (n.indexOf(" " + l[i][0] + " ") > -1) return { cc: l[i][1], name: _ccName[l[i][1]] || l[i][0] }; }
    return null;
  }
  function cname(cc) { countries(); return _ccName[cc] || cc; }
  function ports() {
    if (_ports) return _ports;
    var D = W.LE_PORTS, a = [];
    if (D) {
      D.wpi.forEach(function (r) { a.push({ n: r[0], l: r[1], c: r[2], sz: r[5], ty: r[6], alt: r[12] || "", src: "wpi" }); });
      D.unl.forEach(function (r) { a.push({ n: r[0], l: r[1], c: r[1].slice(0, 2), sz: "", ty: "", alt: "", src: "unl" }); });
      a.forEach(function (p) { p.k = N(p.n + " " + p.alt); });
    }
    return (_ports = a);
  }

  /* ---------------------------------------------------------------- selector checks */
  function checkDigit(s10) {
    var V = {}, v = 10, c, i, sum = 0, ch;
    for (c = 65; c <= 90; c++) { if (v % 11 === 0) v++; V[String.fromCharCode(c)] = v; v++; }
    for (i = 0; i < 10; i++) { ch = s10.charAt(i); sum += (/\d/.test(ch) ? +ch : V[ch]) * Math.pow(2, i); }
    return (sum % 11) % 10;
  }
  function imoValid(d) { if (!/^\d{7}$/.test(d)) return false; var s = 0, i; for (i = 0; i < 6; i++) s += +d.charAt(i) * (7 - i); return s % 10 === +d.charAt(6); }

  /* free, non-restricted sources from the link database that accept a selector type and have a {q} in the URL */
  function leaves(type, max) {
    var L = O().LEAVES || [], out = [], i;
    for (i = 0; i < L.length; i++) {
      var l = L[i];
      if (l.sel.indexOf(type) < 0 || l.url.indexOf("{q}") < 0 || l.url.charAt(0) === "#" || l.flags.indexOf("L") > -1) continue;
      out.push({ l: l, i: i, s: (l.flags.indexOf("R") > -1 ? 1 : 0) + (l.flags.indexOf("A") > -1 ? 1 : 0) + (l.flags.indexOf("D") > -1 ? 1 : 0) });
    }
    out.sort(function (a, b) { return a.s - b.s || a.i - b.i; });
    return out.slice(0, max).map(function (o) { return o.l; });
  }
  function leafLabel(l) { return sh(l.name.replace(/\s*\(.*$/, "") || l.name, 26); }
  function leafActs(type, v, max) { return leaves(type, max).map(function (l) { return act(leafLabel(l), function () { openUrl(fill(l.url, v)); }); }); }

  /* ---------------------------------------------------------------- containers */
  var RX_CONT = /\b([A-Za-z]{3}[UJZujz])[\s-]?(\d{6})[\s-]?(\d)\b/g;
  function carriersFor(code, own) {
    var rows = lines(), out = [], seen = {};
    function add(r) { if (!seen[r.i]) { seen[r.i] = 1; out.push(r); } }
    if (own && own.lines) own.lines.forEach(function (nm) { rows.forEach(function (r) { if (r.n === nm) add(r); }); });
    rows.forEach(function (r) { if (r.pre.indexOf(code) > -1) add(r); });
    out.sort(function (a, b) { return (a.stt ? 1 : 0) - (b.stt ? 1 : 0) || (b.trk ? 1 : 0) - (a.trk ? 1 : 0); });
    return out;
  }
  function contInfo(v) {
    var code = v.slice(0, 4), exp = checkDigit(v.slice(0, 10));
    var own = W.LE_OWNERS && W.LE_OWNERS.find ? W.LE_OWNERS.find(code) : null;
    var cs = carriersFor(code, own), line = null, i;
    for (i = 0; i < cs.length; i++) { if (!cs[i].stt && (cs[i].trk || cs[i].web)) { line = cs[i]; break; } }
    if (!line && cs.length && (cs[0].trk || cs[0].web)) line = cs[0];
    var url = "", deep = false;
    if (line) { url = line.trk || line.web; if (url.indexOf("{q}") > -1) { url = fill(url, v); deep = true; } }
    return { v: v, code: code, ok: exp === +v.charAt(10), exp: exp, own: own, cs: cs, line: line, url: url, deep: deep };
  }
  function shortName(r) { var a = (r.aka || "").split(/[;,\/]/)[0].trim(); return a && a.length <= r.n.length ? a : r.n; }
  function fmtCont(v) { return v.slice(0, 4) + " " + v.slice(4, 10) + " " + v.slice(10); }
  function trackAct(info, label) {
    return act(label, function () { if (!info.deep && O().copy) O().copy(info.v); openUrl(info.url); });
  }
  function searatesAct(v) {
    var l = leaves("cont", 6).filter(function (x) { return /searates/i.test(x.name); })[0];
    return act("Multi-carrier tracker", function () { openUrl(l ? fill(l.url, v) : "https://www.searates.com/container/tracking/?number=" + encodeURIComponent(v)); });
  }
  function answerContainers(list) {
    var infos = list.map(contInfo);
    if (infos.length > 1) {
      var items = infos.map(function (i) {
        return "<b>" + fmtCont(i.v) + "</b>: " + (i.line ? esc(i.line.n) : (i.own ? esc(i.own.owner) + " (" + esc(i.own.type) + ")" : "owner not in my list")) + (i.ok ? "" : ' <b>(check digit wrong)</b>');
      });
      var acts = infos.slice(0, 4).map(function (i) { return i.line ? trackAct(i, "Track " + i.v + " (" + sh(shortName(i.line), 12) + ")") : searatesAct(i.v); });
      return R(P("I found " + infos.length + " container numbers:") + UL(items) + P("Each button opens the carrier's own tracking page (or a multi-carrier tracker when the prefix belongs to a lessor). I copy the number first where the page cannot take it from a link."), acts);
    }
    var i = infos[0], h = P("<b>" + fmtCont(i.v) + "</b>: check digit " + (i.ok ? "<b>valid</b>." : "<b>does not match</b> (it should be " + i.exp + "). The number may be mistyped, or it may not be a genuine container number, which is worth noting in a seizure case."));
    var acts = [];
    if (i.own) {
      h += P("Box owner (BIC register): <b>" + esc(i.own.owner) + "</b>, " + esc(i.own.type) + "." + (i.own.cancelled ? " This owner code is recorded as cancelled (" + esc(i.own.cancelled) + ")." : ""));
    } else if (i.cs.length) {
      h += P("The prefix <b>" + i.code + "</b> is used by <b>" + esc(i.cs[0].n) + "</b>.");
    } else {
      h += P("The prefix <b>" + i.code + "</b> is not in my owner list (the BIC register has the full list).");
    }
    if (i.line) {
      h += P("Carrier: <b>" + esc(i.line.n) + "</b>. " + (i.deep ? "The button opens its tracking page with the number filled in." : "Its tracking page cannot take the number from a link, so the button copies the number first and opens the page: paste it into the box."));
      acts.push(trackAct(i, "Track on " + sh(shortName(i.line), 22)));
      if (i.cs.length > 1) { var o2 = i.cs.filter(function (r) { return r !== i.line && (r.trk || r.web); })[0]; if (o2) { var inf2 = { v: i.v, deep: (o2.trk || o2.web).indexOf("{q}") > -1, url: fill(o2.trk || o2.web, i.v) }; acts.push(trackAct(inf2, "Or " + sh(shortName(o2), 20))); } }
      acts.push(searatesAct(i.v));
    } else {
      h += P("A leasing company owns this box, so the prefix does not say which shipping line is moving it. The bill of lading or booking shows the line. Meanwhile a multi-carrier tracker tries many lines at once.");
      acts.push(searatesAct(i.v));
    }
    acts.push(act("Identify in Shipping lines tab", goView("lines", function () { if (O().linesSearch) O().linesSearch(i.v); })));
    acts.push(act("Search all sources", toBar(i.v, "cont")));
    return R(h, acts);
  }

  /* ---------------------------------------------------------------- other selectors */
  function answerIMO(d, raw) {
    var ok = imoValid(d);
    return R(P("<b>IMO " + d + "</b>: check digit " + (ok ? "<b>valid</b>." : "<b>not valid</b>. It may be mistyped or not a genuine IMO number.")) + P("An IMO number identifies the vessel for life, even if the name or flag changes. These sources take it directly:"),
      leafActs("imo", d, 3).concat([act("Search all sources", toBar(d, "imo"))]));
  }
  function answerMMSI(d) {
    return R(P("<b>MMSI " + d + "</b> is the radio identity a ship broadcasts on AIS. The first three digits are the flag state (MID). These sources take it directly:"), leafActs("mmsi", d, 3).concat([act("Search all sources", toBar(d, "mmsi"))]));
  }
  function answerAWB(d) {
    var pre = d.slice(0, 3), serial = d.slice(3, 11), cd = +serial.slice(0, 7) % 7, ok = cd === +serial.charAt(7);
    var AL = (W.LE_AIRLINES && W.LE_AIRLINES.rows) || [], hit = AL.filter(function (a) { return a[3] === pre; })[0];
    var h = P("<b>AWB " + pre + "-" + serial + "</b>: check digit " + (ok ? "<b>valid</b>." : "<b>not valid</b> (expected " + cd + ")."));
    var acts = [];
    if (hit) {
      h += P("Prefix " + pre + " is <b>" + esc(hit[0]) + "</b> (" + esc(hit[1]) + ", " + esc(cname(hit[4])) + ")" + (hit[5] ? ", status: " + esc(hit[5]) : "") + ".");
      if (hit[6]) { var u = hit[6].replace("{q}", /awbPrefix=/.test(hit[6]) ? serial : pre + serial); acts.push(act("Track on " + sh(hit[0], 20), function () { openUrl(u); })); }
      else h += P("I do not have a verified tracking page for this airline. Try its website, or a cargo tracker that takes any AWB.");
    } else { h += P("I do not have prefix " + pre + " in my airline list."); }
    acts.push(act("Open in Air cargo tab", goView("air", function () { if (O().airSearch) O().airSearch(d); })));
    return R(h, acts);
  }
  function answerFlight(v) {
    return R(P("Looks like a flight number or aircraft registration: <b>" + esc(v) + "</b>. The Flight tracker finds it on the live map; these sources take it directly:"),
      [act("Open live Flight tracker", goView("flights", function () { if (O().flightSearch) O().flightSearch(v); }))].concat(leafActs("flight", v, 2)));
  }
  function answerVIN(v) {
    return R(P("That looks like a 17-character <b>VIN</b>. The Stolen vehicles tab decodes it (maker, country, check digit) and links to national police stolen-vehicle checks."),
      [act("Check VIN: Stolen vehicles tab", goView("stolen", function () { if (O().stolenSearch) O().stolenSearch(v); })), act("Search all sources", toBar(v, "vin"))]);
  }
  function answerBL(num, q) {
    var scac = num.slice(0, 4), rows = lines().filter(function (r) { return r.scac.indexOf(scac) > -1; }), r = rows[0];
    if (!r) return R(P("A bill of lading number usually starts with the carrier's 4-letter SCAC code, but <b>" + esc(scac) + "</b> is not in my list. Tell me the carrier name and I will open its tracking page."), [act("Open Shipping lines tab", goView("lines"))]);
    var url = r.trk || r.web, deep = url.indexOf("{q}") > -1; if (deep) url = fill(url, num);
    return R(P("<b>" + esc(num) + "</b> starts with <b>" + esc(scac) + "</b>, the SCAC of <b>" + esc(r.n) + "</b>. " + (deep ? "The button opens its tracking page with the number filled in." : "The button copies the number and opens its tracking page: paste it into the box.")),
      [act("Track on " + sh(shortName(r), 22), function () { if (!deep && O().copy) O().copy(num); openUrl(url); })]);
  }
  function looksLikeSelector(q) {
    var s = q.trim();
    if (/\s/.test(s) && !/^\+?[\d\s().-]{8,}$/.test(s)) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) || /^(\d{1,3}\.){3}\d{1,3}$/.test(s) || /^https?:\/\//i.test(s) || /^\+\d[\d\s().-]{6,}$/.test(s) ||
      /^(0x[a-fA-F0-9]{40}|(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}|T[1-9A-HJ-NP-Za-km-z]{33})$/.test(s) || /^([a-f0-9]{32}|[a-f0-9]{40}|[a-f0-9]{64})$/i.test(s) || /^@\w{3,}$/.test(s) || /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(s);
  }

  /* ---------------------------------------------------------------- shipping lines */
  var GENERIC = " shipping container lines line ocean network express overseas international company mediterranean maritime marine transport navigation steamship group holding services service logistics freight global world united national atlantic pacific north south east west asia asian europe european american america african africa baltic caribbean nordic gulf sea ferry ferries cargo carrier carriers feeder hamburg orient royal general eastern western southern northern central trading trade lloyd reefer reefers fruit tanker tankers bulk vehicle vehicles project chartering feeders regional alliance alliances container ";
  var _carrIdx, _ctyWords;
  function isCountryWord(w) { if (!_ctyWords) { _ctyWords = {}; countries().forEach(function (c) { c[0].split(" ").forEach(function (x) { _ctyWords[x] = 1; }); }); } return !!_ctyWords[w]; }
  function carrierIndex() {
    if (_carrIdx) return _carrIdx;
    var idx = [];
    lines().forEach(function (r) {
      var seen = {};
      function add(txt, weak) {
        var k = N(txt).trim(); if (!k || seen[k]) return; seen[k] = 1;
        idx.push({ k: k, r: r, w: weak ? 0 : 1, caps: txt === txt.toUpperCase() && /^[A-Z0-9 .&-]+$/.test(txt) ? txt : "" });
      }
      add(r.n);
      r.aka.split(/[;,\/]/).forEach(function (a) { a = a.trim(); if (a) add(a); });
      [r.n].concat(r.aka.split(/[;,\/]/)).forEach(function (t) {
        N(t).trim().split(" ").forEach(function (w) { if (w.length >= 5 && GENERIC.indexOf(" " + w + " ") < 0 && !isCountryWord(w)) add(w, true); });
      });
    });
    return (_carrIdx = idx);
  }
  function findCarrier(n, q, strongOnly) {
    var idx = carrierIndex(), best = null, bl = 0, i;
    for (i = 0; i < idx.length; i++) {
      var e = idx[i], hit = false;
      if (strongOnly && !e.w) continue;
      if (e.k.length >= 4) hit = n.indexOf(" " + e.k + " ") > -1;
      else if (e.caps) hit = new RegExp("(^|[^A-Za-z0-9])" + escRe(e.caps) + "([^A-Za-z0-9]|$)").test(q);
      if (hit) { var sc = e.k.length + e.w * 3 - (e.r.stt ? 2 : 0); if (sc > bl) { bl = sc; best = e.r; } }
    }
    return best;
  }
  function carrierCard(r) {
    var D = W.LE_LINES, al = r.al && D.alliances ? D.alliances[r.al] : "";
    var facts = ["SCAC <b>" + (r.scac.join(", ") || "n/a") + "</b>", "box prefixes <b>" + (r.pre.join(" ") || "n/a") + "</b>", esc(TYPE_SHORT[r.ty] || r.ty), "HQ " + esc(cname(r.cc))];
    var h = P("<b>" + esc(r.n) + "</b>" + (r.aka ? " (" + esc(r.aka) + ")" : "") + (r.stt ? " <b>[" + esc(r.stt) + "]</b>" : "") + ": " + facts.join(" · ") + ".");
    if (al) h += P("Alliance: " + esc(al) + ".");
    if (r.note) h += P(esc(sh(r.note, 260)));
    var a = [];
    var url = r.trk || r.web;
    if (url) a.push(act("Open tracking page", function () { openUrl(url.indexOf("{q}") > -1 ? url.split("{q}").join("") : url); }));
    if (r.web && r.web !== url) a.push(act("Website", function () { openUrl(r.web); }));
    a.push(act("Show in Shipping lines tab", goView("lines", function () { if (O().linesSearch) O().linesSearch(r.n); })));
    h += P("Give me a container or bill of lading number for this line and I will open the right page.");
    return R(h, a);
  }
  function linesOverview(r) {
    var rows = lines(), a = rows.filter(function (x) { return !x.stt; }), m = rows.filter(function (x) { return x.stt === "merged"; }).length, d = rows.filter(function (x) { return x.stt === "defunct"; }).length;
    var by = {}; a.forEach(function (x) { by[x.ty] = (by[x.ty] || 0) + 1; });
    var parts = Object.keys(TYPE_SHORT).filter(function (k) { return by[k]; }).map(function (k) { return "<b>" + by[k] + "</b> " + TYPE_SHORT[k]; });
    return R(P("This directory lists <b>" + rows.length + "</b> ocean carriers: <b>" + a.length + "</b> active, " + m + " merged or rebranded and " + d + " defunct.") +
      P("Active ones by type: " + parts.join(", ") + ".") +
      P("That is this directory's own list, not a census of every shipping company in the world, so I cannot give you a true world total. The " + (by.C || 0) + " global container carriers are the ones to know first."),
      [act("Show the global carriers", goView("lines", function () { if (O().linesSearch) O().linesSearch(""); var b = document.querySelector('#ln-type button[data-ty="C"]'); if (b) b.click(); })), act("Show all lines", goView("lines", function () { if (O().linesSearch) O().linesSearch(""); })), act("Which alliances?", function () { X.ask("which shipping alliances are there"); })]);
  }
  function linesIntent(n, q) {
    var D = W.LE_LINES; if (!D) return null;
    var rows = lines(), act_ = rows.filter(function (x) { return !x.stt; });
    var noun = /\b(shipping lines?|shipping compan\w*|ocean carriers?|container lines?|container carriers?|liner compan\w*|shipping liners?|carriers?|shipowners?|shipping alliances?|alliances?)\b/.test(n) || /\b(reefer|feeder|ferry|ro ro|roro|regional|global|vehicle|car) (lines?|carriers?|operators?|compan\w*)\b/.test(n);
    var air = /\b(air|airline|airlines|flight|awb|airway|aircraft)\b/.test(n);
    var cr = findCarrier(n, q, noun && /\b(how many|number of|count|total|list|which|biggest|largest|top)\b/.test(n));
    if (cr && !air) return carrierCard(cr);
    if (!noun || air) return null;
    var key = null; Object.keys(D.alliances).forEach(function (k) { if (n.indexOf(" " + k.toLowerCase() + " ") > -1 && (k !== "Ocean" || /alliance/.test(n)) && (k !== "MSC" || /alliance/.test(n))) key = k; });
    if (key || /\balliances?\b/.test(n)) {
      if (key) {
        var m = act_.filter(function (x) { return x.al === key; });
        return R(P("<b>" + esc(D.alliances[key]) + "</b>.") + (m.length ? P(m.length + " active line" + (m.length === 1 ? "" : "s") + " in this directory: " + m.map(function (x) { return esc(x.n); }).join(", ") + ".") : ""), [act("Show in Shipping lines tab", goView("lines"))]);
      }
      var al = Object.keys(D.alliances).map(function (k) { return esc(D.alliances[k]) + ": " + setPlural(act_.filter(function (x) { return x.al === k; }).length, "line"); });
      return R(P("The main container alliances in this directory:") + UL(al), [act("Show in Shipping lines tab", goView("lines"))]);
    }
    if (/\b(biggest|largest|top|number one|no 1|first)\b/.test(n)) {
      var rk = function (x) { return /second/i.test(x.note) ? 2 : /third/i.test(x.note) ? 3 : 1; };
      var big = rows.filter(function (x) { return x.ty === "C" && !x.stt && /largest/i.test(x.note); }).sort(function (a, b) { return rk(a) - rk(b); }).slice(0, 4).map(function (x) { return "<b>" + esc(x.n) + "</b>: " + esc(sh(x.note.split(/\.\s/)[0], 120)); });
      if (big.length) return R(P("From this directory's notes (updated " + esc(D.updated) + "):") + UL(big) + P("Rankings move; check a current liner-industry ranking for exact capacity figures."), [act("Show global carriers", goView("lines", function () { if (O().linesSearch) O().linesSearch(""); var b = document.querySelector('#ln-type button[data-ty="C"]'); if (b) b.click(); }))]);
    }
    var cty = findCountry(n);
    if (cty) {
      var cl = act_.filter(function (x) { return x.cc === cty.cc; });
      if (!cl.length) return R(P("I have no active shipping lines headquartered in " + esc(cty.name) + " in this directory."));
      return R(P("<b>" + cl.length + "</b> active shipping line" + (cl.length === 1 ? "" : "s") + " headquartered in " + esc(cty.name) + ":") + UL(cl.slice(0, 10).map(function (x) { return "<b>" + esc(x.n) + "</b> (" + esc(TYPE_SHORT[x.ty]) + ")"; })) + (cl.length > 10 ? P("...and " + (cl.length - 10) + " more in the Shipping lines tab.") : ""), [act("Show in Shipping lines tab", goView("lines"))]);
    }
    var ty = null; [["global", "C"], ["regional", "R"], ["feeder", "F"], ["short sea", "F"], ["ro ro", "V"], ["roro", "V"], ["vehicle", "V"], ["car carrier", "V"], ["reefer", "Q"], ["fruit", "Q"], ["ferry", "P"], ["ferries", "P"], ["multipurpose", "M"], ["project cargo", "M"]].forEach(function (p) { if (n.indexOf(" " + p[0] + " ") > -1) ty = p[1]; });
    if (ty) {
      var tl = act_.filter(function (x) { return x.ty === ty; });
      return R(P("<b>" + tl.length + "</b> active " + TYPE_SHORT[ty] + " lines in this directory" + (/\b(list|which|name|show|who)\b/.test(n) && tl.length <= 16 ? ":" : ".")) + (/\b(list|which|name|show|who)\b/.test(n) && tl.length <= 16 ? UL(tl.map(function (x) { return esc(x.n); })) : ""),
        [act("Show in Shipping lines tab", goView("lines", function () { if (O().linesSearch) O().linesSearch(""); var b = document.querySelector('#ln-type button[data-ty="' + ty + '"]'); if (b) b.click(); }))]);
    }
    return linesOverview();
  }

  /* ---------------------------------------------------------------- ports */
  var SZ = { L: "large", M: "medium", S: "small", VS: "very small" };
  var SZR = { L: 0, M: 1, S: 2, VS: 3, "": 4 };
  function portLine(p) { return "<b>" + esc(p.n) + "</b> <b>" + esc(p.l) + "</b>, " + esc(cname(p.c)) + (p.sz ? ", " + (SZ[p.sz] || "") + " harbour" : "") + (p.ty ? ", " + esc(p.ty.toLowerCase()) : ""); }
  function showPorts(term, cc) { return goView("ports", function () { setInput("pt-country", cc ? cname(cc) : ""); setInput("pt-q", term || ""); }); }
  function portsIntent(n, q) {
    if (!W.LE_PORTS) return null;
    var word = /\b(ports?|harbou?rs?|seaports?|locodes?|un locode|port codes?)\b/.test(n);
    var lc = q.match(/\b[A-Z]{2}[A-Z0-9]{3}\b/);
    if (!word && !(lc && /\b(code|locode)\b/.test(n))) return null;
    if (/\b(airport|airports|iata|icao|flight)\b/.test(n)) return null;
    var all = ports(), cty = findCountry(n);
    if (/\b(how many|number of|count|total)\b/.test(n)) {
      var set = cty ? all.filter(function (p) { return p.c === cty.cc; }) : all, w = set.filter(function (p) { return p.src === "wpi"; }).length;
      return R(P("<b>" + nf(w) + "</b> commercial seaports" + (cty ? " in " + esc(cty.name) : "") + " from the NGA World Port Index, plus <b>" + nf(set.length - w) + "</b> further UN/LOCODE port locations (small harbours, river and inland ports)" + (cty ? "." : " worldwide.")), [act("Open World ports tab", showPorts("", cty && cty.cc))]);
    }
    if (lc) {
      var hit = all.filter(function (p) { return p.l === lc[0]; })[0];
      if (hit) return R(P(portLine(hit) + "."), [act("Open in World ports tab", showPorts(lc[0]))]);
    }
    var name = n.replace(/\b(what|which|where|is|the|a|an|of|in|for|port|ports|harbou?r|harbou?rs|seaports?|code|codes|locode|un|please|find|show|me|give|tell|about|largest|biggest|main|major|list|are|there|do|you|have|i|need|search|lookup|look|up|to|and)\b/g, " ").replace(/\s+/g, " ").trim();
    if (cty) { cty.name.split(/\s+/).forEach(function (w2) { name = name.replace(new RegExp("\\b" + escRe(N(w2).trim()) + "\\b", "g"), " "); }); name = name.replace(/\s+/g, " ").trim(); }
    if (cty && !name) {
      var cp = all.filter(function (p) { return p.c === cty.cc && p.src === "wpi"; }).sort(function (a, b) { return SZR[a.sz] - SZR[b.sz]; }).slice(0, 6);
      if (!cp.length) cp = all.filter(function (p) { return p.c === cty.cc; }).slice(0, 6);
      if (!cp.length) return R(P("I have no ports listed for " + esc(cty.name) + "."));
      return R(P("Largest ports in <b>" + esc(cty.name) + "</b> (World Port Index):") + UL(cp.map(portLine)), [act("Open World ports tab", showPorts("", cty.cc))]);
    }
    if (name.length < 3) return null;
    var k = " " + name + " ", ws = name.split(" ");
    var res = all.filter(function (p) { return cty ? p.c === cty.cc && p.k.indexOf(k) > -1 : p.k.indexOf(k) > -1 || p.l.toLowerCase() === name.replace(/ /g, ""); });
    if (!res.length) res = all.filter(function (p) { return (!cty || p.c === cty.cc) && ws.every(function (w3) { return p.k.indexOf(w3) > -1; }); });
    res.sort(function (a, b) { return (a.src === "wpi" ? 0 : 1) - (b.src === "wpi" ? 0 : 1) || SZR[a.sz] - SZR[b.sz]; });
    if (!res.length) return R(P("I could not find a port called <b>" + esc(name) + "</b>. Try another spelling (ports use local names, e.g. Antwerpen, Wien) or browse by country."), [act("Open World ports tab", showPorts("", cty && cty.cc))]);
    return R(P("Ports matching <b>" + esc(name) + "</b>:") + UL(res.slice(0, 5).map(portLine)) + (res.length > 5 ? P(res.length - 5 + " more in the World ports tab.") : ""), [act("Open in World ports tab", showPorts(name, cty && cty.cc))]);
  }

  /* ---------------------------------------------------------------- airports and airlines */
  function airIntent(n, q) {
    var AP = W.LE_AIRPORTS && W.LE_AIRPORTS.rows, AL = W.LE_AIRLINES && W.LE_AIRLINES.rows;
    var ap = /\b(airports?|iata|icao|airfield)\b/.test(n), al = /\b(airlines?|cargo airlines?|air cargo carriers?|awb prefix|air waybill prefix|prefix)\b/.test(n);
    if (ap && AP) {
      var cty = findCountry(n);
      if (/\b(how many|number of|count|total)\b/.test(n)) {
        var set = cty ? AP.filter(function (r) { return r[4] === cty.cc; }) : AP;
        return R(P("<b>" + nf(set.length) + "</b> airports with an IATA code" + (cty ? " in " + esc(cty.name) : "") + " in this directory (large and medium airports, and smaller ones with scheduled service)."), [act("Open Air cargo tab", goView("air"))]);
      }
      var code = q.match(/\b[A-Z]{3,4}\b/g) || [], hit = null;
      code.forEach(function (c) { if (!hit) hit = AP.filter(function (r) { return r[0] === c || r[1] === c; })[0]; });
      if (hit) return R(P("<b>" + hit[0] + " / " + hit[1] + "</b>: " + esc(hit[2]) + ", " + esc(hit[3]) + ", " + esc(cname(hit[4])) + "."), [act("Open in Air cargo tab", goView("air", function () { if (O().airSearch) O().airSearch(hit[0]); }))]);
      var name = n.replace(/\b(what|which|where|is|the|a|an|of|in|for|airports?|airfield|iata|icao|code|codes|please|find|show|me|give|tell|about|are|there|do|you|have|i|need|search|international|city|to|and)\b/g, " ").replace(/\s+/g, " ").trim();
      if (cty) { cty.name.split(/\s+/).forEach(function (w) { name = name.replace(new RegExp("\\b" + escRe(N(w).trim()) + "\\b", "g"), " "); }); name = name.replace(/\s+/g, " ").trim(); }
      var RK = { L: 0, M: 1, S: 2 };
      var res = AP.filter(function (r) { return (!cty || r[4] === cty.cc) && (!name || N(r[2] + " " + r[3]).indexOf(" " + name + " ") > -1 || N(r[3]).indexOf(" " + name + " ") > -1); });
      if (!res.length && name) res = AP.filter(function (r) { return (!cty || r[4] === cty.cc) && name.split(" ").every(function (w) { return N(r[2] + " " + r[3]).indexOf(w) > -1; }); });
      res.sort(function (a, b) { return RK[a[7]] - RK[b[7]]; });
      if (!res.length) return R(P("I could not find an airport for <b>" + esc(name || (cty && cty.name) || "that") + "</b>. Try the city name or the 3-letter IATA code."), [act("Open Air cargo tab", goView("air"))]);
      return R(P((name ? "Airports matching <b>" + esc(name) + "</b>" : "Largest airports in <b>" + esc(cty.name) + "</b>") + ":") + UL(res.slice(0, 5).map(function (r) { return "<b>" + r[0] + " / " + r[1] + "</b>: " + esc(r[2]) + ", " + esc(r[3]) + ", " + esc(cname(r[4])); })), [act("Open in Air cargo tab", goView("air", function () { if (O().airSearch) O().airSearch(res[0][0]); }))]);
    }
    if (AL && (al || /\b(awb|waybill)\b/.test(n))) {
      if (/\b(how many|number of|count|total)\b/.test(n)) return R(P("<b>" + AL.length + "</b> cargo airlines with AWB prefixes in this directory."), [act("Open Air cargo tab", goView("air"))]);
      var m3 = n.match(/\b(\d{3})\b/);
      if (m3) {
        var h2 = AL.filter(function (a) { return a[3] === m3[1]; });
        return h2.length ? R(P("AWB prefix <b>" + m3[1] + "</b>: " + h2.map(function (a) { return "<b>" + esc(a[0]) + "</b> (" + esc(a[1]) + ", " + esc(cname(a[4])) + ")"; }).join(", ") + "."), [act("Open in Air cargo tab", goView("air", function () { if (O().airSearch) O().airSearch(m3[1]); }))]) : R(P("Prefix " + m3[1] + " is not in my airline list."), [act("Open Air cargo tab", goView("air"))]);
      }
    }
    if (AL) {
      var best = null, bl = 0;
      AL.forEach(function (a) { var k = N(a[0]).trim(), k2 = k.replace(/ (cargo|airlines|airways|air lines|skycargo|sky cargo)$/, ""); [k, k2].forEach(function (c) { if (c.length >= 4 && n.indexOf(" " + c + " ") > -1 && c.length > bl) { bl = c.length; best = a; } }); });
      if (best && /\b(cargo|airline|airlines|awb|prefix|track|tracking|code)\b/.test(n)) {
        var h = P("<b>" + esc(best[0]) + "</b> (" + esc(cname(best[4])) + "): IATA <b>" + esc(best[1]) + "</b>, ICAO <b>" + esc(best[2]) + "</b>, AWB prefix <b>" + esc(best[3]) + "</b>." + (best[7] ? " " + esc(sh(best[7], 180)) : ""));
        var a2 = []; if (best[6]) a2.push(act("Open tracking page", function () { openUrl(best[6].replace("{q}", "")); }));
        a2.push(act("Open in Air cargo tab", goView("air", function () { if (O().airSearch) O().airSearch(best[3]); })));
        return R(h + P("Give me an AWB number for this airline and I will check it and open the tracker."), a2);
      }
    }
    return null;
  }

  /* ---------------------------------------------------------------- HS codes */
  var STOP = " what which where is the a an of in for to and or code codes hs tariff customs commodity harmonised harmonized system number numbers find show me give tell about please do you have i need search lookup look up classify classification under falls fall goes go how are there with ";
  function words(n) { return n.trim().split(" ").filter(function (w) { return w.length > 2 && STOP.indexOf(" " + w + " ") < 0; }); }
  function hsRow(r) { return "<b>" + r[0] + "</b>: " + esc(sh(r[1], 140)); }
  function hsIntent(n, q) {
    var D = W.LE_HS; if (!D) return null;
    if (!/\b(hs|harmoni[sz]ed|tariff|customs codes?|commodity codes?|hs codes?)\b/.test(n)) return null;
    var rows = D.rows;
    if (/\b(how many|number of|count|total)\b/.test(n)) {
      var c2 = rows.filter(function (r) { return r[0].length === 2; }).length, c4 = rows.filter(function (r) { return r[0].length === 4; }).length, c6 = rows.filter(function (r) { return r[0].length === 6; }).length;
      return R(P("The HS 2022 list here has <b>" + nf(rows.length) + "</b> entries: <b>" + c2 + "</b> chapters, <b>" + nf(c4) + "</b> headings and <b>" + nf(c6) + "</b> six-digit subheadings. Countries add their own further digits for national tariffs."), [act("Open HS codes tab", goView("hs"))]);
    }
    var dm = q.match(/\b(\d{2,10})(?:[.\s](\d{2}))?(?:[.\s](\d{2}))?\b/);
    var digits = dm ? (dm[1] + (dm[2] || "") + (dm[3] || "")) : "";
    if (digits.length >= 2) {
      var d6 = digits.slice(0, 6), r = rows.filter(function (x) { return x[0] === d6; })[0] || rows.filter(function (x) { return x[0] === digits.slice(0, 4); })[0] || rows.filter(function (x) { return x[0] === digits.slice(0, 2); })[0];
      if (r) {
        var kids = rows.filter(function (x) { return x[0].length > r[0].length && x[0].indexOf(r[0]) === 0 && x[0].length <= r[0].length + 2; }).slice(0, 4);
        return R(P("HS <b>" + r[0] + "</b>: " + esc(r[1]) + "." + (digits.length > r[0].length ? " (Only the first " + r[0].length + " digits are international; the rest are national.)" : "")) + (kids.length ? P("Includes:") + UL(kids.map(hsRow)) : ""), [act("Open in HS codes tab", goView("hs", function () { if (O().hsSearch) O().hsSearch(r[0]); }))]);
      }
    }
    var w = words(n);
    if (!w.length) return null;
    var res = rows.filter(function (r) { var d = r[1].toLowerCase(); return w.every(function (x) { return d.indexOf(x.replace(/s$/, "")) > -1; }); });
    res.sort(function (a, b) { return (b[0].length === 6) - (a[0].length === 6) || a[0].length - b[0].length; });
    var six = res.filter(function (r) { return r[0].length >= 4; });
    var top = (six.length ? six : res).slice(0, 5);
    if (!top.length) return R(P("I found no HS entry containing all of: <b>" + esc(w.join(", ")) + "</b>. Try a simpler or more general word."), [act("Open HS codes tab", goView("hs"))]);
    return R(P("HS codes matching <b>" + esc(w.join(" ")) + "</b>:") + UL(top.map(hsRow)) + P("Check the notes of the chapter before you classify goods; the description alone is not a legal ruling."), [act("Open in HS codes tab", goView("hs", function () { if (O().hsSearch) O().hsSearch(w.join(" ")); }))]);
  }

  /* ---------------------------------------------------------------- precursors */
  var DRUGW = [["heroin", "HER"], ["cocaine", "COC"], ["crack", "COC"], ["methamphetamine", "METH"], ["meth", "METH"], ["crystal meth", "METH"], ["amphetamine", "AMP"], ["speed", "AMP"], ["mdma", "MDMA"], ["ecstasy", "MDMA"], ["mda", "MDMA"], ["fentanyl", "FEN"], ["lsd", "LSD"], ["methaqualone", "MQ"], ["pcp", "PCP"], ["cathinone", "MCAT"], ["mephedrone", "MCAT"], ["ghb", "GHB"]];
  function precursorIntent(n, q) {
    var D = W.LE_PRECURSORS; if (!D) return null;
    var rows = D.rows, word = /\bprecursors?\b/.test(n), cas = q.match(/\b\d{2,7}-\d{2}-\d\b/);
    var tl = function (r) { return r[2] === "S" ? "not in Tables I/II (monitored or special surveillance)" : "Table " + r[2] + " of the 1988 Convention"; };
    if (cas) {
      var rc = rows.filter(function (r) { return r[3] === cas[0]; })[0];
      if (rc) return precCard(rc, tl, D);
      if (word || /\bcas\b/.test(n)) return R(P("CAS <b>" + cas[0] + "</b> is not in my precursor list (Tables I and II plus special surveillance substances). That does not mean it is uncontrolled: check national and EU lists too."), [act("Open Precursors tab", goView("precursors"))]);
    }
    if (word && /\b(how many|number of|count|total)\b/.test(n)) {
      var t1 = rows.filter(function (r) { return r[2] === "I"; }).length, t2 = rows.filter(function (r) { return r[2] === "II"; }).length, s = rows.length - t1 - t2;
      return R(P("<b>" + rows.length + "</b> substances in the Precursors tab: <b>" + t1 + "</b> in Table I, <b>" + t2 + "</b> in Table II and " + s + " other monitored substances. Status as of " + esc(D.updated) + "."), [act("Open Precursors tab", goView("precursors"))]);
    }
    var dr = null; DRUGW.forEach(function (p) { if (n.indexOf(" " + p[0] + " ") > -1 && !dr) dr = p; });
    if (dr && (word || /\b(make|made|produce|manufacture|synthesi[sz]e|used)\b/.test(n))) {
      var m = rows.filter(function (r) { return r[6].indexOf(dr[1]) > -1; });
      if (m.length) return R(P("<b>" + m.length + "</b> listed precursors are used to make " + esc(D.drugs[dr[1]] || dr[0]).toLowerCase() + ":") + UL(m.slice(0, 8).map(function (r) { return "<b>" + esc(r[0]) + "</b> (" + (r[2] === "S" ? "monitored" : "Table " + r[2]) + ")"; })) + (m.length > 8 ? P("...and " + (m.length - 8) + " more in the Precursors tab.") : ""), [act("Open Precursors tab", goView("precursors", function () { if (O().precursorSearch) O().precursorSearch(dr[0]); }))]);
    }
    var best = null, bl = 0;
    rows.forEach(function (r) { [r[0]].concat(String(r[1] || "").split(/[;,]/)).forEach(function (nm) { var k = N(nm).trim(); if (k.length >= 5 && n.indexOf(" " + k + " ") > -1 && k.length > bl) { bl = k.length; best = r; } }); });
    if (best) return precCard(best, tl, D);
    return null;
  }
  function precCard(r, tl, D) {
    var uses = r[6].map(function (c) { return D.drugs[c] || c; }).join(", ");
    return R(P("<b>" + esc(r[0]) + "</b>" + (r[1] ? " (" + esc(sh(r[1], 80)) + ")" : "") + ": <b>" + tl(r) + "</b>" + (r[5] ? ", controlled since " + esc(r[5]) : "") + ".") +
      P("CAS <b>" + esc(r[3] || "n/a") + "</b> · HS <b>" + esc(r[4] || "n/a") + "</b>" + (uses ? " · used to make: " + esc(uses) : "") + ".") + (r[8] ? P(esc(sh(r[8], 220))) : ""),
      [act("Open in Precursors tab", goView("precursors", function () { if (O().precursorSearch) O().precursorSearch(r[0]); }))]);
  }

  /* ---------------------------------------------------------------- sources in the link database */
  var SELW = [["email", /\b(e mail|emails?|mail addresses?)\b/, "email addresses"], ["phone", /\b(phone|telephone|mobile|msisdn|phone numbers?)\b/, "phone numbers"], ["user", /\b(usernames?|handles?|social media|telegram|instagram|tiktok|snapchat|twitter|facebook)\b/, "usernames and handles"], ["domain", /\b(domains?|websites?|whois|dns)\b/, "domains"], ["ip", /\bip( address(es)?)?\b/, "IP addresses"], ["cont", /\bcontainers?\b/, "container numbers"], ["imo", /\bimo\b/, "IMO numbers"], ["vessel", /\b(vessels?|ships?|boats?)\b/, "vessels"], ["mmsi", /\bmmsi\b/, "MMSI numbers"], ["flight", /\b(flights?|planes?)\b/, "flights"], ["reg", /\b(registrations?|tail numbers?)\b/, "aircraft registrations"], ["vin", /\b(vin|chassis)\b/, "VIN numbers"], ["crypto", /\b(crypto\w*|bitcoin|wallets?|ethereum|tron|usdt)\b/, "crypto wallets"], ["hash", /\b(hash|hashes|md5|sha256?)\b/, "file hashes"], ["img", /\b(images?|photos?|pictures?|reverse image|faces?)\b/, "images"], ["url", /\burls?\b/, "URLs"], ["org", /\b(compan(y|ies)|businesses|org|organisations?|organizations?|directors?)\b/, "companies"], ["name", /\b(persons?|people|names?)\b/, "person names"], ["cve", /\bcves?\b/, "CVE ids"]];
  function srcLine(l) {
    var f = l.flags.map(function (x) { return x === "$" ? "" : x; }).join("");
    return "<b>" + esc(l.name) + "</b>" + (l.note ? ": " + esc(sh(l.note, 90)) : "") + (f ? " [" + esc(f) + "]" : "");
  }
  function openLeaf(l, v) { return act(leafLabel(l), function () { if (l.url.charAt(0) === "#") { X.close(true); return; } var u = v && l.url.indexOf("{q}") > -1 ? fill(l.url, v) : l.url.indexOf("{q}") > -1 ? (function () { try { return new URL(l.url.split("{q}").join("")).origin + "/"; } catch (e) { return l.url.split("{q}").join(""); } })() : l.url; openUrl(u); }); }
  function sourcesIntent(n, q) {
    var L = O().LEAVES; if (!L) return null;
    var word = /\b(sources?|sites?|tools?|links?|websites?|databases?|resources?)\b/.test(n), cnt = /\b(how many|number of|count|total)\b/.test(n);
    if (cnt && /\b(sources?|links?|sites?|tools?|resources?)\b/.test(n)) {
      var sel = null; SELW.forEach(function (p) { if (!sel && p[1].test(n)) sel = p; });
      if (sel) {
        var m = L.filter(function (l) { return l.sel.indexOf(sel[0]) > -1; });
        return R(P("<b>" + m.length + "</b> sources in this desk accept " + sel[2] + ". Paste one into the search bar and they all open with it filled in."), [act("Go to the search bar", function () { later(function () { var i = document.getElementById("cmd-input"); if (i) i.focus(); }); })]);
      }
      var tot = L.length, lo = L.filter(function (l) { return l.flags.indexOf("L") > -1; }).length, rg = L.filter(function (l) { return l.flags.indexOf("R") > -1; }).length;
      return R(P("<b>" + nf(tot) + "</b> sources in total, all free. " + nf(lo) + " are for law enforcement or government accounts only, and " + nf(rg) + " need a free login.") + P("The top-left box of the flow chart shows the total per line of enquiry."), [act("Open the flow chart", goView("flow"))]);
    }
    var ctyS = !cnt && (word || /\b(where can i|where do i|where to|is there (a|any)|do you have (any|a))\b/.test(n)) ? findCountry(n) : null;
    if (ctyS) {
      var cn = N(ctyS.name), inC = L.filter(function (l) { return l.path.length && N(l.path[0].replace(/\s*\[.*\]/, "")) === cn; });
      if (inC.length) {
        var tw = words(n).filter(function (x) { return x.length > 3 && " source sources site sites tool tools link links website websites database databases resource resources where can find check search verify trace identify ".indexOf(" " + x + " ") < 0 && !isCountryWord(x); }).map(function (x) { return x.slice(0, Math.max(4, x.length - 3)); });
        var ft = tw.length ? inC.filter(function (l) { var h = N(l.name + " " + l.note); return tw.some(function (x) { return h.indexOf(x) > -1; }); }) : inC;
        var shown = (ft.length ? ft : inC).slice(0, 6);
        return R(P((ft.length || !tw.length ? "" : "Nothing matched exactly, but ") + "<b>" + inC.length + "</b> sources for <b>" + esc(ctyS.name) + "</b>" + (ft.length && tw.length ? ", <b>" + ft.length + "</b> matching:" : ":")) + UL(shown.map(srcLine)) + (inC.length > shown.length ? P("The rest are under By country in the flow chart or source list.") : ""),
          shown.slice(0, 3).map(function (l) { return openLeaf(l, ""); }).concat([act("Open the source list", goView("desk"))]));
      }
    }
    if (word && /\b(for|to|that|which|can|check|find|search|look|trace|identify|verify|investigate)\b/.test(n)) {
      var sel2 = null; SELW.forEach(function (p) { if (!sel2 && p[1].test(n)) sel2 = p; });
      if (sel2) {
        var m2 = L.filter(function (l) { return l.sel.indexOf(sel2[0]) > -1 && l.flags.indexOf("L") < 0; });
        var plain = m2.filter(function (l) { return l.flags.indexOf("R") < 0 && l.flags.indexOf("A") < 0 && l.flags.indexOf("D") < 0; });
        var show = (plain.length >= 4 ? plain : m2).slice(0, 5);
        return R(P("<b>" + m2.length + "</b> sources accept " + sel2[2] + ". A few without login:") + UL(show.map(srcLine)) + P("Paste the value into the search bar and every one of them opens with it filled in. Flags: A may alert the subject, R free login, D dork, P privacy caution."),
          show.slice(0, 3).map(function (l) { return openLeaf(l, ""); }).concat([act("Go to the search bar", function () { later(function () { var i = document.getElementById("cmd-input"); if (i) i.focus(); }); })]));
      }
    }
    return null;
  }
  var SEEK = /\b(sourc|site|tool|databas|registr|register|list|where|find|check|search|look|verif|trace|identif|investigat|osint|link|websit|api\b|map\b|track|record)/;
  function sourceFallback(n) {
    var L = O().LEAVES; if (!L || !SEEK.test(n)) return null;
    var w = words(n).filter(function (x) { return x.length > 3 && " info information about data record records source sources site sites tool tools website websites database databases registry register where can find check search verify trace identify ".indexOf(" " + x + " ") < 0; }).map(function (x) { return x.replace(/s$/, ""); }); if (!w.length) return null;
    var sc = [];
    L.forEach(function (l, i) {
      var hay = N(l.name + " " + l.note + " " + l.path.join(" ")), name = N(l.name), s = 0, nh = 0;
      w.forEach(function (x) { if (name.indexOf(x) > -1) { s += 3; nh++; } else if (hay.indexOf(x) > -1) s += 1; });
      if (nh > 0 || (w.length > 1 && s >= 2)) sc.push({ l: l, s: s, i: i });
    });
    sc.sort(function (a, b) { return b.s - a.s || a.i - b.i; });
    if (!sc.length) return null;
    var top = sc.slice(0, 5).map(function (o) { return o.l; });
    return R(P("I do not have a ready answer, but these sources in the desk look relevant to <b>" + esc(w.join(" ")) + "</b>:") + UL(top.map(srcLine)), top.slice(0, 3).map(function (l) { return openLeaf(l, ""); }).concat([act("Filter the source list", function () { later(function () { var f = document.getElementById("cmd-input"); if (O().showView) O().showView("desk"); }); })]));
  }

  /* ---------------------------------------------------------------- the brain */
  var INTRO = P("I am Byte. I am not a live AI model, but I know the data built into this desk and I can act on it. Try:") +
    UL(["Paste a <b>container number</b> (for example MSCU1234566): I check it, find the carrier and open its tracking page.", "A <b>B/L</b>, <b>IMO</b>, <b>AWB</b>, <b>flight</b> or <b>VIN</b>: I send it to the right tool.", "\"How many shipping lines are there?\" or \"Which lines are in the Gemini alliance?\"", "\"Port code for Antwerp\", \"Airport code for Brussels\", \"Which airline is AWB prefix 176?\"", "\"HS code for cocaine\" or \"Is acetic anhydride a precursor?\"", "\"Which sources can check a Telegram username?\""]) +
    P("I cannot read live tracking status myself (carrier sites do not allow that), so I open the right page for you.");

  C.brain = function (q, ctx) {
    X = ctx; q = String(q || "").trim(); if (!q) return null;
    var n = N(q), m;
    if (/\b(what can you do|what do you do|who are you|what are you|are you (an )?ai|are you a bot|your abilities|capabilities|what (can|should) i ask|example questions|what do you know)\b/.test(n)) return R(INTRO, [act("Where do I start?", function () { X.ask("where do i start"); })]);

    /* containers: one or several numbers */
    var conts = [], cm; RX_CONT.lastIndex = 0;
    while ((cm = RX_CONT.exec(q)) !== null && conts.length < 5) { var cv = (cm[1] + cm[2] + cm[3]).toUpperCase(); if (conts.indexOf(cv) < 0) conts.push(cv); }
    if (conts.length) return answerContainers(conts);
    /* bill of lading / booking numbers */
    if (/\b(b\/l|bl|bol|bill of lading|booking|waybill number)\b/i.test(q) || /\bb\/l\b/i.test(q)) {
      m = q.match(/\b([A-Za-z]{4}[A-Za-z0-9]{5,16})\b/g);
      var cand = (m || []).filter(function (x) { return /\d/.test(x); })[0];
      if (cand) return answerBL(cand.toUpperCase(), q);
    }
    /* IMO, MMSI */
    m = q.match(/\bIMO[\s:#-]*(\d{7})\b/i);
    if (m) return answerIMO(m[1], q);
    m = q.match(/\b(\d{7})\b/);
    if (m && imoValid(m[1]) && /\b(vessel|ship|imo|boat|tanker|freighter)\b/.test(n)) return answerIMO(m[1], q);
    m = q.match(/\b(\d{9})\b/);
    if (m && /\b(mmsi|ais|vessel|ship)\b/.test(n)) return answerMMSI(m[1]);
    /* air waybill */
    m = q.match(/\b(\d{3})[\s-]?(\d{4})[\s-]?(\d{4})\b/);
    if (m && (/\b(awb|air waybill|airway|waybill|air cargo|air freight|cargo)\b/.test(n) || /^[\d\s-]+$/.test(q))) return answerAWB(m[1] + m[2] + m[3]);
    /* VIN */
    m = q.match(/\b([A-HJ-NPR-Za-hj-npr-z0-9]{17})\b/);
    if (m && /\d/.test(m[1]) && /[a-z]/i.test(m[1])) return answerVIN(m[1].toUpperCase());
    /* flights and aircraft */
    m = q.match(/\b([A-Za-z][A-Za-z0-9]|[A-Za-z0-9][A-Za-z])\s?(\d{2,4}[A-Za-z]?)\b/);
    if (m && /\b(flight|plane|aircraft|airplane|callsign)\b/.test(n) && !/\b(container|vessel|ship)\b/.test(n) && " in on at by to of or is it as if no so up us we be do my ".indexOf(" " + m[1].toLowerCase() + " ") < 0) return answerFlight((m[1] + m[2]).toUpperCase());
    if (/^[A-Za-z]{2}\d{2,4}$/.test(q) && /[A-Za-z]/.test(q.slice(0, 2))) return answerFlight(q.toUpperCase());
    m = q.match(/\b(N\d{1,5}[A-Z]{0,2}|[A-Z]{1,2}-[A-Z0-9]{3,5})\b/);
    if (m && /\b(aircraft|plane|registration|tail|reg)\b/.test(n)) return answerFlight(m[1]);

    /* track / find a container without giving the number */
    if (/\b(track|trace|find|locate|where is|follow|status of|check|look up)\b/.test(n) && /\b(container|shipment|box|cargo|bill of lading|b l|consignment|vessel|ship)\b/.test(n) && !/\b(how many|which|list)\b/.test(n))
      return R(P("Yes. Send me the number and I will do the rest:") + UL(["<b>Container</b>: 4 letters + 7 digits, e.g. MSCU1234566. I check the number, identify the owner and carrier and open the carrier's tracking page.", "<b>Bill of lading</b>: say \"B/L MAEU123456789\" and I find the carrier from its SCAC code.", "<b>Vessel</b>: give the IMO number (\"IMO 9074729\") or MMSI.", "<b>Air cargo</b>: the 11-digit AWB, e.g. 176-12345675."]), [act("Go to the search bar", function () { X.close(true); setTimeout(function () { var i = document.getElementById("cmd-input"); if (i) i.focus(); }, 100); })]);

    /* data questions */
    var r = linesIntent(n, q) || portsIntent(n, q) || airIntent(n, q) || hsIntent(n, q) || precursorIntent(n, q) || sourcesIntent(n, q);
    if (r) return r;

    /* "where can I find / is there a source for ..." */
    if (/\b(where can i|where do i|where to|is there (a|any)|are there (any )?|do you have (any|a)|any (source|site|tool|database|registry)|which (source|site|tool|database|registry|website)s?)\b/.test(n)) { var sf = sourceFallback(n); if (sf) return sf; if (!findCountry(n)) return R(P("I could not find a source for that in the desk. Browse the lines of enquiry in the flow chart, or filter the source list with a keyword."), [act("Open the flow chart", goView("flow")), act("Open the source list", goView("desk"))]); }

    /* a 4-letter code: owner prefix or SCAC */
    m = q.match(/\b([A-Z]{3}[UJZ]|[A-Z]{4})\b/);
    if (m && /\b(who|owner|owns|prefix|scac|code|belongs?|line|carrier)\b/.test(n)) {
      var code = m[1], own = W.LE_OWNERS && W.LE_OWNERS.find ? W.LE_OWNERS.find(code) : null, cs = carriersFor(code, own);
      var sc = lines().filter(function (x) { return x.scac.indexOf(code) > -1; });
      var row = cs[0] || sc[0];
      if (row) return carrierCard(row);
      if (own) return R(P("<b>" + code + "</b> is registered to <b>" + esc(own.owner) + "</b> (" + esc(own.type) + "). That is a leasing company, so it does not say which line carries the box." + (own.note ? " " + esc(own.note) : "")), [act("Open Shipping lines tab", goView("lines", function () { if (O().linesSearch) O().linesSearch(code); }))]);
    }

    /* a bare UN/LOCODE (for example BEANR) */
    m = q.match(/\b([A-Z]{2}[A-Z0-9]{3})\b/);
    if (m && W.LE_PORTS && n.trim().split(" ").length <= 5) {
      var pl = ports().filter(function (p) { return p.l === m[1]; })[0];
      if (pl) return R(P(portLine(pl) + "."), [act("Open in World ports tab", showPorts(m[1]))]);
    }

    /* a lone selector: hand it to the search bar */
    if (looksLikeSelector(q)) return R(P("That looks like a selector. The search bar detects its type and lists every source that accepts it, with the value already filled in."), [act("Search all sources", toBar(q, ""))]);
    return null;
  };

  C.brainFallback = function (q, ctx) {
    X = ctx;
    try { return sourceFallback(N(q)); } catch (e) { return null; }
  };

  /* updated chips and note */
  C.starters = [["Where do I start?", "where do i start"], ["Track a container", "track a container"], ["How many shipping lines?", "how many shipping lines are in the world"], ["Find a port code", "port code for antwerp"], ["What can you do?", "what can you do"], ["What do the flags mean?", "flags"]];
  C.note = "I'm not a live AI. I answer from the data built into this site and open the right tools and tracking pages for you. Check the legal basis for every search before you run it.";
  C.placeholder = "Ask, or paste a container number, IMO, AWB...";
})();
