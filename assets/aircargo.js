/* LE OSINT Framework: air cargo tab (AWB decoder, airline prefixes, airport codes) */
(function () {
  "use strict";
  const AL = window.LE_AIRLINES, AP = window.LE_AIRPORTS;
  const host = document.getElementById("air");
  if (!AL || !AP || !host) return;
  const $ = function (s, r) { return (r || document).querySelector(s); };
  const esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]; }); };
  const fold = function (s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); };
  let dn = null; try { dn = new Intl.DisplayNames(["en"], { type: "region" }); } catch (e) { /* older browser */ }
  function cname(cc) { try { return (dn && dn.of(cc)) || cc; } catch (e) { return cc; } }

  const AIRL = AL.rows.map(function (r) { return { n: r[0], iata: r[1], icao: r[2], pre: r[3], cc: r[4], stt: r[5], trk: r[6], note: r[7], key: fold(r.slice(0, 5).join(" ") + " " + cname(r[4])) }; });
  const PORTS = AP.rows.map(function (r) { return { iata: r[0], icao: r[1], n: r[2], city: r[3], cc: r[4], lat: r[5], lon: r[6], sz: r[7] }; });
  const GENERIC = "https://www.track-trace.com/aircargo";

  host.innerHTML =
    '<header class="desk-head"><div><p class="eyebrow">Airport and air cargo</p><h2>Air waybills, airlines and airports</h2>' +
    '<p class="hint" style="margin:4px 0 0;max-width:84ch">Check an air waybill (AWB) number and see which airline issued it, look up an airline by its codes or AWB prefix, and find an airport by IATA or ICAO code. ' +
    AIRL.length + " cargo airlines and " + PORTS.length.toLocaleString("en") + " airports.</p></div></header>" +

    '<section class="ac-box"><h3>Air waybill (AWB) check</h3>' +
    '<div class="ports-bar"><label class="pf" style="flex:1 1 300px">AWB number (11 digits)<input id="ac-awb" type="search" inputmode="numeric" placeholder="e.g. 235-32642956 or 176 1234 5675" autocomplete="off" spellcheck="false"></label></div>' +
    '<div id="ac-awb-out" class="ln-ident" hidden></div>' +
    '<p class="hint">An AWB is a 3-digit airline prefix plus an 8-digit serial. The last digit of the serial is a check digit: the first 7 digits of the serial divided by 7, remainder. A wrong check digit means a typo or a made-up number. House AWBs (HAWB) issued by forwarders do not follow this format.</p></section>' +

    '<section class="ac-box"><h3>Airlines and AWB prefixes</h3>' +
    '<div class="ports-bar"><label class="pf" style="flex:1 1 300px">Airline name, IATA, ICAO, prefix or country<input id="ac-al" type="search" placeholder="e.g. Ethiopian, ET, ETH, 071, Belgium" autocomplete="off" spellcheck="false"></label><span class="hint" id="ac-al-n"></span></div>' +
    '<div class="tbl-wrap ports-tbl"><table><thead><tr><th>Airline</th><th>IATA</th><th>ICAO</th><th>AWB prefix</th><th>Country</th><th>Tracking</th></tr></thead><tbody id="ac-al-body"></tbody></table></div></section>' +

    '<section class="ac-box"><h3>Airports</h3>' +
    '<div class="ports-bar"><label class="pf" style="flex:1 1 300px">IATA, ICAO, airport name, city or country<input id="ac-ap" type="search" placeholder="e.g. LGG, EBBR, Bole, Lagos" autocomplete="off" spellcheck="false"></label><span class="hint" id="ac-ap-n"></span></div>' +
    '<div class="tbl-wrap ports-tbl"><table><thead><tr><th>IATA</th><th>ICAO</th><th>Airport</th><th>City</th><th>Country</th><th>Look up</th></tr></thead><tbody id="ac-ap-body"></tbody></table></div></section>' +

    '<p class="hint" style="margin-top:12px;max-width:92ch">Sources: AWB prefixes from the IATA airline accounting code list, airline cargo sites and cargo-tracking directories, checked ' + esc(AL.updated) + '. An airline can use more than one prefix, so check the airline itself if the prefix is not listed. Airports: <a href="https://ourairports.com/data/" target="_blank" rel="noopener">OurAirports</a> (public domain). Official lists: <a href="https://www.iata.org/en/publications/directories/code-search/" target="_blank" rel="noopener">IATA code search</a> (free, limited searches) · <a href="https://www.icao.int/publications/doc8585/Pages/default.aspx" target="_blank" rel="noopener">ICAO Doc 8585</a>.</p>';

  // ---------- AWB ----------
  function trackUrl(a, pre, serial) {
    if (a && a.trk) {
      if (a.trk.indexOf("{q}") < 0) return a.trk;
      return a.trk.replace("{q}", /awbPrefix=/.test(a.trk) ? serial : pre + serial);
    }
    return "";
  }
  function awb() {
    const raw = $("#ac-awb").value, d = raw.replace(/\D/g, ""), box = $("#ac-awb-out");
    if (!raw.trim()) { box.hidden = true; return; }
    box.hidden = false;
    if (d.length < 3) { box.innerHTML = "Type at least the 3-digit prefix."; return; }
    const pre = d.slice(0, 3), serial = d.slice(3, 11);
    const hits = AIRL.filter(function (a) { return a.pre === pre; });
    let h = "";
    if (d.length === 11) {
      const cd = +serial.slice(0, 7) % 7, ok = cd === +serial[7];
      h += "<b>AWB " + pre + "-" + serial + "</b>: check digit " + (ok ? '<span class="ok">valid</span>' : '<span class="bad">invalid (expected ' + cd + ")</span>") + ". ";
    } else if (d.length > 11) {
      h += '<span class="bad">Too many digits</span> (' + d.length + "): an AWB has 11. ";
    } else {
      h += "Prefix <b>" + pre + "</b>" + (d.length > 3 ? ", " + serial.length + " of 8 serial digits" : "") + ". ";
    }
    if (hits.length) {
      h += "Issued by <b>" + hits.map(function (a) { return esc(a.n) + "</b> (" + esc([a.iata, a.icao].filter(Boolean).join(" / ")) + ", " + esc(cname(a.cc)) + ")" + (a.stt ? ' <span class="ln-badge">' + esc(a.stt) + "</span>" : ""); }).join("; <b>") + ". ";
      hits.forEach(function (a) { if (a.note) h += '<br><span class="hint">' + esc(a.note) + "</span>"; });
    } else {
      h += "Prefix " + pre + " is not in this list. Check the <a href=\"https://www.iata.org/en/publications/directories/code-search/\" target=\"_blank\" rel=\"noopener\">IATA code search</a>. ";
    }
    if (d.length === 11) {
      const links = [];
      hits.forEach(function (a) { const u = trackUrl(a, pre, serial); if (u) links.push('<a href="' + esc(u) + '" target="_blank" rel="noopener">' + (a.trk.indexOf("{q}") > -1 ? "Track on " + esc(a.n) : esc(a.n) + " tracking page") + "</a>"); });
      links.push('<a href="' + GENERIC + '" target="_blank" rel="noopener">Track-Trace air cargo</a>');
      links.push('<button type="button" class="code-btn" data-copy="' + pre + "-" + serial + '">Copy ' + pre + "-" + serial + "</button>");
      h += "<br>" + links.join(" · ") + '<br><span class="hint">Most airline sites do not accept the number in the link: paste the copied number there.</span>';
    }
    box.innerHTML = h;
  }

  // ---------- Airlines ----------
  function airlines() {
    const q = fold($("#ac-al").value.trim());
    const ws = q.split(/\s+/).filter(Boolean);
    const L = AIRL.filter(function (a) {
      if (!ws.length) return true;
      if (/^\d{3}$/.test(q)) return a.pre === q;
      if (/^[a-z0-9]{2}$/.test(q) && a.iata.toLowerCase() === q) return true;
      if (/^[a-z]{3}$/.test(q) && a.icao.toLowerCase() === q) return true;
      return ws.every(function (w) { return a.key.indexOf(w) > -1; });
    });
    $("#ac-al-n").textContent = L.length + " airline" + (L.length === 1 ? "" : "s");
    $("#ac-al-body").innerHTML = L.map(function (a) {
      return "<tr" + (a.stt ? ' class="ln-old"' : "") + "><td><b>" + esc(a.n) + "</b>" + (a.stt ? ' <span class="ln-badge">' + esc(a.stt) + "</span>" : "") + (a.note ? '<br><span class="hint">' + esc(a.note) + "</span>" : "") + "</td>" +
        "<td>" + (a.iata ? '<button type="button" class="code-btn" data-copy="' + esc(a.iata) + '">' + esc(a.iata) + "</button>" : "") + "</td>" +
        "<td>" + (a.icao ? '<button type="button" class="code-btn" data-copy="' + esc(a.icao) + '">' + esc(a.icao) + "</button>" : "") + "</td>" +
        '<td><button type="button" class="code-btn" data-copy="' + esc(a.pre) + '">' + esc(a.pre) + "</button></td>" +
        "<td>" + esc(cname(a.cc)) + "</td>" +
        "<td>" + (a.trk ? '<a href="' + esc(a.trk.replace("{q}", "")) + '" target="_blank" rel="noopener">Tracking</a>' : '<a href="' + GENERIC + '" target="_blank" rel="noopener">Track-Trace</a>') +
        (a.icao ? ' · <a href="https://globe.airplanes.live/?filterCallSign=' + encodeURIComponent("^" + a.icao) + '" target="_blank" rel="noopener">Live fleet</a>' : "") + "</td></tr>";
    }).join("") || '<tr><td colspan="6" class="hint">No airline found. Try the IATA code search linked below.</td></tr>';
  }

  // ---------- Airports ----------
  function airports() {
    const raw = $("#ac-ap").value.trim(), q = fold(raw);
    if (!q) { $("#ac-ap-n").textContent = "Type to search"; $("#ac-ap-body").innerHTML = ""; return; }
    const ws = q.split(/\s+/).filter(Boolean);
    const exact = [], rest = [];
    PORTS.forEach(function (p) {
      if (p.iata.toLowerCase() === q || p.icao.toLowerCase() === q) { exact.push(p); return; }
      if (q.length < 3) return;
      const k = fold(p.iata + " " + p.icao + " " + p.n + " " + p.city + " " + cname(p.cc));
      if (ws.every(function (w) { return k.indexOf(w) > -1; })) rest.push(p);
    });
    rest.sort(function (a, b) { return "LMS".indexOf(a.sz) - "LMS".indexOf(b.sz); });
    const L = exact.concat(rest), show = L.slice(0, 40);
    $("#ac-ap-n").textContent = L.length + " airport" + (L.length === 1 ? "" : "s") + (L.length > show.length ? ", first " + show.length + " shown" : "");
    $("#ac-ap-body").innerHTML = show.map(function (p) {
      const ll = p.lat + "," + p.lon;
      return '<tr><td><button type="button" class="code-btn" data-copy="' + esc(p.iata) + '">' + esc(p.iata) + "</button></td>" +
        "<td>" + (p.icao ? '<button type="button" class="code-btn" data-copy="' + esc(p.icao) + '">' + esc(p.icao) + "</button>" : "") + "</td>" +
        "<td><b>" + esc(p.n) + "</b>" + (p.sz === "L" ? ' <span class="hint">large</span>' : "") + "</td><td>" + esc(p.city) + "</td><td>" + esc(cname(p.cc)) + "</td>" +
        '<td><a href="https://www.openstreetmap.org/?mlat=' + p.lat + "&mlon=" + p.lon + "#map=14/" + p.lat + "/" + p.lon + '" target="_blank" rel="noopener">Map</a> · ' +
        '<a href="https://globe.airplanes.live/?lat=' + p.lat + "&lon=" + p.lon + '&zoom=11" target="_blank" rel="noopener">Live traffic</a> · ' +
        '<a href="https://www.flightradar24.com/data/airports/' + esc(p.iata.toLowerCase()) + '" target="_blank" rel="noopener">Departures / arrivals</a> · ' +
        '<a href="https://www.google.com/maps/search/' + encodeURIComponent(ll) + '" target="_blank" rel="noopener">Satellite</a></td></tr>';
    }).join("") || '<tr><td colspan="6" class="hint">No airport found.</td></tr>';
  }

  $("#ac-awb").addEventListener("input", awb);
  $("#ac-al").addEventListener("input", airlines);
  $("#ac-ap").addEventListener("input", airports);
  host.addEventListener("click", function (e) { const c = e.target.closest("[data-copy]"); if (c) window.LE_OSINT.copy(c.dataset.copy); });
  airlines(); airports();

  window.LE_OSINT = window.LE_OSINT || {};
  window.LE_OSINT.airSearch = function (v) {
    v = String(v || "").trim();
    if (/^\d[\d\s-]{2,}$/.test(v)) { $("#ac-awb").value = v; awb(); }
    else if (/^[A-Za-z]{3,4}$/.test(v)) { $("#ac-ap").value = v; airports(); }
    else { $("#ac-al").value = v; airlines(); }
  };
})();
