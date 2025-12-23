import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000; // 4000 to avoid conflict with FlowMaster (3000)

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'FlowMaster AI Agent',
        timestamp: new Date().toISOString()
    });
});

import { processMessage } from './services/ai.service';

import { sendTextMessage } from './services/whatsapp.service';

// Webhook for WhatsApp (and Support for HTTP Simulation)
app.post('/whatsapp/inbound', async (req, res) => {
    // 1. Acknowledge immediately (Meta requires < 3s response)
    res.sendStatus(200);

    try {
        const body = req.body;
        console.log('📨 Inbound Payload:', JSON.stringify(body, null, 2).substring(0, 500) + "...");

        // 2. Extract Data
        let message = '';
        let senderId = ''; // The Phone Number of the user
        let tenantId = 'default-tenant'; // In real usage, this would be mapped from the 'to' (PhoneID) or Metadata
        let isSimulation = false;

        if (body.object === 'whatsapp_business_account') {
            // Real WhatsApp Payload
            const entry = body.entry?.[0];
            const changes = entry?.changes?.[0];
            const value = changes?.value;
            const messages = value?.messages;

            if (messages && messages.length > 0) {
                const msg = messages[0];
                if (msg.type === 'text') {
                    message = msg.text.body;
                    senderId = msg.from; // User's Phone Number

                    // Optional: Map destination Phone ID to Internal Tenant ID
                    // const businessPhoneId = value.metadata?.phone_number_id; 
                    // For now, allow tenantId to be default or derived later.
                }
            }
        } else if (body.message) {
            // HTTP Simulation (Developer Mode)
            message = body.message;
            tenantId = body.tenantId || 'default-tenant';
            senderId = body.senderId || 'simulator';
            isSimulation = true;
        }

        if (!message || !senderId) {
            // Probably a status update (sent/delivered/read) or non-text message
            return;
        }

        // 3. AI Processing
        console.log(`🧠 Processing for ${senderId}: "${message}"`);
        const aiResponse = await processMessage(message, tenantId, senderId);

        // 4. Send Reply
        if (isSimulation) {
            console.log(`🤖 [Sim] Reply: "${aiResponse}"`);
            // Can't send HTTP response anymore since we already sent 200 OK.
            // But we log it clearly.
        } else {
            // Real WhatsApp Reply
            console.log(`📤 Replying to ${senderId} via WhatsApp API...`);
            await sendTextMessage(senderId, aiResponse);
        }

    } catch (error) {
        console.error('❌ Webhook Processing Error:', error);
    }
});

// Verification Endpoint for Meta (GET)
app.get('/whatsapp/inbound', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // Verify token (we will set this in .env later)
    if (mode && token) {
        if (mode === 'subscribe' && token === (process.env.WHATSAPP_VERIFY_TOKEN || 'temp-token')) {
            console.log('✅ Webhook verified');
            res.status(200).send(challenge);
        } else {
            console.log('❌ Webhook verification failed');
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(400);
    }
});

app.listen(PORT, () => {
    console.log(`🤖 AI Agent running on port ${PORT}`);
});
