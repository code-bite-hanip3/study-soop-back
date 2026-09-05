import { FOCUS_SESSION_STATUS, HTTP_STATUS } from '#constants';

export const checkStatus = (req, res, next) => {
  const status = req.body.status ?? '';
  if (!FOCUS_SESSION_STATUS.includes(status)) {
    return fail(res, HTTP_STATUS.BAD_REQUEST, '유효하지 않은 상태값입니다');
  }
  next();
};
