import { prisma } from '#db/prisma.js';

function getSessionPoint(studyId) {
  return prisma.pointHistory.findUnique({
    where: {
      studyId,
    },
  });
}

export const pointHistoriesRepository = {
  getSessionPoint,
};
