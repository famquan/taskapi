const express = require('express');
const { getDb } = require('./db');
const todosRouter = require('./routes/todos');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3100;

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Todo routes
app.use('/api/todos', todosRouter);

app.listen(PORT, () => {
  console.log(`TaskAPI running on http://localhost:${PORT}`);
});

module.exports = app;
