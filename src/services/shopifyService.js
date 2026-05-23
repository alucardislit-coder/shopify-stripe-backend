import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const SHOPIFY_STORE_URL = process.env.SHOPIFY_STORE_URL;
const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET;

// Create Basic Auth header
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

/**
 * Process Shopify order/created webhook
 * Extract order details and prepare for Stripe payment
 */
export const processShopifyWebhook = async (orderData) => {
  try {
    console.log('Processing Shopify Order:', orderData.id);

    // Extract relevant order information
    const order = {
      id: orderData.id,
      email: orderData.email,
      total: parseFloat(orderData.total_price) * 100, // Convert to cents for Stripe
      currency: orderData.currency || 'USD',
      customer: {
        firstName: orderData.billing_address?.first_name,
        lastName: orderData.billing_address?.last_name,
        email: orderData.email,
        phone: orderData.customer?.phone,
      },
      lineItems: orderData.line_items,
      billingAddress: orderData.billing_address,
      shippingAddress: orderData.shipping_address,
    };

    return {
      success: true,
      message: 'Webhook processed successfully',
      order,
    };
  } catch (error) {
    console.error('Error processing Shopify webhook:', error);
    throw error;
  }
};

/**
 * Update Shopify order with payment status
 */
export const updateOrderPaymentStatus = async (orderId, paymentStatus) => {
  try {
    const response = await shopifyApiClient.put(`/orders/${orderId}.json`, {
      order: {
        id: orderId,
        metafields: [
          {
            namespace: 'stripe_payment',
            key: 'payment_status',
            value: paymentStatus,
            value_type: 'string',
          },
        ],
      },
    });

    console.log(`Order ${orderId} updated with payment status: ${paymentStatus}`);
    return response.data;
  } catch (error) {
    console.error('Error updating Shopify order:', error);
    throw error;
  }
};

/**
 * Fetch order details from Shopify
 */
export const getShopifyOrder = async (orderId) => {
  try {
    const response = await shopifyApiClient.get(`/orders/${orderId}.json`);
    return response.data.order;
  } catch (error) {
    console.error('Error fetching Shopify order:', error);
    throw error;
  }
};

/**
 * Create fulfillment in Shopify (after successful payment)
 */
export const createShopifyFulfillment = async (orderId, lineItems) => {
  try {
    const fulfillmentOrders = await shopifyApiClient.get(
      `/orders/${orderId}/fulfillment_orders.json`
    );

    const lineItemIds = fulfillmentOrders.data.fulfillment_orders
      .filter((fo) => fo.status === 'scheduled')
      .flatMap((fo) =>
        fo.line_items.map((li) => ({
          id: li.id,
          quantity: li.quantity,
        }))
      );

    if (lineItemIds.length === 0) {
      console.log('No items to fulfill');
      return null;
    }

    const response = await shopifyApiClient.post(
      `/fulfillments.json`,
      {
        fulfillment: {
          line_items_by_fulfillment_order: [
            {
              fulfillment_order_id: fulfillmentOrders.data.fulfillment_orders[0].id,
              fulfillment_order_line_items: lineItemIds,
            },
          ],
        },
      }
    );

    console.log(`Fulfillment created for order ${orderId}`);
    return response.data.fulfillment;
  } catch (error) {
    console.error('Error creating Shopify fulfillment:', error);
    throw error;
  }
};
