import { Router, Request, Response } from 'express';
import { WorkflowService } from '../services/workflowService';

const router = Router();

/**
 * GET /api/notifications
 * Lists in-app system notifications
 */
router.get('/notifications', (_req: Request, res: Response) => {
  const notifications = WorkflowService.listNotifications();
  res.json({
    success: true,
    count: notifications.length,
    notifications,
  });
});

/**
 * PATCH /api/notifications/:id/read
 * Mark notification as read
 */
router.patch('/notifications/:id/read', (req: Request, res: Response) => {
  WorkflowService.markNotificationRead(String(req.params.id));
  res.json({
    success: true,
    message: 'Notification marked as read',
  });
});

export default router;
