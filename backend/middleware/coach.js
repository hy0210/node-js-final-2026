import { ROLE } from '../constants/role.js';
import createError from '../utils/createError.js';

const coach = function (req, res, next) {
  const { role } = req.user;

  if (role !== ROLE.COACH) {
    return next(createError(401, '使用者尚未成為教練'));
  }

  try {
    next();
  } catch (err) {
    return next(err);
  }
};

export default coach;
