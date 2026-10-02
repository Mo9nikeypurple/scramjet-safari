# Start here (least work for you)

## What is already done

Everything for a **real Scramjet proxy** is in this repo:

- Node server + Wisp + Scramjet + BareMux + libcurl
- Safari-style UI
- `/?url=` and `/?goto=` deep links for your Mac OS iframe
- Dockerfile / Railway / Render configs

## What you do (3 steps)

### 1. Deploy this repo (one click)

**Railway (recommended):**

1. Go to https://railway.app/new  
2. **Deploy from GitHub repo** → `Mo9nikeypurple/scramjet-safari`  
3. Wait until it is live  
4. Copy the public URL, e.g. `https://scramjet-safari-production-xxxx.up.railway.app`

**Or Render:** https://dashboard.render.com → New → Web Service → this repo → Start: `npm start`

### 2. Test the URL

Open the URL in a browser. You should see a Safari start page.  
Search Google or open a favorite. If pages load, the proxy works.

### 3. Point Mac OS Safari at that URL

In your Mac OS HTML, set the Safari iframe to:

```html
<iframe id="safari-frame" src="https://YOUR-RAILWAY-URL/"></iframe>
```

Or when navigating to a site:

```js
var PROXY = "https://YOUR-RAILWAY-URL"; // no trailing slash
safariFrame.src = PROXY + "/?url=" + encodeURIComponent(theUrl);
```

Keep the Mac OS shell on jsDelivr + SVG as you already do. Only Safari’s **content** should load from your deployed proxy.

## Local test (optional)

```bash
git clone https://github.com/Mo9nikeypurple/scramjet-safari.git
cd scramjet-safari
npm install --registry=https://registry.npmjs.org/
npm start
# open http://localhost:8080
```

## Checklist

- [ ] Deployed on Railway or Render  
- [ ] Proxy URL opens and can load Google  
- [ ] Mac OS Safari iframe uses that URL  
