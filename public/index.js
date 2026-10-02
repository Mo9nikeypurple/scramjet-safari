"use strict";
const form = document.getElementById("sj-form");
const address = document.getElementById("sj-address");
const statusEl = document.getElementById("status");
const errEl = document.getElementById("err");
const startEl = document.getElementById("start");
const tabTitle = document.getElementById("tab-title");
const stage = document.getElementById("stage");

const FAVS = [
  { t: "Google", u: "https://www.google.com", bg: "#4285f4", l: "G" },
  { t: "YouTube", u: "https://www.youtube.com", bg: "#ff0000", l: "YT" },
  { t: "GitHub", u: "https://github.com", bg: "#24292f", l: "GH" },
  { t: "Reddit", u: "https://www.reddit.com", bg: "#ff4500", l: "r/" },
  { t: "X", u: "https://x.com", bg: "#0f0f0f", l: "X" },
  { t: "Wikipedia", u: "https://www.wikipedia.org", bg: "#333", l: "W" },
  { t: "DuckDuckGo", u: "https://duckduckgo.com", bg: "#de5833", l: "DDG" },
  { t: "Bing", u: "https://www.bing.com", bg: "#00809d", l: "B" },
  { t: "Apple", u: "https://www.apple.com", bg: "#555", l: "A" },
  { t: "Facebook", u: "https://www.facebook.com", bg: "#1877f2", l: "f" },
  { t: "TikTok", u: "https://www.tiktok.com", bg: "#010101", l: "TT" },
  { t: "iCloud", u: "https://www.icloud.com", bg: "#369", l: "i" },
];

const root = document.getElementById("favorites");
FAVS.forEach((f) => {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "fav";
  b.title = f.t;
  const ic = document.createElement("div");
  ic.className = "fav-ic";
  ic.style.background = f.bg;
  ic.textContent = f.l;
  const s = document.createElement("span");
  s.textContent = f.t;
  b.appendChild(ic);
  b.appendChild(s);
  b.onclick = () => navigate(f.u);
  root.appendChild(b);
});

function search(input, engine) {
  try { return new URL(input).toString(); } catch (_) {}
  try {
    const u = new URL("http://" + input);
    if (u.hostname.includes(".")) return u.toString();
  } catch (_) {}
  return engine.replace("%s", encodeURIComponent(input));
}

async function registerSW() {
  if (!("serviceWorker" in navigator)) throw new Error("Service workers not supported");
  await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  await navigator.serviceWorker.ready;
}

const { ScramjetController } = $scramjetLoadController();
const scramjet = new ScramjetController({
  files: {
    wasm: "/scram/scramjet.wasm.wasm",
    all: "/scram/scramjet.all.js",
    sync: "/scram/scramjet.sync.js",
  },
});
scramjet.init();

const connection = new BareMux.BareMuxConnection("/baremux/worker.js");
let sjFrame = null;
let lastUrl = "";

async function ensureTransport() {
  const wispUrl =
    (location.protocol === "https:" ? "wss" : "ws") +
    "://" + location.host + "/wisp/";
  const current = await connection.getTransport();
  if (current !== "/libcurl/index.mjs") {
    await connection.setTransport("/libcurl/index.mjs", [{ websocket: wispUrl }]);
  }
}

async function navigate(raw) {
  errEl.textContent = "";
  statusEl.textContent = "Connecting…";
  const url = search(String(raw || "").trim(), "https://duckduckgo.com/?q=%s");
  if (!url) return;
  lastUrl = url;
  address.value = url;
  try {
    await registerSW();
    await ensureTransport();
    if (!sjFrame) {
      const frame = scramjet.createFrame();
      frame.frame.id = "sj-frame";
      stage.appendChild(frame.frame);
      sjFrame = frame;
    }
    startEl.classList.add("hide");
    document.getElementById("sj-frame").classList.add("on");
    try {
      tabTitle.textContent = new URL(url).hostname.replace(/^www\./, "");
    } catch (_) {
      tabTitle.textContent = "Safari";
    }
    sjFrame.go(url);
    statusEl.textContent = "Loaded";
  } catch (err) {
    errEl.textContent = String(err && err.message ? err.message : err);
    statusEl.textContent = "Error";
    console.error(err);
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  navigate(address.value);
});
document.getElementById("btn-reload").onclick = () => {
  if (lastUrl && sjFrame) sjFrame.go(lastUrl);
};
document.getElementById("btn-close").onclick = () => {
  const fr = document.getElementById("sj-frame");
  if (fr) {
    fr.classList.remove("on");
    startEl.classList.remove("hide");
    tabTitle.textContent = "Start Page";
    address.value = "";
  }
};

registerSW()
  .then(() => { statusEl.textContent = "SW ready — enter a URL"; })
  .catch((e) => {
    statusEl.textContent = "SW registration failed";
    errEl.textContent = String(e && e.message ? e.message : e);
  });

// Deep-link from Mac OS iframe: /?url=https://example.com or /?goto=...
(function deepLink() {
  try {
    var q = new URLSearchParams(location.search);
    var target = q.get("url") || q.get("goto");
    if (target) setTimeout(function () { navigate(target); }, 400);
  } catch (e) {}
})();
