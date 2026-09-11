import { FOCUS_SESSION_STATUS } from '#constants';
import { BadRequestException } from '#errors';

export function calculateStatusUpdate(status, prevData) {
  const NETWORK_LATENCY_OFFSET_SECONDS = 8;
  const COMPLETE_POINT = 3;
  const BONUS_POINT = 1;
  let accumulatedSeconds;
  let lastResumedAt;
  let endedAt;
  let earnedPoint;

  switch (status) {
    case FOCUS_SESSION_STATUS.PAUSED: {
      const accumulatedMilliseconds =
        new Date() - (prevData.lastResumedAt || prevData.startedAt);
      accumulatedSeconds =
        prevData.accumulatedSeconds +
        Math.floor(accumulatedMilliseconds / 1000);
      break;
    }
    case FOCUS_SESSION_STATUS.RUNNING: {
      lastResumedAt = new Date();
      break;
      // 상태별로 필요한 필드만 세팅. undefined인 필드는 Prisma가 업데이트에서 자동 제외함
    }
    case FOCUS_SESSION_STATUS.COMPLETED: {
      endedAt = new Date();
      const prevAccumulatedMilliseconds = prevData.accumulatedSeconds ?? 0;
      const accumulatedMilliseconds =
        prevAccumulatedMilliseconds * 1000 +
        endedAt.getTime() -
        (prevData.lastResumedAt || prevData.startedAt);
      accumulatedSeconds = Math.floor(accumulatedMilliseconds / 1000);
      earnedPoint =
        COMPLETE_POINT +
        BONUS_POINT *
          Math.floor(
            (accumulatedSeconds + NETWORK_LATENCY_OFFSET_SECONDS) / (60 * 10),
          );
      break;
    }
    default: {
      throw new BadRequestException('유효하지 않은 상태값입니다.1');
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
