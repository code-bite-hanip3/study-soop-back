// 포인트 이력 라우트 (⑤ 오늘의 집중 담당)

//   GET /    → 포인트 이력 조회  (?studyId)  — 실적 탭의 오늘 포인트 합계는 프론트에서 합산
import express from 'express';
import { pointHistoriesRepository } from '../repositories/point-histories.repository.js';
import { HTTP_STATUS } from '#constants';
import { BadRequestException } from '#errors';
import { success } from '#utils';

export const pointHistoriesRouter = express.Router();

// GET /point-histories?studyId=:id — 포인트 이력 조회 (⑤ 담당) — 명세 5.16
// 조회(GET)는 Public — studyId는 필수 쿼리
pointHistoriesRouter.get('/', async (req, res, next) => {
  try {
    const { studyId } = req.query;
    if (!studyId) {
      throw new BadRequestException('studyId는 필수입니다.');
    }

    const data = await pointHistoriesRepository.findAllByStudyId(studyId);

    return success(res, {
      status: HTTP_STATUS.OK,
      data,
      message: '포인트 이력 조회',
    });
  } catch (error) {
    next(error);
  }
});