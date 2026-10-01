# Scramjet Safari Proxy

Working Scramjet setup following [Titanium Network docs](https://docs.titaniumnetwork.org/proxies/scramjet/) and the [Scramjet-App](https://github.com/MercuryWorkshop/Scramjet-App) reference.

## Stack
- **Scramjet** service worker + controller (`/scram/`)
- **BareMux** + **libcurl-transport**
- **Wisp** WebSocket endpoint (`/wisp/`)
- Safari-styled start page + chrome

## Run
```bash
cd scramjet-safari
npm install
npm start
```
Open **http://localhost:8080**

Requires Node 18+ and a browser that supports service workers (use localhost or HTTPS).
