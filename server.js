const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const CANVAS_FILE = path.join(__dirname, 'canvas.png');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// GET /api/canvas — return the current canvas as a PNG data URL
app.get('/api/canvas', (req, res) => {
  if (!fs.existsSync(CANVAS_FILE)) {
    return res.json({ data: null });
  }
  const data = fs.readFileSync(CANVAS_FILE, 'base64');
  res.json({ data: 'data:image/png;base64,' + data });
});

// POST /api/canvas — accept base64 data URL, store as PNG
app.post('/api/canvas', (req, res) => {
  const { data } = req.body;
  if (!data || !data.startsWith('data:image/png;base64,')) {
    return res.status(400).json({ error: 'Invalid data' });
  }
  const base64 = data.replace('data:image/png;base64,', '');
  fs.writeFileSync(CANVAS_FILE, Buffer.from(base64, 'base64'));
  res.json({ ok: true });
});

app.get('/', (req, res) => res.json({ status: 'canvas api running' }));

app.listen(PORT, () => console.log(`Canvas API running on port ${PORT}`));
