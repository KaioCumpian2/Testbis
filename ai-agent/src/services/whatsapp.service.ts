
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_TOKEN = process.env.WHATSAPP_API_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const VERSION = 'v21.0';

if (!API_TOKEN) console.error("❌ Missing WHATSAPP_API_TOKEN in .env");
if (!PHONE_ID) console.error("❌ Missing WHATSAPP_PHONE_ID in .env");

export const sendTextMessage = async (to: string, message: string) => {
    if (!API_TOKEN || !PHONE_ID) {
        console.warn("⚠️ WhatsApp credentials missing. Message not sent.");
        return null;
    }

    try {
        const url = `https://graph.facebook.com/${VERSION}/${PHONE_ID}/messages`;

        console.log(`📤 Sending WhatsApp message to ${to}...`);

        const response = await axios.post(url, {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: to,
            type: "text",
            text: { preview_url: false, body: message }
        }, {
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`✅ Message sent (ID: ${response.data.messages?.[0]?.id})`);
        return response.data;
    } catch (error: any) {
        console.error("❌ Error sending WhatsApp message:", error.response?.data || error.message);
        return null; // Don't throw to avoid crashing the AI loop
    }
};
