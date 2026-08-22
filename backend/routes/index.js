import express from 'express';
import coachesRouter from './coaches.js';
import creditPackageRouter from './credit-package.js';
import usersRouter from './users.js';
import adminRoute from './admin.js';

const router = express.Router();

router.use('/coaches', coachesRouter);
router.use('/credit-package', creditPackageRouter);
router.use('/users', usersRouter);
router.use('/admin', adminRoute);

export default router;
