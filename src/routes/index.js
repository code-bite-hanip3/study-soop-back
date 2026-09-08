import express from 'express';
import { studiesRouter } from './studies.route.js';

// 도메인 라우트 — 각 페이지 담당자가 자신의 라우트 파일을 만들고 여기서 연결합니다.
// 보일러플레이트에서는 골격(import 주석)만 제공합니다. 사용 시 주석 해제 후 추가하세요.
// import { habitsRouter } from './habits.route.js';
// import { habitRecordsRouter } from './habit-records.route.js';
import { focusSessionsRouter } from './focus-sessions.route.js';
// import { pointHistoriesRouter } from './point-histories.route.js';

export const router = express.Router();

// 기본 라우트 (health-check — 강사 패턴 그대로)
router.get('/health-check', (req, res) => {
  res.status(200).json({
    message: 'hello 공부의 숲!',
    timestamp: new Date().toISOString(),
  });
});

// 하위 라우트 등록 (도메인 완성 후 주석 해제)
router.use('/studies', studiesRouter);
// router.use('/habits', habitsRouter);   // ✗ flat 금지 — 습관은 Study 종속 (명세 5.9·5.10)
// ④ 구현 시: studiesRouter.use('/:studyId/habits', habitsRouter) 로 nested 마운트
// (위 마운트는 studies.route.js 안에 추가해야 함 — habitsRouter import 후)
// router.use('/habit-records', habitRecordsRouter);
router.use('/focus-sessions', focusSessionsRouter);
// router.use('/point-histories', pointHistoriesRouter);
