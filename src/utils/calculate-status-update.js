import { FOCUS_SESSION_STATUS } from '#constants';
import { BadRequestException } from '#errors';

export function calculateStatusUpdate(status, data) {
  const COMPLETE_POINT = 3;
  const BONUS_POINT = 1;
  let accumulatedSeconds;
  let lastResumedAt;
  let endedAt;
  let earnedPoint;

  switch (status) {
    case FOCUS_SESSION_STATUS.PAUSED: {
      const accumulatedMilliseconds =
        new Date() - (data.lastResumedAt || data.startedAt);
      accumulatedSeconds =
        data.accumulatedSeconds + Math.floor(accumulatedMilliseconds / 1000);
      break;
    }
    case FOCUS_SESSION_STATUS.RUNNING: {
      lastResumedAt = new Date();
      break;
      // 상태별로 필요한 필드만 세팅. undefined인 필드는 Prisma가 업데이트에서 자동 제외함
    }
    case FOCUS_SESSION_STATUS.COMPLETED: {
      endedAt = new Date();
      const accumulatedMilliseconds =
        data.accumulatedSeconds * 1000 +
        endedAt -
        (data.lastResumedAt || data.startedAt);
      accumulatedSeconds = Math.floor(accumulatedMilliseconds / 1000);
      earnedPoint =
        COMPLETE_POINT +
        BONUS_POINT * Math.floor(accumulatedSeconds / (60 * 10));
      break;
    }
    default: {
      throw new BadRequestException('유효하지 않은 상태값입니다');
    }
  }

  const newData = {
    accumulatedSeconds,
    status,
    lastResumedAt,
    endedAt,
    earnedPoint,
  };

  return newData;
}
