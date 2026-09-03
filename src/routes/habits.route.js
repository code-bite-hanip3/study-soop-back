// 습관 라우트 (④ 오늘의 습관 담당)

//   GET    /                 → 스터디의 습관 목록 (studies/:studyId/habits)
//   GET    /                 → 스터디의 습관 목록 (v6: Public — 인증 없음)
//   POST   /                 → 습관 생성 (verifyStudyPassword — Body의 password bcrypt 검증)
//   PATCH  /:habitId         → 습관 수정 (verifyStudyPassword)
//   DELETE /:habitId         → 소프트 삭제 (verifyStudyPassword, isActive=false)
import express from 'express';

export const habitsRouter = express.Router();

// TODO(④ 담당): 아래처럼 구현
// habitsRouter.get('/', async (req, res, next) => { ... });