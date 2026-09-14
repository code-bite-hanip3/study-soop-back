// 스터디 라우트 (③ 상세 페이지 담당)

//   GET    /              → 목록 (① 담당이 사용)
//   POST   /              → 생성 (② 담당이 사용)  [validate → Conflict(중복) → 201]
//   GET    /:studyId      → 상세 (③)
//   PATCH  /:studyId      → 수정 (③, verifyStudyPassword)
//   DELETE /:studyId      → 삭제 (③, verifyStudyPassword)
//   POST   /:studyId/reactions        → 응원 이모지 등록 (5.6)
//   GET    /:studyId/reactions        → 응원 이모지 조회 (5.17)
//   /:studyId/habits                 → 습관 nested (④ 담당 — habitsRouter 하위 마운트)
//   access-tokens 토큰 발급 폐기 — 인증은 각 쓰기 라우트에서
//    verifyStudyPassword(req)로 Body의 password를 bcrypt.compare 검증)
import { z } from 'zod';
import express from 'express';
import { HTTP_STATUS, BACKGROUND_TYPE, STUDY_SORT } from '#constants';
import { BadRequestException } from '#errors';
import { studyRepository } from '#repositories';
import { verifyStudyPassword } from '#middlewares';
import { habitsRouter } from './habits.route.js';
import { success, fail } from '#utils';
import bcrypt from 'bcrypt';

export const studiesRouter = express.Router();

// 습관은 Study 종속 리소스 — flat(/habits) 금지, 여기서 nested 마운트 (④ 담당, 명세 5.9·5.10)
// note: habitsRouter는 mergeParams로 req.params.studyId를 공유받는다.
studiesRouter.use('/:studyId/habits', habitsRouter);

// GET /studies — 스터디 목록 조회 (① 담당, Public) — 명세 1.2
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
    return fail(res, HTTP_STATUS.BAD_REQUEST, '잘못된 쿼리 파라미터입니다.');
  }

  const data = await studyRepository.getStudies(parsed.data);

  return success(res, {
    status: HTTP_STATUS.OK,
    data,
  });
});

// GET /studies/:studyId — 스터디 상세 조회 (③ 담당, Public) — 명세 1.3
// 공개 영역만: 이름·소개·배경·포인트 (passwordHash 제외) — 습관은 ④에서
studiesRouter.get('/:studyId', async (req, res, next) => {
  try {
    const study = await studyRepository.getById(req.params.studyId);
    if (!study) {
      return fail(res, HTTP_STATUS.NOT_FOUND, '스터디를 찾을 수 없습니다.');
    }

    return success(res, {
      status: HTTP_STATUS.OK,
      data: study,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /studies/:studyId — 스터디 수정 (③ 담당, verifyStudyPassword) — 명세 1.4
// body의 password로 인증하고, 인증 성공 시 요청된 필드만 수정
studiesRouter.patch('/:studyId', async (req, res, next) => {
  try {
    const studyId = req.params.studyId;
    await verifyStudyPassword(req);

    const { name, description, backgroundType, backgroundValue } =
      req.body ?? {};

    const data = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (backgroundType !== undefined) data.backgroundType = backgroundType;
    if (backgroundValue !== undefined) data.backgroundValue = backgroundValue;

    const study = await studyRepository.updateById(studyId, data);

    return success(res, {
      status: HTTP_STATUS.OK,
      data: study,
      message: '스터디가 수정되었습니다.',
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /studies/:studyId — 스터디 삭제 (③ 담당, verifyStudyPassword) — 명세 1.5
// 하위 데이터(반응·습관·기록)는 스키마 onDelete: Cascade로 함께 삭제
studiesRouter.delete('/:studyId', async (req, res, next) => {
  try {
    await verifyStudyPassword(req);

    await studyRepository.deleteById(req.params.studyId);

    return success(res, {
      status: HTTP_STATUS.OK,
      message: '스터디가 삭제되었습니다.',
    });
  } catch (error) {
    next(error);
  }
});

// POST /studies/:studyId/reactions — 응원 이모지 등록 (③ 담당, Public) — 명세 5.6
// body: { emoji: "👍" } — (studyId, emoji) Unique → 같은 이모지는 count 증가
const POST_REACTION_SCHEMA = z.object({
  emoji: z.string().trim().min(1).max(16),
});

studiesRouter.post('/:studyId/reactions', async (req, res, next) => {
  try {
    const parsed = POST_REACTION_SCHEMA.safeParse(req.body ?? {});
    if (!parsed.success) {
      return fail(res, HTTP_STATUS.BAD_REQUEST, '이모지를 입력해주세요.');
    }

    const study = await studyRepository.getById(req.params.studyId);
    if (!study) {
      return fail(res, HTTP_STATUS.NOT_FOUND, '스터디를 찾을 수 없습니다.');
    }

    const reaction = await studyRepository.upsertReaction(
      req.params.studyId,
      parsed.data.emoji,
    );

    return success(res, {
      status: HTTP_STATUS.CREATED,
      data: {
        studyId: reaction.studyId,
        emoji: reaction.emoji,
        count: reaction.count,
      },
      message: '응원을 등록했습니다.',
    });
  } catch (error) {
    next(error);
  }
});

// GET /studies/:studyId/reactions — 응원 이모지 조회 (③ 담당, Public) — 명세 5.17
// count 내림차순 이모지 순위 (상위 3개 노출은 프론트에서)
studiesRouter.get('/:studyId/reactions', async (req, res, next) => {
  try {
    const reactions = await studyRepository.getReactions(req.params.studyId);

    return success(res, {
      status: HTTP_STATUS.OK,
      data: reactions,
    });
  } catch (error) {
    next(error);
  }
});


// POST /studies — 스터디 생성
studiesRouter.post('/', async (req, res, next) => {
  const {
    creatorNickname,
    name,
    description,
    backgroundType = BACKGROUND_TYPE.COLOR,
    backgroundValue,
    password,
  } = req.body ?? {};

  const trimNickname = (creatorNickname ?? '').trim();
  const trimName = (name ?? '').trim();
  const trimmedDescription = (description ?? '').trim();

  if (!trimNickname) {
    return next(new BadRequestException('닉네임을 입력해 주세요'));
  }
  if (!trimName) {
    return next(new BadRequestException('스터디 이름을 입력해 주세요'));
  }
  if (!password || password.trim().length < 4) {
    return next(new BadRequestException('비밀번호는 4자 이상 입력해 주세요'));
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const study = await studyRepository.create({
    creatorNickname: trimNickname,
    name: trimName,
    description: trimmedDescription,
    backgroundType,
    backgroundValue,
    passwordHash,
  });

  return success(res, {
    status: HTTP_STATUS.CREATED,
    data: { id: study.id },
    message: '스터디가 생성되었습니다.',
  });
});
