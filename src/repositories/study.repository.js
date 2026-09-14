import { prisma } from '#db/prisma.js';
import { STUDY_SORT } from '#constants';

// 카드에 노출할 상위 응원 이모지 개수 (명세 1.2 reactions 상위 3개)
const REACTIONS_PER_CARD = 3;

// 스터디 여러 개의 "상위 3개 응원 이모지"를 한 번의 쿼리로 가져와
// studyId별로 묶어 반환한다. (N+1 방지)
async function getTopReactionsByStudyIds(studyIds) {
  if (studyIds.length === 0) return new Map();

  const rows = await prisma.studyReaction.findMany({
    where: { studyId: { in: studyIds } },
    orderBy: { count: 'desc' },
    select: { studyId: true, emoji: true, count: true },
  });

  const map = new Map();
  for (const row of rows) {
    const list = map.get(row.studyId) ?? [];
    if (list.length < REACTIONS_PER_CARD) {
      list.push({ emoji: row.emoji, count: row.count });
      map.set(row.studyId, list);
    }
  }
  return map;
}

// 스터디 목록 조회 (GET /studies) — ① 담당, 명세 1.2
// q(이름 부분 검색) / sort(4종) / page,size(기본값 대체) / passwordHash 제외 → { items, page, size, totalCount }
function getStudies({ q, sort, page = 1, size = 20 } = {}) {
  const where = {};
  if (q?.trim().length > 0) {
    where.name = { contains: q.trim(), mode: 'insensitive' };
  }

  const orderBy = STUDY_SORT[sort] ?? STUDY_SORT.RECENT;

  return Promise.all([
    prisma.study.findMany({
      where,
      orderBy,
      skip: (page - 1) * size,
      take: size,
      // passwordHash 제외 — select로 응답에 들어갈 필드만 명시
      select: {
        id: true,
        name: true,
        creatorNickname: true,
        description: true,
        backgroundType: true,
        backgroundValue: true,
        pointTotal: true,
        createdAt: true,
      },
    }),
    prisma.study.count({ where }),
  ]).then(async ([items, totalCount]) => {
    const reactionByStudyId = await getTopReactionsByStudyIds(items.map((item) => item.id));

    return {
      items: items.map((item) => ({
        ...item,
        reactions: reactionByStudyId.get(item.id) ?? [],
      })),
      page,
      size,
      totalCount,
    };
  });
}

// 스터디 생성 (POST /studies) — ② 담당, 명세 1.1
function create(data) {
  return prisma.study.create({ data });
}

// 스터디 상세 조회 (GET /studies/:studyId) — ③ 담당, 명세 1.3
// passwordHash 제외 + 공개 영역만 (이름·소개·배경·포인트) — 습관은 ④에서
function getById(studyId) {
  return prisma.study.findUnique({
    where: { id: studyId },
    select: {
      id: true,
      name: true,
      creatorNickname: true,
      description: true,
      backgroundType: true,
      backgroundValue: true,
      pointTotal: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

// 스터디 수정 (PATCH /studies/:studyId) — ③ 담당, 명세 1.4
// 인증(verifyStudyPassword)은 route에서 처리, 여기선 수정할 필드만 apply
function updateById(studyId, data) {
  return prisma.study.update({
    where: { id: studyId },
    data,
    select: {
      id: true,
      name: true,
      creatorNickname: true,
      description: true,
      backgroundType: true,
      backgroundValue: true,
      pointTotal: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

// 스터디 삭제 (DELETE /studies/:studyId) — ③ 담당, 명세 1.5
// 하위 데이터(반응·습관·기록)는 스키마 onDelete: Cascade로 같이 삭제
function deleteById(studyId) {
  return prisma.study.delete({ where: { id: studyId } });
}

// 응원 이모지 등록 (POST /studies/:studyId/reactions) — ③ 담당, 명세 5.6
// (studyId, emoji) Unique → 같은 이모지는 count 증가
function upsertReaction(studyId, emoji) {
  return prisma.studyReaction.upsert({
    where: { studyId_emoji: { studyId, emoji } },
    update: { count: { increment: 1 } },
    create: { studyId, emoji, count: 1 },
  });
}

// 응원 이모지 조회 (GET /studies/:studyId/reactions) — ③ 담당, 명세 5.17
// count 내림차순 이모지 순위 반환 (상위 3개 노출은 프론트에서)
function getReactions(studyId) {
  return prisma.studyReaction.findMany({
    where: { studyId },
    orderBy: { count: 'desc' },
    select: { emoji: true, count: true },
  });
}

export const studyRepository = {
  getStudies,
  create,
  getById,
  updateById,
  deleteById,
  upsertReaction,
  getReactions,
};