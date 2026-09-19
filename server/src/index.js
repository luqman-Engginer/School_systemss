const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { seed } = require('./seed');
const { authenticate } = require('./auth');

const app = express();
const PORT = process.env.PORT || 5000;

seed();

const corsOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
app.use(cors({ origin: corsOrigins.length ? corsOrigins : true, credentials: true }));
app.use(express.json({ limit: '5mb' }));

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|pdf|doc|docx|xls|xlsx|ppt|pptx|mp4|zip|mp3/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase());
    cb(ok ? null : new Error('Tipe file tidak diizinkan.'), ok);
  }
});

app.post('/api/upload', authenticate, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'Tidak ada file.' });
  res.json({ success: true, data: { url: `/uploads/${req.file.filename}`, name: req.file.originalname } });
});

app.use('/uploads', express.static(UPLOAD_DIR));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/public', require('./routes/public'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/teacher', require('./routes/teacher'));
app.use('/api/student', require('./routes/student'));
app.use('/api/parent', require('./routes/parent'));

app.get('/api/health', (req, res) => res.json({ success: true, data: { status: 'ok', uptime: Math.round(process.uptime()), time: new Date().toISOString() } }));

const PALETTES = [
  ['#6366f1', '#a78bfa'], ['#0ea5e9', '#38bdf8'], ['#10b981', '#6ee7b7'],
  ['#f59e0b', '#fbbf24'], ['#ef4444', '#f87171'], ['#8b5cf6', '#c084fc'],
  ['#14b8a6', '#2dd4bf'], ['#ec4899', '#f472b6'], ['#22c55e', '#86efac'],
  ['#3b82f6', '#60a5fa'], ['#f97316', '#fdba74'], ['#06b6d4', '#22d3ee']
];
app.get('/img/:seed/:w/:h.svg', (req, res) => {
  const { seed, w = '800', h = '600' } = req.params;
  const width = Math.min(1600, Math.max(40, Number(w) || 800));
  const height = Math.min(1200, Math.max(40, Number(h) || 600));
  const hash = [...seed].reduce((a, c) => a + c.charCodeAt(0), 0);
  const [c1, c2] = PALETTES[hash % PALETTES.length];
  const label = seed.replace(/[\W_]+/g, ' ').trim().replace(/\b\w/g, (x) => x.toUpperCase()) || 'SchoolHub';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient></defs>
  <rect width="${width}" height="${height}" fill="url(#g)"/>
  <circle cx="${Math.round(width * 0.85)}" cy="${Math.round(height * 0.18)}" r="${Math.round(width * 0.22)}" fill="rgba(255,255,255,0.12)"/>
  <circle cx="${Math.round(width * 0.12)}" cy="${Math.round(height * 0.88)}" r="${Math.round(width * 0.26)}" fill="rgba(0,0,0,0.08)"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="Inter,system-ui,Arial,sans-serif" font-size="${Math.max(16, Math.round(Math.min(width, height) * 0.085))}" font-weight="700" fill="rgba(255,255,255,0.95)" letter-spacing="0.5">${label}</text>
</svg>`;
  res.type('image/svg+xml');
  res.set('Cache-Control', 'public, max-age=86400');
  res.send(svg);
});

const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api|\/uploads).*/, (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

app.use((req, res) => res.status(404).json({ success: false, error: 'Endpoint tidak ditemukan.' }));

app.use((err, req, res, next) => {
  console.error('[server-error]', err.message);
  if (err instanceof multer.MulterError) return res.status(400).json({ success: false, error: `Upload gagal: ${err.message}` });
  res.status(500).json({ success: false, error: err.message || 'Terjadi kesalahan server.' });
});

app.listen(PORT, () => {
  console.log(`SchoolHub API running at http://localhost:${PORT}`);
});