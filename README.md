# Google Chat Webhook Integration & Enterprise Administration Guide

This repository provides a self-contained code sample and replication walkthrough for sending automated messages and structured **Cards V2 notifications** to Google Chat spaces using **Google Apps Script**.

It includes the complete enterprise architectural roadmap and administrative configuration checklist required to securely enable **Incoming Webhooks** across a restricted **Google Workspace** environment (e.g., enabling webhooks selectively via Configuration Groups while maintaining strict lockdowns across your Root Organizational Unit).

> [!IMPORTANT]
> **IMPORTANT DISCLAIMER:** This solution offers a recommended approach that is not exhaustive and is not intended as a final enterprise-ready solution. Customers should consult their Dev, security, and networking teams before deployment.

---

## Repository Structure

```text
├── Code.gs             # Apps Script sample illustrating simple text & rich Cards V2 notifications
└── README.md           # Architectural configuration walkthrough & replication instructions
```

---

## 1. Prerequisites & GWS Admin Console Checklist

To deploy and test incoming webhooks successfully across your Google Workspace domain, your Super Admin or Workspace Administrator must verify these **three distinct policy zones**:

### A. Google Chat Space Capabilities (`Apps > Google Workspace > Google Chat`)
1. Navigate to **[admin.google.com](https://admin.google.com)** -> **Apps > Google Workspace > Google Chat > Chat apps**.
2. Select your targeted **Configuration Group** (or Organizational Unit) in the left panel.
3. Verify the following toggles are active:

* **Allow users to add and use incoming webhooks:** `ON`.

### B. Drive & Docs Network Allowlists (`Apps > Google Workspace > Drive and Docs`)
1. Navigate to **Apps > Google Workspace > Settings for Drive and Docs > Features and Applications**.
2. Locate **`Importing and fetching from URLs`** *(Select which URLs users can fetch data from or send data to within Sheets and Scripts)*.
3. Confirm this is set to **Allow importing and fetching from all URLs**, or if utilizing restricted mode (`Allow importing and fetching only from the following URLs`), verify that `https://chat.googleapis.com/` is explicitly listed.

---

## 2. Architectural Briefing

```
+-----------------------------------------------------------------------------+
|                         GOOGLE WORKSPACE TENANT                             |
|                                                                             |
|  [1. Chat Apps Settings] --------> ON (Permits Webhook Bot  inside room).   |
|  [2. Drive & Docs URL Policy] ---> Allowed ( UrlFetchApp targeting Chat).   |
+-----------------------------------------------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
|                         GOOGLE APPS SCRIPT (Code.gs)                        |
|                                                                             |
|  postToWebhook(payload) --> UrlFetchApp.fetch(WEBHOOK_URL, { method: POST })|
+-----------------------------------------------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
|                           GOOGLE CHAT TARGET SPACE                          |
|                                                                             |
|  Runtime Evaluation: Evaluates Space Policy & Marketplace Restrictions     |
|    ├── IF Policies Valid --> Returns HTTP 200 (Notification Rendered ✅)    |
|    └── IF Policy Blocked --> Returns HTTP 403 (Policy Rejection Logged ❌)  |
+-----------------------------------------------------------------------------+
```

---

## 3. Step-by-Step Replication Guide

### Option A: Using Google Apps Script CLI (`clasp`) inside Terminal
If you use [`clasp`](https://github.com/google/clasp) locally to manage code deployments:

```bash
# 1. Authenticate against your Google Workspace environment
clasp login

# 2. Initialize a standalone Apps Script project
clasp create --type standalone --title "Google-Chat-Webhook-Sample"

# 3. Push Code.gs and appsscript.json straight into your cloud editor
clasp push

# 4. Open the online Google Apps Script interface
clasp open
```

### Option B: Manual Cloud Editor Setup
1. Go to **[script.google.com](https://script.google.com)** inside your Google Workspace account and click **New Project**.
2. Copy the contents of [Code.gs](file:///Users/oskaryescas/Documents/Client%20Projects/Teleperformance/Chat_Webhook_AppsScript/Code.gs) directly into your editor window and name the file `Code.gs`.
3. Save your project (`Cmd/Ctrl + S`).

---

### Executing the Sample Code

1. In your test Google Chat space (`chat.google.com`), click the room header dropdown arrow -> **Apps & integrations** -> **Manage webhooks**.
2. Create a new incoming webhook named `Apps-Script-Alert` and copy the generated URL (`https://chat.googleapis.com/v1/spaces/...`).
3. In [Code.gs](file:///Users/oskaryescas/Documents/Client%20Projects/Teleperformance/Chat_Webhook_AppsScript/Code.gs), paste your full webhook string directly into the `WEBHOOK_URL` constant right at line 14:
   ```javascript
   const WEBHOOK_URL = "https://chat.googleapis.com/v1/spaces/AAQA.../messages?key=AIza...&token=w4wI...";
   ```
4. **Test Simple Messaging:** Select **`sendSimpleMessage`** from the function execution dropdown right at the top of your editor window and click **Run**. Check your Chat space to see the standard notification appear instantly.
5. **Test Rich Cards V2:** Select **`sendCardMessage`** from the dropdown and click **Run**. Inspect your Chat space to see a highly structured, interactive card displaying custom headers, section blocks, status verification markers, and clickable navigation buttons.
6. **Review Logs:** Navigate to **View > Execution Log** (`Cmd/Ctrl + Enter`) inside your Script Editor. Because `muteHttpExceptions: true` is included inside `postToWebhook()`, your script runs cleanly and returns diagnostic feedback containing precise `HTTP 200` confirmation codes right in your console.

---

## 4. Disclaimers & Enterprise Governance

> [!IMPORTANT]
> **IMPORTANT DISCLAIMER:** This solution offers a recommended approach that is not exhaustive and is not intended as a final enterprise-ready solution. Customers should consult their Dev, security, and networking teams before deployment.

1. **Policy Propagation Latency (Up to 24 Hours):**
   When modifying administrative controls inside the Google Workspace Admin Console—specifically shifting organizational Group overrides, altering Marketplace app restrictions, or updating `API Controls > Apps Script Runtime` permissions—changes must sync across distributed global edge caches. While updates often take effect in minutes within test tenants, full domain propagation across all active cloud runtime containers can take up to **24 hours**.
2. **Security Risk of Exposed Webhook Tokens:**
   An Incoming Webhook URL incorporates both its authentication key and cryptographic token inside the query parameter string (`?key=...&token=...`). Anyone possessing this link can execute unverified `POST` requests directly into your room without Google OAuth or IAM validation. Always treat these URLs as sensitive secrets; never expose plain-text webhook strings in publicly accessible repositories or shared spreadsheets.
3. **When to Transition to Custom GCP-Backed Chat Apps:**
   If your organization’s strict zero-trust posture forbids general space webhooks (`Allow users to install and run incoming webhooks: OFF`) or enforces centralized audit auditing requiring an explicitly registered 12-digit **GCP Project Number / App ID**, you should transition from space webhooks to a dedicated **Custom Chat App** (`Google Cloud Console > Google Chat API configuration`). Custom apps run via structured HTTPS endpoints or Apps Script deployments, possess formal OAuth Client IDs, and can be specifically allowlisted inside the Admin Console without globally allowing general webhooks across your organizational units.
