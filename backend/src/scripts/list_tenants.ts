import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function listTenants() {
    const tenants = await prisma.tenant.findMany({
        include: { config: true }
    });
    console.log('--- LISTA DE TENANTS ---');
    tenants.forEach(t => {
        console.log(`ID: ${t.id} | Nome: ${t.name} | Slug: ${t.slug} | PublicName: ${t.config?.publicName}`);
    });
    console.log('------------------------');
}

listTenants();
