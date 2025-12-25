import { Router } from 'express';
import { prismaClient } from '../lib/prisma';

import { getServices } from '../services/services.service';
import { getAvailableSlots } from '../services/availability.service';
import { getFullEstablishmentConfig } from '../services/config.service';

const router = Router();

// GET /api/config/payment (Public)
// Requires ?tenantId=... query param since we don't have auth token
router.get('/config/payment', async (req, res, next) => {
    try {
        const { tenantId } = req.query;

        if (!tenantId || typeof tenantId !== 'string') {
            return res.status(400).json({ error: 'tenantId query parameter is required for public access' });
        }

        const config = await prismaClient.tenantConfig.findUnique({
            where: { tenantId }
        });

        if (!config) {
            return res.status(404).json({ error: 'Tenant configuration not found' });
        }

        // Return only safe public info
        res.json({
            pixKey: config.pixKey,
            logoUrl: config.logoUrl,
            publicName: config.publicName,
            themeColor: config.themeColor
        });
    } catch (error: any) {
        next(error);
    }
});

// GET /api/public/establishment/:slug
router.get('/public/establishment/:slug', async (req, res, next) => {
    try {
        const { slug } = req.params;
        const tenant = await prismaClient.tenant.findUnique({
            where: { slug }
        });

        if (!tenant) {
            return res.status(404).json({ error: 'Establishment not found' });
        }

        const config = await getFullEstablishmentConfig(tenant.id);
        res.json(config);
    } catch (error: any) {
        next(error);
    }
});

// GET /api/public/services
router.get('/public/services', async (req, res, next) => {
    try {
        const { tenantId } = req.query;
        if (!tenantId || typeof tenantId !== 'string') {
            return res.status(400).json({ error: 'tenantId query parameter is required' });
        }

        const services = await getServices(tenantId);
        res.json(services);
    } catch (error: any) {
        next(error);
    }
});

// GET /api/public/availability
router.get('/public/availability', async (req, res, next) => {
    try {
        const { tenantId, professionalId, date } = req.query;

        if (!tenantId || typeof tenantId !== 'string') {
            return res.status(400).json({ error: 'tenantId is required' });
        }
        if (!professionalId || typeof professionalId !== 'string') {
            return res.status(400).json({ error: 'professionalId is required' });
        }
        if (!date || typeof date !== 'string') {
            return res.status(400).json({ error: 'date is required' });
        }

        const slots = await getAvailableSlots(professionalId, date, tenantId);
        res.json(slots);
    } catch (error: any) {
        next(error);
    }
});

// GET /api/public/professionals
router.get('/public/professionals', async (req, res, next) => {
    try {
        const { tenantId } = req.query;
        if (!tenantId || typeof tenantId !== 'string') {
            return res.status(400).json({ error: 'tenantId query parameter is required' });
        }

        const professionals = await prismaClient.professional.findMany({
            where: { tenantId }
        });
        res.json(professionals);
    } catch (error: any) {
        next(error);
    }
});

// POST /public/appointments
router.post('/public/appointments', async (req, res, next) => {
    try {
        const { tenantId, serviceId, professionalId, date, time, clientName, clientPhone } = req.body;

        if (!tenantId || !serviceId || !professionalId || !date || !time || !clientName || !clientPhone) {
            console.error('[ERROR] Missing fields in public appointment:', {
                tenantId: !!tenantId,
                serviceId: !!serviceId,
                professionalId: !!professionalId,
                date: !!date,
                time: !!time,
                clientName: !!clientName,
                clientPhone: !!clientPhone
            });
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Merge date and time into a single DateTime
        const appointmentDate = new Date(`${date}T${time}:00`);

        // Verify availability (Simple check)
        // Note: We need to check exact DateTime match since we don't have separate time field
        const existingApp = await prismaClient.appointment.findFirst({
            where: {
                tenantId,
                professionalId,
                date: appointmentDate,
                status: { not: 'CANCELLED' }
            }
        });

        if (existingApp) {
            return res.status(409).json({ error: 'Horário indisponivel' });
        }

        // Validate tenantId
        if (!tenantId) {
            console.error('[ERROR] tenantId is missing in public appointment creation');
            return res.status(400).json({ error: 'tenantId is required' });
        }

        // 1. Create Guest User (Simulated)
        const fakeEmail = `guest_${Date.now()}_${Math.floor(Math.random() * 1000)}@flowmaster.io`;
        console.log('[DEBUG] Creating guest user with tenantId:', tenantId);

        const user = await prismaClient.user.create({
            data: {
                name: clientName,
                email: fakeEmail,
                password: 'guest_password_123', // Dummy password
                role: 'USER',
                tenantId
            }
        });

        // 2. Create Appointment with User Link (User ID only)
        const appointment = await prismaClient.appointment.create({
            data: {
                tenantId,
                serviceId,
                professionalId,
                date: appointmentDate,
                userId: user.id, // We store the User ID
                status: 'SCHEDULED',
                paymentStatus: 'PENDING_APPROVAL'
            },
            include: {
                service: true,
                professional: true
            }
        });

        // Return appointment combined with user info so frontend can display it immediately
        res.status(201).json({ ...appointment, user });
    } catch (error: any) {
        next(error);
    }
});

// POST /public/reviews
router.post('/public/reviews', async (req, res, next) => {
    try {
        const { tenantId, appointmentId, serviceId, professionalId, rating, comment } = req.body;

        if (!tenantId || !appointmentId || !serviceId || !professionalId || !rating) {
            return res.status(400).json({ error: 'Missing required fields for review' });
        }

        // Verify if appointment exists and is completed (optional, or just link it)
        // For public simulation, we might relax "COMPLETED" check if we just created it.

        const review = await prismaClient.review.create({
            data: {
                tenantId,
                appointmentId,
                serviceId,
                professionalId,
                rating,
                comment,
                // userId is optional in schema? Yes `userId String?`
            }
        });

        res.status(201).json(review);
    } catch (error: any) {
        // If appointment already has review, it will throw UniqueConstraint violation
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Review already exists for this appointment' });
        }
        next(error);
    }
});

export default router;
