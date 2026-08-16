import AppDataSource from '../db/data-source.js';
import createError from '../utils/createError.js';
import isUuid from '../utils/isUuid.js';
import { PG_ERROR } from '../constants/pgError.js';

const skillRepo = AppDataSource.getRepository('Skill');

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
      { deletedAt: new Date() },
    );
    if (result.affected === 0) {
      return next(createError(404, '技能不存在'));
    }
    res.status(200).json({ status: 'success', data: null });
  } catch (err) {
    next(err);
  }
}
