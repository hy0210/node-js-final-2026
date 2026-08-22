import express from 'express';
import * as coursesController from '../controllers/courses.js';

const router = express.Router();

router.get('/', coursesController.getCourses);

export default router;
