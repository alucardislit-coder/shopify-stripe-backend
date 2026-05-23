import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3000/webhooks/shopify';
const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET || 'test-secret-key';

// Mock Shopify Order
const mockOrder = {
  id: 987654321,
  email: 'customer@example.com',
  total_price: '99.99',
  currency: 'USD',
  billing_address: {
    first_name: 'John',
    last_name: 'Doe',
  },
  customer: {
    phone: '+1234567890',
  },
  line_items: [
    {
      id: 1,
      title: 'Test Product',
      quantity: 1,
      price: '99.99',
    },
  ],
  shipping_address: {
    address1: '123 Main St',
    city: 'New York',
    province: 'NY',
    zip: '10001',
    country: 'United States',
  },
};

// Generate HMAC signature (Shopify verification)
function generateHMAC(data, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(data), 'utf8')
    .digest('base64');
}

async function testWebhook() {
  try {
    console.log('\n🚀 Testing Shopify Webhook Flow\n');
    console.log(`Webhook URL: ${WEBHOOK_URL}`);
    console.log(`Mock Order ID: ${mockOrder.id}\n`);

    // Generate HMAC signature
    const hmac = generateHMAC(mockOrder, SHOPIFY_WEBHOOK_SECRET);

    console.log('📤 Sending webhook request...\n');

    // Send webhook request
    const response = await axios.post(WEBHOOK_URL, mockOrder, {
      headers: {
        'X-Shopify-HMAC-SHA256': hmac,
        'Content-Type': 'application/json',
        'X-Shopify-Topic': 'orders/created',
      },
      validateStatus: () => true, // Don't throw on any status
    });

    console.log('📋 Webhook Response:\n');
    console.log(`Status: ${response.status}`);
    console.log(`Response Data:`);
    console.log(JSON.stringify(response.data, null, 2));

    if (response.status === 200) {
      console.log('\n✅ Webhook test successful!');
      console.log('\n📊 Next Steps:');
      console.log('   1. Check MongoDB for the created order and payment records');
      console.log('   2. Verify Shopify order updated with payment status');
      console.log('   3. Check Stripe dashboard for the payment intent');
    } else {
      console.log('\n⚠️  Webhook returned non-200 status');
    }
  } catch (error) {
    console.error('\n❌ Error testing webhook:');
    console.error(error.message);
    if (error.response?.data) {
      console.error('Response:', error.response.data);
    }
  }
}

testWebhook();
