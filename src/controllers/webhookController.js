import { processShopifyWebhook } from '../services/shopifyService.js';

export const handleShopifyWebhook = async (req, res) => {
  try {
    const result = await processShopifyWebhook(req.body);
    res.status(200).send(result);
  } catch (error) {
    console.error(error);
    res.status(400).send('Webhook error');
  }
};