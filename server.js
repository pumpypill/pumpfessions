const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { customAlphabet } = require('nanoid');

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 12);
const app = express();
const PORT = process.env.PORT || 3000;

const DATA_FILE = path.join(__dirname, 'confessions.json');
let confessions = [];
let clients = [];

function loadConfessions() {
  try {
    if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
    confessions = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch (e) {
    console.error('Failed to load confessions:', e);
    confessions = [];
  }
}

function saveConfessions() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(confessions, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save confessions:', e);
  }
}

function broadcast(confession) {
  const payload = `data: ${JSON.stringify(confession)}\n\n`;
  clients.forEach(res => res.write(payload));
}

app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(express.static(__dirname, { extensions: ['html'] }));

app.get('/api/confessions', (req, res) => {
  res.json(confessions.slice(0, 100));
});

app.post('/api/confessions', (req, res) => {
  const message = (req.body && req.body.message || '').trim();
  if (!message) return res.status(400).json({ error: 'Message required' });
  const confession = {
    id: nanoid(),
    message,
    timestamp: new Date().toISOString(),
    displayTime: new Date().toLocaleString()
  };
  confessions.unshift(confession);
  confessions = confessions.slice(0, 500); // cap
  saveConfessions();
  broadcast(confession);
  res.status(201).json(confession);
});

app.get('/api/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-store',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });
  // send initial batch
  res.write(`data: ${JSON.stringify({ type: 'init', confessions: confessions.slice(0, 50) })}\n\n`);
  clients.push(res);
  req.on('close', () => {
    clients = clients.filter(c => c !== res);
  });
});

loadConfessions();

app.listen(PORT, () => {
  console.log(`Pumpfessions server running on http://localhost:${PORT}`);
});
