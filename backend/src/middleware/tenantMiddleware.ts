/// <reference path="../types/express.d.ts" />
import { Request, Response, NextFunction } from 'express';
import { getTenantClient } from '../lib/prisma';

// Extend Express Request interface
declare global {
    namespace Express {
        interface Request {
            tenantId?: string;
            prisma?: any; // Typed as the extended client
        }
    }
}

export const ensureTenantContext = (req: Request, res: Response, next: NextFunction) => {
    // 0. Allow Preflight OPTIONS
    if (req.method === 'OPTIONS') {
        return next();
    }

    // 1. Extract tenantId from the authenticated user (attached by authenticateJWT)
    const tenantId = (req as any).user?.tenantId;

    if (!tenantId) {
        return res.status(401).json({ error: 'Unauthorized: No tenant context found' });
    }

    // 2. Attach to request (redundant if we use req.user.tenantId, but keeps compatibility)
    req.tenantId = tenantId;

    // 3. Attach the Shielded Prisma Client
    req.prisma = getTenantClient(tenantId);

    next();
};
