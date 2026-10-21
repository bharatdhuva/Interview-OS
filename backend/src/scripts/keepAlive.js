/**
 * Keep-alive ping script
 * Pings the server every 10 minutes to prevent Render spin-down and Atlas idle pause.
 */
const https = require('https');

const TARGET_URL = process.env.PING_URL || 'https://interview-os-backend-2waa.onrender.com/api/v1/health';
const INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

function ping() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Pinging: ${TARGET_URL}`);

  https.get(TARGET_URL, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log(`[${new Date().toISOString()}] Response (${res.statusCode}): ${data}`);
    });
  }).on('error', (err) => {
    console.error(`[${new Date().toISOString()}] Ping error:`, err.message);
  });
}

// Initial ping then periodic
ping();
setInterval(ping, INTERVAL_MS);
