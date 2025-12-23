import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // Create a default tenant with the 'exemplo' slug
    const tenant = await prisma.tenant.upsert({
        where: { slug: 'exemplo' },
        update: {},
        create: {
            name: 'Estabelecimento Exemplo',
            slug: 'exemplo',
            config: {
                create: {
                    publicName: 'Studio Beleza Exemplo',
                    themeColor: '#8B5CF6',
                    pixKey: 'pix@exemplo.com.br',
                    agentName: 'Bia',
                    agentGreeting: 'Olá! Sou a Bia, como posso ajudar no Studio Beleza?'
                }
            },
            services: {
                create: [
                    { name: 'Corte Feminino', price: 80, duration: 60, description: 'Corte moderno com finalização.' },
                    { name: 'Coloração', price: 150, duration: 120, description: 'Coloração premium.' }
                ]
            },
            professionals: {
                create: [
                    { name: 'Ana Silva' },
                    { name: 'Carlos Santos' }
                ]
            }
        }
    });

    console.log('Seeding completed sucessfully!');
    console.log('Default tenant created:', tenant.slug);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
