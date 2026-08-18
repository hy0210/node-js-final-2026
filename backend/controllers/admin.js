import AppDataSource from '../db/data-source.js';
import createError from '../utils/createError.js';
import isUuid from '../utils/isUuid.js';
import isValidUrl from '../utils/isValidUrl.js';
import isNonNegativeInteger from '../utils/isNonNegativeInteger.js';
import ROLE from '../constants/role.js';

const userRepo = AppDataSource.getRepository('User');
const coachRepo = AppDataSource.getRepository('Coach');

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
      user_id: userId,
      experience_years,
      description,
      profile_image_url,
    });
    res.status(201).json({
      status: 'success',
      data: {
        user: { name: matchedUser.name, role: matchedUser.role },
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
  const { id, role } = req.user;

  if (role !== ROLE.COACH) {
    return next(createError(401, '使用者尚未成為教練'));
  }

  try {
    const matchedCoach = await coachRepo.findOne({
      where: { user_id: id },
      relations: ['skills'],
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
  const { id, role } = req.user;

  // TODO: middleware?
  if (role !== ROLE.COACH) {
    return next(createError(401, '使用者尚未成為教練'));
  }

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
}

export async function getCoachCourses(req, res, next) {}
