import bcrypt from 'bcrypt';
import { prismaClient } from '../lib/prisma';
import { generateToken } from './jwt.service';

const SALT_ROUNDS = 10;

export const registerUser = async (data: any) => {
    const { email, password, name, tenantId } = data;

    // Check if user exists in the tenant
    // Note: We need to ensure tenant exists first, but for now we assume tenantId is valid or checked elsewhere
    const existingUser = await prismaClient.user.findFirst({
        where: {
            email,
            tenantId // Email must be unique per tenant (or globally, depending on requirements. Schema says unique globally currently)
        }
    });

    // Schema has @unique on email, so it's globally unique.
    // If we want per-tenant uniqueness, we'd need to change schema.
    // For now, let's respect the current schema which enforces global uniqueness.
    const globalUser = await prismaClient.user.findUnique({
        where: { email }
    });

    if (globalUser) {
        throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prismaClient.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
            tenantId
        }
    });

    // Generate token immediately? Or just return user?
    // Usually register -> login, but we can return token too.
    // Let's just return user for now.
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

export const registerTenantAndAdmin = async (data: any) => {
    const { organizationName, name, email, password } = data;

    // Generate slug from organization name
    const slug = organizationName
        .toLowerCase()
        .normalize('NFD') // decompose accents
        .replace(/[\u0300-\u036f]/g, '') // remove accents
        .replace(/[^a-z0-9]+/g, '-') // non-alphanumeric to dash
        .replace(/^-+|-+$/g, ''); // remove leading/trailing dashes

    // Check if slug exists
    const existingTenant = await prismaClient.tenant.findUnique({
        where: { slug }
    });

    if (existingTenant) {
        throw new Error('Organization name already taken (slug exists)');
    }

    // Check if user email exists (globally)
    const existingUser = await prismaClient.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        throw new Error('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Transaction to create Tenant + Config + User
    const result = await prismaClient.$transaction(async (tx) => {
        // 1. Create Tenant
        const tenant = await tx.tenant.create({
            data: {
                name: organizationName,
                slug,
                // plan: 'FREE' // Schema doesn't support plan yet
            }
        });

        // 2. Create Default Config
        await tx.tenantConfig.create({
            data: {
                tenantId: tenant.id,
                publicName: organizationName,
                themeColor: '#8b5cf6', // Violet
            }
        });

        // 3. Create Admin User
        const user = await tx.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                tenantId: tenant.id,
                role: 'ADMIN'
            }
        });

        // 4. Create Default Professional (The Admin themselves)
        const professional = await tx.professional.create({
            data: {
                name: name,
                // bio field removed as it doesn't exist in schema yet
                tenantId: tenant.id
                // userId removed as it doesn't exist in schema yet
            }
        });

        // 5. Create Default Service
        await tx.service.create({
            data: {
                name: 'Consultoria / Avaliação',
                description: 'Serviço inicial de avaliação',
                price: 0.00,
                duration: 30,
                tenantId: tenant.id
            }
        });

        return { tenant, user };
    });

    // Generate token
    const token = generateToken({
        userId: result.user.id,
        tenantId: result.tenant.id,
        email: result.user.email,
        role: result.user.role
    });

    const { password: _, ...userWithoutPassword } = result.user;

    return {
        user: userWithoutPassword,
        tenant: result.tenant,
        token
    };
};

export const loginUser = async (data: any) => {
    const { email, password } = data;

    const user = await prismaClient.user.findUnique({
        where: { email }
    });

    if (!user) {
        throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new Error('Invalid credentials');
    }

    const token = generateToken({
        userId: user.id,
        tenantId: user.tenantId,
        email: user.email
    });

    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
};

export const generateServiceToken = async (apiKey: string, tenantId: string) => {
    // Ideally this comes from process.env.AI_AGENT_KEY, but for now we enforce it here if env is not readable or set
    const VALID_API_KEY = process.env.AI_AGENT_KEY || 'ai-agent-secret-key-123';

    if (apiKey !== VALID_API_KEY) {
        throw new Error('Invalid API Key');
    }

    // Generate a long-lived token
    const token = generateToken({
        userId: 'service-agent',
        tenantId,
        email: 'ai-agent@system.local',
        role: 'ADMIN' // Agent needs admin privileges to manage appointments
    });

    return { token };
};
