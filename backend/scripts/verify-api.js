const http = require('http');

const data = JSON.stringify({
    organizationName: 'Verifier Corp ' + Date.now(),
    name: 'Verifier User',
    email: `verify_${Date.now()}@test.com`,
    password: 'password123'
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/register-saas',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('Testing Registration Route:', options.path);

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);

    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log('RESPONSE:', body);
        if (res.statusCode === 201) {
            console.log('✅ TEST PASSED: Registration Successful');
        } else {
            console.log('❌ TEST FAILED: Status', res.statusCode);
        }
    });
});

req.on('error', (e) => {
    console.error(`❌ CONNECTION ERROR: ${e.message}`);
});

req.write(data);
req.end();
