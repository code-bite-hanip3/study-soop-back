// 습관 기록 라우트 (④ 오늘의 습관 / 기록표 담당)

//   GET   /            → 습관 기록 조회 (?studyId&from&to)
//   POST  /            → 최초 체크 생성 (5.18, verifyStudyPassword) { habitId, dateKey, isCompleted, password }
//                        ※ 같은 (habitId, dateKey) 재요청 → @@unique 위반 → 409
//   PATCH /:recordId   → 체크 / 해제 토글 (5.13, verifyStudyPassword) { isCompleted, password }
import express from 'express';

export const habitRecordsRouter = express.Router();

// TODO(④ 담당): 아래처럼 구현
// habitRecordsRouter.get('/', async (req, res, next) => { ... });