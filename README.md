# Real Scramjet Proxy (Safari UI)

This is a **real Scramjet proxy**, not an iframe of the public demo.

Built from:
- https://docs.titaniumnetwork.org/proxies/scramjet/
- https://github.com/MercuryWorkshop/Scramjet-App

## What runs

| Piece | Path / role |
|-------|-------------|
| Fastify HTTP server | serves UI + static assets |
| Wisp WebSocket | `/wisp/` — tunnel for proxied traffic |
| Scramjet assets | `/scram/` from `@mercuryworkshop/scramjet` |
| BareMux | `/baremux/` |
| libcurl transport | `/libcurl/` |
| Service worker | `/sw.js` — intercepts & rewrites |
| Client | `ScramjetController` + `frame.go(url)` |

## Run locally

```bash
git clone https://github.com/Mo9nikeypurple/scramjet-safari.git
cd scramjet-safari
npm install --registry=https://registry.npmjs.org/
npm start
```

Open **http://localhost:8080**

## Deploy

Needs a host that supports **Node.js + WebSockets** (not static jsDelivr):

- Railway / Render / Fly.io / a VPS
- Set `PORT` if required

## Why not jsDelivr alone?

A real Scramjet stack needs:

1. Same-origin service worker  
2. Wisp WebSocket server  
3. Node (or similar) to serve `/scram/`, `/baremux/`, `/libcurl/`

jsDelivr is static-only. Use this app on a real host.

## Safari UI

The start page is Safari-styled. Navigation goes through **your** Scramjet SW + Wisp, not `scramjet.mercurywork.shop`.
