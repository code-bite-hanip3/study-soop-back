import express from 'express';
import { focusSession } from '#repositories';
import { calculateStatusUpdate, success } from '#utils';
import { checkStatus } from '#middlewares';
import { FOCUS_SESSION_STATUS, HTTP_STATUS } from '#constants';

export const focusSessionsRouter = express.Router({ mergeParams: true });

focusSessionsRouter.get('/', async (req, res) => {
  const studyId = req.body.studyId;
  const data = await focusSession.getSessionList(studyId);

  if (!data) {
    return fail(res, HTTP_STATUS.NOT_FOUND, '스터디 사용자를 찾을 수 없습니다');
  }

  return success(res, {
    status: HTTP_STATUS.OK,
    data: data,
    message: '사용자 총 점수 조회',
  });
});

focusSessionsRouter.post('/', async (req, res) => {
  const studyId = req.body.studyId;
  const data = await focusSession.createSession(studyId);

  return success(res, {
    status: HTTP_STATUS.CREATED,
    data: data,
    message: '새 기록이 추가되었습니다',
  });
});

focusSessionsRouter.patch('/:id', checkStatus, async (req, res) => {
  const status = req.body.status ?? {};
  const id = req.params.id;
  const data = await focusSession.findOne(id);

  if (!data) {
    return fail(res, HTTP_STATUS.NOT_FOUND, '기록을 찾을 수 없습니다');
  }

  if (data.status === FOCUS_SESSION_STATUS.COMPLETED) {
    return fail(res, HTTP_STATUS.CONFLICT, '이미 완성된 기록입니다');
  }

  const newData = calculateStatusUpdate(status, data);

  const updatedData = await focusSession.updateSession(id, newData);

  return success(res, {
    status: HTTP_STATUS.OK,
    data: updatedData,
    message: '기록이 수정되었습니다',
  });
});

focusSessionsRouter.delete('/:id', checkStatus, async (req, res) => {
  const id = req.params.id;
  const status = req.body.status ?? '';

  if (status !== FOCUS_SESSION_STATUS.CANCELLED) {
    return fail(
      res,
      HTTP_STATUS.BAD_REQUEST,
      '상태값은 CANCELLED이어야 합니다',
    );
  }
  const result = await focusSession.deleteSession(id);

  return success(res, {
    status: HTTP_STATUS.NO_CONTENT,
    data: result,
    message: '기록이 삭제되었습니다',
  });
});
