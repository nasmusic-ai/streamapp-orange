// ==================== dashboard.js ====================

// CHANGE THIS ONCE AFTER YOUR RENDER BACKEND IS LIVE
const RENDER_BACKEND_URL = 'wss://orange-backend-xxxx.onrender.com'; 
// Example: wss://orange-streamapp-backend.onrender.com

// Auto-detect correct WebSocket URL
const WS_URL = location.hostname.includes('github.io') 
  ? RENDER_BACKEND_URL 
  : 'ws://localhost:8080';

const HTTP_URL = WS_URL.replace('ws', 'http'); // for fetch()

let ws;
const status = document.getElementById('status');
const connectBtn = document.getElementById('connect');

// Auto-connect on page load (no button needed anymore)
function connect() {
  if (ws) ws.close();

  ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    status.textContent = 'Connected';
    status.style.color = '#4ade80';
  };

  ws.onclose = () => {
    status.textContent = 'Disconnected';
    status.style.color = '#ef4444';
    // Auto-reconnect after 3 seconds
    setTimeout(connect, 3000);
  };

  ws.onerror = () => {
    status.textContent = 'Error';
    status.style.color = '#ef4444';
  };
}

// Connect immediately
connect();

// Optional: keep button for manual reconnect
connectBtn.addEventListener('click', connect);

// Send Alert Button
document.getElementById('send-alert').addEventListener('click', () => {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    return alert('Not connected yet — wait or refresh');

  const name = document.getElementById('alert-name').value.trim() || 'Anonymous';
  const alertType = document.getElementById('alert-type').value;
  const message = document.getElementById('alert-msg').value.trim();
  const amount = document.getElementById('alert-amount').value || null;

  const payload = { alertType, name, message, amount };

  fetch(`${HTTP_URL}/event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(r => r.json())
  .then(res => {
    console.log('Alert sent!', res);
    alert('Alert sent successfully!');
  })
  .catch(err => {
    console.error(err);
    alert('Failed to send alert — is backend awake?');
  });
});