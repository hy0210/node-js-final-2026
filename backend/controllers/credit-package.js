import AppDataSource from '../db/data-source.js';
import createError from '../utils/createError.js';
import { PG_ERROR } from '../constants/pgError.js';
import isUuid from '../utils/isUuid.js';

const packageRepo = AppDataSource.getRepository('Package');
const purchaseRepo = AppDataSource.getRepository('Purchase');

export async function getPackages(req, res, next) {
  try {
    const packages = await packageRepo.find({
      select: { id: true, name: true, credit_amount: true, price: true },
    });

    // 空陣列也算成功：data 會是 []
    res.status(200).json({ status: 'success', data: packages });
  } catch (err) {
    next(err);
  }
}

export async function createPackage(req, res, next) {
  const { name, credit_amount, price } = req.body;
  if (!name || !credit_amount || !price) {
    return next(createError(400, '缺少必要資料'));
  }
  if (typeof credit_amount !== 'number' || typeof price !== 'number') {
    return next(createError(400, 'credit_amount 和 price 必須是數字'));
  }
  if (credit_amount <= 0 || price <= 0) {
    return next(createError(400, 'credit_amount 和 price 必須是大於 0'));
  }
  if (typeof name !== 'string') {
    return next(createError(400, 'name 必須是字串'));
  }

  try {
    const newPackage = await packageRepo.save({ name, credit_amount, price });
    res.status(200).json({ status: 'success', data: newPackage });
  } catch (err) {
    if (err.code === PG_ERROR.UNIQUE_VIOLATION) {
      return next(createError(409, '方案名稱已存在'));
    }
    next(err);
  }
}

export async function deletePackage(req, res, next) {
  const { packageId } = req.params;

  if (!isUuid(packageId)) {
    return next(createError(400, 'ID錯誤'));
  }

  try {
    const result = await packageRepo.update(
      { id: packageId },
      { deleted_at: new Date() },
    );
    if (result.affected === 0) {
      return next(createError(404, '方案不存在'));
    }
    res.status(200).json({ status: 'success', data: null });
  } catch (err) {
    next(err);
  }
}

// 登入的使用者購買指定方案
export async function purchasePackage(req, res, next) {
  const { creditPackageId } = req.params;
  const { id } = req.user;

  if (!isUuid(creditPackageId)) {
    return next(createError(400, 'ID錯誤'));
  }

  try {
    const matchedPackage = await packageRepo.findOne({
      where: { id: creditPackageId },
    });

    if (!matchedPackage) {
      return next(createError(400, 'ID錯誤'));
    }

    // 把方案寫入使用者的紀錄中
    const newPurchase = await purchaseRepo.save({
      user: { id },
      package: { id: matchedPackage.id },
      purchase_at: new Date(),
    });

    return res.status(200).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    next(err);
  }
}
