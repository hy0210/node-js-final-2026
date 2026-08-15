import express from 'express';
import AppDataSource from '../db/data-source.js';

const router = express.Router();

/* GET health check. */
router.get('/', async (req, res) => {
  try {
    await AppDataSource.query('SELECT 1');
    res.status(200).json({ status: 'success' });
  } catch (err) {
    res.status(503).json({ status: 'failed' });
  }
});

export default router;
