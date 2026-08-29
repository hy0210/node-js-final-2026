// 只接受小寫英文的月份
const MONTHS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
];

export default function isMonth(value) {
  return typeof value === 'string' && MONTHS.includes(value);
}
