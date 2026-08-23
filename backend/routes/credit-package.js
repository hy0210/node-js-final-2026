import express from 'express';
import * as creditPackageController from '../controllers/credit-package.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', creditPackageController.getPackages);
router.post('/', creditPackageController.createPackage);
router.delete('/:packageId', creditPackageController.deletePackage);

// 使用者購買指定方案
router.post('/:creditPackageId', auth, creditPackageController.purchasePackage);

export default router;
