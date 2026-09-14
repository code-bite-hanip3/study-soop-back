// 습관 라우트 (④ 오늘의 습관 담당)
// ⚠️ 습관 목록·생성·batch는 Study 종속이라 반드시 studiesRouter 안에
//   nested로 마운트한다: /studies/:studyId/habits (flat /habits는 범위가 전체로 넓어져 금지)
//   단, 수정·삭제(PATCH·DELETE /:habitId)는 habitId만으로 식별 가능 (명세 D10·D11) —
//   FE updateHabit이 flat 경로를 쓰므로 habitsFlatRouter로 함께 노출한다.

//   GET    /                 → 이 스터디의 습관 목록 (req.params.studyId: Public) [nested]
//   POST   /                 → 이 스터디의 습관 생성 [nested]
//   PATCH  /batch            → 습관 목록 일괄 저장 (추가·삭제) [nested]
//   PATCH  /:habitId         → 습관 수정 [nested + flat]
//   DELETE /:habitId         → 소프트 삭제 (isActive=false) [nested + flat]
import express from 'express';
import { habitsRepository } from '../repositories/habits.repository.js';
import { HTTP_STATUS } from '#constants';
import { BadRequestException, NotFoundException } from '#errors';
import { getTodayDate } from '../utils/koreaServerTime.js';
import { verifyStudyPassword } from '#middlewares';

export const habitsRouter = express.Router({ mergeParams: true });

// TODO(④ 담당): 아래처럼 구현
// habitsRouter.get('/', async (req, res, next) => { ... });

habitsRouter.get('/', async (req, res, next) => {
  const { studyId } = req.params;
  const today = getTodayDate();
  const habits = await habitsRepository.findAllByStudyId(studyId, today);
  const data = habits.map((habit) => {
    const todayRecord = habit.records[0] ?? null;
    return {
      id: habit.id,
      name: habit.name,
      order: habit.order,
      recordId: todayRecord ? todayRecord.id : null,
      isCompleted: todayRecord ? todayRecord.isCompleted : false,
    };
  });
  //조회되는 habit에 habitRecord의 속성을 더해서 가져오기 위함
  //recordId, isCompleted가 있어야 UI로 습관 완료 토글 기능을 만들 수 있음
  //recordId는 토글을 한 번도 안했을 때 의도적으로 null값을 부여, isCompleted=false 부여
  //토글 체크 시 recordId=값 을 갖고, isCompleted=true 로 변경

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data: { habits: data },
    message: null,
  });
});

habitsRouter.post('/', async (req, res, next) => {
  //습관을 생성한다는 것 자체가 특정 스터디 내부에서 발생하므로 studyId를 필수로 받아야됨
  const { studyId } = req.params;
  await verifyStudyPassword(req);
  const { name } = req.body ?? {};
  if (!name) {
    throw new BadRequestException('습관 이름은 필수 항목입니다.');
  }

  const newHabit = await habitsRepository.create({ studyId, name });
  //{studyId, name} 이렇게 묶여 있는 이유: repository의 create에서 data 파라미터 하나만 받기 때문에
  // 묶어서 하나로 넘겨줘야 한다.

  return res.status(HTTP_STATUS.CREATED).json({
    success: true,
    data: newHabit,
    message: '습관이 생성되었습니다.',
  });
});

// PATCH /batch — 습관 목록 수정(추가·삭제)을 한 번에 저장 (④ 담당, 명세 5.11 부가)
// body: { removeHabit: string[], newHabit: [{ name }] }
// ⚠️ 반드시 '/:habitId' 보다 먼저 등록 — 뒤에 있으면 "batch"를 habitId로 오인
habitsRouter.patch('/batch', async (req, res, next) => {
  try {
    const { studyId } = req.params;
    await verifyStudyPassword(req);
    const { removeHabit = [], newHabit = [] } = req.body ?? {};

    let removedCount = 0;
    if (Array.isArray(removeHabit) && removeHabit.length > 0) {
      const removed = await habitsRepository.removeMany(studyId, removeHabit);
      removedCount = removed.count;
    }

    let createdCount = 0;
    if (Array.isArray(newHabit) && newHabit.length > 0) {
      const names = newHabit.map((item) => item.name).filter(Boolean);
      if (names.length > 0) {
        const created = await habitsRepository.createMany(studyId, names);
        createdCount = created.count;
      }
    }

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { removedCount, createdCount },
      message: '습관 목록이 저장되었습니다.',
    });
  } catch (error) {
    next(error);
  }
});

async function updateHabitById(req, res, next) {
  const { habitId } = req.params;
  const { name } = req.body ?? {};
  if (!name) {
    throw new BadRequestException('습관 이름은 필수 항목입니다.');
  }

  const isExist = await habitsRepository.findById(habitId);
  if (!isExist) {
    throw new NotFoundException('선택하신 습관이 없습니다.');
  }

  // flat 라우트(studyId 없음)에도 대응 — 습관이 소속된 스터디로 인증
  req.params = { ...req.params, studyId: isExist.studyId };
  await verifyStudyPassword(req);

  const updated = await habitsRepository.update(habitId, { name });

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data: updated,
    message: '습관이 수정되었습니다.',
  });
}

async function removeHabitById(req, res, next) {
  const { habitId } = req.params;

  const isExist = await habitsRepository.findById(habitId);
  if (!isExist) {
    throw new NotFoundException('선택하신 습관이 없습니다.');
  }

  // flat 라우트(studyId 없음)에도 대응 — 습관이 소속된 스터디로 인증
  req.params = { ...req.params, studyId: isExist.studyId };
  await verifyStudyPassword(req);

  const removed = await habitsRepository.remove(habitId);

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data: removed,
    message: '습관이 종료되었습니다.',
  });
}

habitsRouter.patch('/:habitId', updateHabitById);
habitsRouter.delete('/:habitId', removeHabitById);

// flat 라우트 — 명세 D10·D11 수정/삭제 (habitId만으로 식별, studyId 불필요)
// 목록(GET)·생성(POST)·batch는 여기에 두지 않음 — flat 누출 방지
export const habitsFlatRouter = express.Router();
habitsFlatRouter.patch('/:habitId', updateHabitById);
habitsFlatRouter.delete('/:habitId', removeHabitById);
