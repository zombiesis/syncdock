import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import { WebSocketServer } from 'ws';
import http from 'http';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.resolve(__dirname, '..');   // one level up: the .html files

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// ── Clean-URL Static File Server ─────────────────────────────────────────────
// Serves /workbench -> workbench.html, /pricing -> pricing.html, etc.
// Must be registered BEFORE the rate-limiter so static assets are fast.
const PAGES = [
  'workbench', 'pricing', 'downloads', 'docs', 'community',
  'studio', 'changelog', 'security', 'about', 'status',
  'legal', 'auth', 'companion'
];

// 1. Redirect /page.html -> /page (strip .html, permanent)
app.use((req, res, next) => {
  if (req.path.endsWith('.html') && req.path !== '/index.html') {
    const clean = req.path.slice(0, -5);           // remove .html
    return res.redirect(301, clean + (req.url.includes('?') ? '?' + req.url.split('?')[1] : ''));
  }
  next();
});

// 2. Serve static assets (css, js, images, manifest, etc.)
app.use(express.static(SITE_ROOT, { extensions: ['html'], index: 'index.html' }));

// 3. Clean-URL page routes: /workbench -> workbench.html
PAGES.forEach(page => {
  app.get(`/${page}`, (_req, res) => {
    const fp = path.join(SITE_ROOT, `${page}.html`);
    if (fs.existsSync(fp)) return res.sendFile(fp);
    res.status(404).sendFile(path.join(SITE_ROOT, 'index.html'));
  });
});

// 1. Sliding-Window Rate Limiter Middleware (100 req / 60s per IP)
const rateWindow = new Map();
app.use((req, res, next) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const record = rateWindow.get(ip) || { count: 0, resetAt: now + 60000 };
  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + 60000;
  }
  record.count += 1;
  rateWindow.set(ip, record);
  if (record.count > 100) {
    return res.status(429).json({ ok: false, error: 'HTTP 429: Rate limit exceeded (100 req/min)' });
  }
  next();
});

// 2. Live SMTP Relay Endpoint (Connects to #auth page in index.html)
app.post('/api/smtp-send', async (req, res) => {
  try {
    const {
      to,
      from = process.env.SMTP_USER || 'no-reply@syncdock.tech',
      subject,
      html,
      smtpHost = process.env.SMTP_HOST || 'smtp.syncdock.tech',
      smtpPort = Number(process.env.SMTP_PORT || 587),
      smtpPass = process.env.SMTP_PASS || ''
    } = req.body;

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: from, pass: smtpPass }
    });

    const info = await transporter.sendMail({
      from: `"SyncDock Beta" <${from}>`,
      to,
      subject,
      html
    });

    return res.json({ ok: true, messageId: info.messageId });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// 3. Cross-Device WebSocket Signaling Bus for LAN Hardware Nodes
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (socket) => {
  socket.on('message', (raw) => {
    for (const client of wss.clients) {
      if (client !== socket && client.readyState === 1) {
        client.send(raw.toString());
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`[SyncDock Server] SMTP Relay & WebSocket Bus listening on http://localhost:${PORT}`);
});
