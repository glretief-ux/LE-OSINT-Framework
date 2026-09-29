/* LE OSINT Framework: optional live flight data proxy (Cloudflare Worker, free plan is enough).
   Why: the free ADS-B APIs do not send CORS headers, so a web page cannot read them directly.
   This worker forwards read-only requests to adsb.lol (then airplanes.live as fallback) and adds CORS.
   Deploy: dash.cloudflare.com > Workers & Pages > Create > "Hello World" worker > Edit code > paste this file > Deploy.
   Then paste the worker address (https://<name>.<account>.workers.dev) in Flight tracker > Live data connection.
   Optional: set ALLOWED_ORIGIN below to your site (e.g. "https://glretief-ux.github.io") to stop other sites using it. */
const ALLOWED_ORIGIN = "*";
const UPSTREAMS = ["https://api.adsb.lol", "https://api.airplanes.live"];

function cors() {
  return { "Access-Control-Allow-Origin": ALLOWED_ORIGIN, "Access-Control-Allow-Methods": "GET, OPTIONS", "Access-Control-Max-Age": "86400", "Vary": "Origin" };
}

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors() });
    if (request.method !== "GET") return new Response("Method not allowed", { status: 405, headers: cors() });
    const path = new URL(request.url).pathname;
    // only the read-only lookups the tool uses
    if (!/^\/v2\/(callsign|hex|reg|point)\/[A-Za-z0-9.\-~\/]+$/.test(path)) return new Response("Not found", { status: 404, headers: cors() });
    for (const base of UPSTREAMS) {
      try {
        const r = await fetch(base + path, { headers: { "Accept": "application/json", "User-Agent": "le-osint-framework-flight-proxy" }, cf: { cacheTtl: 5 } });
        if (r.ok) return new Response(r.body, { status: 200, headers: { ...cors(), "Content-Type": "application/json", "Cache-Control": "no-store" } });
      } catch (e) { /* try next upstream */ }
    }
    return new Response(JSON.stringify({ ac: [], msg: "upstream unavailable" }), { status: 502, headers: { ...cors(), "Content-Type": "application/json" } });
  }
};
