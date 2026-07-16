const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Simple in-memory posts store for generated items
const postsStore = [];
let postIdCounter = 1000;

// Note: external search via SerpAPI has been disabled in this server build.
// If needed later, re-enable and provide SERPAPI_KEY in server .env.

// Simple posts endpoint to accept generated items and return created item with id
app.post('/posts', (req, res) => {
  try {
    const body = req.body || {};
    const item = {
      ...body,
      id: postIdCounter++,
      createdAt: body.createdAt || new Date().toISOString().slice(0,10)
    };
    postsStore.push(item);
    return res.status(201).json(item);
  } catch (e) {
    console.error('POST /posts error', e);
    return res.status(500).json({ error: e.message || String(e) });
  }
});

const port = process.env.PORT || 4321;
app.listen(port, () => console.log(`Server listening on ${port}`));
