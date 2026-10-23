import { Router, Request, Response, NextFunction } from 'express';
import { SupabaseService } from '../services/supabaseService';
import { WorkflowService } from '../services/workflowService';
import { WeatherService } from '../services/weatherService';
import { IncidentStatus } from '../../src/types';

const router = Router();

/**
 * GET /api/incidents
 * List incidents with optional filtering
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await SupabaseService.listIncidents(100);
    const { category, urgency, status, search } = req.query;

    let filtered = list;

    if (category && category !== 'all') {
      filtered = filtered.filter((i) => i.category === category);
    }
    if (urgency && urgency !== 'all') {
      filtered = filtered.filter((i) => i.urgency === urgency);
    }
    if (status && status !== 'all') {
      filtered = filtered.filter((i) => i.status === status);
    }
    if (search && typeof search === 'string' && search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.summary.toLowerCase().includes(q) ||
          i.reportedLocation.address.toLowerCase().includes(q) ||
          i.id.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      count: filtered.length,
      incidents: filtered,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/incidents/:id
 * Retrieve single incident
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const incident = await SupabaseService.getIncidentById(id);
    if (!incident) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Incident ${id} does not exist.`,
      });
    }

    res.json({
      success: true,
      incident,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/incidents/:id
 * Update incident status or operator notes
 */
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const { status, operatorNote, actor = 'Console Operator' } = req.body;

    let updated = null;

    if (status) {
      updated = await SupabaseService.updateIncidentStatus(
        id,
        status as IncidentStatus,
        actor,
        `Status updated via API to ${status}`
      );
    }

    if (operatorNote && typeof operatorNote === 'string' && operatorNote.trim()) {
      updated = await SupabaseService.addOperatorNote(id, operatorNote.trim(), actor);
    }

    if (!updated) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Incident ${id} could not be updated.`,
      });
    }

    res.json({
      success: true,
      incident: updated,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/incidents/:id/activity
 * Retrieve audit activity timeline
 */
router.get('/:id/activity', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const incident = await SupabaseService.getIncidentById(id);
    if (!incident) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Incident ${id} does not exist.`,
      });
    }

    res.json({
      success: true,
      incidentId: incident.id,
      timeline: incident.auditTimeline,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/incidents/:id/tasks
 * Add an actionable task to the incident checklist
 */
router.post('/:id/tasks', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const { title, description, priority, assignedTo, dueDate, actor = 'Console Operator' } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Missing title', message: 'Task title is required.' });
    }

    const task = await WorkflowService.addTask(
      id,
      { title, description, priority, assignedTo, dueDate },
      actor
    );

    res.status(201).json({
      success: true,
      task,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/incidents/:id/tasks/:taskId
 * Update task status or assignment
 */
router.patch('/:id/tasks/:taskId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const taskId = String(req.params.taskId);
    const { status, assignedTo, dueDate, actor = 'Console Operator' } = req.body;

    const task = await WorkflowService.updateTask(
      id,
      taskId,
      { status, assignedTo, dueDate },
      actor
    );

    res.json({
      success: true,
      task,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/incidents/:id/referral
 * Generate and record an official referral docket to an emergency or civic authority
 */
router.post('/:id/referral', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const { serviceId, actor = 'Console Operator' } = req.body;

    const referral = await WorkflowService.createReferral(id, serviceId, actor);

    res.status(201).json({
      success: true,
      referral,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/incidents/:id/escalate
 * Trigger immediate operational escalation
 */
router.post('/:id/escalate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const { reason = 'Emergency protocol triggered by operator', actor = 'Console Operator' } = req.body;

    const incident = await WorkflowService.escalateIncident(id, reason, actor);

    res.json({
      success: true,
      incident,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/incidents/:id/reminders
 * Schedule a follow-up or reminder
 */
router.post('/:id/reminders', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const { title, scheduledFor, channel, recipient } = req.body;

    if (!title || !scheduledFor) {
      return res.status(400).json({ error: 'Missing fields', message: 'Title and scheduledFor are required.' });
    }

    const reminder = await WorkflowService.scheduleReminder(id, {
      title,
      scheduledFor,
      channel,
      recipient,
    });

    res.status(201).json({
      success: true,
      reminder,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/incidents/:id/weather/refresh
 * Fetches and links live Open-Meteo weather data to this incident
 */
router.post('/:id/weather/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const incident = await SupabaseService.getIncidentById(id);
    if (!incident) {
      return res.status(404).json({ error: 'Not Found', message: `Incident ${id} does not exist.` });
    }

    let weather;
    if (incident.reportedLocation.coordinates) {
      weather = await WeatherService.getWeatherForCoordinates(
        incident.reportedLocation.coordinates.latitude,
        incident.reportedLocation.coordinates.longitude,
        incident.reportedLocation.address
      );
    } else {
      weather = await WeatherService.getWeatherForLocationText(
        incident.reportedLocation.address || 'Bengaluru'
      );
    }

    incident.weather = weather;
    incident.updatedAt = new Date().toISOString();
    await SupabaseService.saveIncident(incident);

    res.json({
      success: true,
      weather,
      incident,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/incidents/reset-demo
 * Reset demo storage back to initial realistic benchmark records
 */
router.post('/reset-demo', async (_req: Request, res: Response) => {
  SupabaseService.resetLocalStore();
  res.json({
    success: true,
    message: 'Demo store reset to baseline realistic scenarios.',
  });
});

export default router;
