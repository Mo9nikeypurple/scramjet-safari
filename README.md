# scramjet-safari

Mac OS web clone + Safari Scramjet proxy, ready for **jsDelivr**.

## Quick open (after HTML is on this repo)

**SVG wrapper (recommended):**
```
https://fastly.jsdelivr.net/gh/Mo9nikeypurple/scramjet-safari@main/lightspeed.svg
```

Prefer a **commit SHA** instead of `@main` so the CDN does not stick to an old cache:
```
https://fastly.jsdelivr.net/gh/Mo9nikeypurple/scramjet-safari@COMMIT/lightspeed.svg
```

## Upload the Mac OS file (required once)

The full page is ~2.2MB. Upload it in the GitHub website:

1. Open https://github.com/Mo9nikeypurple/scramjet-safari
2. Click **Add file** → **Upload files**
3. Upload `macos-safari-proxy.html` (from the chat artifacts / local copy)
4. Commit to `main`

Then open the **lightspeed.svg** jsDelivr link above.

### Why not push the 2.2MB file via API?

GitHub’s API path we use here truncates multi‑MB bodies. The web **Upload files** UI accepts the full HTML fine. jsDelivr serves GitHub files up to 50MB.

## What this build does

- Hides the top macOS menu bar
- Safari uses Scramjet via `https://scramjet.mercurywork.shop/?goto=…`
- SVG loads HTML as a `text/html` blob (jsDelivr serves `.html` as `text/plain`)

## Local (best)

Open `macos-safari-proxy.html` directly in Chrome/Edge/Firefox (no SVG needed).
