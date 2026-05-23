import stripe from '../config/stripe.js';

export const processStripePayment = async ({ amount, currency, paymentMethodId, customerId }) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    payment_method: paymentMethodId,
    customer: customerId,
    confirm: true,
  });

  return paymentIntent;
};