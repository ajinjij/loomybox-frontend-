# Loomybox frontend

Static site — no build step. Deploy the whole folder to Cloudflare Pages
(build command: none, output directory: `/`).

Before deploying, open `js/api.js` and set `LIVE_API_BASE` to your Render URL.
On localhost it automatically uses `http://localhost:4000/api` instead.
