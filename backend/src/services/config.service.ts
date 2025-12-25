import { prismaClient } from '../lib/prisma';

export const getTenantConfig = async (tenantId: string) => {
    let config = await prismaClient.tenantConfig.findUnique({
        where: { tenantId }
    });

    if (!config) {
        // Auto-create default config if not exists
        config = await prismaClient.tenantConfig.create({
            data: { tenantId }
        });
    }

    return config;
};

export const updateTenantConfig = async (tenantId: string, data: any) => {
    // Ensure exists
    await getTenantConfig(tenantId);

    const { publicName, themeColor, logoUrl, pixKey, portfolioImages, availableSlots } = data;

    return prismaClient.$transaction(async (tx) => {
        // 1. Update Basic Config
        await tx.tenantConfig.update({
            where: { tenantId },
            data: {
                publicName,
                themeColor,
                logoUrl,
                pixKey
            }
        });

        // 2. Sync Portfolio if provided
        if (portfolioImages && Array.isArray(portfolioImages)) {
            await tx.portfolioImage.deleteMany({ where: { tenantId } });
            if (portfolioImages.length > 0) {
                await tx.portfolioImage.createMany({
                    data: portfolioImages.map((img: any) => ({
                        url: img.url,
                        title: img.title || '',
                        isActive: img.isActive !== false,
                        tenantId
                    }))
                });
            }
        }

        // 3. Sync Available Slots if provided
        if (availableSlots && Array.isArray(availableSlots)) {
            await tx.establishmentSlot.deleteMany({ where: { tenantId } });
            if (availableSlots.length > 0) {
                await tx.establishmentSlot.createMany({
                    data: availableSlots.map((slot: any) => ({
                        time: typeof slot === 'string' ? slot : slot.time,
                        isActive: slot.isActive !== false,
                        tenantId
                    }))
                });
            }
        }

        // Return full updated state
        const portfolio = await tx.portfolioImage.findMany({ where: { tenantId } });
        const slots = await tx.establishmentSlot.findMany({
            where: { tenantId },
            orderBy: { time: 'asc' }
        });
        const config = await tx.tenantConfig.findUnique({ where: { tenantId } });
        const tenant = await tx.tenant.findUnique({ where: { id: tenantId } });

        return {
            ...config,
            id: tenantId, // Explicitly return the REAL Tenant ID
            tenantId,
            name: tenant?.name,
            slug: tenant?.slug,
            portfolioImages: portfolio,
            availableSlots: slots
        };
    });
};

export const getFullEstablishmentConfig = async (tenantId: string) => {
    const tenant = await prismaClient.tenant.findUnique({
        where: { id: tenantId },
        include: {
            config: true,
            portfolioImages: true,
            availableSlots: {
                orderBy: { time: 'asc' }
            }
        }
    });

    if (!tenant) throw new Error('Tenant not found');

    return {
        ...tenant.config,
        id: tenant.id, // Explicitly return the REAL Tenant ID
        tenantId: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        portfolioImages: tenant.portfolioImages,
        availableSlots: tenant.availableSlots
    };
};
