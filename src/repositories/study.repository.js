import { prisma } from "#db/prisma.js";

function create(data) {
  return prisma.study.create({data});
}

export const studyRepository = {
  create
};