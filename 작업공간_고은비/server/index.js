const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const SERPAPI_KEY = process.env.SERPAPI_KEY;
if (!SERPAPI_KEY) {
  console.warn('Warning: SERPAPI_KEY not set. /api/search will fail without a key. Set SERPAPI_KEY in server .env');
}

// Simple search proxy using SerpAPI (Google)
app.post('/api/search', async (req, res) => {
  try {
    const { q, num = 5 } = req.body || {};
    if (!q) return res.status(400).json({ error: 'missing query' });
    if (!SERPAPI_KEY) return res.status(500).json({ error: 'SERPAPI_KEY not configured on server' });

    const params = new URLSearchParams({
      engine: 'google',
      q: q,
      api_key: SERPAPI_KEY,
      num: String(num),
      hl: 'ko',
      gl: 'kr'
    });

    const url = `https://serpapi.com/search.json?${params.toString()}`;
    const r = await fetch(url);
    if (!r.ok) {
      const t = await r.text();
      return res.status(r.status).json({ error: t });
    }
    const data = await r.json();
    // extract top organic results
    const raw = (data.organic_results || []).slice(0, num);
    const results = raw.map((it, idx) => {
      const link = it.link || it.url || '';
      let domain = '';
      try { domain = (new URL(link)).hostname.replace('www.', ''); } catch(e) { domain = ''; }
      const snippet = (it.snippet || it.description || '').replace(/\n+/g, ' ').trim();
      return {
        rank: idx + 1,
        title: it.title || it.name || '',
        snippet: snippet.slice(0, 300),
        link,
        domain,
        raw: it
      };
    });

    // also produce a combined snippet text for quick summarization on client
    const combined = results.map(r => `${r.rank}. ${r.title} — ${r.snippet} (${r.domain})`).join('\n');
    return res.json({ results, combined });
  } catch (e) {
    console.error('Search proxy error', e);
    return res.status(500).json({ error: e.message || String(e) });
  }
});

const port = process.env.PORT || 4321;
app.listen(port, () => console.log(`Search proxy listening on ${port}`));
