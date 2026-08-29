import express from 'express';
import * as coursesController from '../controllers/courses.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', coursesController.getCourses);

router.post('/:courseId', auth, coursesController.bookCourse);

router.delete('/:courseId', auth, coursesController.cancelBooking);

export default router;
