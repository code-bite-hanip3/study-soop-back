import { prisma } from '#db/prisma.js';

function create(data) {
  return prisma.habit.create({ data });
}

function findById(habitId) {
  return prisma.habit.findUnique({
    where: { id: habitId },
  });
}

function findAllByStudyId(studyId, dateKey) {
  return prisma.habit.findMany({
    where: { studyId: studyId, isActive: true },
    orderBy: { order: 'asc' },
    include: {
      records: {
        where: { dateKey },
      },
    },
  });
}
//->Habit의 studyId 속성과 파라미터로 받는 studyId가 같아야됨
// id: studyId 이렇게 되면 habitId = studyId 이렇게 비교하게 됨 (절대 false)
//dateKey 추가: 이유 - 오늘의 습관 UI에서 오늘 완료, 미완료된 습관을 구분하기 위해
//habitRecord 필드의 속성 중 하나인 dateKey가 필요하다.

function update(habitId, data) {
  return prisma.habit.update({
    where: { id: habitId },
    data,
  });
}

function remove(habitId) {
  return prisma.habit.update({
    where: { id: habitId },
    data: { isActive: false }, //소프트 삭제, update를 써야됨
  });
} //-> 스키마에 onDelete:Cascade 옵션때문에 진짜 삭제하면 종속된 필드의 데이터도 모두 날라감
//  예를 들어 삭제된 습관의 지난 기록들도 모두 삭제되는 불편함 발생

// 습관 일괄 소프트 삭제 (PATCH /studies/:studyId/habits/batch) — ④ 담당, 명세 5.11
// 같은 스터디 습관만 지우도록 studyId로 범위를 한정한다
function removeMany(studyId, habitIds) {
  return prisma.habit.updateMany({
    where: { id: { in: habitIds }, studyId },
    data: { isActive: false },
  });
}

// 습관 일괄 생성 (PATCH /studies/:studyId/habits/batch) — ④ 담당, 명세 5.11
// 새 습관은 오늘부터 유효 (명세 5.9) — order는 0 기본값
function createMany(studyId, names) {
  return prisma.habit.createMany({
    data: names.map((name) => ({ studyId, name })),
  });
}

export const habitsRepository = {
  create,
  findById,
  findAllByStudyId,
  update,
  remove,
  removeMany,
  createMany,
};
