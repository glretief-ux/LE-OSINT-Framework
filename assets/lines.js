/* LE OSINT Framework: shipping lines directory (searchable dropdown + table) */
(function () {
  "use strict";
  const D = window.LE_LINES;
  const host = document.getElementById("lines");
  if (!D || !host) return;
  const $ = function (s, r) { return (r || document).querySelector(s); };
  const esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]; }); };
  const norm = function (s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); };
  let dn = null; try { dn = new Intl.DisplayNames(["en"], { type: "region" }); } catch (e) { /* older browser */ }
  function cname(cc) { try { return (dn && dn.of(cc)) || cc; } catch (e) { return cc; } }

  const TYPES = { C: "Global container", R: "Regional container", F: "Feeder / short-sea", V: "Ro-ro / vehicles", Q: "Reefer / fruit", P: "Ferry / ro-pax freight", M: "Multipurpose / project" };
  const ROWS = D.rows.map(function (r, i) {
    const o = { i: i, n: r[0], aka: r[1], scac: r[2] ? r[2].split(/\s+/) : [], pre: r[3] ? r[3].split(/\s+/) : [], ty: r[4], al: r[5], cc: r[6], web: r[7], trk: r[8], stt: r[9], note: r[10] };
    o.key = norm([o.n, o.aka, o.scac.join(" "), o.pre.join(" "), cname(o.cc), TYPES[o.ty], o.al].join(" "));
    return o;
  }).sort(function (a, b) { return (a.stt ? 1 : 0) - (b.stt ? 1 : 0) || a.n.localeCompare(b.n); });

  host.innerHTML =
    '<header class="desk-head"><div><p class="eyebrow">Maritime reference</p><h2>Shipping lines</h2>' +
    '<p class="hint" style="margin:4px 0 0;max-width:74ch">' + ROWS.length + " ocean carriers: global and regional container lines, feeders, ro-ro, reefer and freight ferry operators, plus merged and defunct lines that still appear on old bills of lading and boxes. " +
    "Pick a line from the dropdown, or type a name, SCAC, container number or B/L number to identify the line.</p></div></header>" +
    '<div class="ports-bar">' +
    '<div class="pf ln-combo" style="flex:1 1 340px"><label for="ln-q">Shipping line, SCAC, container or B/L number</label>' +
    '<div class="ln-inputwrap"><input id="ln-q" type="search" role="combobox" aria-expanded="false" aria-controls="ln-list" aria-autocomplete="list" placeholder="e.g. Maersk, HLCU, MSCU1234565, ONEY…" autocomplete="off">' +
    '<button type="button" class="ln-toggle" id="ln-toggle" aria-label="Show all shipping lines" title="Show all shipping lines">▾</button></div>' +
    '<ul id="ln-list" class="ln-list" role="listbox" hidden></ul></div>' +
    '<label class="pf">Alliance<select id="ln-al"><option value="">All</option>' + Object.keys(D.alliances).map(function (k) { return '<option value="' + k + '">' + esc(k === "MSC" ? "MSC (independent)" : k) + "</option>"; }).join("") + '<option value="-">No alliance</option></select></label>' +
    '<div class="pf"><span>Type</span><div class="chips" id="ln-type"><button type="button" data-ty="" aria-pressed="true">All</button>' +
    Object.keys(TYPES).map(function (k) { return '<button type="button" data-ty="' + k + '" aria-pressed="false">' + TYPES[k] + "</button>"; }).join("") + "</div></div>" +
    '<label class="pchk"><input type="checkbox" id="ln-old" checked> Include merged and defunct lines</label>' +
    "</div>" +
    '<div id="ln-ident"></div>' +
    '<div class="ports-meta"><span id="ln-count"></span><span class="ports-actions"><button type="button" class="btn ghost" id="ln-copy">Copy list</button><button type="button" class="btn ghost" id="ln-csv">Export CSV</button></span></div>' +
    '<div class="tbl-wrap ports-tbl"><table><thead><tr><th>Shipping line</th><th>SCAC</th><th>Box prefixes</th><th>Type · alliance</th><th>HQ</th><th style="width:190px">Look up</th></tr></thead><tbody id="ln-body"></tbody></table></div>' +
    '<p class="hint" style="margin-top:14px;max-width:84ch">How to read a number: a <b>bill of lading</b> number usually starts with the carrier\'s SCAC (e.g. <span class="mono">MAEU</span>, <span class="mono">HLCU</span>, <span class="mono">ONEY</span>). A <b>container</b> number starts with the owner\'s 4-letter BIC prefix, which may be a <b>leasing company</b> rather than the line operating the box, so confirm the operator with the carrier\'s tracking or the terminal. ' +
    'SCAC and prefixes shown are the main published ones, not a complete register. Official lists: <a href="https://smdg.org/documents/smdg-code-lists/smdg-liner-code-list/" target="_blank" rel="noopener">SMDG liner code list</a> (free Excel download, updated monthly), <a href="https://www.bic-code.org/" target="_blank" rel="noopener">BIC code register</a>, <a href="https://terminal49.com/tools/scac-code-lookup" target="_blank" rel="noopener">SCAC lookup</a>. Alliances as of ' + esc(D.updated) + ": " + Object.keys(D.alliances).map(function (k) { return esc(D.alliances[k]); }).join("; ") + ".</p>";

  const st = { q: "", pick: -1, al: "", ty: "", old: true, open: false, hi: 0 };
  const CONT = /^([A-Z]{3}[UJZ])\s?(\d{6})\s?-?(\d)$/;

  function codeOf(q) {
    const s = q.replace(/[\s-]/g, "").toUpperCase();
    const m = s.match(/^([A-Z]{4})[A-Z0-9]*$/);
    if (!m || (s.length > 4 && !/\d/.test(s))) return null;
    return { code: m[1], full: s, isCont: CONT.test(s) };
  }
  function checkDigit(s) {
    const V = {}; let v = 10;
    for (let c = 65; c <= 90; c++) { if (v % 11 === 0) v++; V[String.fromCharCode(c)] = v; v++; }
    let sum = 0; for (let i = 0; i < 10; i++) { const ch = s[i]; sum += (/\d/.test(ch) ? +ch : V[ch]) * Math.pow(2, i); }
    return (sum % 11) % 10;
  }
  function matches() {
    const q = norm(st.q.trim());
    const cd = codeOf(st.q.trim());
    return ROWS.filter(function (r) {
      if (st.pick > -1) return r.i === st.pick;
      if (!st.old && r.stt) return false;
      if (st.al === "-" ? r.al : st.al && r.al !== st.al) return false;
      if (st.ty && r.ty !== st.ty) return false;
      if (!q) return true;
      if (cd && (r.scac.indexOf(cd.code) > -1 || r.pre.indexOf(cd.code) > -1)) return true;
      return q.split(/\s+/).every(function (w) { return r.key.indexOf(w) > -1; });
    });
  }
  function fillTrack(r, num) {
    if (!r.trk) return "";
    return num && r.trk.indexOf("{q}") > -1 ? r.trk.replace("{q}", encodeURIComponent(num)) : r.trk.replace("{q}", "");
  }
  function looks(r, num) {
    const out = [];
    if (r.web) out.push('<a href="' + esc(r.web) + '" target="_blank" rel="noopener">Website</a>');
    if (r.trk) out.push('<a href="' + esc(fillTrack(r, num)) + '" target="_blank" rel="noopener">' + (num && r.trk.indexOf("{q}") > -1 ? "Track " + esc(num) : "Tracking") + "</a>");
    if (num) out.push('<a href="https://www.searates.com/container/tracking/?number=' + encodeURIComponent(num) + '" target="_blank" rel="noopener">SeaRates</a>');
    out.push('<a href="https://www.opensanctions.org/search/?q=' + encodeURIComponent(r.n) + '" target="_blank" rel="noopener">Sanctions</a>');
    out.push('<a href="https://news.google.com/search?q=' + encodeURIComponent('"' + r.n + '" (seizure OR cocaine OR smuggling OR sanctions)') + '" target="_blank" rel="noopener">Seizure news</a>');
    return out.join(" · ");
  }
  function codeBtns(list) { return list.map(function (c) { return '<button type="button" class="code-btn" data-copy="' + c + '" title="Copy">' + c + "</button>"; }).join(" "); }
  function ident() {
    const cd = codeOf(st.q.trim()), box = $("#ln-ident");
    if (!cd || st.pick > -1) { box.innerHTML = ""; return; }
    const bySc = ROWS.filter(function (r) { return r.scac.indexOf(cd.code) > -1; });
    const byPre = ROWS.filter(function (r) { return r.pre.indexOf(cd.code) > -1; });
    let h = "";
    if (cd.isCont) {
      const cdg = checkDigit(cd.full), ok = cdg === +cd.full[10];
      h += "<b>Container " + esc(cd.full) + "</b>: check digit " + (ok ? '<span class="ok">valid</span>' : '<span class="bad">invalid (expected ' + cdg + ")</span>") + ". ";
    }
    if (byPre.length) h += "Prefix <b>" + cd.code + "</b> belongs to " + byPre.map(function (r) { return esc(r.n); }).join(", ") + ". ";
    if (bySc.length) h += "SCAC <b>" + cd.code + "</b> is " + bySc.map(function (r) { return esc(r.n); }).join(", ") + (cd.isCont ? "" : " (B/L numbers often start with the SCAC)") + ". ";
    if (!byPre.length && !bySc.length) h += "<b>" + cd.code + "</b> is not in this list. It may be a leasing company or a smaller line: check the <a href=\"https://www.bic-code.org/\" target=\"_blank\" rel=\"noopener\">BIC register</a> or <a href=\"https://www.google.com/search?q=" + encodeURIComponent('"' + cd.code + '" SCAC OR "BIC code"') + '" target="_blank" rel="noopener">search the code</a>. ';
    if (cd.isCont) h += '<a href="https://www.searates.com/container/tracking/?number=' + encodeURIComponent(cd.full) + '" target="_blank" rel="noopener">Track on SeaRates</a> · <a href="https://www.track-trace.com/container" target="_blank" rel="noopener">Track-Trace</a>';
    box.innerHTML = '<div class="ln-ident">' + h + "</div>";
  }
  function render() {
    const L = matches();
    const cd = codeOf(st.q.trim());
    const num = cd && cd.full.length >= 8 ? cd.full : "";
    $("#ln-count").textContent = L.length + " shipping line" + (L.length === 1 ? "" : "s") + (st.q.trim() && st.pick < 0 ? " matching “" + st.q.trim() + "”" : "");
    ident();
    $("#ln-body").innerHTML = L.map(function (r) {
      return "<tr" + (r.stt ? ' class="ln-old"' : "") + "><td><b>" + esc(r.n) + "</b>" + (r.stt ? ' <span class="ln-badge">' + (r.stt === "merged" ? "merged / brand retired" : "defunct") + "</span>" : "") +
        (r.aka ? '<br><span class="hint">' + esc(r.aka) + "</span>" : "") + (r.note ? '<div class="ln-note">' + esc(r.note) + "</div>" : "") + "</td>" +
        "<td>" + (r.scac.length ? codeBtns(r.scac) : '<span class="hint">–</span>') + "</td>" +
        "<td>" + (r.pre.length ? codeBtns(r.pre) : '<span class="hint">–</span>') + "</td>" +
        "<td>" + TYPES[r.ty] + (r.al ? '<br><span class="ln-al">' + esc(r.al === "MSC" ? "Independent" : r.al + " alliance") + "</span>" : "") + "</td>" +
        "<td>" + esc(cname(r.cc)) + "</td><td>" + looks(r, num) + "</td></tr>";
    }).join("") || '<tr><td colspan="6" class="hint">No shipping line matches. Try a shorter name, or check the SMDG liner code list (link below).</td></tr>';
  }

  // --- searchable dropdown (combobox) ---
  const inp = $("#ln-q"), lb = $("#ln-list");
  function opts() {
    const q = norm(inp.value.trim());
    const cd = codeOf(inp.value.trim());
    return ROWS.filter(function (r) {
      if (!q || st.pick > -1) return true;
      if (cd && (r.scac.indexOf(cd.code) > -1 || r.pre.indexOf(cd.code) > -1)) return true;
      return q.split(/\s+/).every(function (w) { return r.key.indexOf(w) > -1; });
    });
  }
  function drawList() {
    const O = opts();
    st.hi = Math.min(st.hi, Math.max(O.length - 1, 0));
    lb.innerHTML = O.map(function (r, k) {
      return '<li role="option" id="ln-o' + r.i + '" data-i="' + r.i + '" aria-selected="' + (k === st.hi) + '"' + (r.stt ? ' class="ln-old"' : "") + "><span>" + esc(r.n) + (r.aka ? ' <small>' + esc(r.aka) + "</small>" : "") + "</span><code>" + esc(r.scac[0] || r.pre[0] || "") + "</code></li>";
    }).join("") || '<li class="hint" aria-disabled="true">No match</li>';
    const cur = lb.querySelector('[aria-selected="true"]'); if (cur) { inp.setAttribute("aria-activedescendant", cur.id); cur.scrollIntoView({ block: "nearest" }); }
  }
  function openList(v) { st.open = v; lb.hidden = !v; inp.setAttribute("aria-expanded", v); if (v) drawList(); }
  function pick(i) {
    const r = ROWS.filter(function (x) { return x.i === i; })[0]; if (!r) return;
    st.pick = i; st.q = r.n; inp.value = r.n; openList(false); render();
  }
  let t = 0;
  inp.addEventListener("input", function () {
    st.pick = -1; st.hi = 0; openList(true);
    clearTimeout(t); t = setTimeout(function () { st.q = inp.value; render(); }, 150);
  });
  inp.addEventListener("focus", function () { if (!inp.value) openList(true); });
  inp.addEventListener("keydown", function (e) {
    const O = opts();
    if (e.key === "ArrowDown") { e.preventDefault(); if (!st.open) openList(true); else { st.hi = Math.min(st.hi + 1, O.length - 1); drawList(); } }
    else if (e.key === "ArrowUp") { e.preventDefault(); st.hi = Math.max(st.hi - 1, 0); drawList(); }
    else if (e.key === "Enter") { if (st.open && O[st.hi] && !codeOf(inp.value.trim())) { e.preventDefault(); pick(O[st.hi].i); } else { openList(false); st.q = inp.value; render(); } }
    else if (e.key === "Escape") { if (st.open) { e.preventDefault(); openList(false); } }
  });
  $("#ln-toggle").addEventListener("click", function () { if (st.open) openList(false); else { if (st.pick > -1) { st.pick = -1; inp.value = ""; st.q = ""; render(); } st.hi = 0; openList(true); inp.focus(); } });
  lb.addEventListener("mousedown", function (e) { const li = e.target.closest("li[data-i]"); if (li) { e.preventDefault(); pick(+li.dataset.i); } });
  document.addEventListener("click", function (e) { if (st.open && !e.target.closest(".ln-combo")) openList(false); });

  $("#ln-al").addEventListener("change", function () { st.al = this.value; st.pick = -1; render(); });
  $("#ln-old").addEventListener("change", function () { st.old = this.checked; render(); });
  $("#ln-type").addEventListener("click", function (e) {
    const b = e.target.closest("button[data-ty]"); if (!b) return;
    st.ty = b.dataset.ty; st.pick = -1;
    this.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); render();
  });
  host.addEventListener("click", function (e) { const c = e.target.closest("[data-copy]"); if (c) window.LE_OSINT.copy(c.dataset.copy); });
  function out() { return matches().map(function (r) { return [r.n, r.aka, r.scac.join(" "), r.pre.join(" "), TYPES[r.ty], r.al, cname(r.cc), r.web, r.stt, r.note]; }); }
  $("#ln-copy").addEventListener("click", function () { window.LE_OSINT.copy(out().map(function (r) { return r.join("\t"); }).join("\n")); });
  $("#ln-csv").addEventListener("click", function () {
    const csv = "Shipping line,Other names,SCAC,Box prefixes,Type,Alliance,HQ,Website,Status,Note\n" + out().map(function (r) { return r.map(function (x) { return '"' + String(x || "").replace(/"/g, '""') + '"'; }).join(","); }).join("\n");
    try { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "shipping-lines.csv"; document.body.appendChild(a); a.click(); a.remove(); }
    catch (err) { window.LE_OSINT.copy(csv); }
  });
  window.LE_OSINT.linesSearch = function (v) { inp.value = v; st.q = v; st.pick = -1; render(); };
  render();
})();
