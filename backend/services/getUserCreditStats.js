import AppDataSource from '../db/data-source.js';

const purchaseRepo = AppDataSource.getRepository('Purchase');
const bookingRepo = AppDataSource.getRepository('Booking');

export default async function getUserCreditStats(userId) {
  // 使用者剩餘堂數 ＝「全部購買的堂數加總」−「未取消的報名數」
  const purchases = await purchaseRepo.find({
    where: { user: { id: userId } },
    relations: { package: true },
  });

  const totalCreditCount = purchases.reduce(
    (sum, { package: pkg }) => sum + Number(pkg.credit_amount),
    0,
  );

  // 軟刪除欄位 cancelled_at 已經被排除
  const userBookings = await bookingRepo.find({
    where: { user: { id: userId } },
  });
  const validBookingCount = userBookings.length;
  const remainCount = totalCreditCount - validBookingCount;

  return {
    totalCredit: totalCreditCount,
    creditUsage: validBookingCount,
    creditRemain: remainCount,
  };
}
