import express from 'express';
import { focusSession } from '#repositories';
import { calculateStatusUpdate, fail, success } from '#utils';
import { checkStatus, requireAuth } from '#middlewares';
import {
  FOCUS_SESSION_STATUS,
  FOCUS_SESSION_TRANSITIONS,
  HTTP_STATUS,
} from '#constants';

export const focusSessionsRouter = express.Router({ mergeParams: true });

focusSessionsRouter.get('/', async (req, res, next) => {
  try {
    const studyId = req.query.studyId;
    if (!studyId) {
      return fail(res, HTTP_STATUS.BAD_REQUEST, 'studyId가 필요합니다');
    }

    const cursorId = req.query.cursorId;
    const findUser = await focusSession.findOneStudyId(studyId);

    if (!findUser) {
      return fail(
        res,
        HTTP_STATUS.NOT_FOUND,
        '스터디 사용자를 찾을 수 없습니다',
      );
    }

    const recordList = await focusSession.getSessionList(cursorId, studyId);

    const nextCursor =
      recordList.length > 0 ? recordList[recordList.length - 1].id : null;

    const data = { nextCursor, recordList };

    return success(res, {
      status: HTTP_STATUS.OK,
      data,
      message: '사용자 목록 조회',
    });
  } catch (error) {
    next(error);
  }
});

focusSessionsRouter.post('/', async (req, res, next) => {
  try {
    await requireAuth(req);
    const studyId = req.body.studyId ?? '';
    if (!studyId) {
      return fail(res, HTTP_STATUS.BAD_REQUEST, 'studyId가 필요합니다');
    }

    const data = await focusSession.createSession(studyId);

    return success(res, {
      status: HTTP_STATUS.CREATED,
      data: data,
      message: '새 기록이 추가되었습니다',
    });
  } catch (error) {
    next(error);
  }
});

focusSessionsRouter.patch('/:id', checkStatus, async (req, res, next) => {
  try {
    await requireAuth(req);
    const id = req.params.id;
    const status = req.body.status ?? '';
    const studyId = req.body.studyId;
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

    if (!FOCUS_SESSION_TRANSITIONS.RUNNING.includes(status)) {
      return fail(res, HTTP_STATUS.BAD_REQUEST, '유효하지 않은 상태값입니다.3');
    }

    const prevRecord = await focusSession.findOneID(id);

    if (!prevRecord) {
      return fail(res, HTTP_STATUS.NOT_FOUND, '기록을 찾을 수 없습니다');
    }

    const newData = calculateStatusUpdate(status, prevRecord);

    let updatedResult;
    let pointHistory;
    if (FOCUS_SESSION_STATUS.COMPLETED === newData.status) {
      [updatedResult, pointHistory] = await focusSession.completeFocusSession(
        id,
        studyId,
        newData,
      );
    } else {
      updatedResult = await focusSession.updateSession(id, newData);
    }

    return success(res, {
      status: HTTP_STATUS.OK,
      data: { updatedResult, pointHistory },
      message: '기록이 수정되었습니다',
    });
  } catch (error) {
    next(error);
  }
});

focusSessionsRouter.delete('/:id', async (req, res, next) => {
  try {
    await requireAuth(req);
    const id = req.params.id;

    const result = await focusSession.deleteSession(id);

    if (!result) return;

    return success(res, {
      status: HTTP_STATUS.OK,
      data: result,
      message: '기록이 삭제되었습니다',
    });
  } catch (error) {
    next(error);
  }
});
