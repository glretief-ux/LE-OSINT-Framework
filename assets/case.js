/* LE OSINT Framework: one-page seizure / case summary (saved in this browser, print or save as PDF) */
(function () {
  "use strict";
  const host = document.getElementById("case");
  if (!host) return;
  const $ = function (s, r) { return (r || document).querySelector(s); };
  const esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]; }); };
  const KEY = "leosint.case";

  // [id, label, kind, placeholder] kind: t text, a textarea, s:<options>, dt datetime
  const FORM = [
    ["Case", [
      ["ref", "Case / seizure reference", "t", "e.g. BE-ANR-2026-0412"],
      ["when", "Date and time (Brussels)", "dt", ""],
      ["officer", "Officer and unit", "t", "Name, unit, phone"],
      ["place", "Location", "t", "Port, terminal, airport, warehouse"],
      ["kind", "Type of control", "s:Sea container|Air cargo|Express / postal parcel|Passenger / baggage|Vehicle|Vessel|Other", ""],
      ["basis", "Reason for control", "s:Risk profile / targeting|Intelligence|Random|Scanner image|Detector dog|Other agency request|Other", ""]
    ]],
    ["Transport", [
      ["vessel", "Vessel name and IMO / flight number", "t", "e.g. MSC ANNA, IMO 9454436 · ET 726"],
      ["cont", "Container, ULD or parcel number(s)", "t", "e.g. MSCU1234566"],
      ["seal", "Seal number(s)", "t", "As found, and as re-sealed"],
      ["doc", "B/L, AWB or tracking number", "t", "Master and house numbers"],
      ["from", "Port / airport of loading", "t", "With country"],
      ["via", "Transshipment / transit", "t", ""],
      ["to", "Destination", "t", ""]
    ]],
    ["Parties", [
      ["shipper", "Shipper / exporter", "a", "Name, address, phone, e-mail"],
      ["consignee", "Consignee / importer", "a", "Name, address, phone, e-mail"],
      ["notify", "Notify party, forwarder, broker", "a", ""]
    ]],
    ["Goods and findings", [
      ["declared", "Declared goods and HS code", "t", "e.g. Fresh bananas, 0803.90"],
      ["found", "What was found", "t", "e.g. cocaine (field test positive)"],
      ["qty", "Quantity and packaging", "t", "e.g. 42 bricks in 2 sports bags"],
      ["weight", "Gross weight (kg)", "t", ""],
      ["method", "Concealment method", "s:|Rip-on / rip-off (in the cargo, near the doors)|Within the cargo|Container structure (walls, floor, roof)|Reefer unit / machinery|Hull / sea chest (outside the vessel)|Inside goods (impregnated, mixed, hollowed)|Baggage / on body|Parcel / letter|Other", ""],
      ["test", "Field test and samples", "t", "Kit used, result, sample numbers"]
    ]],
    ["Assessment and action", [
      ["risk", "Risk indicators", "a", "Use 'Add to case summary' in the Risk checklist tab, or type here"],
      ["actions", "Actions taken", "a", "e.g. container held, prosecutor informed, controlled delivery considered"],
      ["exhibits", "Exhibits and photos", "a", "Exhibit numbers, photo numbers, chain of custody"],
      ["next", "Next steps / requests", "a", "e.g. request to origin via CCP / Interpol / liaison"],
      ["notes", "Other notes", "a", ""]
    ]]
  ];
  const IDS = []; FORM.forEach(function (g) { g[1].forEach(function (f) { IDS.push(f); }); });

  function nowBrussels() {
    try {
      const p = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Brussels", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
      const g = function (t) { return (p.find(function (x) { return x.type === t; }) || {}).value; };
      return g("year") + "-" + g("month") + "-" + g("day") + "T" + g("hour") + ":" + g("minute");
    } catch (e) { return new Date().toISOString().slice(0, 16); }
  }
  let data = {};
  try { data = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { data = {}; }
  if (!data.when) data.when = nowBrussels();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* kept in memory only */ } }

  function field(f) {
    const id = "cs-" + f[0], v = data[f[0]] || "";
    let inp;
    if (f[2] === "a") inp = '<textarea id="' + id + '" data-k="' + f[0] + '" rows="3" placeholder="' + esc(f[3]) + '">' + esc(v) + "</textarea>";
    else if (f[2] === "dt") inp = '<input id="' + id + '" data-k="' + f[0] + '" type="datetime-local" value="' + esc(v) + '">';
    else if (f[2].indexOf("s:") === 0) inp = '<select id="' + id + '" data-k="' + f[0] + '">' + f[2].slice(2).split("|").map(function (o) { return "<option" + (o === v ? " selected" : "") + ">" + esc(o) + "</option>"; }).join("") + "</select>";
    else inp = '<input id="' + id + '" data-k="' + f[0] + '" type="text" autocomplete="off" placeholder="' + esc(f[3]) + '" value="' + esc(v) + '">';
    return '<label class="cs-f' + (f[2] === "a" ? " wide" : "") + '"><span>' + esc(f[1]) + "</span>" + inp + (f[0] === "cont" ? '<small class="hint" id="cs-cont-hint"></small>' : "") + "</label>";
  }
  host.innerHTML =
    '<header class="desk-head"><div><p class="eyebrow">Reporting</p><h2>Case summary</h2>' +
    '<p class="hint" style="margin:4px 0 0;max-width:84ch">A one-page summary of a control or seizure for the file, a hand-over or a request to a partner. It saves as you type, in this browser only, and nothing is sent anywhere. Use <b>Print / save as PDF</b> to keep a copy (on iPad: Print, then share the preview as PDF).</p></div></header>' +
    '<div class="rk-actions" style="margin-bottom:12px"><button type="button" class="btn primary" id="cs-print">Print / save as PDF</button><button type="button" class="btn ghost" id="cs-copy">Copy as text</button><button type="button" class="btn ghost" id="cs-addrisk">Insert ticked risk indicators</button><button type="button" class="btn ghost" id="cs-new">New case</button></div>' +
    FORM.map(function (g) { return '<fieldset class="cs-group"><legend>' + esc(g[0]) + '</legend><div class="cs-grid">' + g[1].map(field).join("") + "</div></fieldset>"; }).join("") +
    '<p class="hint">Handle this summary under your agency’s rules for sensitive or classified information. Clear it with <b>New case</b> on shared devices.</p>';

  function contHint() {
    const el = $("#cs-cont-hint"); if (!el) return;
    const m = String(data.cont || "").toUpperCase().match(/[A-Z]{3}[UJZ]\s*-?\s*\d{6}\s*-?\s*\d/);
    if (!m) { el.textContent = ""; return; }
    const s = m[0].replace(/[\s-]/g, "");
    const V = {}; "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").reduce(function (n, c) { if (n % 11 === 0) n++; V[c] = n; return n + 1; }, 10);
    let sum = 0; for (let i = 0; i < 10; i++) sum += (/\d/.test(s[i]) ? +s[i] : V[s[i]]) * Math.pow(2, i);
    const cd = (sum % 11) % 10, ok = cd === +s[10];
    const o = window.LE_OWNERS && window.LE_OWNERS.find ? window.LE_OWNERS.find(s.slice(0, 4)) : null;
    el.innerHTML = esc(s) + ": check digit " + (ok ? "valid" : "<b>invalid</b> (expected " + cd + ")") + (o && !o.unknown ? " · " + esc(o.owner || o.lines.join(", ") || o.cancelled) : "");
  }
  host.addEventListener("input", function (e) {
    const k = e.target.dataset && e.target.dataset.k; if (!k) return;
    data[k] = e.target.value; save();
    if (k === "cont") contHint();
  });
  host.addEventListener("change", function (e) { const k = e.target.dataset && e.target.dataset.k; if (k) { data[k] = e.target.value; save(); } });

  function fmtWhen(v) { return v ? v.replace("T", " ") + " (Brussels time)" : ""; }
  function asText() {
    const out = ["CASE SUMMARY", "Created with the LE OSINT Framework on " + nowBrussels().replace("T", " ") + " (Brussels)", ""];
    FORM.forEach(function (g) {
      const fs = g[1].filter(function (f) { return data[f[0]]; });
      if (!fs.length) return;
      out.push(g[0].toUpperCase());
      fs.forEach(function (f) { const v = f[0] === "when" ? fmtWhen(data.when) : data[f[0]]; out.push(f[1] + ": " + (String(v).indexOf("\n") > -1 ? "\n" + v : v)); });
      out.push("");
    });
    return out.join("\n").trim();
  }
  function printIt() {
    let el = document.getElementById("case-print");
    if (!el) { el = document.createElement("div"); el.id = "case-print"; document.body.appendChild(el); }
    el.innerHTML = '<h1>Case summary' + (data.ref ? " · " + esc(data.ref) : "") + '</h1><p class="cp-meta">Printed ' + esc(nowBrussels().replace("T", " ")) + " (Brussels time)</p>" +
      FORM.map(function (g) {
        const fs = g[1].filter(function (f) { return data[f[0]]; });
        if (!fs.length) return "";
        return "<h2>" + esc(g[0]) + "</h2><table>" + fs.map(function (f) { return "<tr><th>" + esc(f[1]) + "</th><td>" + esc(f[0] === "when" ? fmtWhen(data.when) : data[f[0]]).replace(/\n/g, "<br>") + "</td></tr>"; }).join("") + "</table>";
      }).join("") + '<p class="cp-foot">Signature: ______________________________ &nbsp; Date: ______________</p>';
    document.body.classList.add("print-case");
    const done = function () { document.body.classList.remove("print-case"); window.removeEventListener("afterprint", done); };
    window.addEventListener("afterprint", done);
    try { window.print(); } catch (e) { done(); window.LE_OSINT.copy(asText()); alert("Printing is blocked here. The summary was copied as text instead."); }
    setTimeout(done, 60000);
  }
  function addRisk(t) {
    if (!t) return;
    // replace an earlier inserted list; keep anything the officer typed
    const own = String(data.risk || "").split(/\n\s*\n/).filter(function (p) { return !/^(Sea container|Air cargo \/ express) risk indicators \(\d+\):/.test(p.trim()); }).join("\n\n").trim();
    data.risk = t + (own ? "\n\n" + own : "");
    save(); const el = $("#cs-risk"); if (el) el.value = data.risk;
  }
  host.addEventListener("click", function (e) {
    const id = e.target.id;
    if (id === "cs-print") printIt();
    else if (id === "cs-copy") window.LE_OSINT.copy(asText());
    else if (id === "cs-addrisk") { const t = window.LE_OSINT.riskText ? window.LE_OSINT.riskText() : ""; if (t) addRisk(t); else alert("No indicators ticked yet. Open the Risk checklist tab first."); }
    else if (id === "cs-new") {
      if (!confirm("Clear this case summary and start a new one?")) return;
      data = { when: nowBrussels() }; save();
      IDS.forEach(function (f) { const el = $("#cs-" + f[0]); if (el) el.value = data[f[0]] || (el.tagName === "SELECT" ? el.options[0].value : ""); });
      contHint();
    }
  });
  contHint();

  window.LE_OSINT = window.LE_OSINT || {};
  window.LE_OSINT.caseAddRisk = addRisk;
})();
