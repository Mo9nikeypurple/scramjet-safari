"use strict";

const form = document.getElementById("sj-form");
const address = document.getElementById("sj-address");
const searchEngine = document.getElementById("sj-search-engine");
const error = document.getElementById("sj-error");
const errorCode = document.getElementById("sj-error-code");
const startEl = document.getElementById("start");
const tabTitle = document.getElementById("tab-title");
const stage = document.getElementById("stage");

const FAVS = [
  { title: "Apple", url: "https://www.apple.com", icon: "https://www.apple.com/favicon.ico" },
  { title: "iCloud", url: "https://www.icloud.com", icon: "https://www.icloud.com/favicon.ico" },
  { title: "DuckDuckGo", url: "https://duckduckgo.com", label: "DDG", bg: "linear-gradient(135deg,#de5833,#f5a623)" },
  { title: "Wikipedia", url: "https://www.wikipedia.org", icon: "https://www.wikipedia.org/static/favicon/wikipedia.ico" },
  { title: "Google", url: "https://www.google.com", icon: "https://www.google.com/favicon.ico" },
  { title: "YouTube", url: "https://www.youtube.com", label: "YT", bg: "#ff0000" },
  { title: "X", url: "https://x.com", label: "X", bg: "#0f0f0f" },
  { title: "GitHub", url: "https://github.com", label: "GH", bg: "#24292f" },
  { title: "Reddit", url: "https://www.reddit.com", label: "r/", bg: "#ff4500" },
  { title: "Bing", url: "https://www.bing.com", label: "B", bg: "#00809d" },
  { title: "Facebook", url: "https://www.facebook.com", label: "f", bg: "#1877f2" },
  { title: "TikTok", url: "https://www.tiktok.com", label: "TT", bg: "#010101" },
];

const favRoot = document.getElementById("favorites");
FAVS.forEach((f) => {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "fav";
  btn.title = f.title;
  const ic = document.createElement("div");
  ic.className = "fav-ic";
  if (f.icon) {
    const img = document.createElement("img");
    img.src = f.icon;
    img.alt = "";
    img.referrerPolicy = "no-referrer";
    ic.appendChild(img);
  } else {
    ic.textContent = f.label || f.title[0];
    if (f.bg) {
      ic.style.background = f.bg;
      ic.style.color = "#fff";
    }
  }
  const span = document.createElement("span");
  span.textContent = f.title;
  btn.appendChild(ic);
  btn.appendChild(span);
  btn.addEventListener("click", () => navigate(f.url));
  favRoot.appendChild(btn);
});

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
    "://" +
    location.host +
    "/wisp/";
  if ((await connection.getTransport()) !== "/libcurl/index.mjs") {
    await connection.setTransport("/libcurl/index.mjs", [{ websocket: wispUrl }]);
  }
}

async function navigate(raw) {
  error.textContent = "";
  errorCode.textContent = "";
  const url = search(raw, searchEngine.value);
  lastUrl = url;
  address.value = url;

  try {
    await registerSW();
  } catch (err) {
    error.textContent = "Failed to register service worker.";
    errorCode.textContent = String(err);
    throw err;
  }

  try {
    await ensureTransport();
  } catch (err) {
    error.textContent = "Failed to set libcurl transport.";
    errorCode.textContent = String(err);
    throw err;
  }

  if (!sjFrame) {
    const frame = scramjet.createFrame();
    frame.frame.id = "sj-frame";
    stage.appendChild(frame.frame);
    sjFrame = frame;
  }

  startEl.classList.add("hidden");
  document.getElementById("sj-frame").classList.add("active");
  try {
    tabTitle.textContent = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    tabTitle.textContent = "Safari";
  }
  sjFrame.go(url);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  navigate(address.value);
});

document.getElementById("btn-reload").addEventListener("click", () => {
  if (lastUrl && sjFrame) sjFrame.go(lastUrl);
});

document.getElementById("btn-back").addEventListener("click", () => {
  try {
    const fr = document.getElementById("sj-frame");
    if (fr && fr.contentWindow) fr.contentWindow.history.back();
  } catch (e) {}
});

document.getElementById("btn-fwd").addEventListener("click", () => {
  try {
    const fr = document.getElementById("sj-frame");
    if (fr && fr.contentWindow) fr.contentWindow.history.forward();
  } catch (e) {}
});

document.getElementById("btn-close").addEventListener("click", () => {
  const fr = document.getElementById("sj-frame");
  if (fr) {
    fr.classList.remove("active");
    startEl.classList.remove("hidden");
    tabTitle.textContent = "Start Page";
    address.value = "";
  }
});

// Warm SW on load
registerSW().catch(() => {});
