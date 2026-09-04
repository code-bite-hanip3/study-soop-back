// 집중 세션 라우트 (⑤ 오늘의 집중 담당)

//   POST  /                  → 집중 세션 시작 (RUNNING, verifyStudyPassword)
//   PATCH /:focusSessionId   → 상태 전이 (verifyStudyPassword, { status: ..., password })
//                               - FOCUS_SESSION_TRANSITIONS 외 전이/완료 중복 → ConflictException(409)
import express from 'express';

export const focusSessionsRouter = express.Router();

// TODO(⑤ 담당): 아래처럼 구현
// focusSessionsRouter.post('/', async (req, res, next) => { ... });