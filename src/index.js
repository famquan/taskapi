const express = require('express');
const { getDb } = require('./db');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3100;

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// TODO: Add todo CRUD routes here
// Routes will be added by agents via feature branches

app.listen(PORT, () => {
  console.log(`TaskAPI running on http://localhost:${PORT}`);
});

module.exports = app;
