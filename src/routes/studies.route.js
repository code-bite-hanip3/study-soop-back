// 스터디 라우트 (③ 상세 페이지 담당)

//   GET    /              → 목록 (① 담당이 사용)
//   POST   /              → 생성 (② 담당이 사용)  [validate → Conflict(중복) → 201]
//   GET    /:studyId      → 상세 (③)
//   PATCH  /:studyId      → 수정 (③, verifyStudyPassword)
//   DELETE /:studyId      → 삭제 (③, verifyStudyPassword)
//   POST   /:studyId/reactions        → 응원 이모지 등록 (5.6)
//   GET    /:studyId/reactions        → 응원 이모지 조회 (5.17)
//   (v6: access-tokens 토큰 발급 폐기 — 인증은 각 쓰기 라우트에서
//    verifyStudyPassword(req)로 Body의 password를 bcrypt.compare 검증)
import express from 'express';

export const studiesRouter = express.Router();

// TODO(③ 담당): 아래처럼 구현
// studiesRouter.get('/', async (req, res, next) => { ... });
// studiesRouter.post('/', /* validate */ async (req, res, next) => { ... });
// studiesRouter.get('/:studyId', async (req, res, next) => { ... });