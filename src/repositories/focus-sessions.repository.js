import { FOCUS_SESSION_STATUS } from '#constants';
import { prisma } from '#db/prisma.js';

function getSessionList(studyId) {
  return prisma.focusSession.aggregate({
    where: {
      studyId: studyId,
    },
    _sum: {
      earnedPoint: true,
    },
  });
}

function createSession(studyId) {
  return prisma.focusSession.create({
    data: {
      studyId: studyId,
      durationSeconds: 0,
      accumulatedSeconds: 0,
      status: FOCUS_SESSION_STATUS.RUNNING,
      earnedPoint: 0,
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

function findOne(id) {
  return prisma.focusSession.findUnique({
    where: {
      id: id,
    },
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
  getSessionList,
  createSession,
  updateSession,
  deleteSession,
  findOne,
};
