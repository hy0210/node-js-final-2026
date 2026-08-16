import express from 'express';
import * as coachesController from '../controllers/coaches.js';

const router = express.Router();

router.get('/skill', coachesController.getSkills);
router.post('/skill', coachesController.createSkill);
router.delete('/skill/:skillId', coachesController.deleteSkill);

export default router;
