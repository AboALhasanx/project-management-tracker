import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const projects = db.prepare(`
      SELECT p.*, u.name as owner_name,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'done') as completed_tasks
      FROM projects p
      LEFT JOIN users u ON p.owner_id = u.id
      WHERE p.owner_id = ?
      ORDER BY p.created_at DESC
    `).all(req.userId);
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.post('/', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Project name is required' });
    const id = uuidv4();
    db.prepare('INSERT INTO projects (id, name, description, owner_id) VALUES (?, ?, ?, ?)').run(id, name, description, req.userId);
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

router.get('/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const project = db.prepare('SELECT * FROM projects WHERE id = ? AND owner_id = ?').get(req.params.id, req.userId);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const tasks = db.prepare('SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC').all(req.params.id);
    const milestones = db.prepare('SELECT * FROM milestones WHERE project_id = ? ORDER BY due_date').all(req.params.id);
    res.json({ ...project as object, tasks, milestones });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

router.put('/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const { name, description, status } = req.body;
    db.prepare('UPDATE projects SET name = ?, description = ?, status = ? WHERE id = ? AND owner_id = ?')
      .run(name, description, status, req.params.id, req.userId);
    res.json(db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id));
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

router.delete('/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    db.prepare('DELETE FROM projects WHERE id = ? AND owner_id = ?').run(req.params.id, req.userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;
