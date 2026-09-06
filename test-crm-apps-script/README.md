# Simplifye Test CRM (Apps Script)

A standalone Google Apps Script that fakes a lettings CRM in a Google
Sheet, so a Retell AI voice agent's "existing tenant lookup" custom
function can be tested end-to-end before it's pointed at a real CRM.

## Files

- `Code.gs` — the script: `setupTestCrm()`, `lookupTenant(phoneNumber)`,
  and the `doGet(e)` web app entry point.
- `appsscript.json` — project manifest (Apps Script generates this
  automatically for you too, so you don't strictly need to paste it in).

## 1. Create the Apps Script project

1. Go to [script.google.com](https://script.google.com) and click
   **New project**.
2. Rename the project (e.g. "Simplifye Test CRM") via the title field at
   the top.
3. Delete the default `Code.gs` contents and paste in this repo's
   `Code.gs`.
4. (Optional) Open **Project Settings > Show "appsscript.json"** and
   paste in `appsscript.json` from this repo.

## 2. Create and seed the fake CRM sheet

1. In the Apps Script editor, select the `setupTestCrm` function from the
   function dropdown (next to Debug) and click **Run**.
2. The first run will prompt you to authorize the script (it needs
   Sheets + Drive access to create the spreadsheet). Review and accept.
3. Check **View > Logs** (or Executions) for the URL of the new
   "Simplifye Test CRM" spreadsheet, or just find it in your Google
   Drive. It will have a **Tenants** tab with the 3 seed rows.

Re-running `setupTestCrm()` creates a brand-new spreadsheet each time
(it doesn't overwrite the old one), so only run it once unless you want
a fresh copy.

## 3. Deploy as a web app

1. In the Apps Script editor, click **Deploy > New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in the deployment config:
   - **Description**: e.g. "Retell tenant lookup"
   - **Execute as**: **Me** (your account) — so it runs with your
     permissions and can read the sheet regardless of who calls it.
   - **Who has access**: **Anyone** — this is what allows Retell's
     server to call the URL without a Google login. (If your Google
     Workspace admin restricts this, you may only see "Anyone within
     [your domain]", which won't work for an external caller like
     Retell — talk to your admin, or test from a personal Gmail
     account instead.)
4. Click **Deploy**, then **Authorize access** again if prompted.
5. Copy the **Web app URL** shown — it looks like:

   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```

   That full URL, including the deployment ID (`AKfycb...`), is what you
   call. Query parameters go on the end, e.g.:

   ```
   https://script.google.com/macros/s/AKfycb.../exec?phone=07904455774
   ```

## 4. Point Retell at it

In your Retell custom function config, set the URL to the deployment
URL above with the caller's number passed as the `phone` query
parameter (Retell exposes the caller's number as a dynamic variable you
can interpolate into the URL or pass as a function argument mapped to
`phone`). A GET request with no `phone` param returns:

```json
{ "error": "Missing required \"phone\" query parameter." }
```

A match returns:

```json
{
  "name": "Ryan Higgins",
  "phoneNumber": "07904455774",
  "propertyAddress": "20 Elm Street",
  "status": "Viewing Booked",
  "notes": "Viewing scheduled for Thursday 2pm"
}
```

No match returns the JSON value `null`.

## Notes on redeploying

Every time you edit `Code.gs` after the first deployment, editing the
existing deployment's code isn't enough — Apps Script versions your
code, so you need to either:

- **Deploy > Manage deployments > edit (pencil) icon > select "New
  version" > Deploy**, which keeps the same URL, or
- Create an entirely new deployment (new URL).

Editing and saving the script alone does **not** update what the live
web app URL serves.

## Phone number matching

`lookupTenant` normalizes both the stored number and the incoming
number before comparing, so `+447904455774`, `0044 7904 455774`,
`07904 455774` and `07904455774` all match the same row.
