/**
 * Run this script with Node.js to simulate a phone system (like Genesys)
 * sending a completed call to your Webhook API.
 * 
 * Command: node test-webhook.js
 */

async function testWebhook() {
  const WEBHOOK_URL = "http://localhost:3000/api/v1/webhooks/genesys";
  
  // We will insert 'qac_test_key_123' into your Supabase database manually
  const API_KEY = "qac_test_key_123"; 
  
  // A sample public audio file from Supabase storage (or any public URL)
  // For the test, we'll use a sample URL. In a real test, replace this with a real call recording.
  const audioUrl = "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg";

  console.log(`🚀 Sending mock call data to ${WEBHOOK_URL}...`);
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        client_name: 'John Doe (Mock)',
        agent_id: null,
        duration: 45,
        audio_url: audioUrl
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log("✅ SUCCESS! The webhook accepted the call and Gemini analyzed it.");
      console.log(data);
    } else {
      console.error("❌ FAILED:", data);
    }
  } catch (error) {
    console.error("Network Error:", error);
  }
}

testWebhook();
