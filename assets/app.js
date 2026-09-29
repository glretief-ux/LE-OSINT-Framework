/* LE OSINT Framework — Investigation Desk */
(function () {
  "use strict";

  // ------------------------------------------------------------------
  // Selector types
  // ------------------------------------------------------------------
  const TYPES = {
    user: "Username", email: "Email address", phone: "Phone number", name: "Person name",
    org: "Company", kw: "Keyword", domain: "Domain", ip: "IP address", mac: "MAC / BSSID",
    url: "URL", img: "Image URL", hash: "File hash", crypto: "Crypto address", vessel: "Vessel name",
    imo: "IMO number", mmsi: "MMSI", cont: "Container no.", flight: "Flight number",
    reg: "Aircraft reg.", vin: "VIN", place: "Place / address", cve: "CVE ID"
  };
  const FLAG_TEXT = {
    T: "Tool: install or run locally", D: "Google dork", R: "Free registration or login required",
    L: "Law-enforcement / government access only", F: "Free for verified law enforcement",
    A: "Active: subject may be alerted or your visit logged", P: "Privacy / legal caution"
  };

  // Lines of enquiry: how an investigator thinks, not an alphabetical list.
  const LANES = [
    { id: "person", name: "Person", q: "Who is this person?", cats: ["Username", "Email Address", "Telephone Numbers", "Social Networks", "People Search Engines", "Dating", "Public Records", "Identity & Travel Documents", "Wanted & Missing Persons"] },
    { id: "comms", name: "Communications", q: "Who are they talking to, and where?", cats: ["Instant Messaging", "Gaming Platforms", "Telecom & SIM", "Forums / Blogs / IRC", "Dark Web", "Terrorism"] },
    { id: "goods", name: "Goods, travel & transport", q: "Where is the shipment, vessel, vehicle or traveller?", cats: ["Maritime & Containers", "Customs & Trade", "Transportation", "Travel & Accommodation", "Drug Intelligence", "Classifieds", "Firearms, Wildlife & Cultural Property"] },
    { id: "money", name: "Money & companies", q: "Where is the money and who owns what?", cats: ["Business Records", "Financial Crime & Fraud", "Digital Currency", "Sanctions, PEPs & Watchlists"] },
    { id: "infra", name: "Digital infrastructure", q: "What is behind this website, IP or file?", cats: ["Domain Name", "IP & MAC Address", "Cyber Fraud & Phishing", "Malicious File Analysis", "Threat Intelligence", "Exploits & Advisories"] },
    { id: "place", name: "Places & media", q: "Where and when was this taken?", cats: ["Geolocation Tools / Maps", "Images / Videos / Docs", "Metadata", "AI Tools"] },
    { id: "country", name: "By country", q: "National registers, courts, wanted lists, marketplaces", cats: ["Country Sources"] },
    { id: "research", name: "General research", q: "Search, archive, translate, decode", cats: ["Search Engines", "Archives", "Language Translation", "Encoding / Decoding", "Tools", "Mobile Emulation"] },
    { id: "procedure", name: "Procedure & reporting", q: "Requests, cooperation, law and evidence", cats: ["LE Request Portals", "International Cooperation", "Exploitation & Trafficking Reporting", "Legal & Ethics", "OpSec", "Documentation / Evidence Capture", "Training"] }
  ];

  // ------------------------------------------------------------------
  // Parse the link database
  // ------------------------------------------------------------------
  function parse(src) {
    const root = { name: "root", children: [], notes: [] };
    const stack = [root];
    let current = root, id = 0;
    src.split(/\r?\n/).forEach(function (raw) {
      const line = raw.trim();
      if (!line) return;
      const h = line.match(/^(#{1,3})\s+(.+)$/);
      if (h) {
        const depth = h[1].length;
        let name = h[2].trim();
        const leplus = /\[LE\+\]/.test(name);
        name = name.replace(/\s*\[LE\+\]\s*/, "").trim();
        const node = { id: ++id, name: name, children: [], notes: [], depth: depth, leplus: leplus };
        while (stack.length > depth) stack.pop();
        stack[stack.length - 1].children.push(node);
        stack.push(node);
        current = node;
        return;
      }
      if (line.charAt(0) === ">") { current.notes.push(line.slice(1).trim()); return; }
      if (line.indexOf("|") > -1) {
        const p = line.split("|").map(function (s) { return s.trim(); });
        current.children.push({
          id: ++id, name: p[0], url: p[1], flags: (p[2] || "").replace(/[^TDRLAPF]/g, "").split(""), isNew: /N/.test(p[2] || ""), note: (p[4] || "").trim(),
          sel: (p[3] || "").split(",").map(function (s) { return s.trim(); }).filter(Boolean),
          leaf: true, path: stack.slice(1).map(function (n) { return n.name; }),
          leplus: stack[1] && stack[1].leplus
        });
      }
    });
    return root;
  }
  const DB = parse(window.LE_OSINT_DATA || "");
  const LEAVES = [];
  (function walk(n) { n.children.forEach(function (c) { if (c.leaf) LEAVES.push(c); else walk(c); }); })(DB);
  const CAT_BY_NAME = {};
  DB.children.forEach(function (c) { CAT_BY_NAME[c.name] = c; });
  // any category not placed in a lane goes to General research
  DB.children.forEach(function (c) {
    if (!LANES.some(function (l) { return l.cats.indexOf(c.name) > -1; })) LANES.find(function (l) { return l.id === "research"; }).cats.push(c.name);
  });
  const LANE_OF = {};
  LANES.forEach(function (l) { l.cats.forEach(function (c) { LANE_OF[c] = l; }); });
  window.LE_OSINT = { DB: DB, LEAVES: LEAVES, TYPES: TYPES, LANES: LANES };

  // ------------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------------
  const $ = function (s, r) { return (r || document).querySelector(s); };
  const esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]; }); };
  const store = {
    get: function (k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* unavailable */ } }
  };
  function toast(msg) {
    const t = document.createElement("div"); t.className = "toast"; t.textContent = msg;
    document.body.appendChild(t); setTimeout(function () { t.remove(); }, 2200);
  }
  function fallbackCopy(text) {
    const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); toast("Copied"); } catch (e) { toast("Select the text and copy manually"); }
    ta.remove();
  }
  window.LE_OSINT.toast = toast;
  window.LE_OSINT.copy = function (text) {
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { toast("Copied"); }, function () { fallbackCopy(text); });
    else fallbackCopy(text);
  };
  function debounce(fn, ms) { let t; return function () { clearTimeout(t); t = setTimeout(fn, ms); }; }

  // ------------------------------------------------------------------
  // Selector detection
  // ------------------------------------------------------------------
  function imoValid(d) {
    if (!/^\d{7}$/.test(d)) return false;
    let s = 0; for (let i = 0; i < 6; i++) s += +d[i] * (7 - i);
    return s % 10 === +d[6];
  }
  function detect(v) {
    v = v.trim();
    if (!v) return "";
    if (/^CVE-\d{4}-\d{4,}$/i.test(v)) return "cve";
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "email";
    if (/^https?:\/\//i.test(v)) return /\.(jpe?g|png|gif|webp|bmp|heic|avif)(\?|$)/i.test(v) ? "img" : "url";
    if (/^([0-9a-f]{2}[:-]){5}[0-9a-f]{2}$/i.test(v)) return "mac";
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(v) || /^[0-9a-f:]+:[0-9a-f:]+$/i.test(v)) return "ip";
    if (/^[A-Z]{3}[UJZ]\s?\d{6}\s?-?\d$/i.test(v)) return "cont";
    if (/^IMO\s?\d{7}$/i.test(v) || imoValid(v)) return "imo";
    if (/^\d{9}$/.test(v)) return "mmsi";
    if (/^(0x[a-fA-F0-9]{40}|(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}|T[1-9A-HJ-NP-Za-km-z]{33})$/.test(v)) return "crypto";
    if (/^([a-f0-9]{32}|[a-f0-9]{40}|[a-f0-9]{64})$/i.test(v)) return "hash";
    if (/^[A-HJ-NPR-Z0-9]{17}$/i.test(v) && /\d/.test(v) && /[a-z]/i.test(v)) return "vin";
    if (/^\+?[\d\s\-().]{7,}$/.test(v) && v.replace(/\D/g, "").length >= 7) return "phone";
    if (/^(N\d{1,5}[A-Z]{0,2}|[A-Z]{1,2}-[A-Z0-9]{3,5})$/.test(v)) return "reg";
    if (/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(v)) return "domain";
    if (/^@\S+$/.test(v)) return "user";
    if (/\s/.test(v)) return "name";
    return "user";
  }
  function normalise(v, type) {
    v = v.trim();
    switch (type) {
      case "phone": return v.replace(/\D/g, "");
      case "user": return v.replace(/^@/, "");
      case "cont": return v.replace(/[\s-]/g, "").toUpperCase();
      case "imo": case "mmsi": return v.replace(/\D/g, "");
      case "vin": case "reg": return v.toUpperCase();
      case "flight": return v.replace(/\s/g, "").toUpperCase();
      case "domain": return v.replace(/^https?:\/\//i, "").replace(/\/.*$/, "").toLowerCase();
      default: return v;
    }
  }

  const state = { term: "", type: "", forced: "", lane: store.get("leosint.lane", "person"), view: "desk", filter: "" };

  function fillUrl(link) {
    const u = link.url;
    if (u.charAt(0) === "#" || u.indexOf("{q}") === -1) return u;
    if (state.term && state.type && link.sel.indexOf(state.type) > -1) {
      const val = normalise(state.term, state.type);
      const pos = u.indexOf("{q}");
      const inQuery = u.slice(0, pos).search(/[?#]/) > -1;
      const enc = (inQuery || !/^(url|img)$/.test(state.type)) ? encodeURIComponent(val) : encodeURI(val);
      return u.split("{q}").join(enc);
    }
    try { return new URL(u.split("{q}").join("")).origin + "/"; } catch (e) { return u.split("{q}").join(""); }
  }
  function isFilled(link) { return link.url.indexOf("{q}") > -1 && !!state.term && link.sel.indexOf(state.type) > -1; }
  function flagsHTML(link) {
    return link.flags.map(function (f) { return '<abbr class="flag f-' + (f === "$" ? "S" : f) + '" title="' + esc(FLAG_TEXT[f]) + '">' + esc(f) + "</abbr>"; }).join("");
  }

  // ------------------------------------------------------------------
  // Command bar
  // ------------------------------------------------------------------
  const input = $("#cmd-input");
  const chip = $("#cmd-type");
  const menu = $("#type-menu");
  menu.innerHTML = '<button type="button" data-t="">Detect automatically</button>' + Object.keys(TYPES).map(function (k) { return '<button type="button" data-t="' + k + '">' + TYPES[k] + "</button>"; }).join("");

  function onInput() {
    state.term = input.value.trim();
    state.type = state.forced || detect(state.term);
    chip.textContent = state.term ? (TYPES[state.type] || "Type") : "Any selector";
    chip.classList.toggle("set", !!state.term);
    chip.classList.toggle("forced", !!state.forced);
    render();
  }
  input.addEventListener("input", debounce(onInput, 180));
  input.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { input.value = ""; state.forced = ""; onInput(); }
    if (e.key === "Enter" && input.value.trim()) { onInput(); showView("desk"); }
  });
  $("#cmd-clear").addEventListener("click", function () { input.value = ""; state.forced = ""; onInput(); input.focus(); });
  chip.addEventListener("click", function () { menu.hidden = !menu.hidden; });
  menu.addEventListener("click", function (e) {
    const b = e.target.closest("button[data-t]"); if (!b) return;
    state.forced = b.dataset.t; menu.hidden = true; onInput();
  });
  document.addEventListener("click", function (e) { if (!e.target.closest(".cmd")) menu.hidden = true; });
  $("#examples").addEventListener("click", function (e) {
    const b = e.target.closest("button[data-ex]"); if (!b) return;
    input.value = b.dataset.ex; state.forced = ""; onInput();
  });
  window.LE_OSINT.setSelector = function (v, type) {
    input.value = v; state.forced = type || ""; showView("desk"); onInput(); window.scrollTo(0, 0);
  };

  // ------------------------------------------------------------------
  // Rail (lines of enquiry)
  // ------------------------------------------------------------------
  function laneLinks(lane) {
    const out = [];
    lane.cats.forEach(function (c) { if (CAT_BY_NAME[c]) (function walk(n) { n.children.forEach(function (k) { if (k.leaf) out.push(k); else walk(k); }); })(CAT_BY_NAME[c]); });
    return out;
  }
  function renderRail() {
    const matches = state.term ? LEAVES.filter(function (l) { return l.sel.indexOf(state.type) > -1; }) : [];
    $("#rail-lanes").innerHTML = LANES.map(function (l) {
      const total = laneLinks(l).length;
      const hits = matches.filter(function (m) { return LANE_OF[m.path[0]] === l; }).length;
      return '<button type="button" class="lane' + (state.view === "desk" && state.lane === l.id && !state.term ? " on" : "") + '" data-lane="' + l.id + '">' +
        '<span class="lane-name">' + esc(l.name) + '</span><span class="lane-q">' + esc(l.q) + "</span>" +
        '<span class="lane-n">' + (state.term ? (hits ? '<b>' + hits + "</b> searches" : "—") : total + " sources") + "</span></button>";
    }).join("");
    document.querySelectorAll(".rail-tools button, .topnav button").forEach(function (b) { b.classList.toggle("on", state.view === b.dataset.view); b.setAttribute("aria-current", state.view === b.dataset.view ? "page" : "false"); });
  }
  $("#rail-lanes").addEventListener("click", function (e) {
    const b = e.target.closest("button[data-lane]"); if (!b) return;
    state.lane = b.dataset.lane; store.set("leosint.lane", state.lane);
    showView("desk");
    if (state.term) {
      const el = document.getElementById("run-" + state.lane);
      if (el) { el.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
      input.value = ""; state.forced = ""; onInput();
    } else render();
    window.scrollTo({ top: 0 });
  });
  document.querySelectorAll(".rail-tools button, .topnav button").forEach(function (b) {
    b.addEventListener("click", function () { showView(b.dataset.view); window.scrollTo(0, 0); });
  });

  function showView(v) {
    state.view = v;
    if (v === "playbooks") renderPlaybooks();
    document.querySelectorAll(".view").forEach(function (p) { p.hidden = p.id !== "view-" + v; });
    if (v === "web") drawWeb();
    if (v === "flow") drawFlow();
    document.querySelectorAll(".view").forEach(function (p) { p.hidden = p.id !== "view-" + v; });
    renderRail();
  }

  // ------------------------------------------------------------------
  // Desk: browse mode (no selector) and run sheet (selector entered)
  // ------------------------------------------------------------------
  const DONE_KEY = "leosint.done";
  let done = store.get(DONE_KEY, {});
  function doneSet() { const k = state.type + ":" + normalise(state.term, state.type); return (done[k] = done[k] || {}); }

  function row(l, withCheck) {
    const href = fillUrl(l);
    const internal = href.charAt(0) === "#";
    const ds = withCheck ? doneSet() : null;
    const checked = ds && ds[l.id];
    const where = l.path.slice(1).join(" › ");
    return '<li class="src' + (checked ? " done" : "") + '" data-id="' + l.id + '">' +
      (withCheck ? '<label class="tick"><input type="checkbox" data-done="' + l.id + '"' + (checked ? " checked" : "") + '><span class="sr">Mark as checked</span></label>' : "") +
      '<a class="src-name" ' + (internal ? 'href="' + esc(href) + '" data-internal="1"' : 'href="' + esc(href) + '" target="_blank" rel="noopener noreferrer"') + '>' + esc(l.name) + "</a>" +
      (withCheck ? "" : (where ? '<span class="src-where">' + esc(where) + "</span>" : "")) +
      (l.isNew ? '<span class="newb" title="Added or updated in the September 2026 review">new</span>' : "") +
      (isFilled(l) ? '<span class="filled" title="Opens with your selector filled in">prefilled</span>' : "") +
      '<span class="flags">' + flagsHTML(l) + "</span>" +
      (withCheck && !internal ? '<button type="button" class="log-btn" data-log="' + l.id + '" title="Add this search to the case log">Log</button>' : "") +
      (l.note ? '<span class="src-note">' + esc(l.note) + "</span>" : "") +
      "</li>";
  }

  function renderBrowse() {
    const lane = LANES.find(function (l) { return l.id === state.lane; }) || LANES[0];
    const f = state.filter.toLowerCase();
    let html = '<header class="desk-head"><div><p class="eyebrow">Line of enquiry</p><h2>' + esc(lane.q) + "</h2></div>" +
      '<input type="search" id="lane-filter" placeholder="Filter all ' + LEAVES.length + ' sources" value="' + esc(state.filter) + '"></header>';
    const cats = f ? DB.children : lane.cats.map(function (c) { return CAT_BY_NAME[c]; }).filter(Boolean);
    let count = 0;
    html += '<div class="cats">';
    cats.forEach(function (cat) {
      const items = [];
      (function walk(n) { n.children.forEach(function (k) { if (k.leaf) items.push(k); else walk(k); }); })(cat);
      const shown = items.filter(function (l) { return !f || (l.name + " " + l.url + " " + l.path.join(" ")).toLowerCase().indexOf(f) > -1; });
      if (!shown.length) return;
      count += shown.length;
      html += '<section class="cat"><h3>' + esc(cat.name) + (cat.leplus ? ' <span class="leplus" title="Added for law enforcement">LE+</span>' : "") +
        '<span class="cat-n">' + shown.length + "</span></h3>" +
        (!f ? cat.notes.map(function (n) { return '<p class="note">' + esc(n) + "</p>"; }).join("") : "") +
        '<ul class="srcs">' + shown.map(function (l) { return row(l, false); }).join("") + "</ul></section>";
    });
    html += "</div>";
    if (!count) html += '<p class="empty">No sources match “' + esc(state.filter) + '”.</p>';
    $("#desk").innerHTML = html;
    const fi = $("#lane-filter");
    fi.addEventListener("input", debounce(function () { state.filter = fi.value; renderBrowse(); const n = $("#lane-filter"); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 200));
  }

  function renderRun() {
    const val = normalise(state.term, state.type);
    const links = LEAVES.filter(function (l) { return l.sel.indexOf(state.type) > -1; });
    const ds = doneSet();
    const nDone = links.filter(function (l) { return ds[l.id]; }).length;
    let html = '<header class="desk-head run"><div><p class="eyebrow">Run sheet · ' + esc(TYPES[state.type] || state.type) + '</p><h2 class="sel">' + esc(val) + "</h2></div>" +
      '<div class="run-meta"><div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="' + links.length + '" aria-valuenow="' + nDone + '"><span style="width:' + (links.length ? nDone / links.length * 100 : 0) + '%"></span></div>' +
      '<span class="prog-txt">' + nDone + " of " + links.length + " checked</span>" +
      '<button type="button" class="btn" id="copy-run">Copy run sheet</button><button type="button" class="btn ghost" id="reset-run">Reset ticks</button></div></header>';
    if (!links.length) {
      html += '<p class="empty">No source takes a ' + esc((TYPES[state.type] || "").toLowerCase()) + ' as a direct search yet. Pick another type from the chip in the search bar, or browse a line of enquiry on the left.</p>';
    }
    LANES.forEach(function (lane) {
      const ls = links.filter(function (l) { return LANE_OF[l.path[0]] === lane; });
      if (!ls.length) return;
      const groups = {};
      ls.forEach(function (l) { (groups[l.path[0]] = groups[l.path[0]] || []).push(l); });
      html += '<section class="run-lane" id="run-' + lane.id + '"><h3><span>' + esc(lane.name) + '</span><small>' + esc(lane.q) + "</small></h3>" +
        Object.keys(groups).map(function (g) { return '<div class="run-group"><h4>' + esc(g) + '</h4><ul class="srcs">' + groups[g].map(function (l) { return row(l, true); }).join("") + "</ul></div>"; }).join("") +
        "</section>";
    });
    const tips = helperTips(val);
    if (tips) html = html.replace("</header>", "</header>" + tips);
    $("#desk").innerHTML = html;
    $("#copy-run") && $("#copy-run").addEventListener("click", function () {
      const txt = "Run sheet for " + (TYPES[state.type] || "") + ": " + val + "  (" + new Date().toISOString() + ")\n\n" +
        links.map(function (l) { return (ds[l.id] ? "[x] " : "[ ] ") + l.path[0] + " — " + l.name + "\n    " + fillUrl(l); }).join("\n");
      window.LE_OSINT.copy(txt);
    });
    $("#reset-run") && $("#reset-run").addEventListener("click", function () {
      const k = state.type + ":" + val; delete done[k]; store.set(DONE_KEY, done); renderRun(); renderRail();
    });
  }
  function helperTips(val) {
    const t = state.type;
    const map = {
      cont: ["toolbox-container", "Validate the ISO 6346 check digit first"],
      imo: ["toolbox-container", "Validate the IMO check digit"],
      mmsi: ["toolbox-container", "Decode the MMSI flag (MID)"],
      vin: ["toolbox-container", "Check the VIN check digit"],
      crypto: ["toolbox-crypto", "Identify the blockchain"],
      name: ["toolbox-perm", "Generate username and email variants"],
      hash: ["toolbox-hash", "Hash your own copy to compare"]
    };
    if (!map[t]) return "";
    return '<p class="tip">Tip: <a href="#' + map[t][0] + '" data-internal="1" data-prefill="' + esc(val) + '">' + esc(map[t][1]) + " in the Toolbox →</a></p>";
  }

  $("#desk").addEventListener("change", function (e) {
    const cb = e.target.closest("input[data-done]"); if (!cb) return;
    const ds = doneSet();
    if (cb.checked) ds[cb.dataset.done] = Date.now(); else delete ds[cb.dataset.done];
    store.set(DONE_KEY, done);
    cb.closest("li").classList.toggle("done", cb.checked);
    const links = LEAVES.filter(function (l) { return l.sel.indexOf(state.type) > -1; });
    const n = links.filter(function (l) { return ds[l.id]; }).length;
    $(".prog-txt").textContent = n + " of " + links.length + " checked";
    $(".progress span").style.width = (n / links.length * 100) + "%";
  });
  $("#desk").addEventListener("click", function (e) {
    const a = e.target.closest("a.src-name[target]");
    if (a && state.term) {   // opening a search ticks it off automatically
      const li = a.closest("li"); const cb = li && li.querySelector("input[data-done]");
      if (cb && !cb.checked) { cb.checked = true; cb.dispatchEvent(new Event("change", { bubbles: true })); }
    }
    const b = e.target.closest("button[data-log]"); if (!b) return;
    const l = LEAVES.find(function (x) { return String(x.id) === b.dataset.log; });
    if (l && window.LE_OSINT.addLog) window.LE_OSINT.addLog(fillUrl(l), "Searched " + l.name + " for " + (TYPES[state.type] || "") + " " + normalise(state.term, state.type));
  });

  // internal toolbox links
  document.addEventListener("click", function (e) {
    const a = e.target.closest && e.target.closest('a[data-internal], a[href^="#toolbox-"]');
    if (!a) return;
    e.preventDefault();
    const id = a.getAttribute("href").slice(1);
    if (id === "ports" || id === "hs") { showView(id); window.scrollTo(0, 0); return; }
    showView("toolbox");
    const pre = a.dataset.prefill;
    const target = document.getElementById(id);
    if (pre && target) {
      const inp = { "toolbox-container": state.type === "vin" ? "#vin-in" : "#imo-in", "toolbox-crypto": "#crypto-in" }[id];
      const sel = state.type === "cont" ? "#cont-in" : inp;
      if (sel && $(sel)) { $(sel).value = pre; $(sel).dispatchEvent(new Event("input")); }
      if (id === "toolbox-perm") {
        const parts = pre.split(/\s+/); $("#perm-first").value = parts[0] || ""; $("#perm-last").value = parts.slice(1).join(" ");
        $("#perm-first").dispatchEvent(new Event("input"));
      }
    }
    if (target) setTimeout(function () { target.scrollIntoView({ behavior: "smooth", block: "start" }); }, 30);
  });

  // ------------------------------------------------------------------
  // Case playbooks
  // ------------------------------------------------------------------
  const PB = window.LE_OSINT_PLAYBOOKS || [];
  const PB_KEY = "leosint.playbooks";
  let pbDone = store.get(PB_KEY, {});
  let pbOpen = "";
  const BY_NAME = {};
  LEAVES.forEach(function (l) { if (!BY_NAME[l.name]) BY_NAME[l.name] = l; });
  const TOOL_NAME = { "toolbox-caselog": "Case log", "toolbox-container": "Validators", "toolbox-crypto": "Crypto identifier", "toolbox-perm": "Username permutations", "toolbox-exif": "EXIF viewer", "toolbox-phone": "Phone analyser", "toolbox-coords": "Coordinates", "toolbox-hash": "File hash", "toolbox-dork": "Dork builder", "toolbox-time": "Time converter" };
  function renderPlaybooks() {
    const host = $("#playbooks");
    const pb = PB.find(function (x) { return x.id === pbOpen; });
    if (!pb) {
      host.innerHTML = '<header class="desk-head"><div><p class="eyebrow">Case playbooks</p><h2>Pick the kind of case you are working</h2></div></header><div class="pb-grid">' +
        PB.map(function (x) {
          const steps = x.phases.reduce(function (n, ph) { return n + ph.steps.length; }, 0);
          const d = Object.keys(pbDone[x.id] || {}).length;
          return '<button type="button" class="pb-card" data-pb="' + x.id + '"><h3>' + esc(x.name) + "</h3><p>" + esc(x.when) + '</p><span class="pb-meta">' + x.phases.length + " phases · " + steps + " steps" + (d ? " · " + d + " done" : "") + "</span></button>";
        }).join("") + "</div>";
      return;
    }
    const done = pbDone[pb.id] || {};
    let html = '<button type="button" class="pb-back" data-pb="">← All playbooks</button><header class="desk-head"><div><p class="eyebrow">Playbook</p><h2>' + esc(pb.name) + '</h2><p class="hint" style="margin:4px 0 0">' + esc(pb.when) + '</p></div><button type="button" class="btn ghost" id="pb-reset">Reset ticks</button></header>';
    pb.phases.forEach(function (ph, pi) {
      html += '<section class="pb-phase"><h3><small>Phase ' + (pi + 1) + "</small>" + esc(ph.name) + "</h3>";
      ph.steps.forEach(function (st, si) {
        const k = pi + "." + si;
        const links = (st.src || []).map(function (n) {
          const l = BY_NAME[n]; if (!l) return "";
          const href = fillUrl(l);
          return href.charAt(0) === "#" ? '<a class="tool-link" href="' + esc(href) + '" data-internal="1">' + esc(n) + "</a>" : '<a href="' + esc(href) + '" target="_blank" rel="noopener noreferrer">' + esc(n) + "</a>";
        }).join("");
        const tool = st.tool ? '<a class="tool-link" href="#' + st.tool + '" data-internal="1">Toolbox: ' + esc(TOOL_NAME[st.tool] || st.tool) + "</a>" : "";
        const prof = st.profileView ? '<a class="tool-link" href="#" data-view-link="profile">Open suspect profile</a>' : "";
        html += '<div class="pb-step' + (done[k] ? " done" : "") + '"><label class="tick"><input type="checkbox" data-pbstep="' + k + '"' + (done[k] ? " checked" : "") + '><span class="sr">Done</span></label>' +
          '<div class="t">' + esc(st.t) + "</div>" + (st.why ? '<div class="why">' + esc(st.why) + "</div>" : "<div></div>") +
          '<div class="pb-links">' + links + tool + prof + "</div></div>";
      });
      html += "</section>";
    });
    host.innerHTML = html;
    $("#pb-reset").addEventListener("click", function () { delete pbDone[pb.id]; store.set(PB_KEY, pbDone); renderPlaybooks(); });
  }
  document.addEventListener("click", function (e) {
    const b = e.target.closest && e.target.closest("[data-pb]");
    if (b) { pbOpen = b.dataset.pb; renderPlaybooks(); window.scrollTo(0, 0); return; }
    const v = e.target.closest && e.target.closest("[data-view-link]");
    if (v) { e.preventDefault(); showView(v.dataset.viewLink); window.scrollTo(0, 0); }
  });
  document.addEventListener("change", function (e) {
    const cb = e.target.closest && e.target.closest("input[data-pbstep]"); if (!cb) return;
    pbDone[pbOpen] = pbDone[pbOpen] || {};
    if (cb.checked) pbDone[pbOpen][cb.dataset.pbstep] = Date.now(); else delete pbDone[pbOpen][cb.dataset.pbstep];
    store.set(PB_KEY, pbDone);
    cb.closest(".pb-step").classList.toggle("done", cb.checked);
  });

  // ------------------------------------------------------------------
  // Spider-web map
  // ------------------------------------------------------------------
  const WEB = { open: {}, k: 1, x: 0, y: 0, fitted: false, find: "" };
  const svg = $("#web"), wrap = $("#web-wrap");
  const NS = "http://www.w3.org/2000/svg";
  WEB.open["lane:person"] = true;

  function webTree() {
    // root -> lanes -> categories -> links (sub-categories flattened)
    return {
      id: "root", label: "LE OSINT", depth: 0,
      kids: LANES.map(function (l) {
        return {
          id: "lane:" + l.id, label: l.name, depth: 1, lane: l,
          kids: l.cats.map(function (c) {
            const cat = CAT_BY_NAME[c]; if (!cat) return null;
            const items = [];
            (function walk(n) { n.children.forEach(function (k) { if (k.leaf) items.push(k); else walk(k); }); })(cat);
            return { id: "cat:" + c, label: c, depth: 2, cat: cat, kids: items.map(function (it) { return { id: "src:" + it.id, label: it.name, depth: 3, leaf: it }; }) };
          }).filter(Boolean)
        };
      })
    };
  }
  const TREE = webTree();
  function isOpen(n) { return n.depth === 0 || !!WEB.open[n.id]; }
  function weight(n) {
    if (!n.kids || !n.kids.length || !isOpen(n)) return 1;
    return n.kids.reduce(function (s, k) { return s + weight(k); }, 0) + (n.depth === 0 ? n.kids.length * 0.35 : 0);
  }
  function layout() {
    const nodes = [], edges = [];
    const minGap = [0, 0, 0, 0];
    (function place(n, a0, a1, parent) {
      n.a = (a0 + a1) / 2; n.parent = parent; nodes.push(n);
      if (parent) edges.push([parent, n]);
      if (!n.kids || !isOpen(n)) return;
      const total = weight(n); let a = a0;
      const pad = n.depth === 0 ? 0.35 : 0;
      n.kids.forEach(function (k) {
        const w = weight(k), span = (a1 - a0) * (w + pad) / total;
        place(k, a + (a1 - a0) * pad / total / 2, a + span - (a1 - a0) * pad / total / 2, n);
        a += span;
      });
    })(TREE, -Math.PI / 2, Math.PI * 1.5, null);
    // angular spacing per ring -> radius so labels never collide
    [1, 2, 3].forEach(function (d) {
      const ang = nodes.filter(function (n) { return n.depth === d; }).map(function (n) { return n.a; }).sort(function (a, b) { return a - b; });
      let g = Infinity; for (let i = 1; i < ang.length; i++) g = Math.min(g, ang[i] - ang[i - 1]);
      if (ang.length > 1) g = Math.min(g, ang[0] + Math.PI * 2 - ang[ang.length - 1]);
      minGap[d] = g;
    });
    const R = [0, 170, 0, 0];
    R[2] = Math.max(R[1] + 210, minGap[2] < Infinity ? 17 / minGap[2] : 0);
    R[3] = Math.max(R[2] + 250, minGap[3] < Infinity ? 15.5 / minGap[3] : 0);
    nodes.forEach(function (n) { n.r = R[n.depth]; n.x = Math.cos(n.a) * n.r; n.y = Math.sin(n.a) * n.r; });
    const maxDepth = nodes.reduce(function (m, n) { return Math.max(m, n.depth); }, 1);
    return { nodes: nodes, edges: edges, R: R, rMax: R[maxDepth] + (maxDepth === 3 ? 230 : 190) };
  }
  function pol(r, a) { return [Math.cos(a) * r, Math.sin(a) * r]; }
  function f(v) { return Math.round(v * 10) / 10; }

  function drawWeb() {
    if (!svg) return;
    const L = layout();
    const W = wrap.clientWidth || 900, H = wrap.clientHeight || 600;
    svg.setAttribute("viewBox", (-W / 2) + " " + (-H / 2) + " " + W + " " + H);
    if (!WEB.fitted) { fitWeb(L, W, H); WEB.fitted = true; }
    WEB.last = L;
    const q = WEB.find.toLowerCase();
    let h = '<g id="web-g" transform="translate(' + f(WEB.x) + "," + f(WEB.y) + ") scale(" + WEB.k.toFixed(4) + ')">';
    // web: anchor threads + sagging rings
    const rWeb = Math.max(L.R[2] - 30, 300), N = 28;
    for (let i = 0; i < N; i++) { const p = pol(rWeb + 40, (i / N) * Math.PI * 2 + 0.06); h += '<line class="anchor" x1="0" y1="0" x2="' + f(p[0]) + '" y2="' + f(p[1]) + '"/>'; }
    for (let rr = 40; rr <= rWeb; rr += 34) {
      let d = "";
      for (let i = 0; i <= N; i++) {
        const a = (i / N) * Math.PI * 2 + 0.06, p = pol(rr, a);
        if (i === 0) d += "M" + f(p[0]) + "," + f(p[1]);
        else { const c = pol(rr * 0.9, a - Math.PI / N); d += "Q" + f(c[0]) + "," + f(c[1]) + " " + f(p[0]) + "," + f(p[1]); }
      }
      h += '<path class="thread" d="' + d + '" opacity="' + (0.95 - rr / rWeb * 0.55).toFixed(2) + '"/>';
    }
    // edges
    L.edges.forEach(function (e) {
      const a = e[0], b = e[1], mr = (a.r + b.r) / 2, c1 = pol(mr, a.a), c2 = pol(mr, b.a);
      h += '<path class="edge l' + b.depth + '" d="M' + f(a.x) + "," + f(a.y) + "C" + f(c1[0]) + "," + f(c1[1]) + " " + f(c2[0]) + "," + f(c2[1]) + " " + f(b.x) + "," + f(b.y) + '"/>';
    });
    // nodes
    L.nodes.forEach(function (n) {
      const deg = n.a * 180 / Math.PI, left = Math.cos(n.a) < -0.0001;
      const rot = left ? deg + 180 : deg, anchor = left ? "end" : "start", off = left ? -1 : 1;
      const hit = q && n.label.toLowerCase().indexOf(q) > -1;
      if (n.depth === 0) {
        h += '<g class="node n0" data-id="root"><circle r="46"/><text text-anchor="middle" dy="-2">LE OSINT</text><text text-anchor="middle" dy="16" style="font:600 10px var(--mono);letter-spacing:.06em">' + LEAVES.length + ' SOURCES</text></g>';
        return;
      }
      const open = isOpen(n);
      const rad = n.depth === 1 ? 13 : n.depth === 2 ? 7.5 : 4.5;
      let cls = "node n" + n.depth + (open ? " open" : " closed") + (hit ? " hit" : "");
      if (n.depth === 2 && n.cat.leplus) cls += " le";
      let label = n.label, extra = "";
      if (n.depth === 3) {
        const l = n.leaf;
        if (isFilled(l)) cls += " filled";
        if (l.flags.length) extra = '<tspan class="flagtxt" dx="6">' + esc(l.flags.join(" ")) + "</tspan>";
        const href = fillUrl(l), internal = href.charAt(0) === "#";
        h += '<a class="' + cls + '" ' + (internal ? 'href="' + esc(href) + '" data-internal="1"' : 'href="' + esc(href) + '" target="_blank" rel="noopener noreferrer"') + ' transform="translate(' + f(n.x) + "," + f(n.y) + ')">' +
          "<title>" + esc(l.name + (l.note ? "\n" + l.note : "") + "\n" + l.path.join(" › ") + (l.flags.length ? "\n" + l.flags.map(function (x) { return x + ": " + FLAG_TEXT[x]; }).join("\n") : "") + (isFilled(l) ? "\nOpens with your selector" : "")) + "</title>" +
          '<circle r="' + rad + '"/><text transform="rotate(' + f(rot) + ')" x="' + (off * 10) + '" dy="0.33em" text-anchor="' + anchor + '">' + esc(label) + extra + "</text></a>";
        return;
      }
      const count = n.depth === 1 ? laneLinks(n.lane).length : n.kids.length;
      h += '<g class="' + cls + '" data-id="' + esc(n.id) + '" tabindex="0" role="button" aria-expanded="' + open + '" transform="translate(' + f(n.x) + "," + f(n.y) + ')">' +
        "<title>" + esc(n.label + " — " + count + " sources" + (n.depth === 1 ? "\n" + n.lane.q : "") + (open ? "\nClick to close" : "\nClick to open")) + "</title>" +
        '<circle r="' + rad + '"/>' +
        (n.depth === 1 ? '<text class="badge" text-anchor="middle" dy="0.35em" style="font-size:9px">' + count + "</text>" : "") +
        '<text transform="rotate(' + f(rot) + ')" x="' + (off * (rad + 7)) + '" dy="0.33em" text-anchor="' + anchor + '">' + esc(label) + "</text></g>";
    });
    h += "</g>";
    svg.innerHTML = h;
  }
  function fitWeb(L, W, H) {
    L = L || layout(); W = W || wrap.clientWidth || 900; H = H || wrap.clientHeight || 600;
    WEB.k = Math.min(1.4, Math.min(W, H) / (2 * L.rMax) * 1.1); WEB.x = 0; WEB.y = 0;
  }
  function applyT() { const g = $("#web-g"); if (g) g.setAttribute("transform", "translate(" + f(WEB.x) + "," + f(WEB.y) + ") scale(" + WEB.k.toFixed(4) + ")"); }
  function zoomAt(factor, cx, cy) {
    const k2 = Math.max(0.15, Math.min(4, WEB.k * factor));
    WEB.x = cx - (cx - WEB.x) * (k2 / WEB.k); WEB.y = cy - (cy - WEB.y) * (k2 / WEB.k); WEB.k = k2; applyT();
  }
  function toSvg(ev) { const r = svg.getBoundingClientRect(); return [ev.clientX - r.left - r.width / 2, ev.clientY - r.top - r.height / 2]; }
  function toggleNode(id) {
    const n = WEB.last && WEB.last.nodes.find(function (x) { return x.id === id; });
    if (!n || n.depth === 0) return;
    WEB.open[id] = !WEB.open[id];
    if (!WEB.open[id] && n.kids) n.kids.forEach(function (k) { delete WEB.open[k.id]; });
    const before = [n.x, n.y];
    drawWeb();
    // keep the clicked node where it was on screen, then nudge it towards the centre so its new strands are visible
    const m = WEB.last.nodes.find(function (x) { return x.id === id; });
    if (m) {
      WEB.x += (before[0] - m.x) * WEB.k; WEB.y += (before[1] - m.y) * WEB.k;
      if (WEB.open[id]) { const t = pol((m.r + (m.depth === 1 ? WEB.last.R[2] : WEB.last.R[3])) / 2, m.a); WEB.x = -t[0] * WEB.k; WEB.y = -t[1] * WEB.k; }
      applyT();
    }
  }
  if (svg) {
    let drag = null, moved = false;
    wrap.addEventListener("pointerdown", function (e) { if (e.button !== 0) return; drag = [e.clientX, e.clientY, WEB.x, WEB.y]; moved = false; });
    window.addEventListener("pointermove", function (e) {
      if (!drag) return;
      const dx = e.clientX - drag[0], dy = e.clientY - drag[1];
      if (!moved && Math.abs(dx) + Math.abs(dy) > 4) { moved = true; wrap.classList.add("dragging"); }
      if (moved) { WEB.x = drag[2] + dx; WEB.y = drag[3] + dy; applyT(); }
    });
    window.addEventListener("pointerup", function () { drag = null; setTimeout(function () { wrap.classList.remove("dragging"); }, 0); });
    wrap.addEventListener("click", function (e) {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; return; }
      const g = e.target.closest("g.node[data-id]"); if (g && g.dataset.id !== "root") toggleNode(g.dataset.id);
    }, true);
    wrap.addEventListener("keydown", function (e) {
      const g = e.target.closest && e.target.closest("g.node[data-id]");
      if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); toggleNode(g.dataset.id); }
    });
    wrap.addEventListener("wheel", function (e) { e.preventDefault(); const p = toSvg(e); zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, p[0], p[1]); }, { passive: false });
    $("#web-zin").addEventListener("click", function () { zoomAt(1.3, 0, 0); });
    $("#web-zout").addEventListener("click", function () { zoomAt(1 / 1.3, 0, 0); });
    $("#web-fit").addEventListener("click", function () { fitWeb(); applyT(); });
    $("#web-collapse").addEventListener("click", function () { WEB.open = {}; WEB.find = ""; $("#web-find").value = ""; WEB.fitted = false; drawWeb(); });
    $("#web-find").addEventListener("input", debounce(function () {
      WEB.find = $("#web-find").value.trim();
      const q = WEB.find.toLowerCase();
      if (q.length >= 2) {
        WEB.open = {};
        let hits = 0;
        TREE.kids.forEach(function (lane) {
          lane.kids.forEach(function (cat) {
            const catHit = cat.label.toLowerCase().indexOf(q) > -1;
            const srcHits = cat.kids.filter(function (s) { return s.label.toLowerCase().indexOf(q) > -1; }).length;
            if (catHit || srcHits) { WEB.open[lane.id] = true; hits += srcHits + (catHit ? 1 : 0); }
            if (srcHits && srcHits < 40) WEB.open[cat.id] = true;
          });
          if (lane.label.toLowerCase().indexOf(q) > -1) WEB.open[lane.id] = true;
        });
        $("#web-hint").textContent = hits ? hits + " matches highlighted" : "No matches";
      } else $("#web-hint").textContent = "Click a strand to open it · drag to move · scroll to zoom";
      WEB.fitted = false; drawWeb();
    }, 250));
    window.addEventListener("resize", debounce(function () { if (state.view === "web") drawWeb(); }, 200));
  }

  // ------------------------------------------------------------------
  // Mural-style flow chart (left to right)
  // ------------------------------------------------------------------
  const FLOW = { open: { "lane:person": true }, k: 1, x: 0, y: 0, fitted: false, find: "" };
  const fsvg = $("#flow"), fwrap = $("#flow-wrap");
  const STICKY = ["#FFE27A", "#FFB3C7", "#9FD6FF", "#A8E6A3", "#FFC98A", "#D2B8FF", "#8EE3D5", "#E3EE8C", "#D9DCE0"];
  const COLX = [0, 300, 640, 1010], SIZE = [[230, 84], [236, 66], [268, 46], [310, 36]], SLOT = [0, 84, 58, 42];
  function fOpen(n) { return n.depth === 0 || !!FLOW.open[n.id]; }
  function clip(s, n) { return s.length > n ? s.slice(0, n - 1) + "…" : s; }
  function flowLayout() {
    const nodes = [], edges = []; let cursor = 0;
    TREE.kids.forEach(function (l, i) { l.color = STICKY[i % STICKY.length]; (l.kids || []).forEach(function (c) { c.color = l.color; c.kids.forEach(function (s) { s.color = l.color; }); }); });
    (function place(n, parent) {
      nodes.push(n); if (parent) edges.push([parent, n]);
      n.fx = COLX[n.depth]; n.w = SIZE[n.depth][0]; n.h = SIZE[n.depth][1];
      if (n.kids && n.kids.length && fOpen(n)) {
        const first = nodes.length;
        n.kids.forEach(function (k) { place(k, n); });
        const kids = n.kids.map(function (k) { return k; });
        n.fy = (kids[0].fy + kids[kids.length - 1].fy) / 2;
        if (n.depth === 1) cursor += 22;
      } else { n.fy = cursor + SLOT[Math.max(1, n.depth)] / 2; cursor += SLOT[Math.max(1, n.depth)]; if (n.depth === 1) cursor += 6; }
    })(TREE, null);
    let minY = Infinity, maxY = -Infinity, maxX = 0;
    nodes.forEach(function (n) { minY = Math.min(minY, n.fy - n.h / 2); maxY = Math.max(maxY, n.fy + n.h / 2); maxX = Math.max(maxX, n.fx + n.w + (n.depth === 3 ? 40 : 30)); });
    return { nodes: nodes, edges: edges, box: [-20, minY - 20, maxX + 20, maxY + 20] };
  }
  function drawFlow() {
    if (!fsvg) return;
    const L = flowLayout(); FLOW.last = L;
    const W = fwrap.clientWidth || 900, H = fwrap.clientHeight || 600;
    fsvg.setAttribute("viewBox", "0 0 " + W + " " + H);
    if (!FLOW.fitted) { fitFlow(L, W, H); FLOW.fitted = true; }
    const q = FLOW.find.toLowerCase();
    let h = '<defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="arrowhead" style="fill:var(--conn)"/></marker></defs>';
    h += '<g id="flow-g" transform="translate(' + f(FLOW.x) + "," + f(FLOW.y) + ") scale(" + FLOW.k.toFixed(4) + ')">';
    L.edges.forEach(function (e) {
      const a = e[0], b = e[1], x1 = a.fx + a.w, y1 = a.fy, x2 = b.fx - 4, y2 = b.fy, mx = (x1 + x2) / 2;
      h += '<path class="conn c' + b.depth + '" marker-end="url(#arr)" d="M' + f(x1) + "," + f(y1) + " C" + f(mx) + "," + f(y1) + " " + f(mx) + "," + f(y2) + " " + f(x2) + "," + f(y2) + '"/>';
    });
    L.nodes.forEach(function (n) {
      const x = n.fx, y = n.fy - n.h / 2, hit = q && n.label.toLowerCase().indexOf(q) > -1;
      if (n.depth === 0) {
        h += '<g class="card" data-id="root"><rect class="shadow" x="' + (x + 4) + '" y="' + (y + 5) + '" width="' + n.w + '" height="' + n.h + '" rx="10"/>' +
          '<rect class="body" x="' + x + '" y="' + y + '" width="' + n.w + '" height="' + n.h + '" rx="10" style="fill:#1E2328"/>' +
          '<text class="t1" x="' + (x + 18) + '" y="' + (y + 36) + '" style="fill:#fff">LE OSINT Framework</text>' +
          '<text class="sub" x="' + (x + 18) + '" y="' + (y + 60) + '" style="fill:#AEB6BE">' + LEAVES.length + " free sources</text></g>";
        return;
      }
      if (n.depth === 3) {
        const l = n.leaf, href = fillUrl(l), internal = href.charAt(0) === "#", filled = isFilled(l);
        h += '<a class="card' + (hit ? " hit" : "") + (filled ? " filled" : "") + '" ' + (internal ? 'href="' + esc(href) + '" data-internal="1"' : 'href="' + esc(href) + '" target="_blank" rel="noopener noreferrer"') + ">" +
          "<title>" + esc(l.name + (l.note ? "\n" + l.note : "") + "\n" + l.path.join(" › ") + (l.flags.length ? "\n" + l.flags.map(function (x) { return x + ": " + FLAG_TEXT[x]; }).join("\n") : "") + (filled ? "\nOpens with your selector" : "") + "\n" + l.url) + "</title>" +
          '<rect class="shadow" x="' + (x + 2) + '" y="' + (y + 3) + '" width="' + n.w + '" height="' + n.h + '" rx="6"/>' +
          '<rect class="body" x="' + x + '" y="' + y + '" width="' + n.w + '" height="' + n.h + '" rx="6" style="fill:#FFFFFF"/>' +
          '<rect x="' + x + '" y="' + y + '" width="7" height="' + n.h + '" rx="3" style="fill:' + n.color + '"/>' +
          '<text class="t3" x="' + (x + 16) + '" y="' + (y + 23) + '">' + esc(clip(l.name, l.flags.length ? 30 : 36)) + "</text>" +
          (l.flags.length ? '<text class="flg" text-anchor="end" x="' + (x + n.w - 10) + '" y="' + (y + 23) + '">' + esc(l.flags.join(" ")) + "</text>" : "") +
          (filled ? '<circle cx="' + (x + n.w) + '" cy="' + y + '" r="6" style="fill:#0E7C6B"/>' : "") + "</a>";
        return;
      }
      const open = fOpen(n), count = n.depth === 1 ? laneLinks(n.lane).length : n.kids.length;
      const fill = n.depth === 1 ? n.color : n.color;
      h += '<g class="card' + (hit ? " hit" : "") + '" data-id="' + esc(n.id) + '" tabindex="0" role="button" aria-expanded="' + open + '">' +
        "<title>" + esc(n.label + " — " + count + " sources" + (n.depth === 1 ? "\n" + n.lane.q : "") + (open ? "\nClick to close" : "\nClick to open")) + "</title>" +
        '<rect class="shadow" x="' + (x + 3) + '" y="' + (y + 4) + '" width="' + n.w + '" height="' + n.h + '" rx="' + (n.depth === 1 ? 4 : 8) + '"/>' +
        '<rect class="body" x="' + x + '" y="' + y + '" width="' + n.w + '" height="' + n.h + '" rx="' + (n.depth === 1 ? 4 : 8) + '" style="fill:' + fill + (n.depth === 2 ? ";fill-opacity:.55" : "") + '"/>' +
        (n.depth === 2 ? '<rect x="' + x + '" y="' + y + '" width="' + n.w + '" height="' + n.h + '" rx="8" style="fill:#FFFFFF;fill-opacity:.45"/>' : "") +
        (n.depth === 1
          ? '<text class="t1" x="' + (x + 16) + '" y="' + (y + 28) + '">' + esc(clip(n.label, 21)) + '</text><text class="sub" x="' + (x + 16) + '" y="' + (y + 50) + '">' + count + " sources</text>"
          : '<text class="t2" x="' + (x + 14) + '" y="' + (y + 28) + '">' + esc(clip(n.label, 25)) + (n.cat.leplus ? " ★" : "") + '</text><text class="sub" text-anchor="end" x="' + (x + n.w - 34) + '" y="' + (y + 28) + '">' + count + "</text>") +
        '<circle cx="' + (x + n.w - 16) + '" cy="' + n.fy + '" r="10" style="fill:#FFFFFF;fill-opacity:.8"/><text class="plus" text-anchor="middle" x="' + (x + n.w - 16) + '" y="' + (n.fy + 5.5) + '">' + (open ? "−" : "+") + "</text></g>";
    });
    h += "</g>";
    fsvg.innerHTML = h;
  }
  function fitFlow(L, W, H) {
    L = L || flowLayout(); W = W || fwrap.clientWidth || 900; H = H || fwrap.clientHeight || 600;
    const b = L.box, bw = b[2] - b[0], bh = b[3] - b[1];
    FLOW.k = Math.max(0.25, Math.min(1, W / bw, H / bh));
    FLOW.x = (W - bw * FLOW.k) / 2 - b[0] * FLOW.k;
    FLOW.y = bh * FLOW.k < H ? (H - bh * FLOW.k) / 2 - b[1] * FLOW.k : 20 - b[1] * FLOW.k;
  }
  function applyF() { const g = $("#flow-g"); if (g) g.setAttribute("transform", "translate(" + f(FLOW.x) + "," + f(FLOW.y) + ") scale(" + FLOW.k.toFixed(4) + ")"); }
  function zoomF(factor, cx, cy) {
    const k2 = Math.max(0.15, Math.min(3, FLOW.k * factor));
    FLOW.x = cx - (cx - FLOW.x) * (k2 / FLOW.k); FLOW.y = cy - (cy - FLOW.y) * (k2 / FLOW.k); FLOW.k = k2; applyF();
  }
  function toggleFlow(id) {
    const n = FLOW.last && FLOW.last.nodes.find(function (x) { return x.id === id; });
    if (!n || n.depth === 0) return;
    const before = n.fy;
    FLOW.open[id] = !FLOW.open[id];
    if (!FLOW.open[id] && n.kids) n.kids.forEach(function (k) { delete FLOW.open[k.id]; });
    drawFlow();
    const m = FLOW.last.nodes.find(function (x) { return x.id === id; });
    if (m) {
      FLOW.y += (before - m.fy) * FLOW.k;
      if (FLOW.open[id] && m.kids && m.kids.length) {
        // make sure the newly opened cards are on screen
        const H = fwrap.clientHeight || 600;
        const top = (m.kids[0].fy - m.kids[0].h) * FLOW.k + FLOW.y, bot = (m.kids[m.kids.length - 1].fy + 30) * FLOW.k + FLOW.y;
        if (bot > H - 10) FLOW.y -= Math.min(bot - (H - 10), top - 10);
        if (top < 10) FLOW.y += 10 - top;
      }
      applyF();
    }
  }
  if (fsvg) {
    let drag = null, moved = false;
    fwrap.addEventListener("pointerdown", function (e) { if (e.button !== 0) return; drag = [e.clientX, e.clientY, FLOW.x, FLOW.y]; moved = false; });
    window.addEventListener("pointermove", function (e) {
      if (!drag) return;
      const dx = e.clientX - drag[0], dy = e.clientY - drag[1];
      if (!moved && Math.abs(dx) + Math.abs(dy) > 4) { moved = true; fwrap.classList.add("dragging"); }
      if (moved) { FLOW.x = drag[2] + dx; FLOW.y = drag[3] + dy; applyF(); }
    });
    window.addEventListener("pointerup", function () { drag = null; setTimeout(function () { fwrap.classList.remove("dragging"); }, 0); });
    fwrap.addEventListener("click", function (e) {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; return; }
      const g = e.target.closest("g.card[data-id]"); if (g && g.dataset.id !== "root") toggleFlow(g.dataset.id);
    }, true);
    fwrap.addEventListener("keydown", function (e) {
      const g = e.target.closest && e.target.closest("g.card[data-id]");
      if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); toggleFlow(g.dataset.id); }
    });
    fwrap.addEventListener("wheel", function (e) {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey || e.deltaMode !== 0 || (Math.abs(e.deltaY) >= 50 && Math.abs(e.deltaY) > Math.abs(e.deltaX))) {
        const r = fsvg.getBoundingClientRect(); zoomF(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - r.left, e.clientY - r.top);
      } else { FLOW.x -= e.deltaX; FLOW.y -= e.deltaY; applyF(); }
    }, { passive: false });
    const mid = function () { return [(fwrap.clientWidth || 900) / 2, (fwrap.clientHeight || 600) / 2]; };
    $("#flow-zin").addEventListener("click", function () { const c = mid(); zoomF(1.25, c[0], c[1]); });
    $("#flow-zout").addEventListener("click", function () { const c = mid(); zoomF(1 / 1.25, c[0], c[1]); });
    $("#flow-fit").addEventListener("click", function () { fitFlow(); applyF(); });
    $("#flow-collapse").addEventListener("click", function () { FLOW.open = {}; FLOW.find = ""; $("#flow-find").value = ""; FLOW.fitted = false; drawFlow(); });
    $("#flow-find").addEventListener("input", debounce(function () {
      FLOW.find = $("#flow-find").value.trim();
      const q = FLOW.find.toLowerCase();
      if (q.length >= 2) {
        FLOW.open = {}; let hits = 0;
        TREE.kids.forEach(function (lane) {
          if (lane.label.toLowerCase().indexOf(q) > -1) FLOW.open[lane.id] = true;
          lane.kids.forEach(function (cat) {
            const catHit = cat.label.toLowerCase().indexOf(q) > -1;
            const n = cat.kids.filter(function (s) { return s.label.toLowerCase().indexOf(q) > -1; }).length;
            if (catHit || n) { FLOW.open[lane.id] = true; hits += n + (catHit ? 1 : 0); }
            if (n) FLOW.open[cat.id] = true;
          });
        });
        $("#flow-hint").textContent = hits ? hits + " matches highlighted" : "No matches";
      } else $("#flow-hint").textContent = "Click a card to open the next step · drag to move · scroll to zoom";
      FLOW.fitted = false; drawFlow();
    }, 250));
    window.addEventListener("resize", debounce(function () { if (state.view === "flow") drawFlow(); }, 200));
  }

  function render() {
    renderRail();
    if (state.term) renderRun(); else renderBrowse();
    if (state.view === "web") drawWeb();
    if (state.view === "flow") drawFlow();
  }

  $("#stat-links").textContent = LEAVES.length;
  $("#stat-search").textContent = LEAVES.filter(function (l) { return l.url.indexOf("{q}") > -1; }).length;
  $("#stat-cats").textContent = DB.children.length;

  const h = (location.hash || "").slice(1);
  render();
  if (/^toolbox-/.test(h)) { showView("toolbox"); setTimeout(function () { const el = document.getElementById(h); if (el) el.scrollIntoView(); }, 50); }
  else if (["toolbox", "about", "playbooks", "profile", "web", "flow", "desk", "ports", "hs"].indexOf(h) > -1) showView(h);
  else showView("flow");
})();
