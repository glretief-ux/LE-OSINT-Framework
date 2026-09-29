/* LE OSINT Framework — Harmonized System (HS) code finder */
(function () {
  "use strict";
  const D = window.LE_HS;
  const host = document.getElementById("hs");
  if (!D || !host) return;
  const $ = function (s, r) { return (r || document).querySelector(s); };
  const esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]; }); };
  const norm = function (s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); };

  const TAGS = {
    P: ["Drug precursor", "Chemical controlled or monitored as a drug precursor (UN 1988 Convention / EU precursor regulations). Check licences and end-use."],
    D: ["Narcotic / controlled plant", "Narcotic substance or plant material under international control."],
    W: ["Arms & ammunition", "Weapons, parts and ammunition: export / import licence required."],
    X: ["Excise goods", "Tobacco or alcohol: excise duty, smuggling risk."],
    C: ["Frequent cover load", "Goods often reported as cover loads in cocaine seizures from South America (indicative, not a rule)."],
    V: ["High value / laundering", "Gold, diamonds, jewellery, banknotes or securities: value transfer and money-laundering risk."],
    M: ["Medicines", "Medicinal products: falsified medicines and diversion risk."]
  };
  const ROWS = D.rows.map(function (r) { return { c: r[0], d: r[1], s: r[2], t: r[3], key: norm(r[0] + " " + r[1]) }; });
  const BY = {}; ROWS.forEach(function (r) { BY[r.c] = r; });
  function fmt(c) { return c.length === 2 ? c : c.length === 4 ? c : c.slice(0, 4) + "." + c.slice(4); }
  function lvl(c) { return c.length === 2 ? "Chapter" : c.length === 4 ? "Heading" : "Subheading"; }
  function sectionOf(r) { return r.s; }
  const SECTIONS = Object.keys(D.sections);

  host.innerHTML =
    '<header class="desk-head"><div><p class="eyebrow">Customs reference</p><h2>HS codes (Harmonized System)</h2>' +
    '<p class="hint" style="margin:4px 0 0;max-width:72ch">All ' + ROWS.length.toLocaleString("en") + " chapters, headings and 6-digit subheadings of the WCO Harmonized System, 2022 edition. Search by code or by words, or browse by section. National tariffs (EU CN / TARIC) add further digits; use the TARIC link for duties and measures.</p></div></header>" +
    '<div class="ports-bar">' +
    '<label class="pf" style="flex:1 1 320px">Code or description<input id="hs-q" type="search" placeholder="e.g. 0803, bananas, acetic anhydride, cocaine" autocomplete="off" style="width:100%"></label>' +
    '<label class="pf">Section<select id="hs-sec"><option value="">All sections</option>' + SECTIONS.map(function (s) { return '<option value="' + s + '">' + s + " · " + esc(D.sections[s]) + "</option>"; }).join("") + "</select></label>" +
    '<div class="pf"><span>Enforcement interest</span><div class="chips" id="hs-tags"><button type="button" data-t="" aria-pressed="true">All codes</button>' +
    Object.keys(TAGS).map(function (k) { return '<button type="button" data-t="' + k + '" aria-pressed="false" title="' + esc(TAGS[k][1]) + '">' + TAGS[k][0] + "</button>"; }).join("") + "</div></div>" +
    "</div>" +
    '<div class="ports-meta"><span id="hs-count"></span><span class="ports-actions"><button type="button" class="btn ghost" id="hs-copy">Copy list</button><button type="button" class="btn ghost" id="hs-csv">Export CSV</button></span></div>' +
    '<div id="hs-crumb" class="hs-crumb"></div>' +
    '<div class="tbl-wrap ports-tbl"><table><thead><tr><th style="width:120px">Code</th><th>Description</th><th style="width:210px">Look up</th></tr></thead><tbody id="hs-body"></tbody></table></div>' +
    '<p class="hint" id="hs-more"></p>' +
    '<p class="hint" style="margin-top:14px;max-width:80ch">Source: WCO Harmonized System 2022 nomenclature as published through UN Comtrade (<a href="https://github.com/datasets/harmonized-system" target="_blank" rel="noopener">datasets/harmonized-system</a>, public domain). The official legal text, with notes and explanatory notes, is on the <a href="https://www.wcoomd.org/en/topics/nomenclature/instrument-and-tools/hs-nomenclature-2022-edition.aspx" target="_blank" rel="noopener">WCO website</a>. Enforcement-interest labels are indicative aids for risk profiling, not legal classifications.</p>';

  const st = { q: "", sec: "", tag: "", browse: "", limit: 300 };

  function list() {
    const q = norm(st.q.trim());
    const digits = q.replace(/[\s.]/g, "");
    const isCode = /^\d{2,10}$/.test(digits);
    const words = q.split(/\s+/).filter(Boolean);
    return ROWS.filter(function (r) {
      if (st.sec && r.s !== st.sec) return false;
      if (st.tag && r.t.indexOf(st.tag) < 0) return false;
      if (st.browse && !q) return r.c.indexOf(st.browse) === 0 && r.c.length === (st.browse.length === 2 ? 4 : 6) || r.c === st.browse;
      if (!q) return st.tag ? true : r.c.length === 2;
      if (isCode) return r.c.indexOf(digits.slice(0, 6)) === 0 || digits.indexOf(r.c) === 0;
      return words.every(function (w) { return r.key.indexOf(w) > -1; });
    });
  }
  function tagsHTML(r) {
    return r.t.split("").map(function (k) { return '<span class="hs-tag hs-' + k + '" title="' + esc(TAGS[k][1]) + '">' + TAGS[k][0] + "</span>"; }).join("");
  }
  function lookups(r) {
    const c10 = (r.c + "0000000000").slice(0, 10);
    return '<a href="https://ec.europa.eu/taxation_customs/dds2/taric/measures.jsp?Lang=en&Taric=' + c10 + '" target="_blank" rel="noopener">EU TARIC</a> · ' +
      '<a href="https://ec.europa.eu/taxation_customs/dds2/ebti/ebti_consultation.jsp?Lang=en" target="_blank" rel="noopener">EBTI rulings</a><br>' +
      '<a href="https://www.google.com/search?q=' + encodeURIComponent('"' + fmt(r.c) + '" HS code') + '" target="_blank" rel="noopener">Web search</a>' +
      (r.c.length >= 4 ? ' · <a href="https://www.google.com/search?q=' + encodeURIComponent('"' + fmt(r.c) + '" seizure OR seized customs') + '" target="_blank" rel="noopener">Seizure news</a>' : "");
  }
  function crumb() {
    const b = st.browse;
    if (!b || st.q) { $("#hs-crumb").innerHTML = ""; return; }
    const parts = ['<button type="button" data-browse="">All chapters</button>'];
    if (b.length >= 2) parts.push('<button type="button" data-browse="' + b.slice(0, 2) + '">Ch. ' + b.slice(0, 2) + " " + esc(clip((BY[b.slice(0, 2)] || {}).d || "", 50)) + "</button>");
    if (b.length >= 4) parts.push('<button type="button" data-browse="' + b.slice(0, 4) + '">' + b.slice(0, 4) + " " + esc(clip((BY[b.slice(0, 4)] || {}).d || "", 50)) + "</button>");
    $("#hs-crumb").innerHTML = parts.join('<span aria-hidden="true">›</span>');
  }
  function clip(s, n) { return s.length > n ? s.slice(0, n - 1) + "…" : s; }
  function render() {
    const L = list(), shown = L.slice(0, st.limit);
    const scope = st.q ? "matching “" + st.q.trim() + "”" : st.browse ? "in " + (st.browse.length === 2 ? "chapter " : "heading ") + st.browse : st.tag ? "labelled " + TAGS[st.tag][0].toLowerCase() : "chapters";
    $("#hs-count").textContent = L.length.toLocaleString("en") + " code" + (L.length === 1 ? "" : "s") + " " + scope + (st.sec ? " · section " + st.sec : "");
    crumb();
    $("#hs-body").innerHTML = shown.map(function (r) {
      const hasKids = r.c.length < 6 && ROWS.some(function (x) { return x.c.length === r.c.length + 2 && x.c.indexOf(r.c) === 0; });
      const parent = r.c.length > 2 ? BY[r.c.slice(0, r.c.length - 2)] : null;
      return '<tr class="hs-l' + r.c.length + '"><td><button type="button" class="code-btn" data-copy="' + fmt(r.c) + '" title="Copy code">' + fmt(r.c) + '</button><br><span class="hint">' + lvl(r.c) + "</span></td>" +
        "<td>" + esc(r.d) + (st.q && parent ? '<br><span class="hint">in ' + fmt(parent.c) + " " + esc(clip(parent.d, 80)) + "</span>" : "") +
        (r.t ? '<div class="hs-tags">' + tagsHTML(r) + "</div>" : "") +
        (hasKids ? '<div><button type="button" class="hs-open" data-browse="' + r.c + '">Show ' + (r.c.length === 2 ? "headings" : "subheadings") + " →</button></div>" : "") + "</td>" +
        "<td>" + lookups(r) + "</td></tr>";
    }).join("") || '<tr><td colspan="3" class="hint">No codes match. Try fewer or different words (the descriptions use customs terms, e.g. “fish; frozen” rather than “frozen fish”).</td></tr>';
    $("#hs-more").innerHTML = L.length > shown.length ? "Showing the first " + shown.length + " of " + L.length.toLocaleString("en") + '. <button type="button" class="btn ghost" id="hs-showmore">Show more</button>' : "";
  }
  const timers = {};
  $("#hs-q").addEventListener("input", function () { const v = this.value; clearTimeout(timers.q); timers.q = setTimeout(function () { st.q = v; st.limit = 300; render(); }, 180); });
  $("#hs-sec").addEventListener("change", function () { st.sec = this.value; st.browse = ""; st.limit = 300; render(); });
  $("#hs-tags").addEventListener("click", function (e) {
    const b = e.target.closest("button[data-t]"); if (!b) return;
    st.tag = b.dataset.t; st.browse = ""; st.limit = 300;
    this.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); render();
  });
  host.addEventListener("click", function (e) {
    const c = e.target.closest("[data-copy]"); if (c) { window.LE_OSINT.copy(c.dataset.copy); return; }
    const br = e.target.closest("[data-browse]"); if (br) { st.browse = br.dataset.browse; st.q = ""; $("#hs-q").value = ""; st.limit = 300; render(); window.scrollTo(0, 0); return; }
    if (e.target.id === "hs-showmore") { st.limit += 1000; render(); }
  });
  function out() { return list().map(function (r) { return [fmt(r.c), lvl(r.c), r.d, r.t.split("").map(function (k) { return TAGS[k][0]; }).join("; ")]; }); }
  $("#hs-copy").addEventListener("click", function () { window.LE_OSINT.copy(out().map(function (r) { return r.join("\t"); }).join("\n")); });
  $("#hs-csv").addEventListener("click", function () {
    const csv = "Code,Level,Description,Enforcement interest\n" + out().map(function (r) { return r.map(function (x) { return '"' + String(x).replace(/"/g, '""') + '"'; }).join(","); }).join("\n");
    try { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "hs-codes.csv"; document.body.appendChild(a); a.click(); a.remove(); }
    catch (err) { window.LE_OSINT.copy(csv); }
  });
  window.LE_OSINT.hsSearch = function (v) { $("#hs-q").value = v; st.q = v; st.browse = ""; render(); };
  render();
})();
