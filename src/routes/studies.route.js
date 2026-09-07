// 스터디 라우트 (③ 상세 페이지 담당)

//   GET    /              → 목록 (① 담당이 사용)
//   POST   /              → 생성 (② 담당이 사용)  [validate → Conflict(중복) → 201]
//   GET    /:studyId      → 상세 (③)
//   PATCH  /:studyId      → 수정 (③, verifyStudyPassword)
//   DELETE /:studyId      → 삭제 (③, verifyStudyPassword)
//   POST   /:studyId/reactions        → 응원 이모지 등록 (5.6)
//   GET    /:studyId/reactions        → 응원 이모지 조회 (5.17)
//   access-tokens 토큰 발급 폐기 — 인증은 각 쓰기 라우트에서
//    verifyStudyPassword(req)로 Body의 password를 bcrypt.compare 검증)
import { z } from 'zod';
import express from 'express';
import { HTTP_STATUS, STUDY_SORT } from '#constants';
import { BadRequestException } from '#errors';
import { studyRepository } from '#repositories';
import { success } from '#utils';

export const studiesRouter = express.Router();

// GET /studies — 스터디 목록 조회 (① 담당, Public) — 명세 5.2
// q(검색어) / sort(4종) / page,size(없거나 잘못되면 기본값 대체 1·20)
const GET_STUDIES_QUERY_SCHEMA = z.object({
  q: z.string().trim().optional(),
  sort: z.enum(Object.keys(STUDY_SORT)).optional(),
  page: z.coerce.number().int().min(1).catch(1),
  size: z.coerce.number().int().min(1).catch(20),
});

studiesRouter.get('/', async (req, res) => {
  const parsed = GET_STUDIES_QUERY_SCHEMA.safeParse(req.query);
  if (!parsed.success) {
    throw new BadRequestException('잘못된 쿼리 파라미터입니다.');
  }

  const data = await studyRepository.getStudies(parsed.data);

  return success(res, {
    status: HTTP_STATUS.OK,
    data,
  });
});

// TODO(③ 담당): 아래처럼 구현
// studiesRouter.post('/', /* validate */ async (req, res, next) => { ... });
// studiesRouter.get('/:studyId', async (req, res, next) => { ... });