/* LE OSINT Framework — Toolbox. Everything here runs in the browser; nothing is uploaded. */
(function () {
  "use strict";
  const $ = function (s, r) { return (r || document).querySelector(s); };
  const esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]; }); };
  const copy = function (t) { window.LE_OSINT.copy(t); };
  const toast = function (t) { window.LE_OSINT.toast(t); };
  const store = {
    get: function (k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  };
  function download(name, text, type) {
    try {
      const blob = new Blob([text], { type: type || "text/plain" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = name;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
    } catch (e) { toast("Download blocked here. Use Copy instead."); }
  }
  const ok = function (t) { return '<span class="ok">' + esc(t) + "</span>"; };
  const bad = function (t) { return '<span class="bad">' + esc(t) + "</span>"; };

  // ------------------------------------------------------------------
  // Hashing (WebCrypto + compact MD5)
  // ------------------------------------------------------------------
  function hex(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); }).join(""); }
  function md5(buffer) {
    const K = new Int32Array(64), S = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21];
    for (let i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296) | 0;
    const bytes = new Uint8Array(buffer), len = bytes.length;
    const nBlocks = ((len + 8) >> 6) + 1, words = new Int32Array(nBlocks * 16);
    for (let i = 0; i < len; i++) words[i >> 2] |= bytes[i] << ((i % 4) * 8);
    words[len >> 2] |= 0x80 << ((len % 4) * 8);
    const bitLen = len * 8;
    words[nBlocks * 16 - 2] = bitLen | 0;
    words[nBlocks * 16 - 1] = Math.floor(bitLen / 4294967296);
    let a0 = 0x67452301, b0 = 0xefcdab89 | 0, c0 = 0x98badcfe | 0, d0 = 0x10325476;
    for (let o = 0; o < words.length; o += 16) {
      let A = a0, B = b0, C = c0, D = d0;
      for (let i = 0; i < 64; i++) {
        let F, g;
        if (i < 16) { F = (B & C) | (~B & D); g = i; }
        else if (i < 32) { F = (D & B) | (~D & C); g = (5 * i + 1) % 16; }
        else if (i < 48) { F = B ^ C ^ D; g = (3 * i + 5) % 16; }
        else { F = C ^ (B | ~D); g = (7 * i) % 16; }
        F = (F + A + K[i] + words[o + g]) | 0;
        A = D; D = C; C = B;
        const s = S[(i >> 4) * 4 + (i % 4)];
        B = (B + ((F << s) | (F >>> (32 - s)))) | 0;
      }
      a0 = (a0 + A) | 0; b0 = (b0 + B) | 0; c0 = (c0 + C) | 0; d0 = (d0 + D) | 0;
    }
    return [a0, b0, c0, d0].map(function (n) {
      let s = ""; for (let i = 0; i < 4; i++) s += ("0" + ((n >>> (i * 8)) & 255).toString(16)).slice(-2); return s;
    }).join("");
  }
  async function hashBuffer(buf) {
    const out = { md5: md5(buf) };
    if (window.crypto && crypto.subtle) {
      out.sha1 = hex(await crypto.subtle.digest("SHA-1", buf));
      out.sha256 = hex(await crypto.subtle.digest("SHA-256", buf));
    }
    return out;
  }
  window.LE_OSINT.hashBuffer = hashBuffer;

  // ------------------------------------------------------------------
  // Case log
  // ------------------------------------------------------------------
  const LOG_KEY = "leosint.caselog";
  let log = store.get(LOG_KEY, null);
  const sample = log === null;
  if (sample) {
    log = [{
      id: 1, utc: "2026-09-28T08:41:07Z", local: "28/09/2026, 10:41:07", caseRef: "EXAMPLE-2026-014", officer: "Example Officer",
      url: "https://www.vesselfinder.com/vessels?name=EXAMPLE", action: "Screenshot of vessel page, AIS gap 12-15 Sep",
      file: "vessel_page.png", size: 184233, sha256: "(example row: delete once you add real entries)", md5: ""
    }];
  }
  function saveLog() { if (!store.set(LOG_KEY, log)) $("#cl-warn").hidden = false; }
  function renderLog() {
    const rows = log.map(function (e) {
      return "<tr><td class=\"mono\">" + esc(e.utc) + "</td><td>" + esc(e.caseRef) + "<br><span class=\"hint\">" + esc(e.officer) + "</span></td><td class=\"mono\">" + esc(e.url) + "</td><td>" + esc(e.action) +
        (e.file ? "<br><span class=\"hint\">" + esc(e.file) + " (" + e.size + " bytes)</span>" : "") + "</td><td class=\"mono\">" + esc(e.sha256 || "") + (e.md5 ? "<br>MD5 " + esc(e.md5) : "") +
        "</td><td><button class=\"btn\" type=\"button\" data-del=\"" + e.id + "\">Remove</button></td></tr>";
    }).join("");
    $("#cl-body").innerHTML = rows || '<tr><td colspan="6" class="hint">No entries yet.</td></tr>';
    $("#cl-count").textContent = log.length + (log.length === 1 ? " entry" : " entries");
  }
  function csv() {
    const cols = ["utc", "local", "caseRef", "officer", "url", "action", "file", "size", "sha256", "md5"];
    return cols.join(",") + "\n" + log.map(function (e) {
      return cols.map(function (c) { return '"' + String(e[c] == null ? "" : e[c]).replace(/"/g, '""') + '"'; }).join(",");
    }).join("\n");
  }
  $("#cl-form").addEventListener("submit", async function (ev) {
    ev.preventDefault();
    if (sample && log.length === 1 && log[0].caseRef === "EXAMPLE-2026-014") log = [];
    const now = new Date();
    const entry = {
      id: Date.now(), utc: now.toISOString().replace(/\.\d{3}Z$/, "Z"), local: now.toLocaleString(),
      caseRef: $("#cl-case").value.trim(), officer: $("#cl-officer").value.trim(),
      url: $("#cl-url").value.trim(), action: $("#cl-action").value.trim(), file: "", size: "", sha256: "", md5: ""
    };
    const f = $("#cl-file").files[0];
    if (f) {
      const h = await hashBuffer(await f.arrayBuffer());
      entry.file = f.name; entry.size = f.size; entry.sha256 = h.sha256 || ""; entry.md5 = h.md5;
    }
    log.unshift(entry);
    store.set("leosint.officer", { caseRef: entry.caseRef, officer: entry.officer });
    saveLog(); renderLog();
    $("#cl-url").value = ""; $("#cl-action").value = ""; $("#cl-file").value = "";
    toast("Logged at " + entry.utc);
  });
  $("#cl-body").addEventListener("click", function (e) {
    const b = e.target.closest("button[data-del]");
    if (!b) return;
    if (b.dataset.armed) { log = log.filter(function (x) { return String(x.id) !== b.dataset.del; }); saveLog(); renderLog(); }
    else { b.dataset.armed = "1"; b.textContent = "Confirm"; setTimeout(function () { if (b.isConnected) { delete b.dataset.armed; b.textContent = "Remove"; } }, 3000); }
  });
  $("#cl-csv").addEventListener("click", function () { download("case-log-" + new Date().toISOString().slice(0, 10) + ".csv", csv(), "text/csv"); });
  $("#cl-json").addEventListener("click", function () { download("case-log-" + new Date().toISOString().slice(0, 10) + ".json", JSON.stringify(log, null, 2), "application/json"); });
  $("#cl-copy").addEventListener("click", function () { copy(csv()); });
  $("#cl-clear").addEventListener("click", function (e) {
    const b = e.currentTarget;
    if (b.dataset.armed) { log = []; saveLog(); renderLog(); b.textContent = "Clear log"; delete b.dataset.armed; }
    else { b.dataset.armed = "1"; b.textContent = "Click again to clear"; setTimeout(function () { delete b.dataset.armed; b.textContent = "Clear log"; }, 3000); }
  });
  const saved = store.get("leosint.officer", null);
  if (saved) { $("#cl-case").value = saved.caseRef || ""; $("#cl-officer").value = saved.officer || ""; }
  renderLog();

  // one-click logging from the run sheet
  window.LE_OSINT.addLog = function (url, action) {
    if (sample && log.length === 1 && log[0].caseRef === "EXAMPLE-2026-014") log = [];
    const now = new Date();
    log.unshift({
      id: Date.now(), utc: now.toISOString().replace(/\.\d{3}Z$/, "Z"), local: now.toLocaleString(),
      caseRef: $("#cl-case").value.trim() || "(no case ref)", officer: $("#cl-officer").value.trim() || "(no officer)",
      url: url, action: action, file: "", size: "", sha256: "", md5: ""
    });
    saveLog(); renderLog();
    toast("Added to case log");
  };

  // ------------------------------------------------------------------
  // File hash
  // ------------------------------------------------------------------
  $("#hash-file").addEventListener("change", async function (e) {
    const out = $("#hash-out");
    const files = Array.prototype.slice.call(e.target.files);
    if (!files.length) return;
    out.textContent = "Hashing…";
    let txt = "";
    for (const f of files) {
      const h = await hashBuffer(await f.arrayBuffer());
      txt += f.name + "  (" + f.size + " bytes)\nMD5     " + h.md5 + "\nSHA-1   " + (h.sha1 || "n/a") + "\nSHA-256 " + (h.sha256 || "n/a") + "\n\n";
    }
    out.textContent = txt.trim();
  });
  $("#hash-text-go").addEventListener("click", async function () {
    const buf = new TextEncoder().encode($("#hash-text").value).buffer;
    const h = await hashBuffer(buf);
    $("#hash-out").textContent = "Text input\nMD5     " + h.md5 + "\nSHA-1   " + (h.sha1 || "n/a") + "\nSHA-256 " + (h.sha256 || "n/a");
  });

  // ------------------------------------------------------------------
  // EXIF viewer
  // ------------------------------------------------------------------
  $("#exif-file").addEventListener("change", async function (e) {
    const f = e.target.files[0];
    const out = $("#exif-out");
    if (!f) return;
    const h = await hashBuffer(await f.arrayBuffer());
    let head = f.name + " — " + f.size + " bytes — SHA-256 " + (h.sha256 || "n/a") + "\n";
    if (typeof exifr === "undefined") { out.innerHTML = esc(head) + bad("The EXIF library could not load (offline?). Hashes above are still valid."); return; }
    try {
      const data = await exifr.parse(f, { tiff: true, exif: true, gps: true, iptc: true, xmp: true, icc: false, mergeOutput: true, translateValues: true, reviveValues: true });
      if (!data) { out.innerHTML = esc(head) + bad("No metadata found. Social media platforms usually strip it."); return; }
      let gps = "";
      if (typeof data.latitude === "number" && typeof data.longitude === "number") {
        const ll = data.latitude.toFixed(6) + "," + data.longitude.toFixed(6);
        gps = "\n" + ok("GPS " + ll) + '  <a href="https://www.google.com/maps/search/?api=1&query=' + ll + '" target="_blank" rel="noopener">Google Maps</a> · <a href="https://www.openstreetmap.org/?mlat=' + data.latitude + "&mlon=" + data.longitude + '#map=17/' + data.latitude + "/" + data.longitude + '" target="_blank" rel="noopener">OSM</a>\n';
      }
      const keys = ["Make", "Model", "LensModel", "Software", "DateTimeOriginal", "CreateDate", "ModifyDate", "OffsetTimeOriginal", "Artist", "Copyright", "OwnerName", "SerialNumber", "BodySerialNumber", "ImageUniqueID", "GPSAltitude", "GPSImgDirection", "ImageWidth", "ImageHeight", "ExifImageWidth", "ExifImageHeight", "Orientation"];
      let rows = "";
      const seen = {};
      keys.concat(Object.keys(data)).forEach(function (k) {
        if (seen[k] || data[k] === undefined || typeof data[k] === "object" && !(data[k] instanceof Date)) return;
        seen[k] = 1;
        let v = data[k] instanceof Date ? data[k].toISOString() : String(data[k]);
        if (v.length > 200) v = v.slice(0, 200) + "…";
        rows += (k + "                            ").slice(0, 26) + v + "\n";
      });
      out.innerHTML = esc(head) + gps + "\n" + esc(rows);
    } catch (err) { out.innerHTML = esc(head) + bad("Could not read metadata: " + err.message); }
  });

  // ------------------------------------------------------------------
  // Maritime & vehicle validators
  // ------------------------------------------------------------------
  const ISO_VAL = (function () {
    const m = {}; let v = 10;
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach(function (c) { if (v % 11 === 0) v++; m[c] = v; v++; });
    return m;
  })();
  function containerCheck(raw) {
    const s = raw.replace(/[\s-]/g, "").toUpperCase();
    if (!/^[A-Z]{3}[UJZR][0-9]{6}[0-9]?$/.test(s)) return { valid: false, msg: "Format must be 3-letter owner code + U/J/Z/R + 6 digits + check digit, e.g. MSCU1234566" };
    let sum = 0;
    for (let i = 0; i < 10; i++) { const c = s[i]; sum += (/\d/.test(c) ? +c : ISO_VAL[c]) * Math.pow(2, i); }
    const cd = (sum % 11) % 10;
    return { valid: s.length === 11 ? +s[10] === cd : null, cd: cd, s: s };
  }
  const CAT = { U: "freight container", J: "detachable freight equipment", Z: "trailer or chassis", R: "reefer (ISO 6346:2022 category)" };
  $("#cont-in").addEventListener("input", function () {
    const v = this.value; const out = $("#cont-out");
    if (!v.trim()) { out.textContent = "Enter a container number."; return; }
    const r = containerCheck(v);
    if (r.valid === false && r.msg) { out.innerHTML = bad(r.msg); return; }
    const owner = r.s.slice(0, 3), cat = r.s[3];
    let t = (r.valid === null ? "Check digit should be " + r.cd + " → " + r.s.slice(0, 10) + r.cd : (r.valid ? ok("VALID check digit (" + r.cd + ")") : bad("INVALID: check digit should be " + r.cd + ", not " + r.s[10] + ". Possible typo, or a fabricated number.")));
    t += "\nOwner code  " + esc(owner) + cat + "  (" + esc(CAT[cat] || "") + ")";
    if (r.valid) t += '\n\n<a href="#" data-sel="' + r.s + '" data-type="cont">Search this container in all trackers →</a>';
    out.innerHTML = t;
  });
  $("#imo-in").addEventListener("input", function () {
    const d = this.value.replace(/\D/g, ""); const out = $("#imo-out");
    if (!d) { out.textContent = "Enter an IMO or MMSI number."; return; }
    if (d.length === 7) {
      let s = 0; for (let i = 0; i < 6; i++) s += +d[i] * (7 - i);
      const valid = s % 10 === +d[6];
      out.innerHTML = (valid ? ok("VALID IMO number") : bad("INVALID IMO check digit: expected " + (s % 10))) + (valid ? '\n\n<a href="#" data-sel="' + d + '" data-type="imo">Search IMO ' + d + " →</a>" : "");
    } else if (d.length === 9) {
      out.innerHTML = "MMSI " + esc(d) + "\nMID (flag)  " + esc(d.slice(0, 3)) + '  <a href="https://www.itu.int/en/ITU-R/terrestrial/fmd/Pages/mid.aspx" target="_blank" rel="noopener">ITU MID table</a>' +
        "\nThe MMSI is set by the crew and can be changed or spoofed. Compare it with the IMO number and flag registry." +
        '\n\n<a href="#" data-sel="' + d + '" data-type="mmsi">Search MMSI →</a>';
    } else out.innerHTML = bad("IMO numbers have 7 digits; MMSI numbers have 9.");
  });
  const VIN_T = { A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9, S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9 };
  const VIN_W = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
  const VIN_REGION = [["A-H", "Africa"], ["J-R", "Asia"], ["S-Z", "Europe"], ["1-5", "North America"], ["6-7", "Oceania"], ["8-9", "South America"]];
  $("#vin-in").addEventListener("input", function () {
    const v = this.value.trim().toUpperCase(); const out = $("#vin-out");
    if (!v) { out.textContent = "Enter a 17-character VIN."; return; }
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(v)) { out.innerHTML = bad("A VIN has 17 characters and never contains I, O or Q."); return; }
    let s = 0; for (let i = 0; i < 17; i++) s += (/\d/.test(v[i]) ? +v[i] : VIN_T[v[i]]) * VIN_W[i];
    const cd = s % 11 === 10 ? "X" : String(s % 11);
    const region = (VIN_REGION.find(function (r) { const p = r[0].split("-"); return v[0] >= p[0] && v[0] <= p[1]; }) || [0, "unknown"])[1];
    out.innerHTML = "WMI (manufacturer)  " + v.slice(0, 3) + "   Region: " + region +
      "\nVDS                 " + v.slice(3, 9) + "\nVIS (serial)        " + v.slice(9) +
      "\nCheck digit         " + (v[8] === cd ? ok("matches (" + cd + ")") : (region === "North America" ? bad("MISMATCH: expected " + cd) : "expected " + cd + " (only mandatory for North American vehicles)")) +
      '\n\n<a href="https://vpic.nhtsa.dot.gov/decoder/" target="_blank" rel="noopener">Decode at NHTSA</a>';
  });
  $("#iban-in").addEventListener("input", function () {
    const v = this.value.replace(/\s/g, "").toUpperCase(); const out = $("#iban-out");
    if (!v) { out.textContent = "Enter an IBAN."; return; }
    if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(v)) { out.innerHTML = bad("An IBAN starts with a 2-letter country code and 2 check digits."); return; }
    const r = (v.slice(4) + v.slice(0, 4)).replace(/[A-Z]/g, function (c) { return c.charCodeAt(0) - 55; });
    let m = 0; for (let i = 0; i < r.length; i++) m = (m * 10 + +r[i]) % 97;
    out.innerHTML = (m === 1 ? ok("VALID checksum") : bad("INVALID checksum")) + "\nCountry " + v.slice(0, 2) + "   Length " + v.length + "\n" + v.replace(/(.{4})/g, "$1 ").trim() +
      '\n\n<a href="https://www.iban.com/" target="_blank" rel="noopener">Look up bank at iban.com</a>';
  });

  // ------------------------------------------------------------------
  // Crypto address identifier
  // ------------------------------------------------------------------
  const CHAINS = [
    [/^(bc1q)[a-z0-9]{38,58}$/, "Bitcoin (SegWit bech32)", "https://mempool.space/address/"],
    [/^(bc1p)[a-z0-9]{58}$/, "Bitcoin (Taproot)", "https://mempool.space/address/"],
    [/^1[a-km-zA-HJ-NP-Z1-9]{25,34}$/, "Bitcoin (legacy P2PKH)", "https://mempool.space/address/"],
    [/^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/, "Bitcoin (P2SH) — could also be a multisig", "https://mempool.space/address/"],
    [/^0x[a-fA-F0-9]{40}$/, "Ethereum / EVM chain (ETH, BSC, Polygon, Arbitrum…)", "https://etherscan.io/address/"],
    [/^T[1-9A-HJ-NP-Za-km-z]{33}$/, "TRON (often USDT-TRC20)", "https://tronscan.org/#/address/"],
    [/^(L|M)[a-km-zA-HJ-NP-Z1-9]{26,33}$/, "Litecoin", "https://blockchair.com/litecoin/address/"],
    [/^ltc1[a-z0-9]{39,59}$/, "Litecoin (bech32)", "https://blockchair.com/litecoin/address/"],
    [/^[48][0-9AB][1-9A-HJ-NP-Za-km-z]{93}$/, "Monero (not traceable on public explorers)", "https://xmrchain.net/"],
    [/^r[1-9A-HJ-NP-Za-km-z]{24,34}$/, "XRP", "https://xrpscan.com/account/"],
    [/^D[5-9A-HJ-NP-U][1-9A-HJ-NP-Za-km-z]{32}$/, "Dogecoin", "https://blockchair.com/dogecoin/address/"],
    [/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, "Solana (or other base58 address)", "https://solscan.io/account/"]
  ];
  $("#crypto-in").addEventListener("input", function () {
    const v = this.value.trim(); const out = $("#crypto-out");
    if (!v) { out.textContent = "Paste an address."; return; }
    const hits = CHAINS.filter(function (c) { return c[0].test(v); });
    if (!hits.length) { out.innerHTML = bad("Format not recognised."); return; }
    out.innerHTML = hits.slice(0, 2).map(function (c) {
      return ok(c[1]) + '\n<a href="' + c[2] + (/xmrchain/.test(c[2]) ? "" : encodeURIComponent(v)) + '" target="_blank" rel="noopener">Open in explorer</a>';
    }).join("\n\n") + '\n\n<a href="https://www.chainabuse.com/address/' + encodeURIComponent(v) + '" target="_blank" rel="noopener">Check Chainabuse reports</a> · <a href="https://www.opensanctions.org/search/?q=' + encodeURIComponent(v) + '" target="_blank" rel="noopener">Check sanctions lists</a> · <a href="#" data-sel="' + esc(v) + '" data-type="crypto">All crypto searches →</a>';
  });

  // ------------------------------------------------------------------
  // Username & email permutations
  // ------------------------------------------------------------------
  function perms() {
    const clean = function (s) { return s.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, ""); };
    const f = clean($("#perm-first").value), l = clean($("#perm-last").value), y = $("#perm-year").value.trim();
    const out = $("#perm-out");
    if (!f && !l) { out.value = ""; return; }
    const fi = f.charAt(0), li = l.charAt(0);
    let base = f && l ? [f + l, f + "." + l, f + "_" + l, f + "-" + l, fi + l, fi + "." + l, fi + "_" + l, f + li, f + "." + li, l + f, l + "." + f, l + "_" + f, l + fi, l + "." + fi, f, l] : [f || l];
    const out2 = base.slice();
    if (y) { const yy = y.slice(-2); base.slice(0, 8).forEach(function (b) { out2.push(b + y, b + yy, b + "_" + y); }); }
    let list = Array.from(new Set(out2.filter(Boolean)));
    const doms = $("#perm-domains").value.split(/[\s,]+/).map(function (d) { return d.trim().replace(/^@/, ""); }).filter(Boolean);
    if ($("#perm-email").checked && doms.length) {
      const em = [];
      list.forEach(function (u) { doms.forEach(function (d) { em.push(u + "@" + d); }); });
      list = em;
    }
    out.value = list.join("\n");
    $("#perm-count").textContent = list.length + " variants";
  }
  ["#perm-first", "#perm-last", "#perm-year", "#perm-domains", "#perm-email"].forEach(function (s) { $(s).addEventListener("input", perms); });
  $("#perm-copy").addEventListener("click", function () { copy($("#perm-out").value); });
  perms();

  // ------------------------------------------------------------------
  // Dork builder
  // ------------------------------------------------------------------
  function dork() {
    const parts = [];
    const v = function (id) { return $(id).value.trim(); };
    if (v("#dk-exact")) parts.push('"' + v("#dk-exact").replace(/"/g, "") + '"');
    if (v("#dk-any")) parts.push("(" + v("#dk-any").split(/\s*,\s*|\s+OR\s+/).filter(Boolean).map(function (w) { return /\s/.test(w) ? '"' + w + '"' : w; }).join(" OR ") + ")");
    if (v("#dk-site")) parts.push("site:" + v("#dk-site"));
    if (v("#dk-type")) parts.push("filetype:" + v("#dk-type"));
    if (v("#dk-title")) parts.push("intitle:" + (/\s/.test(v("#dk-title")) ? '"' + v("#dk-title") + '"' : v("#dk-title")));
    if (v("#dk-url")) parts.push("inurl:" + v("#dk-url"));
    if (v("#dk-not")) v("#dk-not").split(/[\s,]+/).filter(Boolean).forEach(function (w) { parts.push("-" + w); });
    if (v("#dk-after")) parts.push("after:" + v("#dk-after"));
    if (v("#dk-before")) parts.push("before:" + v("#dk-before"));
    const q = parts.join(" ");
    const e = encodeURIComponent(q);
    $("#dk-out").innerHTML = q ? esc(q) + '\n\n<a href="https://www.google.com/search?q=' + e + '" target="_blank" rel="noopener">Google</a> · <a href="https://www.bing.com/search?q=' + e + '" target="_blank" rel="noopener">Bing</a> · <a href="https://duckduckgo.com/?q=' + e + '" target="_blank" rel="noopener">DuckDuckGo</a> · <a href="https://yandex.com/search/?text=' + e + '" target="_blank" rel="noopener">Yandex</a>' : "Fill in any field.";
  }
  document.querySelectorAll("#dork-form input").forEach(function (i) { i.addEventListener("input", dork); });
  dork();

  // ------------------------------------------------------------------
  // Time converter & snowflake decoder
  // ------------------------------------------------------------------
  const ZONES = ["UTC", "Europe/Brussels", "Europe/London", "America/New_York", "America/Bogota", "Africa/Lagos", "Asia/Dubai", "Asia/Karachi", "Asia/Shanghai", "Australia/Sydney"];
  function fmtAll(d, label) {
    return (label ? label + "\n" : "") + "Unix (s)    " + Math.floor(d.getTime() / 1000) + "\nISO 8601    " + d.toISOString() + "\n" +
      ZONES.map(function (z) {
        let s; try { s = d.toLocaleString("en-GB", { timeZone: z, dateStyle: "medium", timeStyle: "long" }); } catch (e) { s = "n/a"; }
        return (z + "                 ").slice(0, 18) + s;
      }).join("\n");
  }
  function timeConv() {
    const v = $("#time-in").value.trim(); const out = $("#time-out");
    const mode = $("#time-mode").value;
    if (!v) { out.textContent = fmtAll(new Date(), "Now"); return; }
    try {
      if (mode === "x" || mode === "discord") {
        const id = BigInt(v.replace(/\D/g, ""));
        const epoch = mode === "x" ? 1288834974657n : 1420070400000n;
        const ms = Number((id >> 22n) + epoch);
        out.textContent = fmtAll(new Date(ms), (mode === "x" ? "X / Twitter" : "Discord") + " ID created at:");
        return;
      }
      let d;
      if (/^\d{9,11}$/.test(v)) d = new Date(+v * 1000);
      else if (/^\d{12,14}$/.test(v)) d = new Date(+v);
      else if (/^\d{17,18}$/.test(v)) d = new Date((+v / 10000) - 11644473600000); // Windows FILETIME (100ns since 1601)
      else d = new Date(v);
      if (isNaN(d)) throw new Error();
      out.textContent = fmtAll(d, "");
    } catch (e) { out.innerHTML = bad("Could not read that value. Try a Unix timestamp, an ISO date (2026-09-28T10:00:00Z) or choose a snowflake ID type."); }
  }
  $("#time-in").addEventListener("input", timeConv);
  $("#time-mode").addEventListener("change", timeConv);
  timeConv();

  // ------------------------------------------------------------------
  // Encoder / decoder
  // ------------------------------------------------------------------
  const enc = {
    "b64e": function (s) { return btoa(unescape(encodeURIComponent(s))); },
    "b64d": function (s) { return decodeURIComponent(escape(atob(s.replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, "")))); },
    "urle": function (s) { return encodeURIComponent(s); },
    "urld": function (s) { return decodeURIComponent(s.replace(/\+/g, " ")); },
    "hexe": function (s) { return Array.from(new TextEncoder().encode(s)).map(function (b) { return ("0" + b.toString(16)).slice(-2); }).join(" "); },
    "hexd": function (s) { const h = s.replace(/[^0-9a-f]/gi, ""); const b = new Uint8Array(h.length / 2); for (let i = 0; i < b.length; i++) b[i] = parseInt(h.substr(i * 2, 2), 16); return new TextDecoder().decode(b); },
    "rot13": function (s) { return s.replace(/[a-z]/gi, function (c) { const b = c <= "Z" ? 65 : 97; return String.fromCharCode((c.charCodeAt(0) - b + 13) % 26 + b); }); },
    "rev": function (s) { return Array.from(s).reverse().join(""); },
    "defang": function (s) { return s.replace(/http/gi, function (m) { return m[0] + "xx" + m.slice(3); }).replace(/\./g, "[.]").replace(/@/g, "[@]"); },
    "refang": function (s) { return s.replace(/hxxp/gi, "http").replace(/\[\.\]|\(\.\)|\{\.\}/g, ".").replace(/\[@\]|\[at\]/gi, "@"); }
  };
  $("#enc-btns").addEventListener("click", function (e) {
    const b = e.target.closest("button[data-op]"); if (!b) return;
    try { $("#enc-out").textContent = enc[b.dataset.op]($("#enc-in").value); }
    catch (err) { $("#enc-out").innerHTML = bad("Input is not valid for that operation."); }
  });
  $("#enc-swap").addEventListener("click", function () { $("#enc-in").value = $("#enc-out").textContent; });


  // ------------------------------------------------------------------
  // Phone number & IMEI analyser
  // ------------------------------------------------------------------
  // code | country | trunk prefix | mobile prefix (national significant number)
  const DIAL = ("1|United States / Canada||;7|Russia / Kazakhstan|8|9;20|Egypt|0|1;27|South Africa|0|[6-8];30|Greece||69;31|Netherlands|0|6;32|Belgium|0|4[5-9];33|France|0|[67];34|Spain||[67];36|Hungary|06|[237]0;39|Italy||3;40|Romania|0|7;41|Switzerland|0|7[5-9];43|Austria|0|6;44|United Kingdom|0|7;45|Denmark||;46|Sweden|0|7;47|Norway||[49];48|Poland||[4-8];49|Germany|0|1[5-7];51|Peru||9;52|Mexico||;53|Cuba||5;54|Argentina|0|9;55|Brazil|0|\\d\\d9;56|Chile||9;57|Colombia||3;58|Venezuela|0|4;60|Malaysia|0|1;61|Australia|0|4;62|Indonesia|0|8;63|Philippines|0|9;64|New Zealand|0|2;65|Singapore||[89];66|Thailand|0|[689];81|Japan|0|[789]0;82|South Korea|0|1;84|Vietnam|0|[35789];86|China|0|1;90|Türkiye|0|5;91|India|0|[6-9];92|Pakistan|0|3;93|Afghanistan|0|7;94|Sri Lanka|0|7;95|Myanmar|0|9;98|Iran|0|9;211|South Sudan||9;212|Morocco|0|[67];213|Algeria|0|[5-7];216|Tunisia||[2459];218|Libya|0|9;220|Gambia||[2-9];221|Senegal||7;223|Mali||[5-9];224|Guinea||6;225|Côte d'Ivoire||0[157];226|Burkina Faso||[5-7];227|Niger||9;228|Togo||9;229|Benin||[4-9];231|Liberia|0|[4-8];232|Sierra Leone|0|[2-9];233|Ghana|0|[25];234|Nigeria|0|[789];237|Cameroon||6;241|Gabon||0?[67];242|Congo||0;243|DR Congo|0|[89];244|Angola||9;249|Sudan|0|9;251|Ethiopia|0|9;254|Kenya|0|[17];255|Tanzania|0|[67];256|Uganda|0|7;260|Zambia|0|9;263|Zimbabwe|0|7;297|Aruba||[59];299|Greenland||;350|Gibraltar||5;351|Portugal||9;352|Luxembourg||6;353|Ireland|0|8;354|Iceland||[678];355|Albania|0|6;356|Malta||[79];357|Cyprus||9;359|Bulgaria|0|[89];370|Lithuania|8|6;371|Latvia||2;372|Estonia||5;373|Moldova|0|[67];374|Armenia|0|[4-9];375|Belarus|8|[234];376|Andorra||[346];377|Monaco||[46];380|Ukraine|0|[3-9];381|Serbia|0|6;382|Montenegro|0|6;383|Kosovo|0|4;385|Croatia|0|9;386|Slovenia|0|[3-7]0?;387|Bosnia & Herzegovina|0|6;389|North Macedonia|0|7;420|Czechia||[67];421|Slovakia|0|9;423|Liechtenstein||7;501|Belize||6;502|Guatemala||[345];503|El Salvador||[67];504|Honduras||[389];505|Nicaragua||[578];506|Costa Rica||[5-8];507|Panama||6;509|Haiti||[34];591|Bolivia||[67];592|Guyana||6;593|Ecuador|0|9;594|French Guiana|0|6;595|Paraguay|0|9;597|Suriname||[6-8];598|Uruguay|0|9;599|Curaçao / Caribbean NL||9;852|Hong Kong||[5-9];853|Macau||6;855|Cambodia|0|[1-9];856|Laos|0|20;880|Bangladesh|0|1;886|Taiwan|0|9;960|Maldives||[79];961|Lebanon|0|[37];962|Jordan|0|7;963|Syria|0|9;964|Iraq|0|7;965|Kuwait||[569];966|Saudi Arabia|0|5;967|Yemen|0|7;968|Oman||[79];970|Palestine|0|5;971|United Arab Emirates|0|5;972|Israel|0|5;973|Bahrain||3;974|Qatar||[3-7];975|Bhutan||1;976|Mongolia||[89];977|Nepal|0|9;992|Tajikistan||9;993|Turkmenistan|8|6;994|Azerbaijan|0|[4-7];995|Georgia|0|5;996|Kyrgyzstan|0|[57];998|Uzbekistan||9").split(";").map(function (r) { const p = r.split("|"); return { cc: p[0], name: p[1], trunk: p[2], mob: p[3] }; });
  DIAL.sort(function (a, b) { return b.cc.length - a.cc.length; });
  $("#ph-in").addEventListener("input", function () {
    const out = $("#ph-out");
    let d = this.value.trim();
    if (!d) { out.textContent = "Enter a number in international format, e.g. +32 470 12 34 56 or 0032470123456."; return; }
    d = d.replace(/[^\d+]/g, "").replace(/^00/, "+");
    if (d.charAt(0) !== "+") { out.innerHTML = bad("Add the country code (start with + or 00). A national number alone cannot be matched to a country."); return; }
    d = d.slice(1);
    const c = DIAL.find(function (x) { return d.indexOf(x.cc) === 0; });
    if (!c) { out.innerHTML = bad("Country code not recognised."); return; }
    const nsn = d.slice(c.cc.length);
    const mobile = c.mob ? new RegExp("^(" + c.mob + ")").test(nsn) : null;
    const nat = (c.trunk || "") + nsn;
    const e164 = "+" + d;
    const spaced = "+" + c.cc + " " + nsn.replace(/(\d{3})(?=\d{3,})/g, "$1 ");
    let t = ok(c.name) + "  (+" + c.cc + ")\nType        " + (mobile === null ? "unknown" : mobile ? "mobile (by prefix)" : "fixed line / other (by prefix)") +
      "\nLength      " + nsn.length + " digits after the country code" +
      "\n\nFormats to search for:\n  " + e164 + "\n  " + spaced + "\n  00" + d + "\n  " + nat + "\n  " + d;
    t += '\n\n<a href="https://www.google.com/search?q=' + encodeURIComponent('"' + e164 + '" OR "' + nat + '" OR "00' + d + '"') + '" target="_blank" rel="noopener">Google all formats</a> · <a href="https://wa.me/' + d + '" target="_blank" rel="noopener">WhatsApp profile</a> · <a href="#" data-sel="' + e164 + '" data-type="phone">All phone searches →</a>';
    t += "\nPrefix-based type is a guide only: numbers can be ported between operators and types.";
    out.innerHTML = t;
  });
  $("#imei-in").addEventListener("input", function () {
    const v = this.value.replace(/\D/g, ""); const out = $("#imei-out");
    if (!v) { out.textContent = "Enter the 15-digit IMEI (dial *#06# on the handset)."; return; }
    if (v.length !== 15 && v.length !== 14) { out.innerHTML = bad("An IMEI has 15 digits (14 + check digit)."); return; }
    let sum = 0;
    for (let i = 0; i < 14; i++) { let n = +v[i]; if (i % 2 === 1) { n *= 2; if (n > 9) n -= 9; } sum += n; }
    const cd = (10 - sum % 10) % 10;
    out.innerHTML = (v.length === 14 ? "Check digit should be " + cd + " → " + v + cd : (+v[14] === cd ? ok("VALID check digit") : bad("INVALID: check digit should be " + cd))) +
      "\nTAC (model code)  " + v.slice(0, 8) + "\nSerial            " + v.slice(8, 14) +
      '\n\n<a href="https://www.imei.info/" target="_blank" rel="noopener">Look up the model at IMEI.info</a>';
  });

  // ------------------------------------------------------------------
  // Coordinate converter
  // ------------------------------------------------------------------
  function parseCoords(v) {
    v = v.trim().replace(/,(?=\d)/g, ".").replace(/[′’]/g, "'").replace(/[″”]/g, '"');
    const dec = v.match(/^\s*(-?\d{1,2}(?:\.\d+)?)\s*[,;\s]\s*(-?\d{1,3}(?:\.\d+)?)\s*$/);
    if (dec) return [+dec[1], +dec[2]];
    const re = /(\d{1,3})\s*[°d\s]\s*(?:(\d{1,2}(?:\.\d+)?)\s*['m\s]\s*)?(?:(\d{1,2}(?:\.\d+)?)\s*(?:"|''|s)?\s*)?([NSEW])/gi;
    const parts = []; let m;
    while ((m = re.exec(v)) !== null) {
      let x = +m[1] + (+(m[2] || 0)) / 60 + (+(m[3] || 0)) / 3600;
      if (/[SW]/i.test(m[4])) x = -x;
      parts.push({ v: x, h: m[4].toUpperCase() });
    }
    if (parts.length === 2) {
      const lat = parts.find(function (p) { return /[NS]/.test(p.h); }), lng = parts.find(function (p) { return /[EW]/.test(p.h); });
      if (lat && lng) return [lat.v, lng.v];
    }
    return null;
  }
  function dms(x, pos, neg) {
    const h = x < 0 ? neg : pos; x = Math.abs(x);
    const d = Math.floor(x), mf = (x - d) * 60, m = Math.floor(mf), sec = ((mf - m) * 60).toFixed(1);
    return d + "°" + m + "'" + sec + '"' + h;
  }
  $("#co-in").addEventListener("input", function () {
    const out = $("#co-out");
    if (!this.value.trim()) { out.textContent = "Paste coordinates."; return; }
    const c = parseCoords(this.value);
    if (!c || Math.abs(c[0]) > 90 || Math.abs(c[1]) > 180) { out.innerHTML = bad("Could not read that. Try 51.2317, 4.4018 or 51°13'54.1\"N 4°24'06.5\"E."); return; }
    const la = c[0].toFixed(6), lo = c[1].toFixed(6);
    const link = function (n, u) { return '<a href="' + u + '" target="_blank" rel="noopener">' + n + "</a>"; };
    out.innerHTML = "Decimal     " + la + ", " + lo + "\nDMS         " + dms(c[0], "N", "S") + " " + dms(c[1], "E", "W") + "\n\n" + [
      link("Google Maps", "https://www.google.com/maps/search/?api=1&query=" + la + "," + lo),
      link("Street View", "https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=" + la + "," + lo),
      link("OpenStreetMap", "https://www.openstreetmap.org/?mlat=" + la + "&mlon=" + lo + "#map=17/" + la + "/" + lo),
      link("Bing Maps", "https://www.bing.com/maps?cp=" + la + "~" + lo + "&lvl=17"),
      link("Yandex Maps", "https://yandex.com/maps/?pt=" + lo + "," + la + "&z=17&l=map"),
      link("Apple Maps", "https://maps.apple.com/?ll=" + la + "," + lo + "&z=17"),
      link("Mapillary", "https://www.mapillary.com/app/?lat=" + la + "&lng=" + lo + "&z=17"),
      link("SunCalc", "https://www.suncalc.org/#/" + la + "," + lo + ",17/"),
      link("Copernicus Browser", "https://browser.dataspace.copernicus.eu/")
    ].join(" · ");
  });

  // links that push a value into the selector search
  document.addEventListener("click", function (e) {
    const a = e.target.closest && e.target.closest("a[data-sel]");
    if (!a) return;
    e.preventDefault();
    window.LE_OSINT.setSelector(a.dataset.sel, a.dataset.type);
  });

  // initial example values so every tool shows what it does
  $("#cont-in").value = "MSCU1234566"; $("#cont-in").dispatchEvent(new Event("input"));
  $("#imo-in").value = "9074729"; $("#imo-in").dispatchEvent(new Event("input"));
  $("#vin-in").value = "1HGCM82633A004352"; $("#vin-in").dispatchEvent(new Event("input"));
  $("#iban-in").value = "BE68 5390 0754 7034"; $("#iban-in").dispatchEvent(new Event("input"));
  $("#crypto-in").value = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"; $("#crypto-in").dispatchEvent(new Event("input"));
  $("#ph-in").value = "+32 470 12 34 56"; $("#ph-in").dispatchEvent(new Event("input"));
  $("#imei-in").value = "490154203237518"; $("#imei-in").dispatchEvent(new Event("input"));
  $("#co-in").value = "51°13'54.1\"N 4°24'06.5\"E"; $("#co-in").dispatchEvent(new Event("input"));
  $("#enc-in").value = "hxxps://example[.]com/login"; $("#enc-out").textContent = enc.refang($("#enc-in").value);
})();
