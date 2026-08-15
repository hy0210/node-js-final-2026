import express from 'express';

import apiRouter from './routes/index.js';
import healthRouter from './routes/healthcheck.js';

const app = express();

app.use('/healthcheck', healthRouter);
app.use('/api', apiRouter);

export default app;
