import { Router } from 'express';
import { registerUser, loginUser, generateServiceToken } from '../services/auth.service';

const router = Router();

router.post('/register', async (req, res, next) => {
    try {
        const user = await registerUser(req.body);
        res.status(201).json(user);
    } catch (error: any) {
        next(error);
    }
});

router.post('/register-saas', async (req, res, next) => {
    try {
        const { organizationName, name, email, password } = req.body;
        if (!organizationName || !name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        // Import dynamically if needed to avoid circular deps, or just use the imported service
        const { registerTenantAndAdmin } = await import('../services/auth.service');
        const result = await registerTenantAndAdmin(req.body);
        res.status(201).json(result);
    } catch (error: any) {
        next(error);
    }
});

router.post('/login', async (req, res, next) => {
    try {
        const result = await loginUser(req.body);
        res.json(result);
    } catch (error: any) {
        next(error);
        next(error);
    }
});

router.post('/service-token', async (req, res, next) => {
    try {
        const { apiKey, tenantId } = req.body;
        if (!apiKey || !tenantId) {
            return res.status(400).json({ error: 'apiKey and tenantId are required' });
        }
        const result = await generateServiceToken(apiKey, tenantId);
        res.json(result);
    } catch (error: any) {
        if (error.message === 'Invalid API Key') {
            return res.status(401).json({ error: 'Invalid API Key' });
        }
        next(error);
    }
});

export default router;
