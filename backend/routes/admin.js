import express from 'express';
import * as adminController from '../controllers/admin.js';
import coach from '../middleware/coach.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// 教練本人資料
router.get('/coaches', auth, coach, adminController.getCoachSkills);
router.put('/coaches', auth, coach, adminController.updateCoachDetail);

// 課程列表／開課：要登入且是教練
router.get('/coaches/courses', auth, coach, adminController.getCoachCourses);
router.post(
  '/coaches/courses',
  auth,
  coach,
  adminController.createCoachCourses,
);

// 單一課程：只驗登入，靠 owner-scoped 查詢隔離
router.get('/coaches/courses/:courseId', auth, adminController.getCourseDetail);
router.put('/coaches/courses/:courseId', auth, adminController.updateCourse);

// 不需要登入（作業刻意 public）
// 會把 /coaches/ 後面那一段都當成 userId，會和其他 API 衝突，所以要往後放
router.post('/coaches/:userId', adminController.updateUserToCoach);

export default router;
