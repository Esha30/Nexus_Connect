# 🔐 Google OAuth 403 Forbidden Configuration Guide

If you are experiencing a `403 Forbidden` error or `Error 400: redirect_uri_mismatch` when attempting to log in via Google, you must update your Google Cloud Console configuration to recognize your local development server.

## Step-by-Step Instructions

1. **Open Google Cloud Console:**
   Navigate to [Google Cloud Console Credentials Page](https://console.cloud.google.com/apis/credentials).

2. **Select Your Project:**
   Make sure the project associated with your `GOOGLE_CLIENT_ID` is selected in the top navigation bar dropdown.

3. **Edit OAuth Client ID:**
   Under **OAuth 2.0 Client IDs**, find your web application client ID and click the **Pencil (Edit)** icon next to it.

4. **Add Authorized JavaScript Origins:**
   Under the **Authorized JavaScript origins** section, click `+ ADD URI` and add the following two origins exactly:
   - `http://localhost:5173`
   - `http://127.0.0.1:5173`

5. **(Optional) Add Authorized Redirect URIs:**
   Under **Authorized redirect URIs**, add the same URIs.
   - `http://localhost:5173`
   - `http://127.0.0.1:5173`

6. **Save Changes!**
   Scroll to the bottom and click **SAVE**.

---

> **⚠️ NOTE:** Google can sometimes take up to **5 minutes** to propagate these changes. If the error persists immediately after saving, wait a few minutes, hard refresh your browser (`Ctrl+Shift+R` or `Cmd+Shift+R`), and try logging in again.
