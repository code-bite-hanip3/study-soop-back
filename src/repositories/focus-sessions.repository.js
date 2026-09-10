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

function getSessionList(studyId) {
  return prisma.focusSession.findMany({
    where: {
      studyId,
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
  getSessionPoint,
  createSession,
  updateSession,
  deleteSession,
  findOne,
  getSessionList,
};
