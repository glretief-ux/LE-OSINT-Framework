/* LE OSINT Framework: drug precursor finder (1988 Convention Tables I and II) */
(function () {
  "use strict";
  const D = window.LE_PRECURSORS;
  const host = document.getElementById("precursors");
  if (!D || !host) return;
  const $ = function (s, r) { return (r || document).querySelector(s); };
  const esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]; }); };
  const norm = function (s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[\s,()'".\-–]+/g, ""); };

  const ROWS = D.rows.map(function (r, i) {
    const o = { i: i, n: r[0], syn: r[1], t: r[2], cas: r[3], hs: r[4], yr: r[5], drugs: r[6], role: r[7], note: r[8] };
    o.keys = [r[0]].concat(r[1] ? r[1].split(/;\s*/) : []).map(norm).filter(Boolean);
    o.casK = (r[3].match(/\d{2,7}-\d{2}-\d/g) || []).map(function (c) { return c.replace(/-/g, ""); });
    o.hsK = r[4].replace(/\D/g, "");
    o.text = (r[0] + " " + r[1]).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return o;
  });
  const ALIAS = {
    HER: ["heroin", "diacetylmorphine", "diamorphine"], COC: ["cocaine", "crack", "cocainehydrochloride", "cocabase", "cocapaste"],
    METH: ["methamphetamine", "metamfetamine", "meth", "crystalmeth", "crystal", "ice", "yaba", "shabu", "tik"], AMP: ["amphetamine", "amfetamine", "speed", "captagon"],
    MDMA: ["mdma", "ecstasy", "molly", "mda", "mdea", "xtc"], FEN: ["fentanyl", "fentanil", "carfentanil", "fentanylanalogues", "fentanylanalogue", "acetylfentanyl"],
    LSD: ["lsd", "lysergide", "acid"], MQ: ["methaqualone", "mandrax", "quaalude", "mecloqualone"], PCP: ["pcp", "phencyclidine", "angeldust"],
    MCAT: ["methcathinone", "cathinone", "ephedrone", "cathinones"], GHB: ["ghb", "gammahydroxybutyrate", "liquidecstasy"]
  };
  function drugOf(q) { for (const k in ALIAS) { if (ALIAS[k].indexOf(q) > -1) return k; } return ""; }
  const TBL = { I: ["Table I", "Under international control"], II: ["Table II", "Under international control"], S: ["Not in Table I or II", "Not under international control"] };

  host.innerHTML =
    '<header class="desk-head"><div><p class="eyebrow">Drug intelligence</p><h2>Drug precursors (INCB Tables I and II)</h2>' +
    '<p class="hint" style="margin:4px 0 0;max-width:80ch">Search a chemical by name, other name, CAS number or HS code to see whether it is under international control under the 1988 UN Convention, and which drugs it is used to make. You can also search a drug (e.g. “fentanyl”) to list its precursors. All ' +
    ROWS.filter(function (r) { return r.t === "I"; }).length + " entries of Table I and " + ROWS.filter(function (r) { return r.t === "II"; }).length + " of Table II, status " + esc(D.updated) + ".</p></div></header>" +
    '<div class="ports-bar">' +
    '<label class="pf" style="flex:2 1 320px">Chemical, CAS, HS code or drug<input id="pc-q" type="search" list="pc-names" placeholder="e.g. acetic anhydride, BMK glycidate, 4676-39-5, 2939.41, fentanyl" autocomplete="off" spellcheck="false"><datalist id="pc-names">' +
    ROWS.map(function (r) { return '<option value="' + esc(r.n) + '">'; }).join("") + "</datalist></label>" +
    '<label class="pf">Used to make<select id="pc-drug"><option value="">Any drug</option>' + Object.keys(D.drugs).filter(function (k) { return k !== "MANY"; }).map(function (k) { return '<option value="' + k + '">' + esc(D.drugs[k]) + "</option>"; }).join("") + "</select></label>" +
    '<div class="pf"><span>Status</span><div class="chips" id="pc-t"><button type="button" data-t="" aria-pressed="true">All</button><button type="button" data-t="I" aria-pressed="false">Table I</button><button type="button" data-t="II" aria-pressed="false">Table II</button><button type="button" data-t="S" aria-pressed="false">Not controlled</button></div></div>' +
    "</div>" +
    '<div id="pc-out"></div>' +
    '<div class="pc-info"><div><b>Table I</b> holds the chemicals that become part of the drug (precursors) and designer pre-precursors. They face the strictest controls: governments use pre-export notification through <a href="https://www.incb.org/incb/en/precursors/" target="_blank" rel="noopener">PEN Online</a> and import authorisations.</div>' +
    "<div><b>Table II</b> holds reagents, acids and solvents with large legitimate trade. Governments monitor trade and report suspicious orders.</div>" +
    "<div><b>Not in the Tables</b> does not mean free to trade: many such chemicals are on the INCB <i>limited international special surveillance list</i> and are controlled nationally or by the EU. Salts of Table I and II substances are covered (except salts of hydrochloric and sulphuric acid).</div></div>" +
    '<p class="hint" style="margin-top:12px;max-width:92ch">Sources: 1988 UN Convention against Illicit Traffic, Tables I and II as amended by the Commission on Narcotic Drugs up to its 67th session (March 2024, in force 3 December 2024) and the 2025 reorganisation of the PMK glycidate esters; <a href="https://www.incb.org/incb/uploads/documents/PRECURSORS/RED_LIST/RED_LIST_E.pdf" target="_blank" rel="noopener">INCB Red List</a> (official list with HS codes and CAS numbers); <a href="https://www.incb.org/incb/en/news/news_2024/scheduling-2024-precursors.html" target="_blank" rel="noopener">INCB on the 2024 additions</a>. ' +
    'National lists can be stricter: <a href="https://eur-lex.europa.eu/eli/reg/2004/273/oj" target="_blank" rel="noopener">EU drug precursor categories</a> · <a href="https://www.ecfr.gov/current/title-21/chapter-II/part-1310/section-1310.02" target="_blank" rel="noopener">US DEA List I / List II</a>. HS codes marked “indicative” are not named in the HS and depend on national classification. Use of a chemical is described at the level of the drug it is used for, for risk profiling only.</p>';

  const st = { q: "", drug: "", t: "" };
  function chipDrugs(r) { return r.drugs.map(function (k) { return '<button type="button" class="pc-drug" data-drug="' + k + '">' + esc(D.drugs[k]) + "</button>"; }).join(""); }
  function badge(r) { return '<span class="pc-badge t-' + r.t + '">' + (r.t === "S" ? "Not in Tables I / II" : TBL[r.t][0]) + "</span>"; }
  function card(r) {
    const hsD = r.hsK.slice(0, 6);
    const casFirst = (r.cas.match(/\d{2,7}-\d{2}-\d/) || [""])[0];
    return '<article class="pc-card t-' + r.t + '"><div class="pc-status">' + (r.t === "S" ? "✕ " : "● ") + esc(TBL[r.t][1]) + (r.t !== "S" ? " · <b>" + TBL[r.t][0] + "</b> of the 1988 Convention" : " (1988 Convention)") + "</div>" +
      '<h3 class="pc-name">' + esc(r.n) + "</h3>" + (r.syn ? '<p class="pc-syn">' + esc(r.syn) + "</p>" : "") +
      '<div class="pc-grid"><div><span class="pc-k">Used to make</span><div class="pc-drugs">' + chipDrugs(r) + "</div></div>" +
      '<div><span class="pc-k">Role</span>' + esc(r.role) + "</div>" +
      '<div><span class="pc-k">CAS number</span>' + (r.cas ? r.cas.split(/;\s*/).map(function (c) { const m = c.match(/\d{2,7}-\d{2}-\d/); return m ? '<button type="button" class="code-btn" data-copy="' + m[0] + '">' + esc(m[0]) + "</button>" + esc(c.replace(m[0], "")) : esc(c); }).join("<br>") : "–") + "</div>" +
      '<div><span class="pc-k">HS code</span>' + (r.hs ? '<button type="button" class="code-btn" data-copy="' + esc(r.hs.split(" ")[0]) + '">' + esc(r.hs.split(" ")[0]) + "</button>" + esc(r.hs.slice(r.hs.split(" ")[0].length)) + ' · <a href="#hs" data-hs="' + hsD + '">HS codes tab</a> · <a href="https://ec.europa.eu/taxation_customs/dds2/taric/measures.jsp?Lang=en&Taric=' + (hsD + "0000").slice(0, 10) + '" target="_blank" rel="noopener">EU TARIC</a>' : "–") + "</div>" +
      (r.yr ? '<div><span class="pc-k">Under international control since</span>' + esc(r.yr) + "</div>" : "") + "</div>" +
      (r.note ? '<p class="pc-note">' + esc(r.note) + "</p>" : "") +
      '<p class="pc-links"><a href="https://pubchem.ncbi.nlm.nih.gov/#query=' + encodeURIComponent(casFirst || r.n) + '" target="_blank" rel="noopener">PubChem</a> · <a href="https://www.incb.org/incb/uploads/documents/PRECURSORS/RED_LIST/RED_LIST_E.pdf" target="_blank" rel="noopener">INCB Red List</a> · <a href="https://news.google.com/search?q=' + encodeURIComponent('"' + r.n.split(" and its")[0] + '" (seizure OR seized OR smuggling)') + '" target="_blank" rel="noopener">Seizure news</a></p></article>';
  }
  function filtered(list) { return list.filter(function (r) { return (!st.t || r.t === st.t) && (!st.drug || r.drugs.indexOf(st.drug) > -1); }); }
  function search(q) {
    const n = norm(q), digits = q.replace(/\D/g, "");
    if (!n) return { kind: "none", list: [] };
    const d = drugOf(n);
    if (d) return { kind: "drug", drug: d, list: ROWS.filter(function (r) { return r.drugs.indexOf(d) > -1; }) };
    if (/^\d{2,7}-?\d{2}-?\d$/.test(q.trim())) { const L = ROWS.filter(function (r) { return r.casK.indexOf(digits) > -1; }); if (L.length) return { kind: "cas", list: L }; }
    if (/^\d{4}(\.?\d{2})?$/.test(q.trim())) { const L = ROWS.filter(function (r) { return r.hsK.indexOf(digits) === 0 || digits.indexOf(r.hsK) === 0; }); if (L.length) return { kind: "hs", list: L }; }
    const words = q.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(/[\s,]+/).filter(function (w) { return w.length > 1; });
    const part = n.length >= 3 ? ROWS.filter(function (r) { return r.keys.some(function (k) { return k.indexOf(n) > -1; }) || (words.length > 1 && words.every(function (w) { return r.text.indexOf(w) > -1; })); }) : [];
    const exact = ROWS.filter(function (r) { return r.keys.indexOf(n) > -1; });
    if (exact.length) return { kind: "chem", list: exact, related: part.filter(function (r) { return exact.indexOf(r) < 0; }) };
    return { kind: part.length ? "chem" : "miss", list: part };
  }
  function overview(list) {
    return '<div class="tbl-wrap ports-tbl"><table class="pc-table"><thead><tr><th>Substance</th><th style="width:120px">Status</th><th>Used to make</th><th style="width:150px">Role</th><th style="width:130px">CAS</th><th style="width:100px">HS</th></tr></thead><tbody>' +
      list.map(function (r) { return '<tr><td><button type="button" class="pc-open" data-name="' + esc(r.n) + '">' + esc(r.n) + "</button>" + (r.syn ? '<br><span class="hint">' + esc(r.syn.length > 80 ? r.syn.slice(0, 78) + "…" : r.syn) + "</span>" : "") + "</td><td>" + badge(r) + "</td><td>" + r.drugs.map(function (k) { return esc(D.drugs[k].split(" (")[0].split(" / ")[0]); }).join(", ") + "</td><td>" + esc(r.role) + '</td><td class="mono">' + esc((r.cas.match(/\d{2,7}-\d{2}-\d/) || [""])[0]) + '</td><td class="mono">' + esc(r.hs.split(" ")[0]) + "</td></tr>"; }).join("") +
      "</tbody></table></div>";
  }
  function render() {
    const out = $("#pc-out"), res = search(st.q);
    let h = "";
    if (res.kind === "none") {
      const L = filtered(ROWS);
      h = '<p class="pc-count">' + L.length + " substance" + (L.length === 1 ? "" : "s") + (st.drug ? " used for " + esc(D.drugs[st.drug]) : "") + (st.t ? " · " + esc(TBL[st.t][0]) : "") + ' <span class="ports-actions"><button type="button" class="btn ghost" id="pc-copy">Copy list</button></span></p>' + overview(L);
    } else if (res.kind === "miss") {
      h = '<div class="pc-miss"><b>“' + esc(st.q) + '” is not in Table I or Table II of the 1988 Convention</b> (or is spelled differently: try the CAS number or another name).' +
        "<ul><li>It may still be controlled <b>nationally or in the EU</b>, or be on the INCB <b>limited international special surveillance list</b> of non-scheduled chemicals.</li><li>Check the chemical's identity and CAS number, then the national list of the countries involved.</li></ul>" +
        '<p class="pc-links"><a href="https://pubchem.ncbi.nlm.nih.gov/#query=' + encodeURIComponent(st.q) + '" target="_blank" rel="noopener">Look it up in PubChem</a> · <a href="https://www.incb.org/incb/en/precursors/" target="_blank" rel="noopener">INCB precursors (special surveillance list)</a> · <a href="https://eur-lex.europa.eu/eli/reg/2004/273/oj" target="_blank" rel="noopener">EU categories</a> · <a href="https://www.ecfr.gov/current/title-21/chapter-II/part-1310/section-1310.02" target="_blank" rel="noopener">US List I / II</a></p></div>';
    } else {
      const L = filtered(res.list);
      const head = res.kind === "drug" ? "Chemicals used to make <b>" + esc(D.drugs[res.drug]) + "</b>: " + L.filter(function (r) { return r.t !== "S"; }).length + " under international control" + (L.some(function (r) { return r.t === "S"; }) ? ", plus non-scheduled chemicals of concern" : "") : L.length + " match" + (L.length === 1 ? "" : "es") + " for “" + esc(st.q) + "”";
      h = '<p class="pc-count">' + head + "</p>" + (L.map(card).join("") || '<p class="hint">No match with the current filters.</p>') +
        (res.related && res.related.length ? '<p class="pc-related">Related: ' + res.related.map(function (r) { return '<button type="button" class="pc-open" data-name="' + esc(r.n) + '">' + esc(r.n) + "</button> " + badge(r); }).join(" · ") + "</p>" : "");
    }
    out.innerHTML = h;
  }

  let t = 0;
  $("#pc-q").addEventListener("input", function () { const v = this.value; clearTimeout(t); t = setTimeout(function () { st.q = v.trim(); render(); }, 160); });
  $("#pc-drug").addEventListener("change", function () { st.drug = this.value; render(); });
  $("#pc-t").addEventListener("click", function (e) { const b = e.target.closest("button[data-t]"); if (!b) return; st.t = b.dataset.t; this.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); render(); });
  host.addEventListener("click", function (e) {
    const c = e.target.closest("[data-copy]"); if (c) { window.LE_OSINT.copy(c.dataset.copy); return; }
    const o = e.target.closest("[data-name]"); if (o) { $("#pc-q").value = o.dataset.name; st.q = o.dataset.name; render(); window.scrollTo(0, host.getBoundingClientRect().top + window.scrollY - 80); return; }
    const d = e.target.closest("[data-drug]"); if (d) { $("#pc-q").value = ""; st.q = ""; st.drug = d.dataset.drug; $("#pc-drug").value = st.drug; render(); return; }
    const hs = e.target.closest("[data-hs]"); if (hs) { e.preventDefault(); const btn = document.querySelector('.topnav button[data-view="hs"]'); if (btn) btn.click(); if (window.LE_OSINT.hsSearch) window.LE_OSINT.hsSearch(hs.dataset.hs); window.scrollTo(0, 0); return; }
    if (e.target.id === "pc-copy") {
      const L = filtered(ROWS);
      window.LE_OSINT.copy(["Substance\tStatus\tUsed to make\tRole\tCAS\tHS"].concat(L.map(function (r) { return [r.n, r.t === "S" ? "Not in Tables I/II" : "Table " + r.t, r.drugs.map(function (k) { return D.drugs[k]; }).join("; "), r.role, r.cas, r.hs].join("\t"); })).join("\n"));
    }
  });
  window.LE_OSINT.precursorSearch = function (v) { $("#pc-q").value = v; st.q = v; render(); };
  render();
})();
