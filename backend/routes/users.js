import express from 'express';
import * as usersController from '../controllers/users.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', usersController.signUp);
router.post('/login', usersController.login);
router.get('/profile', auth, usersController.getProfile);
router.put('/profile', auth, usersController.updateProfile);
router.put('/password', auth, usersController.updatePassword);

router.get('/credit-package', auth, usersController.getPurchases);

router.get('/courses', auth, usersController.getBookings);

export default router;
