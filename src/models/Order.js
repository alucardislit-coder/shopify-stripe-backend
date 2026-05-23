import { getDB } from '../config/database.js';

const COLLECTION_NAME = 'orders';

export const createOrder = async (orderData) => {
  const db = getDB();
  const collection = db.collection(COLLECTION_NAME);

  const order = {
    shopifyOrderId: orderData.id,
    email: orderData.email,
    totalPrice: parseFloat(orderData.total_price),
    currency: orderData.currency || 'USD',
    status: 'pending',
    stripePaymentIntentId: null,
    paymentStatus: 'unpaid',
    customer: {
      firstName: orderData.billing_address?.first_name,
      lastName: orderData.billing_address?.last_name,
      email: orderData.email,
      phone: orderData.customer?.phone,
    },
    lineItems: orderData.line_items,
    billingAddress: orderData.billing_address,
    shippingAddress: orderData.shipping_address,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await collection.insertOne(order);
  return { ...order, _id: result.insertedId };
};

export const getOrderByShopifyId = async (shopifyOrderId) => {
  const db = getDB();
  const collection = db.collection(COLLECTION_NAME);
  return await collection.findOne({ shopifyOrderId });
};

export const updateOrderPaymentStatus = async (shopifyOrderId, paymentData) => {
  const db = getDB();
  const collection = db.collection(COLLECTION_NAME);

  const result = await collection.updateOne(
    { shopifyOrderId },
    {
      $set: {
        stripePaymentIntentId: paymentData.stripePaymentIntentId,
        paymentStatus: paymentData.paymentStatus,
        updatedAt: new Date(),
      },
    }
  );

  return result;
};

export const getOrderById = async (orderId) => {
  const db = getDB();
  const collection = db.collection(COLLECTION_NAME);
  return await collection.findOne({ _id: orderId });
};

export const getAllOrders = async (limit = 10, skip = 0) => {
  const db = getDB();
  const collection = db.collection(COLLECTION_NAME);
  return await collection.find({}).limit(limit).skip(skip).toArray();
};
