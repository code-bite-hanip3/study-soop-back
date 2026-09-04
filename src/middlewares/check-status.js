import { BadRequestException } from '#errors';

const statusList = ['READY', 'RUNNING', 'PAUSED', 'COMPLETED', 'CANCELLED'];

export const checkStatus = (req, _res, next) => {
  const status = req.body.status ?? '';
  if (!statusList.includes(status)) {
    throw new BadRequestException('유효하지 않은 상태값입니다');
  }
  next();
};
