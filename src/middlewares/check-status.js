import { FOCUS_SESSION_STATUS } from '#constants';
import { BadRequestException } from '#errors';

export const checkStatus = (req, _res, next) => {
  const status = req.body.status ?? '';
  if (!FOCUS_SESSION_STATUS.includes(status)) {
    throw new BadRequestException('유효하지 않은 상태값입니다');
  }
  next();
};
