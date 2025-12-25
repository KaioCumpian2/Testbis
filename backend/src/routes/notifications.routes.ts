import { Router } from 'express';
import { runReminderJob, getUserNotifications, markAllNotificationsAsRead } from '../services/notifications.service';

const router = Router();

// GET /api/notifications
router.get('/', async (req, res, next) => {
    try {
        const userId = (req.user as any).userId;
        const tenantId = (req.user as any).tenantId;
        const notifications = await getUserNotifications(userId, tenantId);
        res.json(notifications);
    } catch (error: any) {
        next(error);
    }
});

// PUT /api/notifications/read-all
router.put('/read-all', async (req, res, next) => {
    try {
        const userId = (req.user as any).userId;
        const tenantId = (req.user as any).tenantId;
        await markAllNotificationsAsRead(userId, tenantId);
        res.json({ message: 'All notifications marked as read' });
    } catch (error: any) {
        next(error);
    }
});

// POST /api/notifications/run-job
router.post('/run-job', async (req, res, next) => {
    try {
        const count = await runReminderJob();
        res.json({ message: 'Job executed', notificationsCreated: count });
    } catch (errorBy: any) {
        next(errorBy);
    }
});

export default router;
