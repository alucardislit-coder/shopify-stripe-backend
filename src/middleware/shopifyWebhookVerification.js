import crypto from 'crypto';

export const verifyShopifyWebhook = (req, res, next) => {
  const hmac = req.headers['x-shopify-hmac-sha256'];
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;

  const generatedHash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(req.body), 'utf8')
    .digest('base64');

  if (generatedHash === hmac) {
    next();
  } else {
    res.status(403).send('Forbidden: Invalid webhook signature');
  }
};