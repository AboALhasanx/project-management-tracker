import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/project/:projectId', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const tasks = db.prepare(`
      SELECT t.*, u.name as assignee_name
      FROM tasks t
      LEFT JOIN users u ON t.assignee_id = u.id
      WHERE t.project_id = ?
      ORDER BY
        CASE t.priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
        t.created_at DESC
    `).all(req.params.projectId);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.post('/', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const { project_id, title, description, priority, assignee_id, due_date } = req.body;
    if (!project_id || !title) return res.status(400).json({ error: 'Project ID and title required' });
    const id = uuidv4();
    db.prepare('INSERT INTO tasks (id, project_id, title, description, priority, assignee_id, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(id, project_id, title, description, priority || 'medium', assignee_id, due_date);
    res.status(201).json(db.prepare('SELECT * FROM tasks WHERE id = ?').get(id));
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

router.put('/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const { title, description, status, priority, assignee_id, due_date } = req.body;
    db.prepare('UPDATE tasks SET title=?, description=?, status=?, priority=?, assignee_id=?, due_date=? WHERE id=?')
      .run(title, description, status, priority, assignee_id, due_date, req.params.id);
    res.json(db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id));
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

router.delete('/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;
