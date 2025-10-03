# ePortfolio — Requirements Checklist & README

This document helps you verify all rubric items and provides a quick start + deploy guide.

---

## 1) Requirements Checklist (mapped to rubric)

**1. HTML5 + basic CSS** — ✅ Covered

* Semantic layout across pages (header/nav/main/section/footer).
* Typography, layout with Bootstrap + custom CSS.

**2. JavaScript with DOM / events / objects** — ✅ Covered

* DOM manipulation in `index.html`, `notes.js`, `forms.js`, `canvas.js`, `tasks.js`, `map.js`, `chat.js`.
* ES modules + classes where relevant (Pomodoro class in `tasks.js`).

**3. Operational HTML5 form** — ✅ Covered

* `forms.html` with HTML5 inputs (email, tel, date, url, password) + patterns + `required`.

**4. XMLHttpRequest objects to communicate data** — ✅ Covered

* `api.html` → Cat Fact via **XMLHttpRequest** in `api.js`.

**5. CSS style sheets & selectors** — ✅ Covered

* `assets/css/main.css` + Bootstrap utilities; custom states, hover transitions.

**6. HTML5 APIs (media, geolocation)** — ✅ Covered

* Embedded `<video>`/`<audio>`/YouTube in `about.html`.
* Geolocation in `map.html`.

**7. Offline support methods** — ✅ Partially covered → ⚠️

* Local client storage (localStorage/sessionStorage) implemented (notes, form drafts).
* To fully satisfy “support applications offline”, add a **Service Worker** for caching. (See TODO below.)

**8. Adaptive UI (AUI)** — ✅ Covered

* Responsive Bootstrap grid; mobile navbar; theme toggle.

**9. Interactive graphics (SVG/Canvas)** — ✅ Covered

* `canvas.html` demos + Pomodoro progress ring canvas.

**10. CSS transitions/animations** — ✅ Covered

* Card hover transitions; animated canvas; you can add a subtle `@keyframes` fade‑in in `main.css` if needed.

**11. WebSockets (real-time)** — ✅ Covered

* `chat.html` connects to `wss://echo.websocket.events` with send/receive.

**12. Web Workers** — ✅ Covered

* `service/worker.js` for Pomodoro tick processing.

**Report (800–1200 words)** — ✅ Covered

* `report/report.md` (Open Library analysis) + `sitemap.xml` + flowchart instructions.

### Optional small TODOs to reach “polished” state

* **Service Worker** (offline caching): add `sw.js` (cache shell: HTML/CSS/JS; runtime cache for images).
* **Lighthouse**: target ≥ 90 on Performance/Accessibility/SEO. Verify alt text and color contrast.
* **Navbar links consistency**: ensure all pages include the full nav and correct active state.

---

## 2) README — Quick Start

### Prerequisites

* Any static server. Options:

    * VS Code extension **Live Server**
    * Node.js + `npx serve`
    * Python 3: `python -m http.server 5173`

> Some APIs (Geolocation, Service Worker) require HTTPS or `http://localhost`.

### Local run (option A: npx serve)

```bash
# From the project root
npx serve -l 5173
# Open http://localhost:5173/index.html
```

### Local run (option B: VS Code Live Server)

1. Open the project folder in VS Code.
2. Right‑click `index.html` → **Open with Live Server**.

### Project structure (recap)

```
/ (root)
  index.html
  tasks.html
  canvas.html
  forms.html
  map.html
  chat.html
  api.html
  about.html
  /assets/css/main.css
  /js/*.js
  /service/worker.js
  /report/report.md, sitemap.xml, sitemap-flowchart.png
```

### Environment notes

* **Geolocation**: will prompt for permission; works best on HTTPS or `localhost`.
* **WebSocket echo**: public demo server; if blocked by a network, switch to another echo or your own WS server.
* **CORS**: demos use CORS‑enabled endpoints; if a call fails, check console and retry.

---

## 3) Deployment

### GitHub Pages (static hosting)

1. Push the project to a GitHub repo.
2. Settings → Pages → Deploy from **main** branch `/ (root)` or `/docs`.
3. Wait for build; site lives at `https://<username>.github.io/<repo>/`.

### Netlify (drag‑and‑drop)

1. Create account → **Add new site** → **Deploy manually**.
2. Drag the project folder; Netlify assigns a URL like `https://<site>.netlify.app`.
3. Add redirects if needed.

### Vercel

1. Import GitHub repo → Framework: **Other** (static).
2. Build & Output Settings: leave empty; it’s static.
3. Deploy → `https://<project>.vercel.app`.

> After deploy, update `report/sitemap.xml` with your actual URL.

---

## 4) (Optional) Add Service Worker for Offline

Create `sw.js` (workbox or manual cache):

```js
const CACHE = 'studyhub-v1';
const ASSETS = [
  '/', '/index.html', '/assets/css/main.css',
  '/tasks.html', '/canvas.html', '/forms.html', '/map.html', '/chat.html', '/api.html', '/about.html',
  '/js/notes.js', '/js/tasks.js', '/js/canvas.js', '/js/forms.js', '/js/map.js', '/js/chat.js', '/js/api.js',
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return resp;
    }).catch(() => caches.match('/index.html')))
  );
});
```

Register it in `index.html` (and reuse across pages):

```html
<script>
if ('serviceWorker' in navigator) {
  window.addEventListener('load', ()=> navigator.serviceWorker.register('/sw.js'));
}
</script>
```

Test on `https://` or `http://localhost`.

---

## 5) Verification Checklist before submission

* [ ] All pages open without console errors.
* [ ] Notes: create/edit/delete/search; persists after reload (localStorage).
* [ ] Forms: HTML5 + custom JS validation; draft save/restore (sessionStorage).
* [ ] Pomodoro: start/pause/reset/skip; progress ring animates; worker ticks.
* [ ] Canvas: shapes, animation, drawing.
* [ ] Geolocation: getCurrentPosition & watchPosition; tile preview updates.
* [ ] Chat: connect, send, receive; handle close/error.
* [ ] API: fetch (books), XHR (cat fact), jQuery (dogs) — all render results.
* [ ] Media: video/audio/YouTube play; captions track present.
* [ ] Theme toggle works and persists.
* [ ] `report.md`, `sitemap.xml`, `sitemap-flowchart.png` present under `/report`.
* [ ] (Optional) Service Worker registered and passes offline smoke test.

