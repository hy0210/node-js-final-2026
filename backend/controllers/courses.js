import AppDataSource from '../db/data-source.js';
import createError from '../utils/createError.js';
import isUuid from '../utils/isUuid.js';
import { STATUS } from '../constants/status.js';
import createCourseStatus from '../utils/createCourseStatus.js';
import getUserCreditStats from '../services/getUserCreditStats.js';

const courseRepo = AppDataSource.getRepository('Course');
const bookingRepo = AppDataSource.getRepository('Booking');

// 取得全部「進行中」的課程列表
export async function getCourses(req, res, next) {
  try {
    const result = await courseRepo.find({
      select: {
        id: true,
        name: true,
        description: true,
        start_at: true,
        end_at: true,
        max_participants: true,
        skill: {
          id: true,
          name: true,
        },
        user: {
          id: true,
          name: true,
        },
      },
      relations: { skill: true, user: true },
    });

    // 只留下進行中的課程
    const filteredCourses = result
      .map(({ start_at, end_at, ...rest }) => ({
        ...rest,
        start_at,
        end_at,
        status: createCourseStatus(start_at, end_at),
      }))
      .filter((course) => course.status === STATUS.IN_PROGRESS);

    res.status(200).json({
      status: 'success',
      data: filteredCourses.map((course) => ({
        id: course.id,
        name: course.name,
        description: course.description,
        start_at: course.start_at,
        end_at: course.end_at,
        max_participants: course.max_participants,
        coach_name: course.user.name,
        skill_name: course.skill.name,
      })),
    });
  } catch (err) {
    next(err);
  }
}

// 報名課程
export async function bookCourse(req, res, next) {
  const { courseId } = req.params;
  const { id } = req.user;

  if (!isUuid(courseId)) {
    return next(createError(400, 'ID錯誤'));
  }

  try {
    const matchedCourse = await courseRepo.findOne({
      where: { id: courseId },
    });

    if (!matchedCourse) {
      return next(createError(400, 'ID錯誤'));
    }

    const matchedBooking = await bookingRepo.findOne({
      where: { course: { id: courseId }, user: { id } },
      withDeleted: true,
    });

    if (matchedBooking) {
      return next(createError(400, '已經報名過此課程'));
    }

    // 剩餘堂數歸零（購買堂數加總 − 未取消報名數 ≤ 0，沒買過方案也算） → 「已無可使用堂數」
    const { totalCredit, creditRemain } = await getUserCreditStats(id);

    if (totalCredit === 0 || creditRemain <= 0) {
      return next(createError(400, '已無可使用堂數'));
    }

    // 這門課有效報名人數已達名額上限
    const matchedBookings = await bookingRepo.find({
      where: { course: { id: courseId } },
    });

    const courseBookingCount = matchedBookings.length;

    if (matchedCourse.max_participants === courseBookingCount) {
      return next(createError(400, '已達最大參加人數，無法參加'));
    }

    // 新增到報名紀錄中
    await bookingRepo.save({
      user: { id },
      course: { id: courseId },
    });

    res.status(201).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    next(err);
  }
}

// 取消課程報名（軟刪除）
export async function cancelBooking(req, res, next) {
  const { courseId } = req.params;
  const { id } = req.user;

  if (!isUuid(courseId)) {
    return next(createError(400, 'ID錯誤'));
  }
  try {
    // 課程不存在、從未報名過、已經取消過——三種情況都回同一句「ID錯誤」。
    // 1. 課程不存在
    const matchedCourse = await courseRepo.findOne({
      where: { id: courseId },
    });

    if (!matchedCourse) {
      return next(createError(400, 'ID錯誤'));
    }

    // 2. 從未報名過
    const matchedBooking = await bookingRepo.findOne({
      where: { course: { id: courseId }, user: { id } },
      withDeleted: true,
    });

    if (!matchedBooking) {
      return next(createError(400, 'ID錯誤'));
    }

    // 3. 已經取消過
    if (matchedBooking && matchedBooking.cancelled_at !== null) {
      return next(createError(400, 'ID錯誤'));
    }

    // 標記取消沒成功會回 400「取消失敗」
    const result = await bookingRepo.softDelete({
      course: { id: courseId },
      user: { id },
    });

    if (result.affected === 0) {
      return next(createError(400, '取消失敗'));
    }

    res.status(200).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    next(err);
  }
}
