import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Inspecting DB...');

    const user = await prisma.user.findUnique({
        where: { email: 'admin@flowmaster.com' },
        include: { tenant: true }
    });

    if (user) {
        console.log(`Found User: ${user.email}`);
        console.log(`Tenant ID: ${user.tenantId}`);
        console.log(`Tenant Name: ${user.tenant.name}`);

        const services = await prisma.service.findMany({ where: { tenantId: user.tenantId } });
        console.log(`Services for this tenant: ${services.length}`);
    } else {
        console.log('User admin@flowmaster.com not found.');

        // List all users to see who exists
        const allUsers = await prisma.user.findMany({ take: 5 });
        console.log('All users:', allUsers.map(u => ({ email: u.email, tenantId: u.tenantId })));
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
