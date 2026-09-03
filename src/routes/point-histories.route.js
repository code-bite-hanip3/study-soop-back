// 포인트 이력 라우트 (⑤ 오늘의 집중 담당)

//   GET /    → 포인트 이력 조회  (?studyId)  — 실적 탭의 오늘 포인트 합계는 프론트에서 합산
import express from 'express';

export const pointHistoriesRouter = express.Router();

// TODO(⑤ 담당): 아래처럼 구현
// pointHistoriesRouter.get('/', async (req, res, next) => { ... });