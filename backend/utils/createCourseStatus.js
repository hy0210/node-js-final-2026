import { STATUS } from '../constants/status.js';

function createCourseStatus(startAtStr, endAtStr) {
  const startAt = new Date(startAtStr);
  const endAt = new Date(endAtStr);
  const nowDate = new Date();

  if (nowDate < startAt) {
    return STATUS.NOT_STARTED;
  } else if (nowDate > startAt && nowDate < endAt) {
    return STATUS.IN_PROGRESS;
  } else {
    return STATUS.ENDED;
  }
}

export default createCourseStatus;
