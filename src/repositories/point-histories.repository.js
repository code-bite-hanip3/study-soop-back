import { prisma } from '#db/prisma.js';

function getSessionPoint(studyId) {
  return prisma.pointHistory.findFirst({
    where: {
      studyId,
    },
  });
}

export const pointHistoriesRepository = {
  getSessionPoint,
};
