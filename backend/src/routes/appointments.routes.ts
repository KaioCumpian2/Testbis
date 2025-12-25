import { Router } from 'express';
import * as appointmentService from '../services/appointments.service';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', async (req, res, next) => {
    try {
        const userId = (req.user as any).userId || (req.user as any).id; // Handle both potential payload keys safely
        const data = { ...req.body, userId };
        const appointment = await appointmentService.createAppointment(data, req.user!.tenantId);
        res.status(201).json(appointment);
    } catch (error: any) {
        next(error);
    }
});

router.get('/', async (req, res, next) => {
    try {
        const { date, status, paymentStatus } = req.query as { date?: string, status?: string, paymentStatus?: string };
        const userId = (req.user as any).userId || (req.user as any).id;
        const role = (req.user as any).role;

        const filters: any = { date, status, paymentStatus };

        // If it's a client, only show their own appointments
        if (role === 'CLIENT') {
            filters.userId = userId;
        }

        const appointments = await appointmentService.getAppointments(req.user!.tenantId, filters);
        res.json(appointments);
    } catch (error: any) {
        next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const appointment = await appointmentService.getAppointmentById(req.params.id, req.user!.tenantId);
        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }
        res.json(appointment);
    } catch (error: any) {
        next(error);
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        const appointment = await appointmentService.updateAppointment(req.params.id, req.body, req.user!.tenantId);
        res.json(appointment);
    } catch (error: any) {
        next(error);
    }
});

// POST /:id/approve-payment (Sprint 9)
router.post('/:id/approve-payment', async (req, res, next) => {
    try {
        const appointment = await appointmentService.approvePayment(req.params.id, req.user!.tenantId);
        res.json(appointment);
    } catch (error: any) {
        next(error);
    }
});

// POST /:id/reject-payment (Sprint 9)
router.post('/:id/reject-payment', async (req, res, next) => {
    try {
        const appointment = await appointmentService.rejectPayment(req.params.id, req.user!.tenantId);
        res.json(appointment);
    } catch (error: any) {
        next(error);
    }
});

// POST /:id/payment-proof (Client)
router.post('/:id/payment-proof', upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'File is required' });
        }

        const dataURL = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        const updated = await appointmentService.uploadPaymentProof(req.params.id, req.user!.tenantId, dataURL);

        res.json(updated);
    } catch (error: any) {
        next(error);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        await appointmentService.deleteAppointment(req.params.id, req.user!.tenantId);
        res.status(204).send();
    } catch (error: any) {
        next(error);
    }
});

export default router;
