/* LE OSINT Framework: live flight tracker (flight number / callsign / registration / ICAO hex -> live map)
   Live positions: free community ADS-B networks (adsb.lol, airplanes.live, adsb.fi), tried in turn.
   Route and aircraft details: adsbdb.com. Map: Leaflet with CARTO / Esri tiles. Needs internet. */
(function () {
  "use strict";
  const host = document.getElementById("flights");
  if (!host || !window.L) return;
  const $ = function (s, r) { return (r || document).querySelector(s); };
  const esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]; }); };

  // Browsers can only read the ADS-B APIs through a CORS-enabled proxy (the public APIs send no CORS headers).
  // Without a proxy the tab embeds the adsb.lol live map instead.
  let PROXY = ""; try { PROXY = (localStorage.getItem("leosint.flightproxy") || "").replace(/\/+$/, ""); } catch (e) { /* storage blocked */ }
  let SOURCES = [];
  function setSources() {
    SOURCES = PROXY ? [{ name: "your live-data proxy", cs: PROXY + "/v2/callsign/", hex: PROXY + "/v2/hex/", reg: PROXY + "/v2/reg/", pt: function (a, o, r) { return PROXY + "/v2/point/" + a + "/" + o + "/" + r; } }] : [];
  }
  setSources();
  const EMBED = "https://adsb.lol/";
  const SQUAWK = { "7500": "Unlawful interference (hijack)", "7600": "Radio failure", "7700": "General emergency" };

  host.innerHTML =
    '<header class="desk-head"><div><p class="eyebrow">Aviation · live</p><h2>Flight tracker</h2>' +
    '<p class="hint" style="margin:4px 0 0;max-width:76ch">Enter a flight number (<span class="mono">KL1001</span>), ICAO callsign (<span class="mono">KLM1001</span>), aircraft registration (<span class="mono">PH-BXA</span>) or ICAO 24-bit hex code (<span class="mono">4840D6</span>). ' +
    "You get the scheduled route on the map and the aircraft details (type, owner, photo) here, and one click opens the live position. <b>Aircraft in this area</b> shows all live traffic around the map centre.</p></div></header>" +
    '<form class="fl-bar" id="fl-form" autocomplete="off">' +
    '<label class="pf" style="flex:1 1 260px">Flight, callsign, registration or hex<input id="fl-q" type="search" placeholder="e.g. BA123, BAW123, G-XLEA, 400A0B" spellcheck="false"></label>' +
    '<label class="pf">Search as<select id="fl-mode"><option value="auto">Automatic</option><option value="flight">Flight / callsign</option><option value="reg">Registration</option><option value="hex">ICAO hex</option></select></label>' +
    '<button class="btn" type="submit">Track flight</button>' +
    '<button class="btn ghost" type="button" id="fl-area">Aircraft in this area</button>' +
    "</form>" +
    '<div class="fl-opts"><label class="pchk"><input type="checkbox" id="fl-live" checked> Live refresh (10 s)</label><label class="pchk"><input type="checkbox" id="fl-follow" checked> Keep aircraft centred</label><span id="fl-status" class="fl-status" role="status"></span></div>' +
    '<div class="fl-launch" id="fl-launch" hidden></div>' +
    '<div class="fl-grid"><div class="fl-mapbox"><div id="fl-map" class="fl-map" aria-label="Flight map"></div></div><aside id="fl-info" class="fl-info"><p class="hint">No flight selected yet.</p></aside></div>' +
    '<p class="hint" style="margin-top:12px;max-width:86ch">Live positions come from the free, unfiltered community ADS-B network <a href="https://adsb.lol/" target="_blank" rel="noopener">adsb.lol</a> (it also shows aircraft that are hidden on commercial trackers); route and aircraft details from <a href="https://www.adsbdb.com/" target="_blank" rel="noopener">adsbdb</a>. ' +
    "Coverage depends on volunteer receivers: gaps over oceans and remote areas are normal. The scheduled route is from a database and can be wrong for charter, diverted or ad-hoc flights. Your searches are sent to these services, so use an approved, non-attributable environment. Map tiles © Esri and © OpenStreetMap contributors.</p>" +
    '<details class="fl-set" id="fl-set"><summary>Live data connection (advanced)</summary>' +
    '<p class="hint" style="max-width:80ch">By default the live position opens on the <a href="https://adsb.lol/" target="_blank" rel="noopener">adsb.lol</a> map in a new tab, because the free ADS-B services do not let other web pages read or embed their live data. ' +
    'If your unit runs a small proxy (for example the free Cloudflare Worker in <span class="mono">tools/flight-proxy/</span> of this project), enter its address here and the aircraft is drawn on this tool\'s own map with its track, altitude, speed and squawk, refreshed every 10 seconds.</p>' +
    '<div class="fl-bar"><label class="pf" style="flex:1 1 320px">Proxy address<input id="fl-proxy" type="url" placeholder="https://flight-proxy.your-unit.workers.dev" spellcheck="false"></label><button type="button" class="btn ghost" id="fl-proxy-save">Save</button><button type="button" class="btn ghost" id="fl-proxy-clear">Remove proxy</button></div></details>';

  // ---------- map ----------
  const dark = function () { const t = document.documentElement.dataset.theme; return t === "dark" || (t !== "light" && window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches); };
  const tiles = {
    // Esri basemaps need no API key and no Referer, so they also work from the offline file
    "Streets": L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", { maxZoom: 19, attribution: "Map © Esri, HERE, Garmin, © OpenStreetMap contributors" }),
    "Dark": L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}", { maxZoom: 16, attribution: "Map © Esri, HERE, Garmin, © OpenStreetMap contributors" }),
    "Satellite": L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { maxZoom: 19, attribution: "Imagery © Esri, Maxar, Earthstar Geographics" }),
    "OpenStreetMap": L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, referrerPolicy: "strict-origin-when-cross-origin", attribution: "© OpenStreetMap contributors" })
  };
  let map = null, layer = null, areaLayer = null;
  function ensureMap() {
    if (map) { map.invalidateSize(); return; }
    map = L.map("fl-map", { worldCopyJump: true, zoomControl: true }).setView([50.5, 4.5], 5);
    (dark() ? tiles.Dark : tiles.Streets).addTo(map);
    L.control.layers(tiles, null, { position: "topright" }).addTo(map);
    L.control.scale({ imperial: false }).addTo(map);
    layer = L.layerGroup().addTo(map); areaLayer = L.layerGroup().addTo(map);
  }
  function planeIcon(track, cls) {
    return L.divIcon({ className: "fl-plane " + (cls || ""), iconSize: [30, 30], iconAnchor: [15, 15],
      html: '<svg viewBox="0 0 24 24" width="30" height="30" style="transform:rotate(' + (track || 0) + 'deg)"><path d="M12 2c.8 0 1.3.9 1.3 2v5.2l7.7 4.6v2l-7.7-2.4v4.4l2.2 1.7V21L12 20l-3.5 1v-1.5l2.2-1.7v-4.4L3 15.8v-2l7.7-4.6V4c0-1.1.5-2 1.3-2z"/></svg>' });
  }
  function apIcon(lbl) { return L.divIcon({ className: "fl-ap", iconSize: null, html: "<span>" + esc(lbl) + "</span>" }); }
  function gc(a, b, n) { // great-circle points between [lat,lon]
    const r = Math.PI / 180, p1 = a[0] * r, l1 = a[1] * r, p2 = b[0] * r, l2 = b[1] * r;
    const d = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin((p2 - p1) / 2), 2) + Math.cos(p1) * Math.cos(p2) * Math.pow(Math.sin((l2 - l1) / 2), 2)));
    if (!d) return [a, b];
    const out = []; let prev = null;
    for (let i = 0; i <= n; i++) {
      const f = i / n, A = Math.sin((1 - f) * d) / Math.sin(d), B = Math.sin(f * d) / Math.sin(d);
      const x = A * Math.cos(p1) * Math.cos(l1) + B * Math.cos(p2) * Math.cos(l2), y = A * Math.cos(p1) * Math.sin(l1) + B * Math.cos(p2) * Math.sin(l2), z = A * Math.sin(p1) + B * Math.sin(p2);
      let lon = Math.atan2(y, x) / r; const lat = Math.atan2(z, Math.sqrt(x * x + y * y)) / r;
      if (prev !== null) { while (lon - prev > 180) lon -= 360; while (lon - prev < -180) lon += 360; }
      prev = lon; out.push([lat, lon]);
    }
    return out;
  }
  function nm(a, b) { const r = Math.PI / 180, d = Math.acos(Math.min(1, Math.sin(a[0] * r) * Math.sin(b[0] * r) + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.cos((b[1] - a[1]) * r))); return d * 3440.065; }

  // ---------- data ----------
  function getJSON(url, ms) {
    const ctl = window.AbortController ? new AbortController() : null;
    const t = setTimeout(function () { if (ctl) ctl.abort(); }, ms || 9000);
    return fetch(url, { signal: ctl ? ctl.signal : undefined, referrerPolicy: "no-referrer", cache: "no-store" })
      .then(function (r) { clearTimeout(t); if (r.status === 404) return null; if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .catch(function (e) { clearTimeout(t); throw e; });
  }
  function live(kind, val) { // try each network until one answers
    let i = 0; const errs = [];
    function next() {
      if (i >= SOURCES.length) return Promise.reject(new Error(errs.join("; ")));
      const s = SOURCES[i++];
      return getJSON(s[kind] + encodeURIComponent(val)).then(function (j) {
        const ac = (j && (j.ac || j.aircraft)) || [];
        return { ac: ac, src: s };
      }).catch(function (e) { errs.push(s.name + ": " + (e.name === "AbortError" ? "timeout" : e.message)); return next(); });
    }
    return next();
  }
  function liveFirstHit(kind, val) { // like live(), but moves on when a network answers with no aircraft
    let i = 0, lastOk = null; const errs = [];
    function next() {
      if (i >= SOURCES.length) return lastOk ? Promise.resolve(lastOk) : Promise.reject(new Error(errs.join("; ")));
      const s = SOURCES[i++];
      return getJSON(s[kind] + encodeURIComponent(val)).then(function (j) {
        const ac = (j && (j.ac || j.aircraft)) || [];
        lastOk = { ac: ac, src: s };
        return ac.length ? lastOk : next();
      }).catch(function (e) { errs.push(s.name + ": " + (e.name === "AbortError" ? "timeout" : e.message)); return next(); });
    }
    return next();
  }
  const cache = {};
  function adsbdb(path) {
    if (cache[path] !== undefined) return Promise.resolve(cache[path]);
    return getJSON("https://api.adsbdb.com/v0/" + path, 8000).then(function (j) { cache[path] = (j && j.response && typeof j.response === "object") ? j.response : null; return cache[path]; }).catch(function () { return null; });
  }

  // ---------- query parsing ----------
  function classify(raw, mode) {
    const v = raw.trim().toUpperCase().replace(/\s+/g, "");
    if (!v) return null;
    if (mode === "hex" || (mode === "auto" && /^~?[0-9A-F]{6}$/.test(v) && !/^[A-Z]{3}\d/.test(v))) return { kind: "hex", v: v.replace("~", "").toLowerCase() };
    if (mode === "reg" || (mode === "auto" && (/^[A-Z0-9]{1,2}-[A-Z0-9]{2,5}$/.test(v) || /^N\d[0-9A-Z]{0,4}$/.test(v) && !/^N\d{1,4}$/.test(v)))) return { kind: "reg", v: v };
    return { kind: "flight", v: v, alsoHex: /^[0-9A-F]{6}$/.test(v) };
  }

  const st = { q: null, hex: "", cs: "", trail: [], route: null, acinfo: null, timer: 0, busy: false, lastAc: null, src: null, fitDone: false };
  function status(msg, cls) { const s = $("#fl-status"); s.textContent = msg || ""; s.className = "fl-status " + (cls || ""); }

  // ---------- default mode (no proxy): route + details here, live position opens on adsb.lol ----------
  // (the live maps cannot be embedded: their data needs a first-party cookie, which browsers block inside another site)
  function modeUI() {
    $("#fl-live").parentNode.hidden = !PROXY; $("#fl-follow").parentNode.hidden = !PROXY;
    $("#fl-proxy").value = PROXY;
    setTimeout(ensureMap, 30);
  }
  function launcher() {
    const r = st.route, cs = st.cs || (st.q && st.q.v) || "", iata = r && r.callsign_iata || "";
    const btns = ['<a class="btn fl-go" href="' + esc(st.liveUrl) + '" target="_blank" rel="noopener">Show live position ↗</a>'];
    if (st.q && st.q.kind === "flight") {
      btns.push('<a class="btn ghost" href="https://www.flightradar24.com/data/flights/' + encodeURIComponent((iata || cs).toLowerCase()) + '" target="_blank" rel="noopener">Flightradar24 ↗</a>');
      btns.push('<a class="btn ghost" href="https://www.flightaware.com/live/flight/' + encodeURIComponent(cs) + '" target="_blank" rel="noopener">FlightAware ↗</a>');
    }
    if (st.hex) btns.push('<a class="btn ghost" href="https://globe.adsbexchange.com/?icao=' + st.hex + '" target="_blank" rel="noopener">ADS-B Exchange ↗</a>');
    const el = $("#fl-launch");
    el.innerHTML = '<div class="fl-launch-btns">' + btns.join("") + '</div><p class="hint">The live position opens in a new tab on the free, unfiltered adsb.lol map' + (st.q && st.q.kind === "flight" ? ", showing only " + esc(cs) + " (also with a suffix letter, e.g. " + esc(cs) + "F)" : "") + '. Click the aircraft there for altitude, speed and squawk. No aircraft = not airborne yet, landed or out of receiver coverage.</p>';
    el.hidden = false;
  }
  function embedTrack(q) {
    ensureMap(); clearInterval(st.timer); layer.clearLayers(); areaLayer.clearLayers();
    Object.assign(st, { q: q, hex: "", cs: "", trail: [], route: null, acinfo: null, lastAc: null, fitDone: false, bounds: null, liveUrl: "" });
    status("Looking up…");
    function done() {
      let url;
      if (st.hex) url = EMBED + "?icao=" + st.hex + "&zoom=7";
      else if (q.kind === "reg") url = EMBED + "?reg=" + encodeURIComponent(q.v);
      else {
        const cs = st.cs || q.v;
        // airlines often broadcast the flight number with a suffix letter (AT831 is sent as RAM831F), so allow one
        url = EMBED + "?filterCallSign=" + encodeURIComponent("^" + cs + "[A-Z]?$");
        if (st.route && st.route.origin && st.route.destination) {
          const o = [st.route.origin.latitude, st.route.origin.longitude], d = [st.route.destination.latitude, st.route.destination.longitude], mid = gc(o, d, 2)[1], tot = nm(o, d);
          url += "&lat=" + mid[0].toFixed(3) + "&lon=" + mid[1].toFixed(3) + "&zoom=" + (tot > 3500 ? 3 : tot > 1500 ? 4 : tot > 600 ? 5 : 6);
        } else url += "&zoom=3";
      }
      st.liveUrl = url;
      drawRoute(); if (st.bounds) map.fitBounds(st.bounds);
      renderInfo(null); launcher();
      const found = st.route || st.acinfo;
      status(found ? "Route and aircraft details loaded. Press “Show live position” to see where it is now." : "No route or aircraft details found in the database. You can still try “Show live position”.", found ? "ok" : "warn");
    }
    if (q.kind === "flight") adsbdb("callsign/" + q.v).then(function (r) { st.route = r && r.flightroute || null; st.cs = (st.route && st.route.callsign_icao) || q.v; if (!st.route && q.alsoHex) st.hex = q.v.toLowerCase(); done(); });
    else if (q.kind === "reg") adsbdb("aircraft/" + encodeURIComponent(q.v)).then(function (r) { st.acinfo = r && r.aircraft || null; if (st.acinfo && st.acinfo.mode_s) st.hex = st.acinfo.mode_s.toLowerCase(); done(); });
    else { st.hex = q.v; adsbdb("aircraft/" + q.v).then(function (r) { st.acinfo = r && r.aircraft || null; done(); }); }
  }

  // callsign with suffix letter (RAM831F): scan around the route and match ^CALLSIGN[A-Z]?$
  function routeScan(cs) {
    const r = st.route, o = [r.origin.latitude, r.origin.longitude], d = [r.destination.latitude, r.destination.longitude];
    const pts = gc(o, d, 4), re = new RegExp("^" + cs + "[A-Z]?$");
    let i = 0;
    function next() {
      if (i >= pts.length || !SOURCES.length) return Promise.resolve(null);
      const pt = pts[i++];
      return getJSON(SOURCES[0].pt(pt[0].toFixed(3), pt[1].toFixed(3), 250)).then(function (j) {
        const ac = ((j && (j.ac || j.aircraft)) || []).filter(function (a) { return re.test((a.flight || "").trim()); });
        return ac.length ? { ac: ac, src: SOURCES[0] } : next();
      }).catch(next);
    }
    return next();
  }
  function track(q) {
    if (!PROXY) { embedTrack(q); return; }
    $("#fl-launch").hidden = true;
    ensureMap();
    clearInterval(st.timer);
    Object.assign(st, { q: q, hex: "", cs: "", trail: [], route: null, acinfo: null, lastAc: null, fitDone: false });
    layer.clearLayers(); areaLayer.clearLayers();
    status("Searching…");
    let p;
    if (q.kind === "flight") {
      p = adsbdb("callsign/" + q.v).then(function (r) {
        st.route = r && r.flightroute || null;
        st.cs = (st.route && st.route.callsign_icao) || q.v;
        return liveFirstHit("cs", st.cs).then(function (res) {
          if (!res.ac.length && st.cs !== q.v) return liveFirstHit("cs", q.v);
          if (!res.ac.length && q.alsoHex) return liveFirstHit("hex", q.v.toLowerCase());
          if (!res.ac.length && st.route && st.route.origin) return routeScan(st.cs).then(function (hit) { return hit || res; });
          return res;
        });
      });
    } else {
      p = liveFirstHit(q.kind, q.v);
    }
    p.then(function (res) { handle(res, true); })
      .catch(function (e) { status("Could not reach the live ADS-B services (" + e.message + "). Check your internet connection, or use the links on the right.", "bad"); renderInfo(null); drawRoute(); });
    st.timer = setInterval(refresh, 10000);
  }
  function refresh() {
    if (!$("#fl-live").checked || document.hidden || host.offsetParent === null || !st.q || st.busy) return;
    st.busy = true;
    const p = st.hex ? liveFirstHit("hex", st.hex) : st.q.kind === "flight" ? liveFirstHit("cs", st.cs || st.q.v) : liveFirstHit(st.q.kind, st.q.v);
    p.then(function (res) { handle(res, false); }).catch(function () { status("Live refresh failed; retrying in 10 s.", "bad"); }).then(function () { st.busy = false; });
  }
  function handle(res, first) {
    const list = res.ac.filter(function (a) { return a.lat != null && a.lon != null; });
    st.src = res.src;
    if (!list.length) {
      status(res.ac.length ? "Aircraft found but no position is being received right now." : "Not airborne or not being received right now" + (st.route ? " (scheduled route shown)." : "."), "warn");
      renderInfo(res.ac[0] || null); drawRoute(); return;
    }
    if (first && list.length > 1 && !st.hex) { pickList(list); return; }
    const ac = st.hex ? (list.filter(function (a) { return a.hex === st.hex; })[0] || list[0]) : list[0];
    st.hex = ac.hex; st.lastAc = ac;
    const cs = (ac.flight || "").trim();
    if (cs && !st.route && st.q.kind !== "flight" && !st.routeTried) { st.routeTried = true; adsbdb("callsign/" + cs).then(function (r) { st.route = r && r.flightroute || null; drawRoute(); renderInfo(st.lastAc); }); }
    if (!st.acinfo) adsbdb("aircraft/" + ac.hex).then(function (r) { st.acinfo = r && r.aircraft || null; renderInfo(st.lastAc); });
    const pos = [ac.lat, ac.lon];
    const last = st.trail[st.trail.length - 1];
    if (!last || last[0] !== pos[0] || last[1] !== pos[1]) st.trail.push(pos);
    draw(ac);
    const age = ac.seen_pos != null ? Math.round(ac.seen_pos) : null;
    status("Live via " + res.src.name + " · updated " + new Date().toISOString().slice(11, 19) + " UTC" + (age != null ? " · position " + age + " s old" : ""), "ok");
  }
  function pickList(list) {
    status(list.length + " aircraft match. Pick one:", "warn");
    $("#fl-info").innerHTML = '<ul class="fl-pick">' + list.map(function (a) { return '<li><button type="button" data-hex="' + a.hex + '"><b>' + esc((a.flight || "").trim() || a.hex) + "</b> " + esc(a.r || "") + " " + esc(a.t || "") + '<span class="hint"> · ' + esc(alt(a)) + "</span></button></li>"; }).join("") + "</ul>";
    list.forEach(function (a) { L.marker([a.lat, a.lon], { icon: planeIcon(a.track) }).addTo(layer); });
    map.fitBounds(L.latLngBounds(list.map(function (a) { return [a.lat, a.lon]; })).pad(0.3));
  }
  function drawRoute() {
    const r = st.route; if (!r || !r.origin || !r.destination) return;
    const o = [r.origin.latitude, r.origin.longitude], d = [r.destination.latitude, r.destination.longitude];
    L.polyline(gc(o, d, 64), { color: "#7a8a86", weight: 2, dashArray: "6 7", opacity: .9 }).addTo(layer);
    L.marker(o, { icon: apIcon(r.origin.iata_code || r.origin.icao_code) }).bindTooltip(r.origin.name + ", " + r.origin.municipality).addTo(layer);
    L.marker(d, { icon: apIcon(r.destination.iata_code || r.destination.icao_code) }).bindTooltip(r.destination.name + ", " + r.destination.municipality).addTo(layer);
    st.bounds = L.latLngBounds([o, d]).pad(0.2);
    if (!st.lastAc && !st.fitDone && !$("#fl-map").hidden) { map.fitBounds(st.bounds); st.fitDone = true; }
  }
  function draw(ac) {
    layer.clearLayers(); drawRoute();
    if (st.trail.length > 1) L.polyline(st.trail, { color: "#0E8A6A", weight: 3 }).addTo(layer);
    const emerg = SQUAWK[ac.squawk] || (ac.emergency && ac.emergency !== "none");
    L.marker([ac.lat, ac.lon], { icon: planeIcon(ac.track, emerg ? "emerg" : "sel"), zIndexOffset: 1000 })
      .bindTooltip(((ac.flight || "").trim() || ac.hex) + " · " + alt(ac)).addTo(layer);
    if (!st.fitDone) {
      const pts = [[ac.lat, ac.lon]];
      if (st.route && st.route.origin) { pts.push([st.route.origin.latitude, st.route.origin.longitude], [st.route.destination.latitude, st.route.destination.longitude]); }
      if (pts.length > 1) map.fitBounds(L.latLngBounds(pts).pad(0.15)); else map.setView(pts[0], 8);
      st.fitDone = true;
    } else if ($("#fl-follow").checked) map.panTo([ac.lat, ac.lon], { animate: true });
    renderInfo(ac);
  }
  function alt(a) { if (a.alt_baro === "ground") return "on ground"; const v = a.alt_baro != null ? a.alt_baro : a.alt_geom; return v != null ? Math.round(v).toLocaleString("en") + " ft" : "altitude n/a"; }
  function row(k, v) { return v == null || v === "" ? "" : "<tr><th>" + k + "</th><td>" + v + "</td></tr>"; }
  function renderInfo(ac) {
    const r = st.route, i = st.acinfo;
    const cs = ac && (ac.flight || "").trim() || st.cs || (st.q && st.q.v) || "";
    const hex = ac && ac.hex || st.hex || (i && i.mode_s && i.mode_s.toLowerCase()) || "";
    const reg = (ac && ac.r) || (i && i.registration) || (st.q && st.q.kind === "reg" ? st.q.v : "");
    const iata = r && r.callsign_iata || "";
    let h = "";
    if (ac && ac.squawk && SQUAWK[ac.squawk]) h += '<div class="fl-alert">Squawk ' + ac.squawk + ": " + SQUAWK[ac.squawk] + "</div>";
    h += '<h3 class="fl-title">' + esc(cs || reg || hex.toUpperCase() || "Unknown") + (iata && iata !== cs ? ' <span class="hint">(' + esc(iata) + ")</span>" : "") + "</h3>";
    if (r && r.airline) h += '<p class="fl-airline">' + esc(r.airline.name) + (r.airline.country ? ' <span class="hint">· ' + esc(r.airline.country) + "</span>" : "") + "</p>";
    if (r && r.origin && r.destination) {
      let prog = "";
      if (ac && ac.lat != null) { const o = [r.origin.latitude, r.origin.longitude], d = [r.destination.latitude, r.destination.longitude], p = [ac.lat, ac.lon]; const tot = nm(o, d), togo = nm(p, d); prog = '<div class="fl-prog"><span style="width:' + Math.max(0, Math.min(100, 100 - togo / tot * 100)).toFixed(0) + '%"></span></div><p class="hint">' + Math.round(togo).toLocaleString("en") + " NM to go of " + Math.round(tot).toLocaleString("en") + " NM (great circle)</p>"; }
      h += '<div class="fl-route"><div><b>' + esc(r.origin.iata_code || r.origin.icao_code) + "</b><small>" + esc(r.origin.municipality || r.origin.name) + "</small></div><span>→</span><div><b>" + esc(r.destination.iata_code || r.destination.icao_code) + "</b><small>" + esc(r.destination.municipality || r.destination.name) + "</small></div></div>" + prog +
        '<p class="hint" style="margin-top:0">Scheduled route from database; confirm with the airline or airport.</p>';
    }
    h += '<table class="fl-tbl">';
    if (ac) {
      h += row("Altitude", esc(alt(ac)) + (ac.baro_rate ? " <span class=\"hint\">(" + (ac.baro_rate > 0 ? "↑ " : "↓ ") + Math.abs(ac.baro_rate) + " ft/min)</span>" : ""));
      h += row("Ground speed", ac.gs != null ? Math.round(ac.gs) + " kt" : "");
      h += row("Track", ac.track != null ? Math.round(ac.track) + "°" : "");
      h += row("Squawk", ac.squawk ? '<span class="mono">' + esc(ac.squawk) + "</span>" + (SQUAWK[ac.squawk] ? ' <b class="bad">' + SQUAWK[ac.squawk] + "</b>" : "") : "");
      h += row("Position", ac.lat != null ? '<button type="button" class="code-btn" data-copy="' + ac.lat.toFixed(5) + ", " + ac.lon.toFixed(5) + '">' + ac.lat.toFixed(4) + ", " + ac.lon.toFixed(4) + "</button>" : "");
      h += row("Signal", esc((ac.type || "").replace("adsb_icao", "ADS-B").replace("mlat", "MLAT (multilateration)").replace("tisb_icao", "TIS-B").replace("adsr_icao", "ADS-R").replace("mode_s", "Mode S (no position)")));
    }
    h += row("Registration", reg ? '<button type="button" class="code-btn" data-copy="' + esc(reg) + '">' + esc(reg) + "</button>" : "");
    h += row("Aircraft type", esc((i && i.type) || (ac && (ac.desc || ac.t)) || ""));
    h += row("ICAO hex", hex ? '<button type="button" class="code-btn" data-copy="' + esc(hex.toUpperCase()) + '">' + esc(hex.toUpperCase()) + "</button>" : "");
    h += row("Registered owner", esc((i && i.registered_owner) || (ac && ac.ownOp) || ""));
    h += row("Owner country", esc(i && i.registered_owner_country_name || ""));
    h += "</table>";
    if (i && i.url_photo) h += '<a href="' + esc(i.url_photo) + '" target="_blank" rel="noopener"><img class="fl-photo" src="' + esc(i.url_photo_thumbnail || i.url_photo) + '" alt="Photo of ' + esc(reg) + '" loading="lazy" referrerpolicy="no-referrer"></a>';
    h += '<div class="fl-actions"><button type="button" class="btn ghost" id="fl-log">Log to case log</button></div>';
    const today = new Date().toISOString().slice(0, 10);
    const L2 = [];
    if (st.liveUrl) L2.push(["Live position (adsb.lol)", st.liveUrl]);
    if (iata || cs) L2.push(["Flightradar24", "https://www.flightradar24.com/data/flights/" + encodeURIComponent((iata || cs).toLowerCase())]);
    if (cs) L2.push(["FlightAware", "https://www.flightaware.com/live/flight/" + encodeURIComponent(cs)]);
    if (hex) {
      L2.push(["ADS-B Exchange (live)", "https://globe.adsbexchange.com/?icao=" + hex]);
      L2.push(["ADS-B Exchange (today's track)", "https://globe.adsbexchange.com/?icao=" + hex + "&showTrace=" + today]);
      L2.push(["adsb.lol", "https://adsb.lol/?icao=" + hex]);
      L2.push(["airplanes.live", "https://globe.airplanes.live/?icao=" + hex]);
    }
    if (reg) { L2.push(["Aircraft photos (JetPhotos)", "https://www.jetphotos.com/registration/" + encodeURIComponent(reg)]); L2.push(["Web search registration", "https://www.google.com/search?q=" + encodeURIComponent('"' + reg + '"')]); }
    if (!L2.length) L2.push(["Flightradar24", "https://www.flightradar24.com/"]);
    h += '<p class="fl-links">' + L2.map(function (x) { return '<a href="' + esc(x[1]) + '" target="_blank" rel="noopener">' + esc(x[0]) + "</a>"; }).join(" · ") + "</p>";
    $("#fl-info").innerHTML = h;
  }

  // ---------- area view ----------
  function area() {
    ensureMap();
    if (!PROXY) {
      const c0 = map.getCenter();
      const url = EMBED + "?lat=" + c0.lat.toFixed(4) + "&lon=" + c0.lng.toFixed(4) + "&zoom=" + Math.max(4, map.getZoom() + 1) + "&noIsolation";
      const w = window.open(url, "_blank", "noopener");
      status(w === null ? "" : "Live air traffic around the map centre opened in a new tab (adsb.lol).", "ok");
      $("#fl-launch").innerHTML = '<div class="fl-launch-btns"><a class="btn fl-go" href="' + esc(url) + '" target="_blank" rel="noopener">Open live air traffic here ↗</a></div><p class="hint">Move this map to the place of interest first, then press <b>Aircraft in this area</b>.</p>';
      $("#fl-launch").hidden = false;
      return;
    } clearInterval(st.timer); st.q = null; layer.clearLayers(); areaLayer.clearLayers();
    const c = map.getCenter(), b = map.getBounds();
    const radius = Math.min(250, Math.max(5, Math.round(nm([c.lat, c.lng], [b.getNorth(), c.lng]))));
    status("Loading aircraft within " + radius + " NM of the map centre…");
    let i = 0; const errs = [];
    (function next() {
      if (i >= SOURCES.length) { status("Could not reach the live ADS-B services (" + errs.join("; ") + ").", "bad"); return; }
      const s = SOURCES[i++];
      getJSON(s.pt(c.lat.toFixed(4), c.lng.toFixed(4), radius)).then(function (j) {
        const ac = ((j && (j.ac || j.aircraft)) || []).filter(function (a) { return a.lat != null; });
        ac.forEach(function (a) {
          L.marker([a.lat, a.lon], { icon: planeIcon(a.track, SQUAWK[a.squawk] ? "emerg" : "") })
            .bindTooltip(((a.flight || "").trim() || a.hex) + " · " + (a.r || "") + " " + (a.t || "") + " · " + alt(a))
            .on("click", function () { $("#fl-q").value = a.hex.toUpperCase(); $("#fl-mode").value = "hex"; track({ kind: "hex", v: a.hex }); })
            .addTo(areaLayer);
        });
        const em = ac.filter(function (a) { return SQUAWK[a.squawk]; }).length;
        status(ac.length + " aircraft within " + radius + " NM (via " + s.name + ")" + (em ? " · " + em + " squawking emergency" : "") + ". Click an aircraft to track it.", "ok");
        $("#fl-info").innerHTML = '<p class="hint">' + ac.length + " aircraft in view. Click one on the map to track it and see its details.</p>";
      }).catch(function (e) { errs.push(s.name + ": " + e.message); next(); });
    })();
  }

  // ---------- events ----------
  $("#fl-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const q = classify($("#fl-q").value, $("#fl-mode").value);
    if (!q) { status("Enter a flight number, callsign, registration or hex code.", "warn"); return; }
    st.routeTried = false; track(q);
    try { history.replaceState(null, "", "#flights=" + encodeURIComponent($("#fl-q").value.trim())); } catch (err) { /* file:// */ }
  });
  $("#fl-area").addEventListener("click", area);
  host.addEventListener("click", function (e) {
    const c = e.target.closest("[data-copy]"); if (c) { window.LE_OSINT.copy(c.dataset.copy); return; }
    const p = e.target.closest("[data-hex]"); if (p) { st.hex = p.dataset.hex; layer.clearLayers(); liveFirstHit("hex", st.hex).then(function (res) { handle(res, false); }); return; }
    if (e.target.id === "fl-log" && window.LE_OSINT.addLog) {
      const a = st.lastAc, r = st.route;
      const txt = "Flight check " + ((a && (a.flight || "").trim()) || st.cs || (st.q && st.q.v) || "") + (a ? " hex " + a.hex.toUpperCase() + (a.r ? " reg " + a.r : "") + " at " + (a.lat != null ? a.lat.toFixed(4) + "," + a.lon.toFixed(4) : "no position") + ", " + alt(a) + (a.squawk ? ", squawk " + a.squawk : "") : (PROXY ? " (not airborne)" : (st.hex ? " hex " + st.hex.toUpperCase() : "") + " (live position checked on adsb.lol)")) + (r && r.origin ? ", route " + r.origin.iata_code + "-" + r.destination.iata_code : "") + (st.src ? ", source " + st.src.name : "");
      window.LE_OSINT.addLog(st.liveUrl || (st.hex ? "https://globe.adsbexchange.com/?icao=" + st.hex : ""), txt);
      window.LE_OSINT.toast && window.LE_OSINT.toast("Added to case log");
    }
  });
  $("#fl-proxy-save").addEventListener("click", function () {
    const v = $("#fl-proxy").value.trim().replace(/\/+$/, "");
    if (v && !/^https:\/\//.test(v)) { status("The proxy address must start with https://", "bad"); return; }
    PROXY = v; try { localStorage.setItem("leosint.flightproxy", v); } catch (err) { /* ignore */ }
    setSources(); modeUI(); status(v ? "Proxy saved: live data will be drawn on this tool's map." : "Proxy removed: live position opens on adsb.lol.", "ok");
  });
  $("#fl-proxy-clear").addEventListener("click", function () { $("#fl-proxy").value = ""; $("#fl-proxy-save").click(); });
  document.addEventListener("visibilitychange", function () { if (!document.hidden) refresh(); });
  new MutationObserver(function () {
    const v = document.getElementById("view-flights");
    if (v && !v.hidden && !$("#fl-map").hidden) setTimeout(ensureMap, 30);
  }).observe(document.getElementById("view-flights"), { attributes: true, attributeFilter: ["hidden"] });
  new MutationObserver(function () {
    if (!map) return; const want = dark() ? tiles.Dark : tiles.Streets, other = dark() ? tiles.Streets : tiles.Dark;
    if (map.hasLayer(other)) { map.removeLayer(other); want.addTo(map); }
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  modeUI();
  if (!document.getElementById("view-flights").hidden) setTimeout(ensureMap, 30);
  window.LE_OSINT.flightSearch = function (v) { $("#fl-q").value = v; $("#fl-mode").value = "auto"; const q = classify(v, "auto"); if (q) { st.routeTried = false; track(q); } };
  const m = location.hash.match(/^#flights=(.+)$/);
  if (m) setTimeout(function () { window.LE_OSINT.flightSearch(decodeURIComponent(m[1])); }, 50);
})();
