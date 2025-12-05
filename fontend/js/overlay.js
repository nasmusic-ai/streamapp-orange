// ==================== public/js/overlay.js ====================
// FINAL VERSION – Ready for OBS and live streams

const RENDER_BACKEND_URL = 'wss://streamapp-orange.onrender.com'; // Your real backend

const WS_URL = location.hostname.includes('github.io')
  ? RENDER_BACKEND_URL
  : 'ws://localhost:8080';

const alertsContainer = document.getElementById('alerts');

// Make overlay truly transparent and ignore mouse in OBS
document.body.style.background = 'transparent';
document.body.style.pointerEvents = 'none';
alertsContainer.style.pointerEvents = 'none';

function createAlert(data) {
  const { alertType, name = 'Anonymous', message = '', amount } = data;

  let title = '';
  let emoji = '';

  switch (alertType) {
    case 'follower':    title = 'New Follower!';      emoji = 'Follow';     break;
    case 'donation':    title = 'Donation!';         ' + (amount ? `$${amount}` : ''); emoji = 'Gift';      break;
    case 'cheer':       title = 'Bits Cheer!';       emoji = 'Star';       break;
    case 'subscriber':  title = 'New Subscriber!';   emoji = 'Crown';      break;
    case 'raid':        title = 'RAID INCOMING!';    emoji = 'Lightning';  break;
    default:            title = 'New Alert!';        emoji = 'Bell';       break;
  }

  const alertEl = document.createElement('div');
  alertEl.className = 'alert-popup';
  alertEl.innerHTML = `
    <div class="alert-content">
      <h2>${emoji} ${title}</h2>
      <p class="name">${name}</p>
      ${message ? `<p class="msg">${message}</p>` : ''}
    </div>
  `;

  alertsContainer.appendChild(alertEl);

  // Trigger fade-in
  requestAnimationFrame(() => {
    alertsContainer.style.opacity = 1;
    alertEl.style.opacity = 1;
    alertEl.style.transform = 'translateY(0)';
  });

  // Auto-remove after 8 seconds with smooth exit
  setTimeout(() => {
    alertEl.style.opacity = '0';
    alertEl.style.transform = 'translateY(30px)';
    setTimeout(() => {
      alertEl.remove();
      if (alertsContainer.children.length === 0) {
        alertsContainer.style.opacity = '0';
      }
    }, 600);
  }, 8000);
}

function connect() {
  const socket = new WebSocket(WS_URL);

  socket.onopen = () => console.log('Overlay connected to backend');

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'alert') createAlert(data);
    } catch (e) {
      console.error('Invalid JSON received:', event.data);
    }
  };

  socket.onclose = () => {
    console.warn('WebSocket disconnected – reconnecting in 3s...');
    setTimeout(connect, 3000);
  };

  socket.onerror = (err) => console.error('WebSocket error:', err);
}

// Start + forever reconnect
connect();
