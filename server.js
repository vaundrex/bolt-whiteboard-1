import express from 'express';
import { WebSocketServer } from 'ws';
import { createTLServer } from '@tldraw/tlsync';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3001;

// Store rooms in memory
const rooms = new Set();

// Enable JSON parsing
app.use(express.json());

// API endpoints for room management
app.get('/api/rooms', (req, res) => {
  res.json(Array.from(rooms));
});

app.post('/api/rooms', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Room name is required' });
  }
  rooms.add(name);
  res.status(201).json({ name });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, 'dist')));
}

const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Create TLDraw sync server
const tlserver = createTLServer({
  maxRooms: 50,
  maxClients: 50,
  maxDocuments: 50,
});

// Handle WebSocket connections
wss.on('connection', (ws) => {
  tlserver.handleConnection(ws);
});