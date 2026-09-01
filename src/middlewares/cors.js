import { isDevelopment, isProduction } from '#config';

export const cors = (req, res, next) => {
  const whiteList = isDevelopment
    ? ['http://localhost:5173']
    : ['https://www.naver.com', 'https://www.google.com'];

  const origin = req.get('Origin');
  res.vary('Origin');

  if (!origin && isDevelopment) {
    return next();
  }

  if (isProduction && !whiteList.includes(origin)) {
    return res.status(403).json({
      success: false,
      message: '허용되지 않은 출처 입니다.',
    });
  }

  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  );
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Headers', 'X-Study-Password');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
};
