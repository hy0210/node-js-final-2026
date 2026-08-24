import express from 'express';
import * as coursesController from '../controllers/courses.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', coursesController.getCourses);

router.post('/:courseId', auth, coursesController.bookCourse);

export default router;
