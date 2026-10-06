/* LE OSINT Framework: manifest and booking risk checklist (sea containers, air cargo) */
(function () {
  "use strict";
  const D = window.LE_RISK;
  const host = document.getElementById("risk");
  if (!D || !host) return;
  const $ = function (s, r) { return (r || document).querySelector(s); };
  const esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]; }); };
  const KEY = "leosint.risk";
  let mem = { mode: "sea", sea: {}, air: {} };
  try { const s = JSON.parse(localStorage.getItem(KEY) || "null"); if (s && s.sea) mem = s; } catch (e) { /* storage blocked */ }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) { /* in memory only */ } }

  host.innerHTML =
    '<header class="desk-head"><div><p class="eyebrow">Targeting support</p><h2>Manifest and booking risk checklist</h2>' +
    '<p class="hint" style="margin:4px 0 0;max-width:84ch">Tick the indicators that apply to a consignment. Each one shows why it matters and where it comes from. <b>Strong</b> marks signs that the source itself treats as a trigger; all others are supporting signs. There is no score: one indicator alone proves nothing, and several together are a reason to look closer under your national procedures.</p></div></header>' +
    '<div class="ports-bar"><div class="pf"><span>Consignment</span><div class="chips" id="rk-mode"><button type="button" data-m="sea">Sea container (' + D.sea.length + ')</button><button type="button" data-m="air">Air cargo / express (' + D.air.length + ')</button></div></div>' +
    '<div class="rk-actions"><button type="button" class="btn primary" id="rk-case">Add to case summary</button><button type="button" class="btn ghost" id="rk-copy">Copy ticked list</button><button type="button" class="btn ghost" id="rk-clear">Clear ticks</button></div></div>' +
    '<div class="rk-sum" id="rk-sum"></div><div id="rk-list"></div>' +
    '<p class="hint" style="margin-top:14px;max-width:92ch">' + esc(D.note || "") + ' Updated ' + esc(D.updated) + '. Your ticks stay in this browser only.</p>' +
    '<details class="rk-src"><summary>Sources (' + Object.keys(D.sources).length + ')</summary><ul>' + Object.keys(D.sources).map(function (k) { return '<li><a href="' + esc(D.sources[k][1]) + '" target="_blank" rel="noopener">' + esc(D.sources[k][0]) + "</a></li>"; }).join("") + "</ul></details>";

  function rows() { return D[mem.mode]; }
  function ticked(mode) { const m = mode || mem.mode; return D[m].filter(function (r) { return mem[m][r[0]]; }); }
  function summary() {
    const t = ticked(), s = t.filter(function (r) { return r[4] === "strong"; }).length;
    $("#rk-sum").innerHTML = t.length ? "<b>" + t.length + "</b> indicator" + (t.length === 1 ? "" : "s") + " ticked" + (s ? ", <b>" + s + " strong</b>" : "") + "." : "No indicators ticked yet.";
    $("#rk-sum").className = "rk-sum" + (s ? " has-strong" : t.length ? " has" : "");
  }
  function render() {
    host.querySelectorAll("#rk-mode button").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.m === mem.mode ? "true" : "false"); });
    const groups = [];
    rows().forEach(function (r) { if (groups.indexOf(r[1]) < 0) groups.push(r[1]); });
    $("#rk-list").innerHTML = groups.map(function (g) {
      const rs = rows().filter(function (r) { return r[1] === g; });
      return '<section class="rk-group"><h3>' + esc(g) + ' <span class="hint">' + rs.length + "</span></h3><ul>" + rs.map(function (r) {
        const src = D.sources[r[5]] || ["", ""];
        return '<li class="rk-item' + (mem[mem.mode][r[0]] ? " on" : "") + '"><label><input type="checkbox" data-id="' + esc(r[0]) + '"' + (mem[mem.mode][r[0]] ? " checked" : "") + "><span><b>" + esc(r[2]) + "</b>" + (r[4] === "strong" ? ' <span class="rk-strong">strong</span>' : "") + '<br><span class="hint">' + esc(r[3]) + ' <a href="' + esc(src[1]) + '" target="_blank" rel="noopener" title="' + esc(src[0]) + '">Source</a></span></span></label></li>';
      }).join("") + "</ul></section>";
    }).join("");
    summary();
  }
  function asText(mode) {
    const m = mode || mem.mode, t = ticked(m);
    if (!t.length) return "";
    return (m === "sea" ? "Sea container" : "Air cargo / express") + " risk indicators (" + t.length + "):\n" + t.map(function (r) { return "- " + r[2] + (r[4] === "strong" ? " [strong]" : "") + " (" + r[1] + ")"; }).join("\n");
  }

  host.addEventListener("change", function (e) {
    const c = e.target.closest("input[data-id]"); if (!c) return;
    if (c.checked) mem[mem.mode][c.dataset.id] = 1; else delete mem[mem.mode][c.dataset.id];
    c.closest(".rk-item").classList.toggle("on", c.checked);
    save(); summary();
  });
  host.addEventListener("click", function (e) {
    const m = e.target.closest("#rk-mode button");
    if (m) { mem.mode = m.dataset.m; save(); render(); return; }
    if (e.target.id === "rk-clear") { mem[mem.mode] = {}; save(); render(); return; }
    if (e.target.id === "rk-copy") { const t = asText(); if (t) window.LE_OSINT.copy(t); return; }
    if (e.target.id === "rk-case") {
      if (window.LE_OSINT.caseAddRisk) window.LE_OSINT.caseAddRisk(window.LE_OSINT.riskText());
      if (window.LE_OSINT.showView) window.LE_OSINT.showView("case");
    }
  });
  render();

  window.LE_OSINT = window.LE_OSINT || {};
  window.LE_OSINT.riskText = function () { return [asText("sea"), asText("air")].filter(Boolean).join("\n\n"); };
})();
