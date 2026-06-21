const https = require('http'); // using http since we are testing on localhost:3000

// ==========================================
// CONFIGURATION
// Replace this with the API Key and Email shown on your Dashboard!
const API_KEY = "qac_test_key_123"; 
const AGENT_EMAIL = "tarun.dutta499@gmail.com"; 
// ==========================================

const payload = JSON.stringify({
  agent_email: AGENT_EMAIL,
  client_name: "John Doe (Webhook Test)",
  duration: 180,
  text_transcript: `
Customer: Hi, I'm calling because my internet has been down for 3 hours.
Agent: Oh, I'm sorry to hear that. Let me look into your account. Can I have your name and phone number?
Customer: John Doe, 555-0198.
Agent: Thanks John. I see the outage in your area. It should be resolved in the next hour.
Customer: Okay, thank you.
Agent: You're welcome. Have a great day!
  `.trim()
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/v1/webhooks/genesys',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Length': Buffer.byteLength(payload)
  }
};

console.log(`🚀 Firing Mock Webhook Payload to localhost:3000...`);

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`\n✅ Response Status: ${res.statusCode}`);
    try {
      console.log(`✅ Response Body:`, JSON.parse(data));
      if (res.statusCode === 202) {
        console.log(`\n🎉 SUCCESS! The call has been injected and the AI is auditing it in the background!`);
        console.log(`Go check your web Dashboard in about 15 seconds to see the new audit appear.`);
      }
    } catch (e) {
      console.log(`Response Body:`, data);
    }
  });
});

req.on('error', (error) => {
  console.error('\n❌ Connection Error!');
  console.error('Make sure your Next.js server is running (npm run dev) on port 3000!');
  console.error(error.message);
});

req.write(payload);
req.end();
