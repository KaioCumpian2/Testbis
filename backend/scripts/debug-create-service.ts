import axios from 'axios';

async function main() {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'admin@flowmaster.com',
            password: '123456'
        });
        const token = loginRes.data.token;
        console.log('Logged in. Token:', token.substring(0, 10) + '...');

        // 2. Create Service
        console.log('Creating service...');
        // Match the frontend payload structure
        const payload = {
            name: 'Debug Service',
            description: 'Created via debug script',
            price: 50.00, // Number
            duration: 30  // Number
        };

        const createRes = await axios.post('http://localhost:3000/api/services', payload, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Service created:', createRes.data);

    } catch (error: any) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

main();
