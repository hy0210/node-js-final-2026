import express from 'express';
import cors from 'cors';

import apiRouter from './routes/index.js';
import healthRouter from './routes/healthcheck.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/healthcheck', healthRouter);
app.use('/api', apiRouter);

app.use((err, req, res, next) => {
  console.error('[error]', req.method, req.originalUrl, err.message);

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: 'failed',
      message: err.message,
    });
  }

  res.status(500).json({
    status: 'failed',
    message: '伺服器發生錯誤，請稍後再試',
  });
});

export default app;
