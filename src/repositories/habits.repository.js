import { prisma } from '#db/prisma.js';

function create(data) {
  return prisma.habit.create({ data });
}

function findById(habitId) {
  return prisma.habit.findUnique({
    where: { id: habitId },
  });
}

function findAllByStudyId(studyId) {
  return prisma.habit.findMany({
    where: { studyId: studyId, isActive: true },
    orderBy: { order: 'asc' },
  });
}
//->Habit의 studyId 속성과 파라미터로 받는 studyId가 같아야됨
// id: studyId 이렇게 되면 habitId = studyId 이렇게 비교하게 됨 (절대 false)

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

export const habitsRepository = {
  create,
  findById,
  findAllByStudyId,
  update,
  remove,
};
