const express = require('express');
const { getDb } = require('../db');

const router = express.Router();

// POST /api/todos — Create a new todo
router.post('/', (req, res) => {
  const { title, description } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({ error: 'title is required' });
  }

  const db = getDb();
  const stmt = db.prepare(
    'INSERT INTO todos (title, description) VALUES (?, ?)'
  );
  const result = stmt.run(title.trim(), description || '');

  const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(result.lastInsertRowid);

  res.status(201).json(todo);
});

// GET /api/todos — List all todos
router.get('/', (req, res) => {
  const db = getDb();
  const { completed } = req.query;

  let todos;
  if (completed === 'true') {
    todos = db.prepare('SELECT * FROM todos WHERE completed = 1 ORDER BY created_at DESC').all();
  } else if (completed === 'false') {
    todos = db.prepare('SELECT * FROM todos WHERE completed = 0 ORDER BY created_at DESC').all();
  } else {
    todos = db.prepare('SELECT * FROM todos ORDER BY created_at DESC').all();
  }

  res.json(todos);
});

module.exports = router;
