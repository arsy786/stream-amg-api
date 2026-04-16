import express from 'express';
import assetRoutes from './routes/asset.routes';

const app = express();

app.use(express.json());

app.use('/assets', assetRoutes);

export default app;
