
import { prismaClient } from '../src/lib/prisma';

async function run() {
    try {
        const email = 'kaiocumpian30@gmail.com';
        const user = await prismaClient.user.findUnique({
            where: { email },
            include: { tenant: true }
        });

        if (user) {
            console.log('--- USER INFO ---');
            console.log(`Name: ${user.name}`);
            console.log(`Email: ${user.email}`);
            console.log(`Role: ${user.role}`);
            console.log(`Tenant Name: ${user.tenant.name}`);
            console.log(`Tenant Slug: ${user.tenant.slug}`);
            console.log(`Tenant ID: ${user.tenantId}`);
            console.log('-----------------');
        } else {
            console.log(`User ${email} not found.`);
        }

        // Also list all users to see if there are other admins
        const admins = await prismaClient.user.findMany({
            where: { role: 'ADMIN' },
            include: { tenant: true }
        });
        console.log('--- ALL ADMINS ---');
        console.table(admins.map(a => ({ name: a.name, email: a.email, tenant: a.tenant.slug })));
        console.log('------------------');

    } catch (error) {
        console.error(error);
    } finally {
        await prismaClient.$disconnect();
    }
}

run();
