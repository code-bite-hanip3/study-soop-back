import { prisma } from '#db/prisma.js';
import { STUDY_SORT } from '#constants';

// 카드에 노출할 상위 응원 이모지 개수 (명세 5.2 reactions 상위 3개)
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

// 스터디 목록 조회 (GET /studies) — ① 담당, 명세 5.2
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

export const studyRepository = {
  getStudies,
};