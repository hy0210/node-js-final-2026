import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PG_ERROR } from '../constants/pgError.js';

import AppDataSource from '../db/data-source.js';
import createError from '../utils/createError.js';
import isValidPassword from '../utils/isValidPassword.js';

const userRepo = AppDataSource.getRepository('User');

// 身分（role）固定是 USER，註冊時無法指定身分
export async function signUp(req, res, next) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return next(createError(400, '欄位未填寫正確'));
  }

  if (!isValidPassword(password)) {
    return next(
      createError(
        400,
        '密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字',
      ),
    );
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const encodedPassword = await bcrypt.hash(password, salt);

    const newUser = await userRepo.save({
      name,
      email,
      role: 'USER',
      password: encodedPassword,
    });
    res.status(201).json({
      status: 'success',
      data: { user: { id: newUser.id, name: newUser.name } },
    });
  } catch (err) {
    // 在資安上，不會告訴使用者這個 email 使用過了，這裡只是作業練習
    if (err.code === PG_ERROR.UNIQUE_VIOLATION) {
      return next(createError(409, 'Email 已被使用'));
    }
    next(err);
  }
}

export async function login(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(createError(400, '欄位未填寫正確'));
  }
  if (!isValidPassword(password)) {
    return next(
      createError(
        400,
        '密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字',
      ),
    );
  }
  // 1. 比對 email
  const matchedUser = await userRepo.findOne({
    select: { id: true, name: true, password: true, role: true },
    where: { email },
  });

  if (!matchedUser) {
    return next(createError(400, '使用者不存在或密碼輸入錯誤'));
  }

  // 2. 比對密碼
  const isPasswordMatched = await bcrypt.compare(
    password,
    matchedUser.password,
  );

  if (!isPasswordMatched) {
    return next(createError(400, '使用者不存在或密碼輸入錯誤'));
  }
  try {
    // 塞到 req.user 中
    const userPayload = {
      id: matchedUser.id,
      role: matchedUser.role,
    };

    const token = jwt.sign(userPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_DAY,
    });
    return res.status(200).json({
      status: 'success',
      data: {
        token,
        user: {
          name: matchedUser.name,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getProfile(req, res, next) {
  // PS: token 裡面會有 id, role，解析完後會被塞到 req 流中
  const { id } = req.user;

  const matchedUser = await userRepo.findOne({
    select: { name: true, email: true },
    where: { id },
  });

  if (!matchedUser) {
    return next(createError(400, '使用者不存在'));
  }

  return res.status(200).json({
    status: 'success',
    data: {
      user: {
        name: matchedUser.name,
        email: matchedUser.email,
      },
    },
  });
}

export async function updateProfile(req, res, next) {
  const { name } = req.body;

  if (!name) {
    return next(createError(400, '欄位未填寫正確'));
  }

  const { id } = req.user;

  const matchedUser = await userRepo.findOne({
    select: { name: true },
    where: { id },
  });

  if (name === matchedUser.name) {
    return next(createError(400, '使用者名稱未變更'));
  }

  try {
    const result = await userRepo.update({ id }, { name });
    if (result.affected === 0) {
      // 沒有任何列被更新
      return next(createError(400, '更新使用者資料失敗'));
    }

    return res.status(200).json({
      status: 'success',
      data: {
        user: {
          name: matchedUser.name,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updatePassword(req, res, next) {
  const { password, new_password, confirm_new_password } = req.body;

  if (!password || !new_password || !confirm_new_password) {
    return next(createError(400, '欄位未填寫正確'));
  }

  const isAnyInvalid =
    !isValidPassword(password) ||
    !isValidPassword(new_password) ||
    !isValidPassword(confirm_new_password);
  if (isAnyInvalid) {
    return next(
      createError(
        400,
        '密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字',
      ),
    );
  }

  if (password === new_password) {
    return next(createError(400, '新密碼不能與舊密碼相同'));
  }

  if (new_password !== confirm_new_password) {
    return next(createError(400, '新密碼與驗證新密碼不一致'));
  }

  const { id } = req.user;

  const matchedUser = await userRepo.findOne({
    select: { id: true, password: true },
    where: { id },
  });

  if (!matchedUser) {
    return next(createError(400, '使用者不存在'));
  }

  const isPasswordMatched = await bcrypt.compare(
    password,
    matchedUser.password,
  );
  if (!isPasswordMatched) {
    return next(createError(400, '密碼輸入錯誤'));
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const encodedNewPassword = await bcrypt.hash(new_password, salt);

    const result = await userRepo.update(
      { id },
      {
        password: encodedNewPassword,
      },
    );

    if (result.affected === 0) {
      // 沒有任何列被更新
      return next(createError(400, '更新使用者資料失敗'));
    }

    return res.status(200).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    next(err);
  }
}
