// 공용 인증 헬퍼 (보일러플레이트 뼈대) — bcrypt 비밀번호 검증
// - 쓰기 작업(만들기·수정·삭제)의 Request Body에서 password를 꺼내
//   스터디의 passwordHash와 bcrypt.compare로 대조합니다. 실패 시 401.
// - 조회(GET)는 인증 없음 
import bcrypt from 'bcrypt';
import { prisma } from '#db/prisma.js';
import { BadRequestException, UnauthorizedException, NotFoundException } from '#errors';

/**
 * 쓰기 요청의 password를 스터디 passwordHash와 대조합니다.
 * - studyId는 path(:studyId)나 body/query에서 자동 결정됩니다.
 * - 통과하면 req.study에 스터디 레코드를 담아 돌려줍니다 (라우트에서 재조회 불필요).
 *
 * 사용 예:
 *   router.patch('/:studyId', async (req, res, next) => {
 *     try {
 *       await verifyStudyPassword(req);
 *       // 인증 통과 → 비즈니스 로직
 *     } catch (error) { next(error); }
 *   });
 */
export async function verifyStudyPassword(req) {
  const studyId =
    req.params?.studyId ??
    req.body?.studyId ??                      // habit-records·focus-sessions처럼 Body에 studyId가 있는 API
    req.query?.studyId;                       // habit-records?studyId=... 처럼 Query로 주는 경우

  const password = req.body?.password;

  // password 누락 → 400
  if (!password) {
    throw new BadRequestException('비밀번호는 필수입니다.');
  }

  // 스터디 조회 → 404
  const study = await prisma.study.findUnique({ where: { id: studyId } });
  if (!study) {
    throw new NotFoundException('스터디를 찾을 수 없습니다.');
  }

  // bcrypt 대조 → 불일치 시 401
  const matches = await bcrypt.compare(password, study.passwordHash);
  if (!matches) {
    throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
  }

  // 검증 성공 — 스터디를 요청에 심어둠 (라우트가 재조회 없이 사용)
  req.study = study;
  return study;
}

// 하위 호환: 기존 requireAuth 이름으로도 import 가능 (v6에서는 위 헬퍼 사용 권장)
export const requireAuth = verifyStudyPassword;
