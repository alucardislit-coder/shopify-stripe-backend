import express from 'express';
import dotenv from 'dotenv';
import { webhookRoutes } from './routes/webhooks.js';
import { paymentRoutes } from './routes/payments.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/webhooks', webhookRoutes);
app.use('/payments', paymentRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});