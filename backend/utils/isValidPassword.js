// 必須同時包含英文大寫、英文小寫、數字，長度 8～16 字。允許符號。

const PASSWORD_RE = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,16}$/;

export default function isValidPassword(value) {
  return typeof value === 'string' && PASSWORD_RE.test(value);
}
