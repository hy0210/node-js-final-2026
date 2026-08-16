import jwt from 'jsonwebtoken';
import { JWT_ERROR } from '../constants/jwtError.js';
import createError from '../utils/createError.js';

const auth = function (req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(createError(401, '請先登入'));
  }

  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    return next(createError(401, '請先登入'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === JWT_ERROR.TOKEN_EXPIRED) {
      return next(createError(401, 'Token 已過期'));
    }
    return next(createError(401, '無效的 token'));
  }
};

export default auth;
