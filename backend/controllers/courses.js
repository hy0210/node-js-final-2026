import AppDataSource from '../db/data-source.js';
import createError from '../utils/createError.js';
import isUuid from '../utils/isUuid.js';
import { STATUS } from '../constants/status.js';
import createCourseStatus from '../utils/createCourseStatus.js';

const courseRepo = AppDataSource.getRepository('Course');
const bookingRepo = AppDataSource.getRepository('Booking');
const purchaseRepo = AppDataSource.getRepository('Purchase');

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

    const hasBookedByUser = await bookingRepo.findOne({
      where: { course: { id: courseId }, user: { id } },
      withDeleted: true,
    });

    if (hasBookedByUser) {
      return next(createError(400, '已經報名過此課程'));
    }

    // 使用者剩餘堂數 ＝「全部購買的堂數加總」−「未取消的報名數」
    const purchases = await purchaseRepo.find({
      where: { user: { id } },
      relations: {
        package: true,
      },
    });

    if (purchases.length === 0) {
      return next(createError(400, '已無可使用堂數'));
    }

    const purchasedPackages = purchases.map((p) => p.package);
    const totalCreditCount = purchasedPackages.reduce((accum, cur) => {
      return accum + Number(cur.credit_amount);
    }, 0);

    const userBookings = await bookingRepo.find({ where: { user: { id } } });

    const validBookingCount = userBookings.filter(
      (booking) => booking.cancelled_at === null,
    ).length;

    const remainCount = totalCreditCount - validBookingCount;

    if (remainCount <= 0) {
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

    const newBooking = await bookingRepo.save({
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
