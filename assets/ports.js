/* LE OSINT Framework — World ports directory (searchable by country) */
(function () {
  "use strict";
  const D = window.LE_PORTS;
  const host = document.getElementById("ports");
  if (!D || !host) return;
  const $ = function (s, r) { return (r || document).querySelector(s); };
  const esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]; }); };
  let dn = null; try { dn = new Intl.DisplayNames(["en"], { type: "region" }); } catch (e) { /* older browser */ }
  function cname(cc) { if (D.names[cc]) return D.names[cc]; try { return (dn && dn.of(cc)) || cc; } catch (e) { return cc; } }
  function norm(s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }

  const SIZE = { L: "Large", M: "Medium", S: "Small", VS: "Very small" };
  const RANK = { L: 0, M: 1, S: 2, VS: 3, "": 4 };
  const STATUS = { AA: "Approved by government agency", AC: "Approved by Customs", AF: "Approved by facilitation body", AI: "Code adopted by international organisation", AM: "Approved by national standardisation body", AQ: "Entry approved, functions not verified", AS: "Approved by national standardisation body", RL: "Recognised location (not officially approved)", RN: "Request from credible national sources", RQ: "Request under consideration", QQ: "Original entry not verified since", UR: "Entry included on user's request", "": "" };
  const FUNC = { "1": "port", "2": "rail", "3": "road", "4": "airport", "5": "postal", "6": "multimodal", "7": "fixed transport", "B": "border crossing" };

  // Build one list: World Port Index first, UN/LOCODE extras marked
  const ALL = [];
  D.wpi.forEach(function (r) {
    ALL.push({ n: r[0], l: r[1], c: r[2], la: r[3], lo: r[4], sz: r[5], ty: r[6], fp: r[7], ct: r[8], wb: r[9], w: r[10], lf: r[11], a: r[12], src: "wpi" });
  });
  D.unl.forEach(function (r) {
    ALL.push({ n: r[0], l: r[1], c: r[1].slice(0, 2), sub: r[2], st: r[3], fn: r[4], la: r[5], lo: r[6], sz: "", src: "unl" });
  });
  ALL.forEach(function (p) { if (p.a && norm(p.a) === norm(p.n)) p.a = ""; p.key = norm(p.n + " " + (p.a || "") + " " + p.l); });

  const counts = {};
  ALL.forEach(function (p) { counts[p.c] = counts[p.c] || [0, 0]; counts[p.c][p.src === "wpi" ? 0 : 1]++; });
  const countries = Object.keys(counts).map(function (c) { return [c, cname(c)]; }).sort(function (a, b) { return a[1].localeCompare(b[1]); });

  host.innerHTML =
    '<header class="desk-head"><div><p class="eyebrow">Maritime reference</p><h2>World ports &amp; UN/LOCODE port codes</h2>' +
    '<p class="hint" style="margin:4px 0 0;max-width:70ch">' + D.wpi.length.toLocaleString("en") + " commercial seaports from the NGA World Port Index, plus " + D.unl.length.toLocaleString("en") +
    " further UN/LOCODE port locations (small harbours, river and inland ports). Pick a country or search by port name or code.</p></div></header>" +
    '<div class="ports-bar">' +
    '<label class="pf">Country<input id="pt-country" list="pt-countries" placeholder="Type a country…" autocomplete="off"><datalist id="pt-countries">' +
    countries.map(function (c) { return '<option value="' + esc(c[1]) + '">'; }).join("") + "</datalist></label>" +
    '<label class="pf">Port name or code<input id="pt-q" type="search" placeholder="e.g. Antwerp or BEANR" autocomplete="off"></label>' +
    '<div class="pf"><span>Harbour size</span><div class="chips" id="pt-size">' +
    [["", "All"], ["L", "Large"], ["M", "Medium"], ["S", "Small"], ["VS", "Very small"]].map(function (x, i) { return '<button type="button" data-sz="' + x[0] + '" aria-pressed="' + (i === 0) + '">' + x[1] + "</button>"; }).join("") + "</div></div>" +
    '<label class="pchk"><input type="checkbox" id="pt-all"> Also show all UN/LOCODE port locations</label>' +
    "</div>" +
    '<div class="ports-meta"><span id="pt-count"></span><span class="ports-actions"><button type="button" class="btn ghost" id="pt-copy">Copy list</button><button type="button" class="btn ghost" id="pt-csv">Export CSV</button></span></div>' +
    '<div class="tbl-wrap ports-tbl"><table><thead><tr><th>Port</th><th>UN/LOCODE</th><th>Size</th><th>Type / notes</th><th>Location</th></tr></thead><tbody id="pt-body"></tbody></table></div>' +
    '<p class="hint" id="pt-more"></p>' +
    '<p class="hint" style="margin-top:14px;max-width:80ch">Sources: NGA <a href="https://msi.nga.mil/Publications/WPI" target="_blank" rel="noopener">World Port Index</a> (Pub. 150, April 2025, public domain) and UNECE <a href="https://unece.org/trade/cefact/unlocode-code-list-country-and-territory" target="_blank" rel="noopener">UN/LOCODE</a> (release 2024-2). ' +
    "A code marked ≈ was matched to the port by name and should be confirmed. The ISO 6346 / BIC and container tools are in the Toolbox.</p>";

  const st = { cc: "BE", q: "", sz: "", all: false, limit: 400 };
  try { const s = JSON.parse(localStorage.getItem("leosint.ports") || "null"); if (s) { st.cc = s.cc || st.cc; st.all = !!s.all; } } catch (e) { /* ignore */ }
  $("#pt-country").value = st.cc ? cname(st.cc) : "";
  $("#pt-all").checked = st.all;

  function current() {
    const q = norm(st.q.trim());
    const codeQ = /^[a-z]{2}\s?[a-z0-9]{3}$/.test(q) ? q.replace(/\s/g, "") : "";
    return ALL.filter(function (p) {
      if (p.src === "unl" && !st.all && !codeQ) return false;
      if (st.cc && p.c !== st.cc && !codeQ) return false;
      if (st.sz && p.sz !== st.sz) return false;
      if (codeQ) return p.l.toLowerCase() === codeQ || p.key.indexOf(q) > -1;
      return !q || p.key.indexOf(q) > -1;
    }).sort(function (a, b) {
      if (a.src !== b.src) return a.src === "wpi" ? -1 : 1;
      if (!st.cc && a.c !== b.c) return cname(a.c).localeCompare(cname(b.c));
      return (RANK[a.sz] - RANK[b.sz]) || a.n.localeCompare(b.n);
    });
  }
  function mapLinks(p) {
    if (p.la == null || p.lo == null) return '<span class="hint">no coordinates</span>';
    const ll = p.la + "," + p.lo;
    return '<span class="mono">' + p.la.toFixed(3) + ", " + p.lo.toFixed(3) + '</span><br><a href="https://www.google.com/maps/search/?api=1&query=' + ll + '" target="_blank" rel="noopener">Map</a> · ' +
      '<a href="https://map.openseamap.org/?zoom=13&lat=' + p.la + "&lon=" + p.lo + '" target="_blank" rel="noopener">Sea chart</a> · ' +
      '<a href="https://www.google.com/maps/@?api=1&map_action=map&center=' + ll + '&zoom=14&basemap=satellite" target="_blank" rel="noopener">Satellite</a>';
  }
  function render() {
    const list = current();
    const shown = list.slice(0, st.limit);
    const isCode = /^[a-z]{2}\s?[a-z0-9]{3}$/.test(norm(st.q.trim()));
    $("#pt-count").textContent = list.length.toLocaleString("en") + " port" + (list.length === 1 ? "" : "s") + (isCode ? " matching " + st.q.trim().toUpperCase() + " (all countries)" : (st.cc ? " in " + cname(st.cc) : " worldwide") + (st.all ? " (incl. all UN/LOCODE port locations)" : ""));
    $("#pt-body").innerHTML = shown.map(function (p) {
      const notes = [];
      if (p.src === "wpi") { if (p.ty) notes.push(esc(p.ty)); if (p.fp) notes.push("first port of entry"); if (p.ct) notes.push("container facilities"); if (p.wb) notes.push('<span class="hint">' + esc(p.wb) + "</span>"); }
      else { notes.push("UN/LOCODE only" + (p.sub ? " · subdivision " + esc(p.sub) : "")); notes.push('<span class="hint">' + esc(STATUS[p.st] || p.st) + " · functions: " + esc(p.fn.split("").filter(function (x) { return x !== "-"; }).map(function (x) { return FUNC[x] || x; }).join(", ")) + "</span>"); }
      return "<tr><td><b>" + esc(p.n) + "</b>" + (p.a ? '<br><span class="hint">' + esc(p.a) + "</span>" : "") + (!st.cc ? '<br><span class="hint">' + esc(cname(p.c)) + "</span>" : "") + "</td>" +
        '<td class="mono">' + (p.l ? '<button type="button" class="code-btn" data-copy="' + esc(p.l) + '" title="Copy code">' + esc(p.l) + (p.lf ? " ≈" : "") + "</button>" : '<span class="hint">none assigned</span>') + "</td>" +
        "<td>" + (p.sz ? '<span class="sz sz-' + p.sz + '">' + SIZE[p.sz] + "</span>" : '<span class="hint">—</span>') + "</td>" +
        "<td>" + notes.join("<br>") + "</td><td>" + mapLinks(p) + "</td></tr>";
    }).join("") || '<tr><td colspan="5" class="hint">No ports match. Clear the size filter, tick "all UN/LOCODE port locations", or check the spelling.</td></tr>';
    $("#pt-more").innerHTML = list.length > shown.length ? 'Showing the first ' + shown.length + ' of ' + list.length.toLocaleString("en") + '. <button type="button" class="btn ghost" id="pt-showmore">Show more</button>' : "";
    try { localStorage.setItem("leosint.ports", JSON.stringify({ cc: st.cc, all: st.all })); } catch (e) { /* ignore */ }
  }
  function setCountry() {
    const v = norm($("#pt-country").value.trim());
    if (!v) { st.cc = ""; return; }
    const hit = countries.find(function (c) { return norm(c[1]) === v || c[0].toLowerCase() === v; }) || countries.find(function (c) { return norm(c[1]).indexOf(v) === 0; });
    st.cc = hit ? hit[0] : st.cc;
  }
  const timers = {};
  const later = function (k, fn) { clearTimeout(timers[k]); timers[k] = setTimeout(fn, 180); };
  $("#pt-country").addEventListener("input", function () { later("c", function () { setCountry(); st.limit = 400; render(); }); });
  $("#pt-country").addEventListener("change", function () { setCountry(); if (st.cc) $("#pt-country").value = cname(st.cc); st.limit = 400; render(); });
  $("#pt-country").addEventListener("focus", function () { this.select(); });
  $("#pt-q").addEventListener("input", function () { const v = this.value; later("q", function () { st.q = v; st.limit = 400; render(); }); });
  $("#pt-size").addEventListener("click", function (e) {
    const b = e.target.closest("button[data-sz]"); if (!b) return;
    st.sz = b.dataset.sz; this.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); render();
  });
  $("#pt-all").addEventListener("change", function () { st.all = this.checked; st.limit = 400; render(); });
  host.addEventListener("click", function (e) {
    const c = e.target.closest("[data-copy]"); if (c) { window.LE_OSINT.copy(c.dataset.copy); return; }
    if (e.target.id === "pt-showmore") { st.limit += 1000; render(); }
  });
  function rowsOut() {
    return current().map(function (p) { return [cname(p.c), p.n, p.l, SIZE[p.sz] || "", p.src === "wpi" ? (p.ty || "") : "UN/LOCODE only", p.la, p.lo, p.src === "wpi" ? "World Port Index" : "UN/LOCODE"]; });
  }
  $("#pt-copy").addEventListener("click", function () { window.LE_OSINT.copy(rowsOut().map(function (r) { return r.join("\t"); }).join("\n")); });
  $("#pt-csv").addEventListener("click", function () {
    const csv = "Country,Port,UN/LOCODE,Size,Type,Latitude,Longitude,Source\n" + rowsOut().map(function (r) { return r.map(function (x) { return '"' + String(x == null ? "" : x).replace(/"/g, '""') + '"'; }).join(","); }).join("\n");
    try { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "ports-" + (st.cc || "world") + ".csv"; document.body.appendChild(a); a.click(); a.remove(); }
    catch (e) { window.LE_OSINT.copy(csv); }
  });
  render();
})();
