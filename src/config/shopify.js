import { shopifyApi, ApiVersion } from '@shopify/shopify-api';
import dotenv from 'dotenv';

dotenv.config();

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: ['read_orders', 'write_orders'],
  hostName: process.env.SHOPIFY_STORE_URL,
  apiVersion: ApiVersion.October23,
});

export default shopify;