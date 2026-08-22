import express from 'express';
import * as coachesController from '../controllers/coaches.js';

const router = express.Router();

router.get('/skill', coachesController.getSkills);
router.post('/skill', coachesController.createSkill);
router.delete('/skill/:skillId', coachesController.deleteSkill);

router.get('/', coachesController.getCoaches);
router.get('/:coachId', coachesController.getCoachDetail);
router.get('/:coachId/courses', coachesController.getCoachCourses);

export default router;
