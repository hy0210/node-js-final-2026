import express from 'express';
import * as creditPackageController from '../controllers/credit-package.js';

const router = express.Router();

router.get('/', creditPackageController.getPackages);
router.post('/', creditPackageController.createPackage);
router.delete('/:packageId', creditPackageController.deletePackage);

export default router;
