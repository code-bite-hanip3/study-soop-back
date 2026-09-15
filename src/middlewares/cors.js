import { isDevelopment, isProduction } from '../config/config.js';

export const cors = (req, res, next) => {
  const whiteList = isDevelopment
    ? ['http://localhost:5173']
    : [
        // 공부의 숲 프론트 배포 도메인 (Netlify)
        'https://hanip3.netlify.app',
      ];

  
  const origin = req.get('origin');
  res.vary('origin');

  
  if (!origin) {
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

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
};
