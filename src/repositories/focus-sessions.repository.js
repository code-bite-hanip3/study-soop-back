import { FOCUS_SESSION_STATUS } from '#constants';
import { prisma } from '#db/prisma.js';

function getSessionPoint(studyId) {
  return prisma.pointHistory.findFirst({
    where: {
      studyId,
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
      id,
    },
    data: newData,
  });
}

function completeFocusSession(id, studyId, newData) {
  return prisma.$transaction([
    prisma.focusSession.update({
      where: {
        id: id,
      },
      data: newData,
    }),
    prisma.pointHistory.upsert({
      where: { studyId },
      update: {
        amount: {
          increment: newData.earnedPoint,
        },
      },
      create: {
        studyId,
        amount: newData.earnedPoint,
      },
    }),
  ]);
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
  completeFocusSession,
  deleteSession,
  findOneID,
  findOneStudyId,
  getSessionList,
};
