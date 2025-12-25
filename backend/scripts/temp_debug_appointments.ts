
import { prismaClient } from '../src/lib/prisma';

async function run() {
    try {
        const total = await prismaClient.appointment.count();
        console.log(`Total appointments: ${total}`);

        const appointments = await prismaClient.appointment.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
                professional: { select: { name: true } },
                service: { select: { name: true } },
                user: { select: { name: true, email: true } },
                tenant: { select: { name: true, slug: true } }
            }
        });

        console.log('--- RECENT APPOINTMENTS ---');
        appointments.forEach(appt => {
            console.log({
                id: appt.id,
                createdAt: appt.createdAt.toISOString(),
                dateOfAppointment: appt.date.toISOString(),
                status: appt.status,
                tenant: appt.tenant.slug,
                professional: appt.professional?.name,
                service: appt.service?.name,
                user: appt.user?.name || 'Guest'
            });
        });
        console.log('---------------------------');
    } catch (error) {
        console.error(error);
    } finally {
        await prismaClient.$disconnect();
    }
}

run();
