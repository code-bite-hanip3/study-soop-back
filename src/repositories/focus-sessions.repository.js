import { FOCUS_SESSION_STATUS } from '#constants';
import { prisma } from '#db/prisma.js';

function getSessionPoint(studyId = '126d30dc-bf24-4a65-be40-951fb9d1d205') {
  return prisma.focusSession.aggregate({
    where: {
      studyId,
    },
    _sum: {
      earnedPoint: true,
    },
  });
}

function getSessionList(
  cursorId,
  studyId = '126d30dc-bf24-4a65-be40-951fb9d1d205',
) {
  return prisma.focusSession.findMany({
    where: {
      studyId,
    },
    take: 10,
    ...(cursorId && {
      skip: 1,
      cursor: { id: cursorId },
    }),
    orderBy: { createdAt: 'desc' },
  });
}

function findOneID(id) {
  return prisma.focusSession.findUnique({
    where: {
      id: id,
    },
  });
}

function findOneStudyId(id = '126d30dc-bf24-4a65-be40-951fb9d1d205') {
  return prisma.focusSession.findFirst({
    where: {
      studyId: id,
    },
  });
}

function createSession(studyId = '126d30dc-bf24-4a65-be40-951fb9d1d205') {
  return prisma.focusSession.create({
    data: {
      studyId,
      durationSeconds: 0,
      status: FOCUS_SESSION_STATUS.RUNNING,
      startedAt: new Date(),
    },
  });
}

function updateSession(id, newData) {
  return prisma.focusSession.update({
    where: {
      id: id,
    },
    data: newData,
  });
}

function deleteSession(id) {
  return prisma.focusSession.delete({
    where: {
      id: id,
    },
  });
}

export const focusSession = {
  getSessionPoint,
  createSession,
  updateSession,
  deleteSession,
  findOneID,
  findOneStudyId,
  getSessionList,
};
