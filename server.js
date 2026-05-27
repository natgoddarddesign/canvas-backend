const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = 'natgoddarddesign/canvas-backend';
const GITHUB_FILE = 'canvas.png';
const RAW_URL = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/${GITHUB_FILE}`;
const API_URL = `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE}`;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/api/canvas', async (req, res) => {
  try {
    const r = await fetch(RAW_URL + '?t=' + Date.now());
    if (!r.ok) return res.json({ data: null });
    const buf = await r.arrayBuffer();
    const b64 = Buffer.from(buf).toString('base64');
    res.json({ data: 'data:image/png;base64,' + b64 });
  } catch (e) {
    res.json({ data: null });
  }
});

app.post('/api/canvas', async (req, res) => {
  const { data } = req.body;
  if (!data || !data.startsWith('data:image/png;base64,')) {
    return res.status(400).json({ error: 'Invalid data' });
  }
  const base64 = data.replace('data:image/png;base64,', '');

  try {
    // Get current file SHA (required by GitHub API to update a file)
    let sha;
    const check = await fetch(API_URL, {
      headers: { Authorization: `token ${GITHUB_TOKEN}`, 'User-Agent': 'canvas-backend' }
    });
    if (check.ok) {
      const json = await check.json();
      sha = json.sha;
    }

    const body = {
      message: 'update canvas',
      content: base64,
      ...(sha && { sha })
    };

    const put = await fetch(API_URL, {
      method: 'PUT',
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'canvas-backend'
      },
      body: JSON.stringify(body)
    });

    if (!put.ok) {
      const err = await put.text();
      return res.status(500).json({ error: err });
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/canvas', async (req, res) => {
  try {
    const check = await fetch(API_URL, {
      headers: { Authorization: `token ${GITHUB_TOKEN}`, 'User-Agent': 'canvas-backend' }
    });
    if (!check.ok) return res.json({ ok: true });
    const { sha } = await check.json();
    await fetch(API_URL, {
      method: 'DELETE',
      headers: { Authorization: `token ${GITHUB_TOKEN}`, 'Content-Type': 'application/json', 'User-Agent': 'canvas-backend' },
      body: JSON.stringify({ message: 'clear canvas', sha })
    });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/', (req, res) => res.json({ status: 'canvas api running' }));
app.listen(PORT, () => console.log(`Canvas API running on port ${PORT}`));
