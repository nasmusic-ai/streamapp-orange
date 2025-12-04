import express from 'express';
import { WebSocketServer } from 'ws';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'Orange StreamApp Backend Running!', time: new Date().toISOString() });
});

// POST /event → broadcast to all overlays
app.post('/event', (req, res) => {
  const body = req.body;
  if (!body || !body.alertType) {
    return res.status(400).json({ error: 'alertType required' });
  }

  const event = {
    type: 'alert',
    alertType: body.alertType,    // follower | donation | cheer
    name: body.name || 'Anonymous',
    message: body.message || '',
    amount: body.amount || null,
    time: Date.now()
  };

  broadcast(event);
  res.json({ success: true, event });
});

const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('New overlay connected');
  ws.send(JSON.stringify({ type: 'system', msg: 'connected' }));

  ws.on('close', () => console.log('Overlay disconnected'));
});

function broadcast(data) {
  const msg = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === client.OPEN) {
      client.send(msg);
    }
  });
}