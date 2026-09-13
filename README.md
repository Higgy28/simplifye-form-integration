# Simplifye Lettings — Demo Landing Page

A single-page, framework-free HTML/CSS/JS landing page for **Simplifye Lettings**,
a fictional UK letting agency created for sales demo purposes.

## Structure

```
index.html       Page markup
css/styles.css   All styling (blue/grey palette with a warm accent colour)
js/script.js     Handles the valuation form submission
```

The valuation form on the page POSTs `{ "name": "...", "phone": "...", "property": "..." }`
as JSON to the Google Apps Script endpoint configured in `js/script.js`.

## Hosting on GitHub Pages

1. Push this repository to GitHub (already done if you're reading this on GitHub).
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Choose the branch this code lives on (e.g. `main`) and the folder **`/ (root)`**, then **Save**.
5. Wait a minute for GitHub to build the site — the page will appear at:
   `https://<your-username>.github.io/<repository-name>/`
6. Revisit **Settings → Pages** to confirm the URL once it's live.

No build step is required — this is static HTML/CSS/JS.

## Note on the form

Google Apps Script web app endpoints don't return CORS headers, so the browser
can't read the response body. The form submits the request in `no-cors` mode
and shows the confirmation message as long as the request is sent successfully
(it can't detect server-side errors from the Apps Script itself). If you need
delivery confirmation, consider having the Apps Script also send you an email
or log to a sheet you check separately.
