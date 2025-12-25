import { Router } from 'express';
import { createReview, getReviews } from '../services/reviews.service';

const router = Router();

// GET /api/reviews
router.get('/', async (req, res, next) => {
    try {
        const tenantId = (req.user as any).tenantId;
        const { rating, serviceId } = req.query;

        const reviews = await getReviews(tenantId, {
            rating: rating ? parseInt(rating as string) : undefined,
            serviceId: serviceId as string
        });

        res.json(reviews);
    } catch (error) {
        next(error);
    }
});

// POST /api/reviews
router.post('/', async (req, res, next) => {
    try {
        const userId = (req.user as any).userId; // Authenticated user
        const tenantId = (req.user as any).tenantId;
        const { appointmentId, rating, comment } = req.body;

        const review = await createReview({
            appointmentId,
            rating,
            comment,
            userId,
            tenantId
        });

        res.status(201).json(review);
    } catch (error: any) {
        next(error);
    }
});

export default router;
