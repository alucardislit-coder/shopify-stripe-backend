import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const SHOPIFY_STORE_URL = process.env.SHOPIFY_STORE_URL;
const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET;
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://your-domain.com/webhooks/shopify';

const basicAuth = Buffer.from(
  `${SHOPIFY_API_KEY}:${SHOPIFY_API_SECRET}`
).toString('base64');

const shopifyApiClient = axios.create({
  baseURL: `https://${SHOPIFY_STORE_URL}/admin/api/2023-10`,
  headers: {
    Authorization: `Basic ${basicAuth}`,
    'Content-Type': 'application/json',
  },
});

const webhooks = [
  {
    topic: 'orders/created',
    address: WEBHOOK_URL,
    format: 'json',
  },
  {
    topic: 'orders/updated',
    address: WEBHOOK_URL,
    format: 'json',
  },
  {
    topic: 'orders/fulfilled',
    address: WEBHOOK_URL,
    format: 'json',
  },
];

async function registerWebhooks() {
  try {
    console.log('🔄 Registering Shopify webhooks...');
    console.log(`Store URL: ${SHOPIFY_STORE_URL}`);
    console.log(`Webhook URL: ${WEBHOOK_URL}`);
    console.log('');

    // Get existing webhooks
    const existingResponse = await shopifyApiClient.get('/webhooks.json');
    const existingWebhooks = existingResponse.data.webhooks;

    console.log(`Found ${existingWebhooks.length} existing webhooks\n`);

    for (const webhook of webhooks) {
      // Check if webhook already exists
      const exists = existingWebhooks.some(
        (w) => w.topic === webhook.topic && w.address === webhook.address
      );

      if (exists) {
        console.log(`✅ Webhook already registered: ${webhook.topic}`);
      } else {
        try {
          const response = await shopifyApiClient.post('/webhooks.json', {
            webhook,
          });
          console.log(`✅ Successfully registered: ${webhook.topic}`);
          console.log(`   ID: ${response.data.webhook.id}`);
        } catch (error) {
          console.error(`❌ Failed to register ${webhook.topic}:`, error.response?.data || error.message);
        }
      }
    }

    console.log('');
    console.log('🎉 Webhook registration complete!');
  } catch (error) {
    console.error('❌ Error registering webhooks:', error.message);
    if (error.response?.data) {
      console.error('Details:', error.response.data);
    }
    process.exit(1);
  }
}

registerWebhooks();
