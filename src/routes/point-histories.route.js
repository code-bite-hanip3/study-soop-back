import express from 'express';
import { HTTP_STATUS } from '#constants';
import { fail, success } from '#utils';
import { focusSession } from '#repositories';
import { pointHistoriesRepository } from '../repositories/point-histories.repository.js';

export const pointHistoriesRouter = express.Router();

pointHistoriesRouter.get('/', async (req, res, next) => {
  try {
    const studyId = req.query.studyId;
    if (!studyId) {
      return fail(res, HTTP_STATUS.BAD_REQUEST, 'studyId가 필요합니다');
    }

    const findUser = await focusSession.findOneStudyId(studyId);

    if (!findUser) {
      return fail(
        res,
        HTTP_STATUS.NOT_FOUND,
        '스터디 사용자를 찾을 수 없습니다',
      );
    }

    const result = await pointHistoriesRepository.getSessionPoint(studyId);

    if (!result) {
      return fail(res, HTTP_STATUS.NOT_FOUND, '총 점수를 불러올 수 없습니다');
    }

    return success(res, {
      status: HTTP_STATUS.OK,
      data: result,
      message: '사용자 총 점수 조회',
    });
  } catch (error) {
    next(error);
  }
});
