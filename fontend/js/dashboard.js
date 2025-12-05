// ==================== public/js/dashboard.js ====================
// FINAL VERSION – 100% working with your live backend

const RENDER_BACKEND_URL = 'wss://streamapp-orange.onrender.com'; // Your real backend

const WS_URL = location.hostname.includes('github.io')
  ? RENDER_BACKEND_URL
  : 'ws://localhost:8080';

const HTTP_URL = WS_URL.replace('ws', 'http'); // used for POST /event

let ws;
const status = document.getElementById('status');
const connectBtn = document.getElementById('connect');

// Auto-connect + forever reconnect
function connect() {
  if (ws) ws.close();

  ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    status.textContent = 'Connected';
    status.style.color = '#4ade80';
    connectBtn.textContent = 'Reconnect';
  };

  ws.onclose = () => {
    status.textContent = 'Disconnected – reconnecting…';
    status.style.color = '#f59e0b';
    setTimeout(connect, 3000);
  };

  ws.onerror = () => {
    status.textContent = 'Connection Error';
    status.style.color = '#ef4444';
  };
}

// Start connecting immediately
connect();

// Manual reconnect button (still useful)
connectBtn.addEventListener('click', connect);

// Send Alert
document.getElementById('send-alert').addEventListener('click', () => {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    alert('Not connected yet – please wait a few seconds');
    return;
  }

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
    console.log('Alert sent →', res);
    // Success feedback
    const btn = document.getElementById('send-alert');
    const original = btn.textContent;
    btn.textContent = 'Sent!';
    btn.style.background = '#4ade80';
    setTimeout(() => {
      btn.textContent = original;
      btn.style.background = '';
    }, 1500);

    // Clear inputs after success (optional, feels nice)
    document.getElementById('alert-name').value = '';
    document.getElementById('alert-msg').value = '';
    document.getElementById('alert-amount').value = '';
  })
  .catch(err => {
    console.error(err);
    alert('Failed to send – check if backend is awake');
  });
});
