/* LE OSINT Framework: stolen vehicle / VIN check tab */
(function () {
  "use strict";
  const D = window.LE_STOLEN;
  const host = document.getElementById("stolen");
  if (!D || !host) return;
  const $ = function (s, r) { return (r || document).querySelector(s); };
  const esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]; }); };
  let dn = null; try { dn = new Intl.DisplayNames(["en"], { type: "region" }); } catch (e) { /* older browser */ }
  function cname(cc) { try { return (dn && dn.of(cc)) || cc; } catch (e) { return cc; } }
  const LS = function (k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } };

  // ---------- VIN decoding (ISO 3779 / 3780; check digit per US 49 CFR 565) ----------
  const ORDER = "ABCDEFGHJKLMNPRSTUVWXYZ1234567890";
  const RANGES = [ // [from, to, country] on the first two characters
    ["AA", "AH", "South Africa"], ["JA", "J0", "Japan"], ["KL", "KR", "South Korea"], ["LA", "L0", "China"],
    ["MA", "ME", "India"], ["MF", "MK", "Indonesia"], ["ML", "MR", "Thailand"], ["NL", "NR", "Turkey"],
    ["PA", "PE", "Philippines"], ["PL", "PR", "Malaysia"], ["RF", "RK", "Taiwan"],
    ["SA", "SM", "United Kingdom"], ["SN", "ST", "Germany"], ["SU", "SZ", "Poland"],
    ["TA", "TH", "Switzerland"], ["TJ", "TP", "Czech Republic"], ["TR", "TV", "Hungary"], ["TW", "T1", "Portugal"],
    ["U5", "U7", "Slovakia"], ["UU", "UZ", "Romania"],
    ["VA", "VE", "Austria"], ["VF", "VR", "France"], ["VS", "VW", "Spain"], ["VX", "V2", "Serbia / former Yugoslavia"],
    ["WA", "W0", "Germany"], ["XL", "XR", "Netherlands"], ["XS", "XW", "Russia / former USSR"], ["X3", "X0", "Russia"],
    ["YA", "YE", "Belgium"], ["YF", "YK", "Finland"], ["YS", "YW", "Sweden"], ["ZA", "ZR", "Italy"],
    ["1A", "10", "United States"], ["2A", "20", "Canada"], ["3A", "3W", "Mexico"], ["4A", "40", "United States"], ["5A", "50", "United States"],
    ["6A", "6W", "Australia"], ["7A", "7E", "New Zealand"], ["8A", "8E", "Argentina"], ["8X", "82", "Venezuela"], ["9A", "9E", "Brazil"], ["93", "99", "Brazil"]
  ];
  const REGION = function (c) { return "ABCDEFGH".indexOf(c) > -1 ? "Africa" : "JKLMNPR".indexOf(c) > -1 ? "Asia" : "STUVWXYZ".indexOf(c) > -1 ? "Europe" : "12345".indexOf(c) > -1 ? "North America" : "67".indexOf(c) > -1 ? "Oceania" : "89".indexOf(c) > -1 ? "South America" : ""; };
  const WMI = {
    WVG: "Volkswagen SUV", WV3: "Volkswagen truck", W1T: "Mercedes-Benz truck", WDF: "Mercedes-Benz van", WAP: "Alpina", VF6: "Renault Trucks", VXK: "Opel (Stellantis)", VSX: "Opel Spain", NMB: "Mercedes-Benz Turkey", YV3: "Volvo bus", YS4: "Scania bus", TMT: "Tatra", U6Y: "Kia Slovakia", ZGU: "Moto Guzzi", ZD4: "Aprilia", SAD: "Jaguar SUV", SFA: "Ford UK", JTM: "Toyota SUV", JTJ: "Lexus SUV", KNE: "Kia Europe", LVV: "Chery", LGW: "Great Wall", LPS: "Polestar", LSG: "SAIC General Motors",
    WVW: "Volkswagen", WV1: "Volkswagen commercial", WV2: "Volkswagen bus/van", WAU: "Audi", WUA: "Audi Sport", WBA: "BMW", WBS: "BMW M", WBY: "BMW i", WMW: "MINI", WDB: "Mercedes-Benz", WDD: "Mercedes-Benz", W1K: "Mercedes-Benz", W1N: "Mercedes-Benz SUV", WDC: "Mercedes-Benz SUV", W1V: "Mercedes-Benz van", WP0: "Porsche", WP1: "Porsche SUV", W0L: "Opel", W0V: "Opel", WF0: "Ford Germany", WME: "smart", WMA: "MAN", WKK: "Setra / Kässbohrer",
    VF1: "Renault", VF3: "Peugeot", VF7: "Citroën", VR3: "Peugeot", VR7: "Citroën", VR1: "DS", VNK: "Toyota France", VSS: "SEAT", VS6: "Ford Spain", VSK: "Nissan Spain", VWV: "Volkswagen Spain",
    ZFA: "Fiat", ZAR: "Alfa Romeo", ZLA: "Lancia", ZFF: "Ferrari", ZHW: "Lamborghini", ZAM: "Maserati", ZCF: "Iveco", ZAP: "Piaggio", ZDM: "Ducati",
    SAL: "Land Rover", SAJ: "Jaguar", SCC: "Lotus", SCF: "Aston Martin", SCB: "Bentley", SCA: "Rolls-Royce", SAR: "Rover / MG", SB1: "Toyota UK", SFD: "Alexander Dennis", SJN: "Nissan UK", SHH: "Honda UK", SMT: "Triumph",
    TMB: "Škoda", TMA: "Hyundai Czech", TRU: "Audi Hungary", TSM: "Suzuki Hungary", U5Y: "Kia Slovakia", UU1: "Dacia", YV1: "Volvo cars", YV4: "Volvo SUV", YV2: "Volvo trucks", YS3: "Saab", YS2: "Scania", XLR: "DAF", XTA: "Lada (AvtoVAZ)", X7L: "Renault Russia", NMT: "Toyota Turkey", NM0: "Ford Turkey", NLH: "Hyundai Turkey",
    JTD: "Toyota", JTE: "Toyota", JTN: "Toyota", JT2: "Toyota", JTH: "Lexus", JHM: "Honda", JHL: "Honda", JN1: "Nissan", JN8: "Nissan SUV", JMZ: "Mazda", JM1: "Mazda", JF1: "Subaru", JS1: "Suzuki motorcycle", JS3: "Suzuki", JMB: "Mitsubishi", JA3: "Mitsubishi", JYA: "Yamaha", JKA: "Kawasaki",
    KMH: "Hyundai", KNA: "Kia", KND: "Kia SUV", KNM: "Renault Samsung", KL1: "GM Korea", KPT: "SsangYong / KGM",
    LSV: "SAIC Volkswagen", LFV: "FAW-Volkswagen", LRW: "Tesla Shanghai", LBV: "BMW Brilliance", LGX: "BYD", LC0: "BYD", LJ1: "JAC", LVS: "Ford China", LSJ: "SAIC MG", LB3: "Geely", LYV: "Volvo China", L6T: "Geely",
    MA3: "Maruti Suzuki (India)", MBJ: "Toyota Kirloskar (India)", MAJ: "Ford India", MAK: "Honda India", MEE: "Renault India", MBH: "Suzuki India", MCA: "FCA India (Fiat / Jeep)", MZB: "Kia India", MAL: "Hyundai India", MAT: "Tata", MA1: "Mahindra", MRH: "Honda Thailand", MR0: "Toyota Thailand", MNT: "Nissan Thailand",
    "1FA": "Ford", "1FT": "Ford truck", "1FM": "Ford SUV", "1G1": "Chevrolet", "1GC": "Chevrolet truck", "1GN": "Chevrolet SUV", "1GT": "GMC truck", "1G6": "Cadillac", "1C4": "Jeep / Chrysler", "1C6": "Ram", "1J4": "Jeep", "1HG": "Honda USA", "1N4": "Nissan USA", "1HD": "Harley-Davidson", "2T1": "Toyota Canada", "2HG": "Honda Canada", "2C3": "Chrysler Canada", "3VW": "Volkswagen Mexico", "3FA": "Ford Mexico", "3N1": "Nissan Mexico", "3GN": "GM Mexico", "4T1": "Toyota USA", "4S4": "Subaru USA", "4JG": "Mercedes-Benz USA", "5YJ": "Tesla", "7SA": "Tesla", "5UX": "BMW USA", "5N1": "Nissan USA", "5NP": "Hyundai USA", "5FN": "Honda USA",
    "6FP": "Ford Australia", "6G1": "Holden", "8AP": "Fiat Argentina", "8AJ": "Toyota Argentina", "9BW": "Volkswagen Brazil", "9BD": "Fiat Brazil", "9BR": "Toyota Brazil", "93H": "Honda Brazil", "9BG": "GM Brazil"
  };
  const TRANS = { A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9, S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9 };
  const WT = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
  const YEARS = "ABCDEFGHJKLMNPRSTVWXY123456789";
  function ord(c) { return ORDER.indexOf(c); }
  function country(v) {
    const p = v.slice(0, 2);
    for (const r of RANGES) { if (r[0][0] === p[0] && ord(p[1]) >= ord(r[0][1]) && ord(p[1]) <= ord(r[1][1])) return r[2]; }
    return "";
  }
  function checkDigit(v) {
    let sum = 0;
    for (let i = 0; i < 17; i++) { const ch = v[i]; const n = /\d/.test(ch) ? +ch : TRANS[ch]; if (n == null) return null; sum += n * WT[i]; }
    const r = sum % 11; return r === 10 ? "X" : String(r);
  }
  // I, O and Q are never used in a VIN: they are almost always a misread 1 or 0
  function fixVin(raw) { return String(raw || "").toUpperCase().replace(/[\s.\-_*]/g, "").replace(/I/g, "1").replace(/[OQ]/g, "0"); }
  function decode(raw) {
    const v = raw.toUpperCase().replace(/[\s-]/g, "");
    const out = { v: v, issues: [], ok: false };
    if (!v) return out;
    if (/[IOQ]/.test(v)) out.issues.push("Contains I, O or Q, which are never used in a VIN (often a misread 1 or 0).");
    if (/[^A-Z0-9]/.test(v)) out.issues.push("Contains characters other than letters and digits.");
    if (v.length !== 17) { out.issues.push("Has " + v.length + " characters; a modern VIN (from 1981) has 17. Older and some non-road vehicles use shorter chassis numbers."); return out; }
    out.wmi = v.slice(0, 3);
    out.maker = WMI[out.wmi] || WMI[out.wmi.slice(0, 2) + "*"] || "";
    out.country = country(v); out.region = REGION(v[0]);
    const cd = checkDigit(v); out.cd = cd; out.cdOk = cd != null && cd === v[8];
    const yi = YEARS.indexOf(v[9]);
    if (yi > -1) { const y1 = 1980 + yi, y2 = y1 + 30; out.years = (y2 <= new Date().getFullYear() + 1) ? [y2, y1] : [y1]; }
    out.plant = v[10]; out.serial = v.slice(11);
    out.na = "12345".indexOf(v[0]) > -1;
    out.ok = !out.issues.length;
    return out;
  }

  // ---------- page ----------
  const countries = Array.from(new Set(D.checks.map(function (r) { return r[0]; }))).sort(function (a, b) { return cname(a).localeCompare(cname(b)); });
  host.innerHTML =
    '<header class="desk-head"><div><p class="eyebrow">Vehicles</p><h2>Stolen vehicle check (VIN)</h2>' +
    '<p class="hint" style="margin:4px 0 0;max-width:78ch">Enter the VIN (chassis number) and, if you have it, the plate. The VIN is checked and decoded, and you get every <b>free</b> public stolen-vehicle check we could confirm (' + D.checks.length + ' services in ' + countries.length + ' countries), with a place to record the result of each one.</p></div></header>' +
    '<div class="ports-bar">' +
    '<label class="pf" style="flex:2 1 300px">VIN / chassis number<input id="sv-vin" type="search" maxlength="24" placeholder="e.g. WVWZZZ1KZ6W612305" spellcheck="false" autocomplete="off" class="mono-in"></label>' +
    '<label class="pf" style="flex:1 1 160px">Plate (optional)<input id="sv-plate" type="search" maxlength="16" placeholder="e.g. 1-ABC-123" spellcheck="false" autocomplete="off" class="mono-in"></label>' +
    '<label class="pf">Country<select id="sv-cc"><option value="">All countries</option>' + countries.map(function (c) { return '<option value="' + c + '">' + esc(cname(c)) + "</option>"; }).join("") + "</select></label>" +
    '<div class="pf"><span>Search by</span><div class="chips" id="sv-by"><button type="button" data-by="" aria-pressed="true">All</button><button type="button" data-by="vin" aria-pressed="false">Accepts VIN</button><button type="button" data-by="plate" aria-pressed="false">Plate only</button></div></div>' +
    "</div>" +
    '<div id="sv-decode"></div>' +
    '<ol class="sv-how"><li><b>Type the VIN</b>: it is checked and decoded here, in the tool.</li><li><b>Press “Open &amp; copy VIN”</b> on a service below: the official site opens and the VIN is already copied. Paste it there (police sites do not let other pages search for you).</li><li><b>Set the Result</b> (No record / HIT), then <b>Copy check summary</b> for your case file.</li></ol>' +
    '<div class="ports-meta"><span id="sv-count"></span><span class="ports-actions"><button type="button" class="btn ghost" id="sv-summary">Copy check summary</button><button type="button" class="btn ghost" id="sv-reset">Clear results</button></span></div>' +
    '<div id="sv-list" class="sv-list"></div>' +
    '<div class="box-warn sv-warn"><b>A "no record" result does not mean the vehicle is clean.</b> Each service only holds thefts reported in its own country, often with a delay of days. Stolen vehicles are often given a <b>cloned VIN</b> copied from a legitimate vehicle, which passes every online check. Compare the VIN on the windscreen plate, door pillar, chassis stamping and documents; look for altered rivets, labels or welds; and ask your Interpol NCB or SIRENE bureau for SMV / SIS checks.</div>' +
    '<h3 class="sv-h">Law enforcement only</h3><p class="hint">Not public. Use them through your national contact point.</p><ul class="sv-ul">' +
    D.le.map(function (r) { return '<li><a href="' + esc(r[1]) + '" target="_blank" rel="noopener"><b>' + esc(r[0]) + "</b></a> · " + esc(r[2]) + "</li>"; }).join("") + "</ul>" +
    '<h3 class="sv-h">Free supporting checks (no stolen flag)</h3><p class="hint">Use these to confirm the vehicle\'s identity matches its documents.</p><ul class="sv-ul">' +
    D.support.map(function (r) { return '<li><span class="sv-cc">' + esc(cname(r[0])) + '</span> <a href="' + esc(r[2]) + '" target="_blank" rel="noopener"><b>' + esc(r[1]) + "</b></a> · " + esc(r[3]) + "</li>"; }).join("") + "</ul>" +
    '<h3 class="sv-h">No free public stolen check found</h3><p class="hint" style="max-width:90ch">' + esc(D.none) + ". In these countries the check is only available to police or through paid commercial reports, which this framework does not list.</p>" +
    '<p class="hint" style="margin-top:14px;max-width:90ch">Services checked ' + esc(D.updated) + ". “Unverified” means the site exists but could not be fully tested (often geo-blocked). None of these sites accepts the VIN in its web address, so <b>Open</b> copies the VIN (or plate) for you to paste. Your search is sent to the site you open; some police sites may record searches.</p>";

  const st = { vin: "", plate: "", cc: "", by: "", res: {} };
  const saved = LS("leosint.stolen") || {};
  function key() { return st.vin || st.plate || "_"; }
  function results() { return (saved[key()] || {}); }
  function save() { LS("leosint.stolen", saved); }

  let vpicTimer = 0, vpicFor = "";
  function renderDecode() {
    const box = $("#sv-decode");
    if (!st.vin) { box.innerHTML = ""; return; }
    const d = decode(st.vin);
    let h = '<div class="sv-dec">' + (st.typed && st.typed !== st.vin ? '<p class="sv-fix">You typed <span class="mono">' + esc(st.typed) + '</span>. The letters I, O and Q are never used in a VIN, so they were read as <b>1</b> and <b>0</b>: decoding and checks use <span class="mono"><b>' + esc(st.vin) + '</b></span>. <button type="button" class="btn ghost" id="sv-usefix">Put corrected VIN in the box</button></p>' : "") + '<div class="sv-dec-main"><span class="sv-vin">' + d.v.split("").map(function (c, i) { return '<span class="p' + (i < 3 ? "w" : i < 8 ? "d" : i === 8 ? "c" : i === 9 ? "y" : i === 10 ? "p" : "s") + '">' + esc(c) + "</span>"; }).join("") + "</span>";
    h += '<span class="sv-legend"><span class="pw">WMI (maker)</span><span class="pd">vehicle description</span><span class="pc">check digit</span><span class="py">year</span><span class="pp">plant</span><span class="ps">serial</span></span></div>';
    if (d.issues.length) h += '<p class="bad">' + d.issues.map(esc).join("<br>") + "</p>";
    if (d.v.length === 17) {
      h += '<table class="sv-tbl">';
      h += "<tr><th>Manufacturer (WMI " + esc(d.wmi) + ')</th><td id="sv-maker"' + (d.maker ? ">" + esc(d.maker) : ' data-empty="1"><span class="hint">not in the offline list, see NHTSA below</span>') + "</td></tr>";
      h += "<tr><th>Country of manufacture</th><td>" + esc(d.country || "unknown") + (d.region ? ' <span class="hint">(' + esc(d.region) + ")</span>" : "") + "</td></tr>";
      h += "<tr><th>Check digit (position 9)</th><td>" + (d.cdOk ? '<span class="ok">valid (' + esc(d.cd) + ")</span>" : d.na ? '<b class="bad">invalid: expected ' + esc(d.cd) + ", found " + esc(d.v[8]) + "</b> · mandatory on North American VINs, so this VIN is mistyped or false" : '<span class="hint">does not match (expected ' + esc(d.cd) + "); normal for many European and Asian VINs, which do not use a check digit</span>") + "</td></tr>";
      h += "<tr><th>Model year (position 10)</th><td>" + (d.years ? esc(d.years.join(" or ")) + (d.na ? "" : ' <span class="hint">(only reliable on North American VINs)</span>') : '<span class="hint">not encoded</span>') + "</td></tr>";
      h += "<tr><th>Plant · serial</th><td>" + esc(d.plant) + " · " + esc(d.serial) + "</td></tr>";
      h += '<tr><th>NHTSA decode</th><td id="sv-vpic"><span class="hint">Looking up…</span></td></tr></table>';
    }
    h += "</div>";
    box.innerHTML = h;
    if (d.v.length === 17) {
      clearTimeout(vpicTimer);
      vpicTimer = setTimeout(function () { vpic(d.v); }, 400);
    }
  }
  const vcache = {};
  function vpic(v) {
    const cell = function () { return document.getElementById("sv-vpic"); };
    const link = ' <a href="https://vpic.nhtsa.dot.gov/decoder/" target="_blank" rel="noopener">NHTSA decoder ↗</a>';
    vpicFor = v;
    const done = function (r) {
      if (vpicFor !== v || !cell()) return;
      if (!r) { cell().innerHTML = '<span class="hint">Could not reach NHTSA (offline or blocked).</span>' + link; return; }
      const mk = document.getElementById("sv-maker");
      if (mk && mk.dataset.empty && (r.Make || r.Manufacturer)) mk.innerHTML = esc(r.Make || r.Manufacturer) + ' <span class="hint">(from NHTSA)</span>';
      const parts = [r.ModelYear, r.Make || r.Manufacturer, r.Model, r.Trim, r.BodyClass, r.VehicleType].filter(function (x) { return x && x !== "Not Applicable"; });
      const err = (r.ErrorCode || "").split(",").filter(function (c) { return c.trim() !== "0"; }).length ? r.ErrorText : "";
      cell().innerHTML = (parts.length ? "<b>" + esc(parts.join(" · ")) + "</b>" + (r.PlantCountry ? ' <span class="hint">built in ' + esc(r.PlantCountry) + (r.Manufacturer ? " by " + esc(r.Manufacturer) : "") + "</span>" : "") : '<span class="hint">NHTSA has no data for this VIN' + (/^7\b/.test(r.ErrorCode || "") || /not registered with NHTSA/i.test(r.ErrorText || "") ? ": the manufacturer code is not registered for the US market (normal for vehicles built for Europe, Asia or Africa). The offline decode above still applies." : " (common for vehicles never sold in North America).") + "</span>") +
        (err && parts.length ? '<br><span class="hint">NHTSA note: ' + esc(err.split(";")[0]) + "</span>" : "") + link;
    };
    if (vcache[v] !== undefined) { done(vcache[v]); return; }
    const ctl = window.AbortController ? new AbortController() : null; const t = setTimeout(function () { if (ctl) ctl.abort(); }, 8000);
    fetch("https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/" + encodeURIComponent(v) + "?format=json", { signal: ctl ? ctl.signal : undefined, referrerPolicy: "no-referrer" })
      .then(function (r) { return r.json(); })
      .then(function (j) { clearTimeout(t); vcache[v] = j && j.Results && j.Results[0] || null; done(vcache[v]); })
      .catch(function () { clearTimeout(t); done(null); });
  }

  const RES = [["", "Not checked"], ["clear", "No record found"], ["hit", "HIT: reported stolen"], ["na", "Could not check"]];
  function list() {
    return D.checks.map(function (r, i) { return { i: i, cc: r[0], n: r[1], url: r[2], by: r[3], who: r[4], note: r[5], u: r[6] === "u" }; })
      .filter(function (r) { return (!st.cc || r.cc === st.cc) && (!st.by || (st.by === "vin" ? r.by !== "plate" : r.by === "plate")); })
      .sort(function (a, b) { return cname(a.cc).localeCompare(cname(b.cc)) || a.i - b.i; });
  }
  function render() {
    const L = list(), R = results();
    const hits = Object.keys(R).filter(function (k) { return R[k] === "hit"; }).length, done = Object.keys(R).filter(function (k) { return R[k]; }).length;
    $("#sv-count").innerHTML = L.length + " free check" + (L.length === 1 ? "" : "s") + (st.cc ? " for " + esc(cname(st.cc)) : "") + (done ? ' · <span class="' + (hits ? "bad" : "ok") + '">' + done + " recorded" + (hits ? ", " + hits + " HIT" : "") + "</span>" : "");
    let last = "";
    const rows = L.map(function (r) {
      const need = r.by === "vin" ? "VIN" : r.by === "plate" ? "Plate" : "VIN or plate";
      const val = r.by === "plate" ? st.plate : (st.vin || st.plate);
      const res = R[r.i] || "", first = r.cc !== last; last = r.cc;
      return '<tr class="' + (first ? "sv-first " : "") + (res ? "r-" + res : "") + '"><td class="sv-cc-td">' + (first ? "<b>" + esc(cname(r.cc)) + "</b>" : "") + "</td>" +
        '<td><a class="sv-name" href="' + esc(r.url) + '" target="_blank" rel="noopener" data-open="' + r.i + '">' + esc(r.n) + " ↗</a>" + (r.u ? ' <span class="sv-unv" title="Exists but could not be fully tested">Unverified</span>' : "") +
        '<div class="sv-who">' + esc(r.who) + '</div><div class="sv-note">' + esc(r.note) + "</div></td>" +
        '<td><span class="sv-need' + (r.by === "plate" ? " plate" : "") + '">' + need + "</span></td>" +
        '<td class="sv-act"><a class="btn" href="' + esc(r.url) + '" target="_blank" rel="noopener" data-open="' + r.i + '">Open' + (val ? " &amp; copy " + (r.by === "plate" || !st.vin ? "plate" : "VIN") : "") + "</a>" +
        (window.LE_OSINT.addLog ? ' <button type="button" class="btn ghost" data-log="' + r.i + '" title="Add to case log">Log</button>' : "") + "</td>" +
        '<td><select class="sv-sel" data-res="' + r.i + '" aria-label="Result">' + RES.map(function (x) { return '<option value="' + x[0] + '"' + (x[0] === res ? " selected" : "") + ">" + x[1] + "</option>"; }).join("") + "</select></td></tr>";
    }).join("");
    $("#sv-list").innerHTML = rows ? '<div class="tbl-wrap ports-tbl"><table class="sv-table"><thead><tr><th style="width:120px">Country</th><th>Service</th><th style="width:100px">Search by</th><th style="width:190px">Check</th><th style="width:180px">Result</th></tr></thead><tbody>' + rows + "</tbody></table></div>" : '<p class="hint">No service matches these filters.</p>';
  }

  // ---------- events ----------
  const timers = {};
  function onInput(id, k, fn) { $(id).addEventListener("input", function () { const v = this.value; clearTimeout(timers[k]); timers[k] = setTimeout(function () { if (k === "vin") { st.typed = v.trim().toUpperCase().replace(/[\s.\-_*]/g, ""); st.vin = fixVin(v); } else st[k] = v.trim().toUpperCase().replace(/\s+/g, " "); fn(); }, 200); }); }
  onInput("#sv-vin", "vin", function () { renderDecode(); render(); });
  onInput("#sv-plate", "plate", render);
  $("#sv-cc").addEventListener("change", function () { st.cc = this.value; render(); });
  $("#sv-by").addEventListener("click", function (e) { const b = e.target.closest("button[data-by]"); if (!b) return; st.by = b.dataset.by; this.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); render(); });
  host.addEventListener("click", function (e) {
    if (e.target.id === "sv-usefix") { $("#sv-vin").value = st.vin; st.typed = st.vin; renderDecode(); render(); return; }
    const o = e.target.closest("[data-open]");
    if (o) { const r = D.checks[+o.dataset.open]; const val = r[3] === "plate" ? st.plate : (st.vin || st.plate); if (val) { try { navigator.clipboard.writeText(val); } catch (err) { /* ignore */ } window.LE_OSINT.toast && window.LE_OSINT.toast((r[3] === "plate" || !st.vin ? "Plate " : "VIN ") + val + " copied: paste it on the site"); } return; }
    const l = e.target.closest("[data-log]");
    if (l) { const r = D.checks[+l.dataset.log]; const res = (RES.filter(function (x) { return x[0] === (results()[l.dataset.log] || ""); })[0] || RES[0])[1]; window.LE_OSINT.addLog(r[2], "Stolen vehicle check " + r[1] + " (" + cname(r[0]) + ") for " + [st.vin && "VIN " + st.vin, st.plate && "plate " + st.plate].filter(Boolean).join(", ") + ": " + res); window.LE_OSINT.toast && window.LE_OSINT.toast("Added to case log"); return; }
  });
  host.addEventListener("change", function (e) {
    const s = e.target.closest("select[data-res]"); if (!s) return;
    const k = key(); saved[k] = saved[k] || {}; if (s.value) saved[k][s.dataset.res] = s.value; else delete saved[k][s.dataset.res]; save(); render();
  });
  $("#sv-reset").addEventListener("click", function () { delete saved[key()]; save(); render(); });
  $("#sv-summary").addEventListener("click", function () {
    const R = results(), d = st.vin ? decode(st.vin) : null, now = new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC";
    const lines = ["Stolen vehicle check · " + now, st.vin ? "VIN: " + st.vin + (d && d.v.length === 17 ? " (" + [d.maker, d.country, d.cdOk ? "check digit valid" : "check digit not valid"].filter(Boolean).join(", ") + ")" : "") : "", st.plate ? "Plate: " + st.plate : "", ""];
    D.checks.forEach(function (r, i) { if (R[i]) lines.push("- " + cname(r[0]) + " · " + r[1] + ": " + (RES.filter(function (x) { return x[0] === R[i]; })[0] || RES[0])[1] + " (" + r[2] + ")"); });
    if (lines.length === 4) lines.push("(no results recorded yet: set the Result of each check you ran)");
    lines.push("", "Note: a no-record result is not proof the vehicle is not stolen (national coverage only, reporting delays, cloned VINs).");
    window.LE_OSINT.copy(lines.filter(function (x, i) { return x !== "" || i > 2; }).join("\n"));
  });
  window.LE_OSINT.stolenSearch = function (v) { $("#sv-vin").value = v; st.typed = v.trim().toUpperCase().replace(/[\s.\-_*]/g, ""); st.vin = fixVin(v); renderDecode(); render(); };
  const m = location.hash.match(/^#stolen=(.+)$/); if (m) { try { window.LE_OSINT.stolenSearch(decodeURIComponent(m[1])); } catch (e) { /* ignore */ } }
  render();
})();
