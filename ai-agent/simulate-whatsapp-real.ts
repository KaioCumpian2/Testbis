
import axios from 'axios';

const API_URL = 'http://localhost:4000/whatsapp/inbound';

const payload = {
    "object": "whatsapp_business_account",
    "entry": [
        {
            "id": "100555...",
            "changes": [
                {
                    "value": {
                        "messaging_product": "whatsapp",
                        "metadata": {
                            "display_phone_number": "155500...",
                            "phone_number_id": "123456789"
                        },
                        "contacts": [{
                            "profile": { "name": "Test User" },
                            "wa_id": "5511999998888"
                        }],
                        "messages": [
                            {
                                "from": "5511999998888",
                                "id": "wamid.HBgLM...",
                                "timestamp": "167...",
                                "text": {
                                    "body": "Quais serviços vocês tem disponiveis hoje?"
                                },
                                "type": "text"
                            }
                        ]
                    },
                    "field": "messages"
                }
            ]
        }
    ]
};

async function testRealPayload() {
    try {
        console.log("📡 Sending Real WhatsApp Payload...");
        // WhatsApp expects immediate 200 OK.
        // We measure time to get that 200 OK (should be fast)
        const start = Date.now();
        const response = await axios.post(API_URL, payload);
        const duration = Date.now() - start;

        console.log(`✅ Server Acknowledged in ${duration}ms (Status: ${response.status})`);
        console.log("👉 Check Server Logs to see AI response and Outbound attempt!");
    } catch (error: any) {
        console.error("❌ Error:", error.message);
    }
}

testRealPayload();
