# STACKEDHQ Health Advisory — website

A simple, static 3-file website (no build step, no framework) with a
consultation form that posts straight to an n8n webhook.

```
index.html    the page
styles.css    all styling
script.js     form submit logic + the webhook URL
```

## 1. Point it at your n8n webhook

Open `script.js` and edit this line near the top:

```js
const N8N_WEBHOOK_URL = "https://YOUR-N8N-DOMAIN.com/webhook/YOUR-WEBHOOK-ID";
```

A few things worth double-checking, since these are the two issues that
usually trip people up:

- **Use the production URL, not the test one.** n8n gives you a
  `/webhook-test/...` URL that only listens while you have the workflow
  open in the editor with "Listen for test event" active. The real URL
  for a live site is `/webhook/...`, and it only responds once the
  workflow is **Active** (toggle in the top right of the n8n editor).
- **CORS.** Since the browser is calling n8n directly from a different
  domain, n8n needs to allow it. On the Webhook (trigger) node, open
  **Options → Allowed Origins (CORS)** and set it to `*` while testing,
  or to your exact Vercel domain (e.g. `https://your-site.vercel.app`)
  once you're ready to lock it down. If you're using a **Respond to
  Webhook** node to send the reply, you can also add an
  `Access-Control-Allow-Origin` header there.

The form sends this JSON body to your webhook. The key names are
snake_case and must match exactly what the n8n Code node reads — a
mismatch fails silently rather than erroring:

```json
{
  "submission_id": "SHQ-260819-K7QP3M",
  "name": "...",
  "email": "...",
  "organization": "...",
  "request": "...",
  "submitted_at": "2026-08-19T12:00:00.000Z",
  "hp": ""
}
```

- `submission_id` is the reference code shown to the person after they
  submit. It is generated in the browser, reused on retry, and only
  regenerated after a confirmed success.
- `hp` is a honeypot. It is hidden from people and left empty. If it
  arrives non-empty, the submission came from a bot and n8n drops it.

## 2. Preview it locally (optional)

No build tools needed. Either:

- Just double-click `index.html` to open it in a browser, or
- Run a tiny local server from this folder so relative paths behave
  exactly like they will in production:
  ```
  python3 -m http.server 5500
  ```
  then visit `http://localhost:5500`.

## 3. Push to GitHub

```bash
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

## 4. Deploy on Vercel

1. Go to vercel.com → **Add New Project** → import the GitHub repo.
2. Framework preset: **Other** (it's a static site — no build command,
   no output directory needed).
3. Click **Deploy**.

That's it — Vercel will serve `index.html` directly. Every future
`git push` to `main` redeploys automatically.

## Customizing

- **Branding / copy**: edit the text directly in `index.html` — brand
  name in the header/footer, hero headline, service cards, and the
  contact details in the footer (currently placeholders).
- **Form fields**: each field lives inside a `<div class="field">` in
  the `<form id="consultation-form">` section of `index.html`. Add or
  remove fields there — no JS changes needed, `script.js` reads
  whatever fields exist on the form automatically.
- **Colors/fonts**: all defined as CSS variables at the top of
  `styles.css` under `:root`.
