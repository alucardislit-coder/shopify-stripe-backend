# Shopify + Stripe Backend

This is a Node.js backend for integrating Shopify and Stripe, built with Express.

## Features
- Shopify Webhook Handler (`orders/created`)
- Stripe Payment Processing
- Shopify + Stripe Sync

## Getting Started

### Prerequisites
- Node.js (v16+)
- Shopify API Key/Secret
- Stripe API Key

### Installation

```bash
git clone <repo_url>
cd shopify-stripe-backend
npm install
```

### Configuration

Rename `.env.example` to `.env` and provide the following values:

```env
SHOPIFY_API_KEY=<your_shopify_api_key>
SHOPIFY_API_SECRET=<your_shopify_api_secret>
SHOPIFY_WEBHOOK_SECRET=<your_shopify_webhook_secret>
SHOPIFY_STORE_URL=<your_shopify_store_url>
STRIPE_SECRET_KEY=<your_stripe_secret_key>
```

### Run the Server

```bash
npm start
```

## Endpoints

- `/webhooks/shopify` - Handles Shopify webhooks
- `/payments/charge` - Creates Stripe charge

## License

MIT