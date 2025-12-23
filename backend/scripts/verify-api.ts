import axios from 'axios';

async function testRegistration() {
    console.log('Testing Registration API...');
    const url = 'http://localhost:3000/api/auth/register-saas';
    const payload = {
        organizationName: 'Test Corp ' + Date.now(),
        name: 'Tester',
        email: `test${Date.now()}@example.com`,
        password: 'password123'
    };

    try {
        console.log(`POST ${url}`);
        const response = await axios.post(url, payload);
        console.log('✅ Success!');
        console.log('Status:', response.status);
        console.log('Data:', response.data);
    } catch (error: any) {
        console.error('❌ Failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testRegistration();
