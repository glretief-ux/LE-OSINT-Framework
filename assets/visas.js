/* LE OSINT Framework: Visas tab (visa requirements by passport and destination, with a map) */
(function () {
  "use strict";
  const V = window.LE_VISAS, W = window.LE_WORLD, host = document.getElementById("visas");
  if (!V || !host) return;
  const $ = function (s, r) { return (r || document).querySelector(s); };
  const esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]; }); };
  const fold = function (s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); };

  const NAME = {}, IDX = {};
  V.countries.forEach(function (c, i) { NAME[c[0]] = c[1]; IDX[c[0]] = i; });
  const CODES = V.countries.map(function (c) { return c[0]; });
  const cache = {};
  function row(p) { return cache[p] || (cache[p] = V.rows[p].split(",")); }

  // status key -> label, colour, short meaning
  const ST = {
    free: { label: "Visa free", color: "#1F9D62", order: 0, short: "No visa needed" },
    voa: { label: "Visa on arrival", color: "#9BC53D", order: 1, short: "Visa issued at the border" },
    eta: { label: "eTA / travel authorisation", color: "#3B82C4", order: 2, short: "Apply online before travel" },
    evisa: { label: "e-visa", color: "#E0A526", order: 3, short: "Apply online before travel" },
    req: { label: "Visa required", color: "#D64545", order: 4, short: "Apply at an embassy or consulate before travel" },
    ban: { label: "No admission", color: "#3B2A2E", order: 5, short: "Entry not permitted" },
    self: { label: "Your own country", color: "#7C8BA6", order: 6, short: "Own country" }
  };
  const LEGEND = ["free", "voa", "eta", "evisa", "req", "ban"];
  const NONE = "#C9CED2";

  function decode(t) {
    if (/^\d+$/.test(t)) return { key: "free", days: +t };
    return { key: { f: "free", a: "voa", t: "eta", e: "evisa", r: "req", x: "ban", "-": "self" }[t] || "req", days: null };
  }
  function lookup(p, d) { return decode(row(p)[IDX[d]]); }

  const st = { p: "", d: "", f: "all", q: "", s: "az" };

  // ---------- markup ----------
  const opts = CODES.slice().sort(function (a, b) { return NAME[a].localeCompare(NAME[b]); }).map(function (c) { return '<option value="' + c + '">' + esc(NAME[c]) + "</option>"; }).join("");
  host.innerHTML =
    '<header class="desk-head"><div><p class="eyebrow">Entry requirements · ordinary passports</p><h2>Visa requirements</h2>' +
    '<p class="hint" style="margin:4px 0 0;max-width:84ch">Choose the country that issued the passport, then the country you want to visit. The map colours every country for that passport and you get the entry requirement, the permitted stay and where to confirm it. ' +
    CODES.length + " countries and territories, " + (CODES.length * (CODES.length - 1)).toLocaleString("en") + " passport and destination pairs. Nothing you choose here leaves your browser.</p></div></header>" +

    '<section class="ac-box" id="vs-top">' +
    '<div class="ports-bar vs-bar">' +
    '<label class="pf">Passport issued by<select id="vs-p"><option value="">Select a country…</option>' + opts + "</select></label>" +
    '<button type="button" class="btn ghost vs-swap" id="vs-swap" title="Swap passport and destination" aria-label="Swap passport and destination">⇄</button>' +
    '<label class="pf">Travelling to<select id="vs-d"><option value="">Select a country…</option>' + opts + "</select></label>" +
    '<button type="button" class="btn ghost" id="vs-clear">Clear</button>' +
    "</div>" +
    '<div class="vs-grid">' +
    '<div class="vs-mapbox"><div id="vs-map" class="vs-map" role="application" aria-label="World map coloured by visa requirement for the chosen passport. Click a country to choose it."></div></div>' +
    '<aside class="vs-side" id="vs-side" aria-live="polite"></aside>' +
    "</div></section>" +

    '<section class="ac-box" id="vs-all" hidden>' +
    '<h3 id="vs-all-h"></h3>' +
    '<div class="ports-bar">' +
    '<label class="pf" style="flex:1 1 260px">Find a destination<input id="vs-q" type="search" placeholder="e.g. Japan, Thailand, TR" autocomplete="off" spellcheck="false"></label>' +
    '<label class="pf">Show<select id="vs-f"><option value="all">All requirements</option>' + LEGEND.map(function (k) { return '<option value="' + k + '">' + esc(ST[k].label) + "</option>"; }).join("") + "</select></label>" +
    '<label class="pf">Sort<select id="vs-s"><option value="az">Country A to Z</option><option value="easy">Easiest entry first</option></select></label>' +
    '<button type="button" class="btn ghost" id="vs-csv">Export CSV</button><span class="hint" id="vs-n"></span></div>' +
    '<div class="tbl-wrap ports-tbl"><table><thead><tr><th>Destination</th><th>Requirement</th><th>Stay</th><th>What it means</th></tr></thead><tbody id="vs-body"></tbody></table></div></section>' +

    '<p class="hint" style="margin-top:12px;max-width:92ch">Data: <a href="https://github.com/imorte/passport-index-data" target="_blank" rel="noopener">Passport Index dataset</a> (from <a href="https://www.passportindex.org" target="_blank" rel="noopener">passportindex.org</a>, MIT licence), updated ' + esc(V.updated) + '. It covers ordinary passports and short visits. Work, study, residence, transit and official, diplomatic or service passports follow other rules, and rules change often, so newly introduced schemes may be missing. Confirm with the destination\'s embassy or the <a href="https://www.iatatravelcentre.com/" target="_blank" rel="noopener">IATA Travel Centre</a> before anyone travels. Borders: Natural Earth (public domain); territories that are not in the data are drawn grey.</p>';

  // ---------- map ----------
  let map = null, polys = {}, marks = {}, worldBounds = null;
  function colours() {
    const cs = getComputedStyle($("#vs-map"));
    const g = function (n, d) { return (cs.getPropertyValue(n) || "").trim() || d; };
    return { land: g("--land", "#EEF0EC"), bord: g("--bord", "#9FB0AA"), sel: g("--sel", "#17211E") };
  }
  function colourFor(c) {
    if (!st.p) return null;
    if (c === st.p) return ST.self.color;
    return ST[lookup(st.p, c).key].color;
  }
  function tip(c) {
    if (!st.p) return "<b>" + esc(NAME[c]) + "</b>";
    if (c === st.p) return "<b>" + esc(NAME[c]) + "</b><br>Your passport";
    const r = lookup(st.p, c);
    return "<b>" + esc(NAME[c]) + "</b><br>" + esc(ST[r.key].label) + (r.days ? ", up to " + r.days + " days" : "");
  }
  function polyStyle(c) {
    const k = colours(), col = colourFor(c), isD = c === st.d, isP = c === st.p;
    return { fillColor: col || k.land, fillOpacity: col ? 0.88 : 1, color: isD || isP ? k.sel : k.bord, weight: isD ? 3 : isP ? 2 : 0.6, dashArray: isP && !isD ? "5 3" : null };
  }
  function markStyle(c) {
    const k = colours(), col = colourFor(c), isD = c === st.d, isP = c === st.p;
    return { radius: isD ? 9 : 5.5, fillColor: col || k.land, fillOpacity: 1, color: isD || isP ? k.sel : "#FFFFFF", weight: isD ? 3 : isP ? 2.5 : 1.5 };
  }
  function restyle() {
    if (!map) return;
    Object.keys(polys).forEach(function (c) { polys[c].setStyle(polyStyle(c)); });
    Object.keys(marks).forEach(function (c) { marks[c].setStyle(markStyle(c)); });
    [st.p, st.d].forEach(function (c) { if (c && polys[c]) polys[c].bringToFront(); });
  }
  function ensureMap() {
    if (map) { map.invalidateSize(); return; }
    if (!window.L || !W) { $("#vs-map").innerHTML = '<p class="hint" style="padding:16px">The map could not load. The drop-down menus and the table still work.</p>'; return; }
    const el = $("#vs-map");
    if (!el.clientWidth) return;
    map = L.map(el, { minZoom: 1, maxZoom: 8, zoomSnap: 0.5, attributionControl: false, worldCopyJump: false, maxBounds: [[-66, -190], [88, 200]], maxBoundsViscosity: 1 });
    worldBounds = L.latLngBounds([[-56, -168], [80, 178]]);
    map.fitBounds(worldBounds, { animate: false });
    map.createPane("vsMarks"); map.getPane("vsMarks").style.zIndex = 450;
    if (W.others) {
      L.geoJSON(W.others, {
        style: function () { const k = colours(); return { fillColor: NONE, fillOpacity: 0.55, color: k.bord, weight: 0.4 }; },
        onEachFeature: function (f, l) { l.bindTooltip("<b>" + esc(f.properties.n) + "</b><br>Territory: not in the visa data. Check the rules of the state it belongs to.", { sticky: true, className: "vs-tip" }); }
      }).addTo(map);
    }
    L.geoJSON(W.countries, {
      style: function (f) { return polyStyle(f.properties.c); },
      onEachFeature: function (f, l) {
        const c = f.properties.c; polys[c] = l;
        l.bindTooltip(function () { return tip(c); }, { sticky: true, className: "vs-tip" });
        l.on("click", function () { pick(c); });
      }
    }).addTo(map);
    (W.small || []).forEach(function (s) {
      const c = s[0]; if (!NAME[c]) return;
      const m = L.circleMarker([s[1], s[2]], Object.assign({ pane: "vsMarks" }, markStyle(c))).addTo(map);
      m.bindTooltip(function () { return tip(c); }, { sticky: true, className: "vs-tip" });
      m.on("click", function () { pick(c); });
      marks[c] = m;
    });
    const Reset = L.Control.extend({
      options: { position: "topleft" },
      onAdd: function () {
        const d = L.DomUtil.create("div", "leaflet-bar vs-reset"), a = L.DomUtil.create("a", "", d);
        a.href = "#"; a.title = "Show the whole world"; a.setAttribute("role", "button"); a.setAttribute("aria-label", "Show the whole world"); a.textContent = "🌍";
        L.DomEvent.disableClickPropagation(d);
        L.DomEvent.on(a, "click", function (e) { L.DomEvent.preventDefault(e); map.fitBounds(worldBounds); });
        return d;
      }
    });
    map.addControl(new Reset());
    restyle();
    if (st.d) zoomTo(st.d, true);
  }
  function zoomTo(c, instant) {
    if (!map) return;
    const o = { animate: !instant, duration: 0.7 };
    if (marks[c]) map.flyTo(marks[c].getLatLng(), 5, o);
    else if (polys[c]) map.flyToBounds(polys[c].getBounds(), Object.assign({ maxZoom: 5, padding: [30, 30] }, o));
  }

  // ---------- result + side panel ----------
  function explain(key, days, pn, dn) {
    switch (key) {
      case "free": return days
        ? "A passport issued by " + esc(pn) + " can be used to enter " + esc(dn) + " without a visa for a short visit. Permitted stay as listed: up to <b>" + days + " days</b>. Some countries count this per visit and others per rolling period, so check how " + esc(dn) + " counts it."
        : "A passport issued by " + esc(pn) + " can be used to enter " + esc(dn) + " without a visa. The data gives no limit on the stay, which is typical for freedom of movement or where the border officer sets the length. Confirm the allowed stay.";
      case "voa": return "No visa is needed in advance: it is issued at the border on arrival. Have a valid passport, a return or onward ticket, proof of funds and the fee ready (some countries only take cash or only card), and check whether an online pre-registration is also required.";
      case "eta": return "No visa, but an electronic travel authorisation must be approved online before travel (for example ESTA for the USA, eTA for Canada, ETA for the UK, eVisitor for Australia). It is linked to the passport. Apply only on the official government site.";
      case "evisa": return "An electronic visa must be applied for online before travel, and the approval carried or saved. Use only the official government portal: look-alike sites often charge extra fees.";
      case "req": return "A visa must be obtained before travel, usually from an embassy or consulate of " + esc(dn) + " (some countries also offer an online application). Allow time for the application, supporting documents and possibly fingerprints or an interview.";
      case "ban": return "The data lists <b>no admission</b>: entry is currently not permitted for this passport, for example because of a travel ban or conflict. Confirm with the embassy before any plan is made.";
      default: return "";
    }
  }
  function summary(p, d) {
    const r = lookup(p, d);
    return NAME[p] + " passport to " + NAME[d] + ": " + ST[r.key].label + (r.days ? ", up to " + r.days + " days" : "") + " (Passport Index data, " + V.updated + "). Confirm with the embassy or IATA Travel Centre.";
  }
  function legendHTML(counts) {
    return '<ul class="vs-leg" aria-label="Map colours">' + LEGEND.map(function (k) {
      const inner = '<span class="vs-dot" style="background:' + ST[k].color + '"></span><span>' + esc(ST[k].label) + "</span>" + (counts ? '<span class="vs-n">' + counts[k] + "</span>" : "");
      return counts
        ? '<li><button type="button" data-vsf="' + k + '" aria-pressed="' + (st.f === k) + '" title="Show only: ' + esc(ST[k].label) + '">' + inner + "</button></li>"
        : '<li class="vs-leg-row">' + inner + "</li>";
    }).join("") + (counts ? '<li class="vs-leg-row"><span class="vs-dot" style="background:' + ST.self.color + '"></span><span>Your passport</span></li>' : "") + "</ul>";
  }
  function counts(p) {
    const c = { free: 0, voa: 0, eta: 0, evisa: 0, req: 0, ban: 0 };
    CODES.forEach(function (d) { if (d !== p) c[lookup(p, d).key]++; });
    return c;
  }
  function renderSide() {
    const box = $("#vs-side"); let h = "";
    if (!st.p) {
      h = '<p class="vs-lead"><b>1.</b> Choose the country that issued the passport.<br><b>2.</b> Choose the country to visit.</p><p class="hint">You can also click countries on the map: the first click sets the passport, the next ones set the destination.</p>' + legendHTML(null);
    } else {
      const c = counts(st.p), easy = c.free + c.voa;
      if (!st.d) {
        h = '<p class="vs-lead">Passport: <b>' + esc(NAME[st.p]) + "</b></p><p>Now choose where to go, or click a country on the map.</p>";
      } else if (st.d === st.p) {
        h = '<p class="vs-lead"><b>' + esc(NAME[st.p]) + '</b></p><p>Same country: a citizen does not need a visa to enter their own country. Choose another destination.</p>';
      } else {
        const r = lookup(st.p, st.d), s = ST[r.key], rev = lookup(st.d, st.p), pn = NAME[st.p], dn = NAME[st.d];
        h = '<div class="vs-res"><p class="eyebrow">Result</p>' +
          '<p class="vs-route"><b>' + esc(pn) + '</b> passport <span aria-hidden="true">→</span> <b>' + esc(dn) + "</b></p>" +
          '<p class="vs-badge"><span class="vs-dot" style="background:' + s.color + '"></span><b>' + esc(s.label) + "</b>" + (r.days ? " · up to " + r.days + " days" : "") + "</p>" +
          "<p>" + explain(r.key, r.days, pn, dn) + "</p>" +
          '<p class="hint">For ordinary passports and short visits. Work, study, residence, transit and official or diplomatic passports can differ.</p>' +
          '<p class="vs-rev">Other direction: a <b>' + esc(dn) + "</b> passport entering <b>" + esc(pn) + "</b>: <b>" + esc(ST[rev.key].label) + "</b>" + (rev.days ? " (" + rev.days + " days)" : "") + ". " +
          '<button type="button" class="code-btn" id="vs-rev-btn">Swap</button></p>' +
          '<p class="vs-links"><a href="https://www.iatatravelcentre.com/" target="_blank" rel="noopener">IATA Travel Centre</a> (airline check, official source) · ' +
          '<a href="https://www.google.com/search?q=' + encodeURIComponent(dn + " embassy official visa requirements for " + pn + " citizens") + '" target="_blank" rel="noopener">Official sites (web search)</a> · ' +
          '<a href="https://en.wikipedia.org/wiki/Special:Search?go=Go&search=' + encodeURIComponent("Visa policy of " + dn) + '" target="_blank" rel="noopener">Visa policy (Wikipedia)</a> · ' +
          '<button type="button" class="code-btn" data-copy="' + esc(summary(st.p, st.d)) + '">Copy summary</button></p></div>';
      }
      h += '<p class="vs-sub"><b>' + esc(NAME[st.p]) + "</b> passport: <b>" + easy + "</b> of " + (CODES.length - 1) + " destinations without a visa in advance (visa free or on arrival). Click a line to list only those.</p>" + legendHTML(c);
    }
    box.innerHTML = h;
  }

  // ---------- table ----------
  function renderTable() {
    const sec = $("#vs-all");
    if (!st.p) { sec.hidden = true; return; }
    sec.hidden = false;
    $("#vs-all-h").textContent = "All destinations for a " + NAME[st.p] + " passport";
    const q = fold(st.q.trim());
    let L = CODES.filter(function (d) { return d !== st.p; }).map(function (d) { const r = lookup(st.p, d); return { c: d, n: NAME[d], r: r, s: ST[r.key] }; });
    if (st.f !== "all") L = L.filter(function (x) { return x.r.key === st.f; });
    if (q) L = L.filter(function (x) { return fold(x.n).indexOf(q) > -1 || x.c.toLowerCase() === q; });
    L.sort(function (a, b) {
      if (st.s === "easy" && a.s.order !== b.s.order) return a.s.order - b.s.order;
      if (st.s === "easy" && a.r.days !== b.r.days) return (b.r.days || 0) - (a.r.days || 0);
      return a.n.localeCompare(b.n);
    });
    $("#vs-n").textContent = L.length + " destination" + (L.length === 1 ? "" : "s");
    $("#vs-body").innerHTML = L.map(function (x) {
      return '<tr' + (x.c === st.d ? ' class="vs-on"' : "") + '><td><button type="button" class="hs-open" data-dest="' + x.c + '">' + esc(x.n) + "</button></td>" +
        '<td><span class="vs-dot" style="background:' + x.s.color + '"></span> ' + esc(x.s.label) + "</td>" +
        "<td>" + (x.r.days ? x.r.days + " days" : x.r.key === "free" ? '<span class="hint">not limited / not stated</span>' : "") + "</td>" +
        '<td class="hint">' + esc(x.s.short) + "</td></tr>";
    }).join("") || '<tr><td colspan="4" class="hint">No destination matches.</td></tr>';
  }
  function csv() {
    if (!st.p) return;
    const q = function (s) { s = String(s); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    const lines = [["Passport", "Destination", "Requirement", "Stay (days)", "Source"].join(",")];
    CODES.filter(function (d) { return d !== st.p; }).sort(function (a, b) { return NAME[a].localeCompare(NAME[b]); }).forEach(function (d) {
      const r = lookup(st.p, d);
      lines.push([q(NAME[st.p]), q(NAME[d]), q(ST[r.key].label), r.days || "", q("Passport Index dataset " + V.updated)].join(","));
    });
    const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "visa-requirements-" + st.p + ".csv";
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  }

  // ---------- state ----------
  function refresh() {
    $("#vs-p").value = st.p; $("#vs-d").value = st.d; $("#vs-f").value = st.f;
    restyle(); renderSide(); renderTable();
  }
  function pick(c) {
    if (!st.p) st.p = c; else st.d = c;
    refresh(); if (st.d) zoomTo(st.d);
  }
  function setDest(c, scroll) {
    st.d = c; refresh(); zoomTo(c);
    if (scroll) { const t = $("#vs-top"); if (t && t.scrollIntoView) t.scrollIntoView({ behavior: "smooth", block: "start" }); }
  }

  $("#vs-p").addEventListener("change", function (e) { st.p = e.target.value; st.f = "all"; refresh(); });
  $("#vs-d").addEventListener("change", function (e) { st.d = e.target.value; refresh(); if (st.d) zoomTo(st.d); });
  $("#vs-swap").addEventListener("click", function () { const t = st.p; st.p = st.d; st.d = t; refresh(); if (st.d) zoomTo(st.d); });
  $("#vs-clear").addEventListener("click", function () { st.p = ""; st.d = ""; st.f = "all"; st.q = ""; $("#vs-q").value = ""; refresh(); if (map) map.fitBounds(worldBounds); });
  $("#vs-q").addEventListener("input", function (e) { st.q = e.target.value; renderTable(); });
  $("#vs-f").addEventListener("change", function (e) { st.f = e.target.value; renderSide(); renderTable(); });
  $("#vs-s").addEventListener("change", function (e) { st.s = e.target.value; renderTable(); });
  $("#vs-csv").addEventListener("click", csv);
  host.addEventListener("click", function (e) {
    const c = e.target.closest("[data-copy]"); if (c) { window.LE_OSINT.copy(c.dataset.copy); return; }
    const f = e.target.closest("[data-vsf]");
    if (f) { st.f = st.f === f.dataset.vsf ? "all" : f.dataset.vsf; $("#vs-f").value = st.f; renderSide(); renderTable(); const t = $("#vs-all"); if (t && t.scrollIntoView) t.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    const d = e.target.closest("[data-dest]"); if (d) { setDest(d.dataset.dest, true); return; }
    if (e.target.closest("#vs-rev-btn")) { const t = st.p; st.p = st.d; st.d = t; refresh(); zoomTo(st.d); }
  });

  new MutationObserver(function () {
    const v = document.getElementById("view-visas");
    if (v && !v.hidden) setTimeout(ensureMap, 30);
  }).observe(document.getElementById("view-visas"), { attributes: true, attributeFilter: ["hidden"] });
  new MutationObserver(restyle).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  try { matchMedia("(prefers-color-scheme: dark)").addEventListener("change", restyle); } catch (e) { /* older browser */ }

  window.LE_OSINT = window.LE_OSINT || {};
  window.LE_OSINT.visaSet = function (p, d) {
    p = String(p || "").toUpperCase(); d = String(d || "").toUpperCase();
    if (NAME[p]) st.p = p;
    if (NAME[d]) st.d = d;
    refresh(); if (st.d) zoomTo(st.d, true);
  };

  refresh();
  if (!document.getElementById("view-visas").hidden) setTimeout(ensureMap, 30);
})();
