/**
 * ============================================================================
 * GOOGLE CHAT WEBHOOK - MINIMALISTIC SAMPLE
 * ============================================================================
 * 
 * Quick Start Instructions:
 * 1. Copy your Webhook URL from your Google Chat space (Manage webhooks).
 * 2. Paste the exact string directly into the WEBHOOK_URL variable below.
 * 3. Select either `sendSimpleMessage` or `sendCardMessage` from the top function dropdown.
 * 4. Click 'Run' and view the output inside Execution Log (View > Logs).
 */

// ⚠️ REPLACE THIS STRING with the full URL generated from your Google Chat space
const WEBHOOK_URL = "https://chat.googleapis.com/v1/spaces/YOUR_SPACE_ID/messages?key=YOUR_KEY&token=YOUR_TOKEN";

/**
 * 1. SEND A SIMPLE TEXT MESSAGE
 * Demonstrates sending a straightforward notification to your Chat space.
 */
function sendSimpleMessage() {
  const payload = {
    text: "Hello from Apps Script! 🚀 Webhook integration successful."
  };

  postToWebhook(payload);
}

/**
 * 2. SEND A RICH CARD MESSAGE (Cards V2)
 * Demonstrates creating structured, beautifully styled cards with titles, headers, and clickable buttons.
 */
function sendCardMessage() {
  const payload = {
    cardsV2: [
      {
        cardId: "minimal-card-sample",
        card: {
          header: {
            title: "System Status Update",
            subtitle: "Automated alert from internal custom app",
            imageUrl: "https://www.gstatic.com/images/branding/product/2x/chat_48dp.png",
            imageType: "CIRCLE"
          },
          sections: [
            {
              widgets: [
                {
                  decoratedText: {
                    topLabel: "Integration Test",
                    text: "Google Workspace Webhook Connection Active ✅"
                  }
                },
                {
                  buttonList: {
                    buttons: [
                      {
                        text: "Open Google Admin",
                        onClick: {
                          openLink: { url: "https://admin.google.com" }
                        }
                      },
                      {
                        text: "View Cards Documentation",
                        onClick: {
                          openLink: { url: "https://developers.google.com/workspace/chat/format-messages" }
                        }
                      }
                    ]
                  }
                }
              ]
            }
          ]
        }
      }
    ]
  };

  postToWebhook(payload);
}

/**
 * Helper function that submits the payload via HTTP POST to the target webhook endpoint.
 */
function postToWebhook(payload) {
  if (!WEBHOOK_URL || WEBHOOK_URL.includes("YOUR_SPACE_ID")) {
    Logger.log("⚠️ PLEASE SET YOUR WEBHOOK URL: Replace the placeholder string inside the `WEBHOOK_URL` variable at line 14 before running.");
    return;
  }

  const options = {
    method: "POST",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true // Captures server response cleanly without crashing execution
  };

  Logger.log("Sending POST request to Google Chat Webhook URL...");
  const response = UrlFetchApp.fetch(WEBHOOK_URL, options);
  
  const responseCode = response.getResponseCode();
  const responseBody = response.getContentText();

  Logger.log("HTTP Response Code: " + responseCode);
  Logger.log("Server Response: " + responseBody);

  if (responseCode === 200) {
    Logger.log("✅ SUCCESS: Your message appeared inside the Chat space!");
  } else {
    Logger.log(`❌ FAILED with status ${responseCode}. Please verify your Webhook URL and Google Workspace administrative permissions.`);
  }
}
