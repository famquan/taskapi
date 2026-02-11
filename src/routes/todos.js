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

// GET /api/todos/:id — Get a single todo by ID
router.get('/:id', (req, res) => {
  const db = getDb();
  const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id);

  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  res.json(todo);
});

// PATCH /api/todos/:id — Update a todo
router.patch('/:id', (req, res) => {
  const db = getDb();
  const { title, description, completed } = req.body;

  // Check if at least one field is provided
  if (title === undefined && description === undefined && completed === undefined) {
    return res.status(400).json({ error: 'No fields provided' });
  }

  // Check if todo exists
  const existing = db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  // Build dynamic update
  const fields = [];
  const values = [];

  if (title !== undefined) {
    fields.push('title = ?');
    values.push(title);
  }
  if (description !== undefined) {
    fields.push('description = ?');
    values.push(description);
  }
  if (completed !== undefined) {
    fields.push('completed = ?');
    values.push(completed ? 1 : 0);
  }

  fields.push("updated_at = datetime('now')");
  values.push(req.params.id);

  db.prepare(`UPDATE todos SET ${fields.join(', ')} WHERE id = ?`).run(...values);

  const updated = db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /api/todos/:id — Delete a todo
router.delete('/:id', (req, res) => {
  const db = getDb();

  const existing = db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  db.prepare('DELETE FROM todos WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

module.exports = router;
