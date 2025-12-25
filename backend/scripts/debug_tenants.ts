
import { prismaClient } from '../src/lib/prisma';

async function run() {
    try {
        const tenants = await prismaClient.tenant.findMany();
        console.log('--- TENANTS ---');
        console.table(tenants.map(t => ({ id: t.id, name: t.name, slug: t.slug })));
        console.log('---------------------------');
    } catch (error) {
        console.error(error);
    } finally {
        await prismaClient.$disconnect();
    }
}

run();
