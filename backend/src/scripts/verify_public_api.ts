import axios from 'axios';

const API_URL = 'http://localhost:3000/api/public/establishment';

async function verifyPublicAPI() {
    const slugs = ['exemplo', 'teste'];

    console.log('--- TESTANDO ISOLAMENTO PÚBLICO ---');

    for (const slug of slugs) {
        try {
            console.log(`Buscando dados para: ${slug}...`);
            const response = await axios.get(`${API_URL}/${slug}`);
            console.log(`Slug retornado: ${response.data.slug}`);
            console.log(`Nome Público: ${response.data.publicName || response.data.name}`);
            console.log('------------------------');
        } catch (error: any) {
            console.error(`Erro ao buscar ${slug}:`, error.message);
        }
    }
}

verifyPublicAPI();
