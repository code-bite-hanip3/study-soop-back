// 습관 기록 라우트 (④ 오늘의 습관 / 기록표 담당)

//   GET   /            → 습관 기록 조회 (?studyId&from&to)
//   POST  /            → 최초 체크 생성 (5.18, verifyStudyPassword) { habitId, dateKey, isCompleted, password }
//                        ※ 같은 (habitId, dateKey) 재요청 → @@unique 위반 → 409
//   PATCH /:recordId   → 체크 / 해제 토글 (5.13, verifyStudyPassword) { isCompleted, password }
import express from 'express';
import { habitRecordsRepository } from '../repositories/habitRecords.repository.js';
import { habitsRepository } from '../repositories/habits.repository.js';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '#errors';
import { HTTP_STATUS } from '#constants';

export const habitRecordsRouter = express.Router();

// TODO(④ 담당): 아래처럼 구현
// habitRecordsRouter.get('/', async (req, res, next) => { ... });

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}
const today = getTodayDate();

habitRecordsRouter.post('/', async (req, res, next) => {
  const { habitId } = req.body ?? {};

  //받은 데이터 검증
  if (!habitId) {
    throw new BadRequestException('habitId는 필수 항목입니다.');
  }

  //DB에 습관이 있는지 확인
  const habit = await habitsRepository.findById(habitId);
  if (!habit) {
    throw new NotFoundException('찾는 습관이 없습니다.');
  }

  //습관 기록이 중복 생성되었는지 검증
  const isExist = await habitRecordsRepository.findByHabitandDate(
    habitId,
    today,
  );
  if (isExist) {
    throw new ConflictException('오늘 기록이 이미 존재합니다.');
  }

  const newRecord = await habitRecordsRepository.create({
    habitId,
    dateKey: today,
    isCompleted: true,
  });

  return res.status(HTTP_STATUS.CREATED).json({
    success: true,
    data: newRecord,
    message: '기록이 생성되었습니다',
  });
});

habitRecordsRouter.patch('/:recordId', async (req, res, next) => {
  const { recordId } = req.params;
  const { isCompleted } = req.body ?? {};

  //받은 데이터 검증
  if (typeof isCompleted !== 'boolean') {
    throw new BadRequestException('잘 못된 데이터 타입 입니다.');
  }

  //습관 기록 중복 체크
  const isExist = await habitRecordsRepository.findById(recordId);
  if (!isExist) {
    throw new NotFoundException(
      '습관 기록이 없어요, 오늘의 습관을 완료해주세요.',
    );
  }

  //DB에 있는 habitRecord 정보를 아래로 업데이트 또는 생성
  const updateRecord = await habitRecordsRepository.update(recordId, {isCompleted});

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data: updateRecord,
    message: isCompleted ? '습관을 완료했습니다.' : '습관을 완료해주세요',
  });
});

//습관 기간 조회
habitRecordsRouter.get('/', async (req, res, next) => {
  const { studyId, from, to } = req.query;

  if (!studyId || !from || !to) {
    throw new BadRequestException('studyId, from, to은 필수 항목입니다.');
  }

  const records = await habitRecordsRepository.findAllByStudyandRange(
    studyId,
    from,
    to,
  );
  const data = {
    studyId,
    from,
    to,
    records: records.map((record) => ({
      habitId: record.habitId,
      habitName: record.habit.name,
      dateKey: record.dateKey.toISOString().slice(0, 10),
      isCompleted: record.isCompleted,
    })),
  };

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data,
    message: null,
  });
});
