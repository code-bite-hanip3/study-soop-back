// 공부의 숲 도메인 상수 (보일러플레이트 뼈대 — 팀이 확장)
export { HTTP_STATUS } from './http-status.js';
export const FOCUS_SESSION_STATUS = {
  READY: 'READY',
  RUNNING: 'RUNNING',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

// 허용된 상태 전이 (잘못된 전이 → 409 Conflict)
export const FOCUS_SESSION_TRANSITIONS = {
  READY: ['RUNNING', 'CANCELLED'],
  RUNNING: ['PAUSED', 'COMPLETED', 'CANCELLED'],
  PAUSED: ['RUNNING', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

export const POINT_HISTORY_TYPE = {
  FOCUS_COMPLETED: 'FOCUS_COMPLETED',
  BONUS: 'BONUS',
  ADJUSTMENT: 'ADJUSTMENT',
};

export const BACKGROUND_TYPE = {
  COLOR: 'COLOR',
  IMAGE: 'IMAGE',
};
