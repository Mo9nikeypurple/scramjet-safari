/* Scramjet static SW — assets from jsDelivr, traffic via remote Wisp */
const swPath = self.location.pathname;
const basePath = swPath.substring(0, swPath.lastIndexOf("/") + 1);

self.$scramjet = {
  files: {
    wasm: "https://cdn.jsdelivr.net/npm/@mercuryworkshop/scramjet@1.1.0/dist/scramjet.wasm.wasm",
    all: "https://cdn.jsdelivr.net/npm/@mercuryworkshop/scramjet@1.1.0/dist/scramjet.all.js",
    sync: "https://cdn.jsdelivr.net/npm/@mercuryworkshop/scramjet@1.1.0/dist/scramjet.sync.js",
  },
};

importScripts("https://cdn.jsdelivr.net/npm/@mercuryworkshop/scramjet@1.1.0/dist/scramjet.all.js");
importScripts("https://cdn.jsdelivr.net/npm/@mercuryworkshop/bare-mux@2.1.9/dist/index.js");

const { ScramjetServiceWorker } = $scramjetLoadWorker();
const scramjet = new ScramjetServiceWorker({
  prefix: basePath + "scramjet/",
});

self.addEventListener("install", (e) => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

let wispUrl = null;
let resolveConfig;
const configReady = new Promise((r) => { resolveConfig = r; });

self.addEventListener("message", ({ data }) => {
  if (!data || data.type !== "config") return;
  if (data.wispurl) {
    wispUrl = data.wispurl;
    if (resolveConfig) {
      resolveConfig();
      resolveConfig = null;
    }
  }
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      await scramjet.loadConfig();
      if (scramjet.route(event)) {
        return scramjet.fetch(event);
      }
      return fetch(event.request);
    })()
  );
});

scramjet.addEventListener("request", (e) => {
  e.response = (async () => {
    await configReady;
    if (!wispUrl) {
      return new Response("Wisp URL not configured", { status: 500 });
    }
    if (!scramjet.client) {
      const connection = new BareMux.BareMuxConnection(
        "https://cdn.jsdelivr.net/npm/@mercuryworkshop/bare-mux@2.1.9/dist/worker.js"
      );
      await connection.setTransport(
        "https://cdn.jsdelivr.net/npm/@mercuryworkshop/epoxy-transport@2.1.28/dist/index.mjs",
        [{ wisp: wispUrl }]
      );
      scramjet.client = connection;
    }
    try {
      return await scramjet.client.fetch(e.url, {
        method: e.method,
        body: e.body,
        headers: e.requestHeaders,
        credentials: "include",
        mode: e.mode === "cors" ? e.mode : "same-origin",
        cache: e.cache,
        redirect: "manual",
        duplex: "half",
      });
    } catch (err) {
      return new Response("Proxy error: " + (err && err.message ? err.message : String(err)), {
        status: 502,
      });
    }
  })();
});
