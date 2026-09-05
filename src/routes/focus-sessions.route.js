import express from 'express';
import { focusSession } from '#repositories';
import { BadRequestException, NotFoundException } from '#errors';
import { calculateStatusUpdate } from '#utils';
import { checkStatus } from '#middlewares';
import { HTTP_STATUS } from '#constants';

export const focusSessionsRouter = express.Router({ mergeParams: true });

focusSessionsRouter.get('/:studyId', async (req, res) => {
  const studyId = Number(req.params.studyId);
  const data = await focusSession.getSessionList(studyId);
  if (!data) {
    throw new NotFoundException('스터디 사용자를 찾을 수 없습니다');
  }
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data: data,
    message: '사용자 총 점수 조회',
  });
});

focusSessionsRouter.post('/:studyId', async (req, res) => {
  const studyId = Number(req.params.studyId);
  const data = await focusSession.createSession(studyId);
  return res.status(HTTP_STATUS.CREATED).json({
    success: true,
    data: data,
    message: '새 기록이 추가되었습니다',
  });
});

focusSessionsRouter.patch('/:id', checkStatus, async (req, res) => {
  const status = req.body.status ?? {};
  const id = Number(req.params.id);
  const data = await focusSession.findOne(id);

  if (!data) {
    return res.status(404).json({ message: '기록을 찾을 수 없습니다' });
  }

  if (data.status === 'COMPLETED') {
    return res.status(400).json({ message: '이미 완성된 기록입니다' });
  }

  const newData = calculateStatusUpdate(status, data);

  const updatedData = await focusSession.updateSession(id, newData);
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data: updatedData,
    message: '기록이 수정되었습니다',
  });
});

focusSessionsRouter.delete('/:id', checkStatus, async (req, res) => {
  const id = Number(req.params.id);
  const status = req.body.status ?? '';

  if (status !== 'CANCELLED') {
    throw new BadRequestException('상태값은 CANCELLED이어야 합니다');
  }
  const result = await focusSession.deleteSession(id);
  return res.status(HTTP_STATUS.NO_CONTENT).json({
    success: true,
    data: result,
    message: '기록이 삭제되었습니다',
  });
});
