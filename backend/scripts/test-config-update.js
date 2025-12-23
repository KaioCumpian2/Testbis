const http = require('http');

// IMPORTANTE: Substitua este token pelo seu token real do localStorage
const TOKEN = 'SEU_TOKEN_AQUI';

const data = JSON.stringify({
    publicName: 'Teste Config',
    themeColor: '#8B5CF6',
    pixKey: 'teste@pix.com'
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/config',
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'Authorization': `Bearer ${TOKEN}`
    }
};

console.log('Testando PUT /api/config...');
console.log('Token:', TOKEN.substring(0, 20) + '...');

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);

    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log('RESPONSE:', body);
        if (res.statusCode === 200) {
            console.log('✅ SUCESSO: Config atualizada!');
        } else {
            console.log('❌ ERRO: Status', res.statusCode);
        }
    });
});

req.on('error', (e) => {
    console.error(`❌ ERRO DE CONEXÃO: ${e.message}`);
});

req.write(data);
req.end();
