import { prismaClient, getTenantClient } from '../lib/prisma';

async function verifyIsolation() {
    console.log('🧪 Iniciando Verificação de Isolamento Multi-Tenant...');

    try {
        // 1. Criar dados de teste (Acesso Global/Sudo)
        const tenantA = await prismaClient.tenant.upsert({
            where: { slug: 'test-tenant-a' },
            update: {},
            create: { name: 'Tenant A', slug: 'test-tenant-a' }
        });

        const tenantB = await prismaClient.tenant.upsert({
            where: { slug: 'test-tenant-b' },
            update: {},
            create: { name: 'Tenant B', slug: 'test-tenant-b' }
        });

        // 2. Criar um recurso para o Tenant A
        const proA = await prismaClient.professional.create({
            data: {
                name: 'Profissional do A',
                tenantId: tenantA.id
            }
        });
        console.log(`✅ Criado Profissional A (${proA.id}) no Tenant A`);

        // 3. Tentar acessar o Profissional A usando o Cliente do Tenant B
        console.log('🛡️ Testando Escudo: Tentativa de acesso do Tenant B ao recurso do Tenant A...');
        const shieldedClientB = getTenantClient(tenantB.id);

        const foundPro = await shieldedClientB.professional.findUnique({
            where: { id: proA.id }
        });

        if (foundPro) {
            console.error('❌ FALHA DE SEGURANÇA: Tenant B conseguiu visualizar dados do Tenant A!');
            process.exit(1);
        } else {
            console.log('✅ SUCESSO: Tenant B NÃO conseguiu ver dados do Tenant A.');
        }

        // 4. Tentar atualizar o Profissional A usando o Cliente do Tenant B
        try {
            await shieldedClientB.professional.update({
                where: { id: proA.id },
                data: { name: 'HACKED' }
            });
            console.error('❌ FALHA DE SEGURANÇA: Tenant B conseguiu atualizar dados do Tenant A!');
            process.exit(1);
        } catch (e) {
            console.log('✅ SUCESSO: Tenant B NÃO conseguiu atualizar dados do Tenant A (Erro esperado).');
        }

        // 5. Verificar que o Tenant A ainda vê seus próprios dados
        const shieldedClientA = getTenantClient(tenantA.id);
        const refetchPro = await shieldedClientA.professional.findUnique({
            where: { id: proA.id }
        });

        if (refetchPro && refetchPro.name === 'Profissional do A') {
            console.log('✅ SUCESSO: Tenant A vê seus próprios dados corretamente.');
        } else {
            console.error('❌ ERRO: Tenant A perdeu acesso aos seus próprios dados ou os dados foram corrompidos.');
            process.exit(1);
        }

        console.log('\n✨ VERIFICAÇÃO CONCLUÍDA: O Escudo Multi-Tenant está 100% operacional!');

        // Limpeza opcional
        // await prismaClient.professional.delete({ where: { id: proA.id } });

    } catch (error) {
        console.error('💥 ERRO DURANTE A VERIFICAÇÃO:', error);
        process.exit(1);
    }
}

verifyIsolation();
