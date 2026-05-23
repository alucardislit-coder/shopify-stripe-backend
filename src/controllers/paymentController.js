import { processStripePayment } from '../services/stripeService.js';

export const createStripePayment = async (req, res) => {
  try {
    const paymentResult = await processStripePayment(req.body);
    res.status(200).json(paymentResult);
  } catch (error) {
    console.error(error);
    res.status(400).send('Payment processing error');
  }
};