const MONTH_INDEX_MAP = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
};

/**
 * 取得指定月份（今年）的 PostgreSQL Date 邊界範圍 (UTC)
 * @param {string} month - 英文小寫月份名（january ~ december）
 * @returns {{ start: Date, end: Date }} 包含 start 和 end Date 物件的物件
 */
export default function getTimeRange(month) {
  const targetYear = new Date().getFullYear();
  const monthIndex = MONTH_INDEX_MAP[month];

  // Date.UTC(year, monthIndex, day)
  const start = new Date(Date.UTC(targetYear, monthIndex, 1)); // 該月 1 日 00:00 UTC
  const end = new Date(Date.UTC(targetYear, monthIndex + 1, 1)); // 下個月 1 日 00:00 UTC

  return { start, end };
}
