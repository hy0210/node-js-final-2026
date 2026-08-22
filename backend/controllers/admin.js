import AppDataSource from '../db/data-source.js';
import createError from '../utils/createError.js';
import isUuid from '../utils/isUuid.js';
import isValidUrl from '../utils/isValidUrl.js';
import isNonNegativeInteger from '../utils/isNonNegativeInteger.js';
import createCourseStatus from '../utils/createCourseStatus.js';
import { ROLE } from '../constants/role.js';

const userRepo = AppDataSource.getRepository('User');
const coachRepo = AppDataSource.getRepository('Coach');
const courseRepo = AppDataSource.getRepository('Course');

export async function updateUserToCoach(req, res, next) {
  const { userId } = req.params;

  if (!isUuid(userId)) {
    return next(createError(400, 'ID 錯誤'));
  }
  const { experience_years, description, profile_image_url } = req.body;

  if (!isNonNegativeInteger(experience_years) || !description) {
    return next(createError(400, '欄位未填寫正確'));
  }

  // 非必填
  if (profile_image_url && !isValidUrl(profile_image_url)) {
    return next(createError(400, '欄位未填寫正確'));
  }

  const matchedUser = await userRepo.findOne({
    select: { id: true, name: true, role: true },
    where: { id: userId },
  });

  if (!matchedUser) {
    return next(createError(400, '使用者不存在'));
  }

  if (matchedUser.role === ROLE.COACH) {
    return next(createError(409, '使用者已經是教練'));
  }

  try {
    const newCoach = await coachRepo.save({
      user: { id: userId },
      experience_years,
      description,
      profile_image_url,
    });

    // 將 user 升級
    const result = await userRepo.update(
      { id: userId },
      {
        role: ROLE.COACH,
      },
    );

    // update 只會回傳 { affected }, 沒有 user 實體
    if (result.affected === 0) {
      return next(createError(404, '使用者不存在'));
    }

    res.status(201).json({
      status: 'success',
      data: {
        user: { name: matchedUser.name, role: ROLE.COACH },
        coach: {
          id: newCoach.id,
          user_id: matchedUser.id,
          experience_years: newCoach.experience_years,
          description: newCoach.description,
          profile_image_url: newCoach.profile_image_url,
          created_at: newCoach.created_at,
          updated_at: newCoach.updated_at,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getCoachSkills(req, res, next) {
  const { id } = req.user;

  try {
    // relations: 一併載入關聯實體（預設只查 COACH 本表，不會帶出 skills）
    // 這裡的 'skills' 對應 Coach entity 裡定義的 relations.skills
    const matchedCoach = await coachRepo.findOne({
      where: { user: { id } },
      relations: { skills: true },
    });

    const skillIds = matchedCoach.skills.map((skill) => skill.id);

    const data = {
      id: matchedCoach.id,
      experience_years: matchedCoach.experience_years,
      description: matchedCoach.description,
      profile_image_url: matchedCoach.profile_image_url,
      skill_ids: skillIds,
    };
    return res.status(200).json({
      status: 'success',
      data,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateCoachDetail(req, res, next) {
  const { id } = req.user;

  const { experience_years, description, profile_image_url, skill_ids } =
    req.body;

  // 都是必填
  if (
    !isNonNegativeInteger(experience_years) ||
    !description ||
    !isValidUrl(profile_image_url)
  ) {
    return next(createError(400, '欄位未填寫正確'));
  }

  // skill_ids 必須是非空陣列，且每個元素都是技能的 id（uuid 字串）
  if (
    !Array.isArray(skill_ids) ||
    skill_ids.length <= 0 ||
    skill_ids.some((id) => !isUuid(id))
  ) {
    return next(createError(400, '欄位未填寫正確'));
  }

  try {
    // update() 不會回傳實體，skills 是關聯，所以要用 findOne + save()
    const matchedCoach = await coachRepo.findOne({
      where: { user: { id } },
      relations: { skills: true }, // TypeORM 會去查 COACH_SKILLS → 再抓對應的 SKILL
    });
    if (!matchedCoach) {
      return next(createError(400, '教練不存在'));
    }

    // save() 看到物件有 primary key id → 走 UPDATE，不是 INSERT
    // 此時 matchedCoach 會有 skills 陣列
    // skills: [
    //   { id: 'skill-uuid-1', name: '瑜伽', ... },
    //   { id: 'skill-uuid-2', name: '重訓', ... },
    // ]
    const result = await coachRepo.save({
      id: matchedCoach.id, // 有 id → UPDATE
      experience_years,
      description,
      profile_image_url,
      skills: skill_ids.map((newId) => ({ id: newId })),
    });

    res.status(200).json({
      status: 'success',
      data: {
        id: result.id,
        experience_years: result.experience_years,
        description: result.description,
        profile_image_url: result.profile_image_url,
        skill_ids: result.skills.map((skill) => skill.id),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getCoachCourses(req, res, next) {
  const { id } = req.user;

  try {
    // .find() 回傳的是陣列
    const matchedCourses = await courseRepo.find({
      where: { user: { id } }, // 透過 relation 的 joinColumn
      select: {
        id: true,
        name: true,
        start_at: true,
        end_at: true,
        max_participants: true,
        meeting_url: true,
        max_participants: true,
      },
    });

    // participants 代表未取消的報名數
    res.status(200).json({
      status: 'success',
      data: matchedCourses.map((course) => ({
        ...course,
        status: createCourseStatus(course.start_at, course.end_at),
        participants: 0,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function createCoachCourses(req, res, next) {
  const { id } = req.user;

  const {
    skill_id,
    name,
    description,
    start_at,
    end_at,
    max_participants,
    meeting_url,
  } = req.body;

  if (
    !skill_id ||
    !name ||
    !description ||
    !start_at ||
    !end_at ||
    !isNonNegativeInteger(max_participants) ||
    !isValidUrl(meeting_url)
  ) {
    return next(createError(400, '欄位未填寫正確'));
  }

  try {
    const newCourse = await courseRepo.save({
      user: { id }, // 寫進 COURSE.user_id
      skill: { id: skill_id }, // 寫進 COURSE.skill_id
      name,
      description,
      start_at,
      end_at,
      max_participants,
      meeting_url,
    });

    res.status(201).json({
      status: 'success',
      data: { course: newCourse },
    });
  } catch (err) {
    next(err);
  }
}

export async function getCourseDetail(req, res, next) {
  const { courseId } = req.params;
  const { id } = req.user;

  try {
    const matchedCourse = await courseRepo.findOne({
      select: {
        id: true,
        name: true,
        description: true,
        start_at: true,
        end_at: true,
        max_participants: true,
        meeting_url: true,
        skill: {
          id: true,
          name: true,
        },
      },
      where: {
        id: courseId, // 本表欄位
        user: { id }, // relation 條件
      },
      relations: { skill: true }, //  Skill 實體的單一物件（many-to-one)。沒有就是 null。
    });

    // 課程不是你開的、或 id 根本不存在
    if (!matchedCourse) {
      return next(createError(400, '課程不存在'));
    }

    const { skill, ...rest } = matchedCourse;

    const data = {
      ...rest,
      skill_id: skill.id,
      skill_name: skill.name,
    };
    res.status(200).json({
      status: 'success',
      data,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateCourse(req, res, next) {
  const { courseId } = req.params;
  const { id } = req.user;

  const {
    skill_id,
    name,
    description,
    start_at,
    end_at,
    max_participants,
    meeting_url,
  } = req.body;

  if (
    !skill_id ||
    !name ||
    !description ||
    !start_at ||
    !end_at ||
    !isNonNegativeInteger(max_participants) ||
    !isValidUrl(meeting_url)
  ) {
    return next(createError(400, '欄位未填寫正確'));
  }

  try {
    const matchedCourse = await courseRepo.findOne({
      where: {
        id: courseId, // 本表欄位
        user: { id }, // relation 條件
      },
    });

    // 課程不是你開的、或 id 根本不存在
    if (!matchedCourse) {
      return next(createError(400, '課程不存在'));
    }

    const result = await courseRepo.save({
      id: matchedCourse.id, // 有 id → 走 UPDATE，不是 INSERT
      name,
      description,
      start_at,
      end_at,
      max_participants,
      meeting_url,
      skill: { id: skill_id }, // 更新 COURSE.skill_id，等於換掉舊的 skill 關聯
    });

    const { skill, ...rest } = result;

    const data = {
      ...rest,
      skill_id: skill.id,
    };
    res.status(200).json({
      status: 'success',
      data,
    });
  } catch (err) {
    next(err);
  }
}
