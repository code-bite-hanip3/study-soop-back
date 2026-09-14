import { FOCUS_SESSION_STATUS } from '#constants';
import { prisma } from '#db/prisma.js';

function getSessionPoint(studyId) {
  return prisma.focusSession.aggregate({
    where: {
      studyId,
    },
    _sum: {
      earnedPoint: true,
    },
  });
}

function getSessionList(cursorId, studyId) {
  return prisma.focusSession.findMany({
    where: {
      studyId,
    },
    take: 10,
    ...(cursorId && {
      skip: 1,
      cursor: { id: cursorId },
    }),
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  });
}

function findOneID(id) {
  return prisma.focusSession.findUnique({
    where: {
      id: id,
    },
  });
}

function findOneStudyId(id) {
  return prisma.focusSession.findFirst({
    where: {
      studyId: id,
    },
  });
}

function createSession(studyId) {
  return prisma.focusSession.create({
    data: {
      studyId,
      durationSeconds: 0,
      status: FOCUS_SESSION_STATUS.RUNNING,
      startedAt: new Date(),
      lastResumedAt: new Date(),
      endedAt: new Date(),
      accumulatedSeconds: 0,
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
