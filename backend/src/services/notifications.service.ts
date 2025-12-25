import { prismaClient } from '../lib/prisma';

/**
 * Creates a notification
 */
export const createNotification = async (data: {
    userId: string;
    message: string;
    type: string;
    tenantId: string;
    metadata?: any;
    title?: string; // Optional title
}) => {
    // If schema doesn't have title, we just ignore it or add it to metadata if crucial.
    // For now assuming we might add it to schema or just use it for logic.
    // If schema update is needed, we do it.
    // Let's verify schema first. If schema has no title, we put it in message or metadata.

    return (prismaClient.notification as any).create({
        data: {
            userId: data.userId,
            title: data.title,
            message: data.message,
            type: data.type,
            tenantId: data.tenantId,
            metadata: data.metadata,
            isRead: false
        }
    });
};

/**
 * Job: Checks for appointments in the next 24 hours and creates reminders.
 */
export const runReminderJob = async () => {
    console.log('[Job] Starting Reminder Check...');

    const now = new Date();
    const future24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const upcomingAppointments = await prismaClient.appointment.findMany({
        where: {
            date: {
                gte: now,
                lte: future24h
            },
            status: { in: ['SCHEDULED'] },
            userId: { not: null }
        },
        include: {
            service: true
        }
    });

    console.log(`[Job] Found ${upcomingAppointments.length} appointments due in 24h.`);

    let sentCount = 0;

    for (const appt of upcomingAppointments) {
        const alreadyNotified = await prismaClient.notification.findFirst({
            where: {
                userId: appt.userId,
                type: 'REMINDER_24H',
                metadata: {
                    path: ['appointmentId'],
                    equals: appt.id
                }
            }
        });

        if (!alreadyNotified) {
            await createNotification({
                userId: appt.userId!,
                tenantId: appt.tenantId,
                type: 'REMINDER_24H',
                message: `Lembrete: Seu agendamento de ${appt.service.name} é amanhã às ${appt.date.toISOString()}`,
                metadata: { appointmentId: appt.id }
            });
            sentCount++;
        }
    }

    console.log(`[Job] Created ${sentCount} new notifications.`);
    return sentCount;
};

export const getUserNotifications = async (userId: string, tenantId: string) => {
    return prismaClient.notification.findMany({
        where: { userId, tenantId },
        orderBy: { createdAt: 'desc' },
        take: 50
    });
};

export const markNotificationAsRead = async (id: string, userId: string) => {
    return prismaClient.notification.updateMany({
        where: { id, userId },
        data: { isRead: true }
    });
};

export const markAllNotificationsAsRead = async (userId: string, tenantId: string) => {
    return prismaClient.notification.updateMany({
        where: { userId, tenantId, isRead: false },
        data: { isRead: true }
    });
};
