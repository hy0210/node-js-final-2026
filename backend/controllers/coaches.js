import AppDataSource from '../db/data-source.js';
import createError from '../utils/createError.js';
import isUuid from '../utils/isUuid.js';
import { PG_ERROR } from '../constants/pgError.js';
import isNonNegativeInteger from '../utils/isNonNegativeInteger.js';
import { STATUS } from '../constants/status.js';
import createCourseStatus from '../utils/createCourseStatus.js';

const skillRepo = AppDataSource.getRepository('Skill');
const coachRepo = AppDataSource.getRepository('Coach');
const courseRepo = AppDataSource.getRepository('Course');

// 取得技能列表
export async function getSkills(req, res, next) {
  try {
    const skills = await skillRepo.find({
      select: { id: true, name: true },
    });

    // 空陣列也算成功：data 會是 []
    res.status(200).json({ status: 'success', data: skills });
  } catch (err) {
    next(err);
  }
}
// 新增、移除教練技能
export async function createSkill(req, res, next) {
  const { name } = req.body;

  if (!name) {
    return next(createError(400, '技能名稱不能為空'));
  }
  try {
    const skill = await skillRepo.save({ name });
    res.status(201).json({ status: 'success', data: skill });
  } catch (err) {
    if (err.code === PG_ERROR.UNIQUE_VIOLATION) {
      return next(createError(409, '資料重複'));
    }
    next(err);
  }
}
export async function deleteSkill(req, res, next) {
  const { skillId } = req.params;

  if (!isUuid(skillId)) {
    return next(createError(400, 'ID錯誤'));
  }

  try {
    const result = await skillRepo.update(
      { id: skillId },
      { deleted_at: new Date() },
    );const newPackage = await packageRepo.save({ name, credit_amount, price });
    res.status(200).json({ status: 'success', data: newPackage });
    if (result.affected === 0) {
      return next(createError(404, '技能不存在'));
    }
    res.status(200).json({ status: 'success', data: null });
  } catch (err) {
    next(err);
  }
}

// 取得教練分頁列表
export async function getCoaches(req, res, next) {
  const { per, page } = req.query;
  // 一開始會是字串，要先轉成數字
  const perNum = Number(per);
  const pageNum = Number(page);

  if (!isNonNegativeInteger(perNum) || !isNonNegativeInteger(Number(pageNum))) {
    return next(createError(400, '欄位未填寫正確'));
  }

  try {
    const coaches = await coachRepo.find({
      select: {
        id: true,
        user: {
          id: true,
          name: true,
        },
      },
      relations: { user: true },
      skip: (pageNum - 1) * perNum,
      take: perNum,
    });

    res.status(200).json({
      status: 'success',
      data: coaches
        .filter((c) => c.user) // 跳過 user 是 null 的，可能 user 已經刪除但是 coach 資料還在
        .map((c) => ({
          id: c.id,
          user_id: c.user.id,
          name: c.user.name,
        })),
    });
  } catch (err) {
    next(err);
  }
}

// 取得教練詳細資料
export async function getCoachDetail(req, res, next) {
  const { coachId } = req.params;
  if (!isUuid(coachId)) {
    return next(createError(400, '欄位未填寫正確'));
  }
  try {
    const matchedCoach = await coachRepo.findOne({
      where: { id: coachId },
      relations: { skills: true, user: true }, //此時 matchedCoach 會有 skills 陣列
    });
    if (!matchedCoach) {
      return next(createError(400, '找不到該教練'));
    }

    const { skills, user, ...rest } = matchedCoach;

    if (!user) {
      return next(createError(400, '找不到該教練'));
    }

    const data = {
      user: {
        name: user.name,
        role: user.role,
      },
      coach: {
        ...rest,
        skills: skills.map((skill) => skill.name),
      },
    };

    res.status(200).json({
      status: 'success',
      data,
    });
  } catch (err) {
    next(err);
  }
}

// 取得指定教練「未結束」的課程列表
export async function getCoachCourses(req, res, next) {
  const { coachId } = req.params;
  if (!isUuid(coachId)) {
    return next(createError(400, '欄位未填寫正確'));
  }

  // 先用 coachRepo 拿到 user_id
  // 再用 user_id 拿到 coaches 列表
  try {
    const matchedCoach = await coachRepo.findOne({
      select: {
        user: {
          id: true,
        },
      },
      where: { id: coachId },
      relations: { user: true },
    });

    if (!matchedCoach) {
      return next(createError(400, '找不到該教練'));
    }

    const userId = matchedCoach.user.id;

    const matchedCourses = await courseRepo.find({
      where: { user: { id: userId } },
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

    // 完全沒找到課程
    if (matchedCourses.length === 0) {
      return res.status(200).json({
        status: 'success',
        data: [],
      });
    }

    // 有課程，用 status 篩選課程列表，只留下尚未開始和進行中的課程
    const filteredCourses = matchedCourses
      .map(({ start_at, end_at, ...rest }) => ({
        ...rest,
        start_at,
        end_at,
        status: createCourseStatus(start_at, end_at),
      }))
      .filter((course) => course.status !== STATUS.ENDED);

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
