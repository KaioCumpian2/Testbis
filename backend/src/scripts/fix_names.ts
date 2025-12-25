import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fixNames() {
    const tenants = await prisma.tenant.findMany({
        include: { config: true }
    });

    for (const t of tenants) {
        if (t.config && t.config.publicName === 'Service Hub') {
            console.log(`Fixing tenant: ${t.name}`);
            await prisma.tenantConfig.update({
                where: { tenantId: t.id },
                data: { publicName: t.name }
            });
        }
    }
    console.log('Done fixing names.');
}

fixNames();
