// 포인트 이력 리포지토리 (⑤ 오늘의 집중 담당)
import { prisma } from '#db/prisma.js';

// 스터디별 포인트 이력 조회 (GET /point-histories?studyId) — 최신순
// 실적 탭의 "오늘 포인트 합계"는 프론트에서 createdAt 기준으로 합산
function findAllByStudyId(studyId) {
  return prisma.pointHistory.findMany({
    where: { studyId },
    orderBy: { createdAt: 'desc' },
  });
}

export const pointHistoriesRepository = {
  findAllByStudyId,
};