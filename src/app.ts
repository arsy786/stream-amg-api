import express from 'express';
import assetRoutes from './routes/asset.routes';

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/assets', assetRoutes);

export default app;
