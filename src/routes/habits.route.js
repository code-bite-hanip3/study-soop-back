// 습관 라우트 (④ 오늘의 습관 담당)
// ⚠️ 습관은 Study에 종속된 리소스 — 이 라우트는 반드시
//   studiesRouter 안에 nested로 마운트한다: /studies/:studyId/habits
//   (flat /habits는 범위가 전체 스터디로 넓어져 금지 )

//   GET    /                 → 이 스터디의 습관 목록 (req.params.studyId: Public)
//   POST   /                 → 이 스터디의 습관 생성 (verifyStudyPassword — req.params.studyId로 조회)
//   PATCH  /:habitId         → 습관 수정 (verifyStudyPassword)
//   DELETE /:habitId         → 소프트 삭제 (verifyStudyPassword, isActive=false)
import express from 'express';
import { habitsRepository } from '../repositories/habits.repository.js';
import { HTTP_STATUS } from '#constants';
import { BadRequestException, NotFoundException } from '#errors';

export const habitsRouter = express.Router({ mergeParams: true });

// TODO(④ 담당): 아래처럼 구현
// habitsRouter.get('/', async (req, res, next) => { ... });
habitsRouter.get('/', async (req, res, next) => {
  const { studyId } = req.params;
  const habits = await habitsRepository.findAllByStudyId(studyId);

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data: habits,
    message: null,
  });
});

habitsRouter.post('/', async (req, res, next) => {
  //습관을 생성한다는 것 자체가 특정 스터디 내부에서 발생하므로 studyId를 필수로 받아야됨
  const { studyId } = req.params;
  const { name } = req.body ?? {};
  if (!name) {
    throw new BadRequestException('습관 이름은 필수 항목입니다.');
  }

  const newhabit = await habitsRepository.create({ studyId, name });
  //{studyId, name} 이렇게 묶여 있는 이유: repository의 create에서 data 파라미터 하나만 받기 때문에
  // 묶어서 하나로 넘겨줘야 한다.

  return res.status(HTTP_STATUS.CREATED).json({
    success: true,
    data: newhabit,
    message: '습관이 생성되었습니다.',
  });
});

habitsRouter.patch('/:habitId', async (req, res, next) => {
  const { habitId } = req.params;
  const { name } = req.body ?? {};
  if (!name) {
    throw new BadRequestException('습관 이름은 필수 항목입니다.');
  }

  const isExist = await habitsRepository.findById(habitId);
  if (!isExist) {
    throw new NotFoundException('선택하신 습관이 없습니다.');
  }

  const updated = await habitsRepository.update(habitId, { name });

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data: updated,
    message: '습관이 수정되었습니다.',
  });
});

habitsRouter.delete('/:habitId', async (req, res, next) => {
  const { habitId } = req.params;

  const isExist = await habitsRepository.findById(habitId);
  if (!isExist) {
    throw new NotFoundException('선택하신 습관이 없습니다.');
  }

  const removed = await habitsRepository.remove(habitId);

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data: { id: habitId, isActive: false },
    message: '습관이 종료되었습니다.',
  });
});
