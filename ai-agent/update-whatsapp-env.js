
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const token = 'EAAVrXgj8sLABQJ7ScaJxcg256609ADyIjaPDYTH3sfZBV2RMq6ZBe8JfXvzrNhW2iWfEjrRlWgMbq0OxV4PWWuh1r2opLsazIkVZCFtnGddGGyBDS6IfqHkBsrZAs7XW7bsPB2DgrxlEHaeny755d5j1Y3LmXH1pcRmh7GTy6M0Dkiq3zHcBK5y6kikkmsVPy0foCpcT7HZALXn5HyE8BV0NZC9nBlaYAOJBvcRAgZBfTTCGsBCHSpkYZAYgmOZAqmRuc8YFgRylnP9vfOCP8RB9VU4ZBTvXiMVZBTUa6ZBNsk8ZD';

let content = '';
if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, 'utf8');
}

// Remove existing keys if present to avoid dupes
let lines = content.split('\n');
lines = lines.filter(line => !line.startsWith('WHATSAPP_API_TOKEN='));
lines = lines.filter(line => !line.startsWith('WHATSAPP_PHONE_ID='));
lines = lines.filter(line => !line.startsWith('WHATSAPP_VERIFY_TOKEN='));

lines.push(`WHATSAPP_API_TOKEN=${token}`);
lines.push(`WHATSAPP_PHONE_ID=PLACEHOLDER_PHONE_ID_HERE`);
lines.push(`WHATSAPP_VERIFY_TOKEN=flowmaster-secure-token`);

fs.writeFileSync(envPath, lines.join('\n'));
console.log('✅ WHATSAPP_API_TOKEN updated in .env');
