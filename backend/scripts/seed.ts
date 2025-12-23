import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding ...');

    const tenantA = await prisma.tenant.upsert({
        where: { id: 'tenant-a' },
        update: {},
        create: {
            id: 'tenant-a',
            name: 'FlowMaster HQ', // Better name
        },
    });
    console.log('Created Tenant A:', tenantA);

    // Create Admin User
    const hashedPassword = await bcrypt.hash('123456', 10);
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@flowmaster.com' },
        update: {
            password: hashedPassword,
            tenantId: tenantA.id
        },
        create: {
            email: 'admin@flowmaster.com',
            name: 'Administrador',
            password: hashedPassword,
            role: 'ADMIN',
            tenantId: tenantA.id,
        },
    });
    console.log('Created Admin User:', adminUser.email);

    const tenantB = await prisma.tenant.upsert({
        where: { id: 'tenant-b' },
        update: {},
        create: {
            id: 'tenant-b',
            name: 'Tenant B',
        },
    });
    console.log('Created Tenant B:', tenantB);

    // Seed for Tenant A
    const service = await prisma.service.create({
        data: {
            name: 'Corte de Cabelo Premium',
            price: 50.00,
            duration: 45,
            tenantId: tenantA.id,
        },
    });
    console.log('Created Service:', service);

    const professional = await prisma.professional.create({
        data: {
            name: 'Ana Pereira',
            tenantId: tenantA.id,
            schedules: {
                create: [
                    { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', tenantId: tenantA.id }, // Seg
                    { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', tenantId: tenantA.id }, // Ter
                    { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', tenantId: tenantA.id }, // Qua
                    { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', tenantId: tenantA.id }, // Qui
                    { dayOfWeek: 5, startTime: '09:00', endTime: '18:00', tenantId: tenantA.id }, // Sex
                ]
            }
        },
    });
    console.log('Created Professional:', professional);

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
