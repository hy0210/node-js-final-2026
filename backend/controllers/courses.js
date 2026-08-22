import AppDataSource from '../db/data-source.js';
import createError from '../utils/createError.js';
import isUuid from '../utils/isUuid.js';
import isNonNegativeInteger from '../utils/isNonNegativeInteger.js';
import { STATUS } from '../constants/status.js';
import createCourseStatus from '../utils/createCourseStatus.js';

const courseRepo = AppDataSource.getRepository('Course');

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
