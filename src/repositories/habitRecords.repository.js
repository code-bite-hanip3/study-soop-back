import { prisma } from '#db/prisma.js';

function findByHabitandDate(habitId, dateKey) {
  return prisma.habitRecord.findUnique({
    where: { habitId_dateKey: { habitId, dateKey } },
  });
}
//dateKey_habitId = 스키마에 @@unique([habitId, dateKey])
//유니크 제약이 있어 이를 사용해 prisma에서 자동완성된 id이다.
//같은 날 같은 habitId가 DB에 기록되는 것을 방지해준다.(더블클릭 등의 이유로 발생)

function findById(recordId) {
  return prisma.habitRecord.findUnique({
    where: { id: recordId },
  });
}

function create(data) {
  return prisma.habitRecord.create({ data });
}

function update(recordId, data) {
  return prisma.habitRecord.update({
    where: { id: recordId },
    data,
  });
}

function findAllByStudyandRange(studyId, from, to) {
  return prisma.habitRecord.findMany({
    where: {
      habit: { studyId },  //habit 필드를 통해 studyId로 필터링 해야된다.(habitRecord필드에는 없음)
      dateKey: { gte: new Date(from), lte: new Date(to) }, //gte:이상, lte: 이하
    },
    include: { habit: true },
    orderBy: { dateKey: 'asc' },
  });
}

export const habitRecordsRepository = {
  findAllByStudyandRange,
  findByHabitandDate,
  findById,
  create,
  update,
};
