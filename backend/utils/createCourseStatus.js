function createCourseStatus(startAtStr, endAtStr) {
  const startAt = new Date(startAtStr);
  const endAt = new Date(endAtStr);
  const nowDate = new Date();

  if (nowDate < startAt) {
    return '尚未開始';
  } else if (nowDate > startAt && nowDate < endAt) {
    return '進行中';
  } else {
    return '已結束';
  }
}

export default createCourseStatus;
