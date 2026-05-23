import { getDB } from '../config/database.js';

const COLLECTION_NAME = 'payments';

export const createPayment = async (paymentData) => {
  const db = getDB();
  const collection = db.collection(COLLECTION_NAME);

  const payment = {
    shopifyOrderId: paymentData.shopifyOrderId,
    stripePaymentIntentId: paymentData.stripePaymentIntentId,
    amount: paymentData.amount,
    currency: paymentData.currency || 'USD',
    status: paymentData.status,
    customerEmail: paymentData.customerEmail,
    metadata: paymentData.metadata || {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await collection.insertOne(payment);
  return { ...payment, _id: result.insertedId };
};

export const getPaymentByStripeId = async (stripePaymentIntentId) => {
  const db = getDB();
  const collection = db.collection(COLLECTION_NAME);
  return await collection.findOne({ stripePaymentIntentId });
};

export const updatePaymentStatus = async (stripePaymentIntentId, status) => {
  const db = getDB();
  const collection = db.collection(COLLECTION_NAME);

  const result = await collection.updateOne(
    { stripePaymentIntentId },
    {
      $set: {
        status,
        updatedAt: new Date(),
      },
    }
  );

  return result;
};

export const getPaymentByShopifyOrder = async (shopifyOrderId) => {
  const db = getDB();
  const collection = db.collection(COLLECTION_NAME);
  return await collection.findOne({ shopifyOrderId });
};
