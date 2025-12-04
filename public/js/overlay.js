// ==================== overlay.js ====================

// CHANGE THIS ONCE — SAME URL AS DASHBOARD
const RENDER_BACKEND_URL = 'wss://orange-backend-xxxx.onrender.com';

const WS_URL = location.hostname.includes('github.io')
  ? RENDER_BACKEND_URL
  : 'ws://localhost:8080';

const alertsContainer = document.getElementById('alerts');

function createAlert(data) {
  const { alertType, name, message = '', amount } = data;

  let title = '';
  let icon = '';

  switch (alertType) {
    case 'follower':   title = 'New Follower!'; icon = 'heart'; break;
    case 'donation':   title = `Donation${amount ? ' $' + amount : ''}!`; icon = 'gift'; break;
    case 'cheer':      title = 'Bits Cheer!'; icon = 'star'; break;
    case 'subscriber': title = 'New Subscriber!'; icon = 'crown'; break;
    case 'raid':       title = 'RAID INCOMING!'; icon = 'bolt'; break;
    default:           title = 'New Alert!'; icon = 'bell';
  }

  const alertEl = document.createElement('div');
  alertEl.className = 'alert-popup';
  alertEl.innerHTML = `
    <h2>${icon} ${title}</h2>
    <p><strong>${name}</strong>${message ? '<br>' + message : ''}</p>
  `;

  alertsContainer.appendChild(alertEl);
  alertsContainer.style.opacity = 1;

  // Auto-remove after 7 seconds with smooth fade
  setTimeout(() => {
    alertEl.style.opacity = '0';
    alertEl.style.transform = 'translateY(20px)';
    setTimeout(() => {
      alertEl.remove();
      if (alertsContainer.children.length === 0) {
        alertsContainer.style.opacity = 0;
      }
    }, 600);
  }, 7000);
}

function connect() {
  const socket = new WebSocket(WS_URL);

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'alert') createAlert(data);
    } catch (e) {
      console.error('Bad message', event.data);
    }
  };

  socket.onclose = () => {
    console.warn('WebSocket closed — reconnecting in 3s...');
    setTimeout(connect, 3000);
  };

  socket.onerror = (e) => console.error('WS Error', e);
}

// Start connection + auto-reconnect forever
connect();