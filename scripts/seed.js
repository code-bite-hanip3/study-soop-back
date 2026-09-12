import { faker } from '@faker-js/faker';
import { PrismaClient } from '#generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';
import { assertSafeSeedTarget, resetStudyData } from './seed-safety.js';

// mock(study-soop-front 목록 목업 30장)의 내용을 그대로 확정 데이터로 이식
// createdAt = "오늘 - days일" 역산 → 카드의 "N일째 진행 중" 표시·정렬(RECENT/OLDEST)이 목업과 동일
const DAY_MS = 24 * 60 * 60 * 1000;

// 파스텔 카드 3색 — StudyCard.module.css(themeGreen #e3eedd·themeYellow #fbefd3)와
// global.css(--color-blue-light #e0f1f5) 값을 그대로 사용해 화면 색 일치 확인
const PASTEL_COLORS = {
  green: '#E3EEDD',
  yellow: '#FBEFD3',
  blue: '#E0F1F5',
};

// ── mock 30장 이식 데이터 ─────────────────────────────────────────
// backgroundValue: IMAGE = '/images/{thumbnail}.png' (FE가 파일명으로 THUMBNAILS 매핑)
//                  COLOR = 파스텔 hex (FE가 themeColor 키로 변환)
const STUDIES = [
  // 이미지 카드 1~6 (첫 바퀴)
  { name: '밴프 새벽 감성 스터디', description: '매일 아침 산사진 한 장 찍고 공유해요', days: 12, points: 310, backgroundType: 'IMAGE', backgroundValue: '/images/banff.png', reactions: [['👤', 37], ['🔥', 26], ['❤️', 14]] },
  { name: '캘거리 스탬피드 문화 탐방', description: '캐나다 축제 문화를 팀원들과 함께 배워요', days: 25, points: 230, backgroundType: 'IMAGE', backgroundValue: '/images/calgary.png', reactions: [['🚩', 21], ['🔥', 33], ['👤', 18]] },
  { name: '캔모어 산악 트래킹 기록', description: '주말마다 등산로 다녀와 코스 일기를 써요', days: 37, points: 145, backgroundType: 'IMAGE', backgroundValue: '/images/canmore.png', reactions: [['❤️', 42], ['👍', 15], ['👤', 9]] },
  { name: '한강 야경 러닝 크루', description: '퇴근 후 한강에서 5km 함께 달려요', days: 48, points: 375, backgroundType: 'IMAGE', backgroundValue: '/images/hanGang.png', reactions: [['🔥', 51], ['👤', 28], ['❤️', 20]] },
  { name: '보랏빛 캔버스 아트 랩', description: '파스텔 톤 그림을 그리며 감성을 정리해요', days: 63, points: 198, backgroundType: 'IMAGE', backgroundValue: '/images/listBack.png', reactions: [['💬', 24], ['❤️', 36], ['👍', 12]] },
  { name: '샌프란시스코 여행 일본어 회화', description: '여행지에서 바로 쓸 실전 표현을 몰아 익혀요', days: 7, points: 88, backgroundType: 'IMAGE', backgroundValue: '/images/sf.png', reactions: [['👤', 13], ['👍', 19], ['🚩', 7]] },
  // 이미지 카드 7~12 (두 번째 바퀴)
  { name: '산 너머 바다 포토 일기', description: '언덕 위 풍경을 매일 한 컷씩 남겨요', days: 3, points: 62, backgroundType: 'IMAGE', backgroundValue: '/images/banff.png', reactions: [['❤️', 22], ['👤', 11], ['🔥', 8]] },
  { name: '로키 트레인 여행 계획 클럽', description: '철도로 떠나는 캐나다 일주 루트를 설계해요', days: 54, points: 412, backgroundType: 'IMAGE', backgroundValue: '/images/calgary.png', reactions: [['🚩', 30], ['👤', 25], ['🔥', 17]] },
  { name: '해질녘 호수 오로라 크루', description: '오로라 시즌을 대비해 사진 촬영법을 공부해요', days: 66, points: 289, backgroundType: 'IMAGE', backgroundValue: '/images/canmore.png', reactions: [['❤️', 48], ['🔥', 21], ['💬', 12]] },
  { name: '강변 로드 자전거 기록', description: '한강 둔치 자전거 길 스탬프를 하나씩 채워요', days: 19, points: 156, backgroundType: 'IMAGE', backgroundValue: '/images/hanGang.png', reactions: [['👍', 27], ['👤', 14], ['🔥', 10]] },
  { name: '우주 별자리 그림 아틀리에', description: '작은 캔버스 안에 별밤을 그려 담아요', days: 40, points: 233, backgroundType: 'IMAGE', backgroundValue: '/images/listBack.png', reactions: [['❤️', 39], ['💬', 18], ['👍', 16]] },
  { name: '골든게이트 브리지 야경 명소 투어', description: '아름다운 야경 명소를 지도에 하나씩 저장해요', days: 82, points: 344, backgroundType: 'IMAGE', backgroundValue: '/images/sf.png', reactions: [['🚩', 23], ['❤️', 29], ['👤', 20]] },
  // 이미지 카드 13~18 (세 번째 바퀴)
  { name: '친구들과 함께하는 로드트립', description: '산악 도로 여행을 위한 준비물 체크리스트를 공유해요', days: 91, points: 501, backgroundType: 'IMAGE', backgroundValue: '/images/banff.png', reactions: [['👤', 32], ['🔥', 27], ['🚩', 11]] },
  { name: '혼자 떠나는 캐나다 배낭 여행', description: '구글맵으로 빛나는 코스를 직접 짜봐요', days: 8, points: 120, backgroundType: 'IMAGE', backgroundValue: '/images/calgary.png', reactions: [['❤️', 26], ['👍', 13], ['💬', 9]] },
  { name: '반려견과 함께 걷는 산책 일기', description: '두 발보다 네 발이 먼저일 때의 산책 코스 모음', days: 73, points: 267, backgroundType: 'IMAGE', backgroundValue: '/images/canmore.png', reactions: [['👤', 17], ['❤️', 44], ['👍', 21]] },
  { name: '한강 변 피크닉 준비 스터디', description: '돗자리와 샌드위치, 함께 챙기면 두 배 즐거워요', days: 16, points: 94, backgroundType: 'IMAGE', backgroundValue: '/images/hanGang.png', reactions: [['🔥', 15], ['👤', 8], ['❤️', 31]] },
  { name: '파스텔 톤 일상 기록 모임', description: '매일의 소소한 순간을 연한 색으로 남겨요', days: 59, points: 205, backgroundType: 'IMAGE', backgroundValue: '/images/listBack.png', reactions: [['💬', 28], ['❤️', 35], ['👤', 10]] },
  { name: 'SF 지하철 한 줄 여행기', description: '역마다 하나씩, 사진과 문장을 남기는 여행 수첩', days: 44, points: 177, backgroundType: 'IMAGE', backgroundValue: '/images/sf.png', reactions: [['👍', 20], ['🚩', 14], ['❤️', 18]] },
  // 파스텔 카드 19~30 (green/yellow/blue 3색 순환 → blue 4장 추가)
  { name: '파이썬 알고리즘 조각 모음', description: '하루 한 조각씩 자료구조를 쉽게 배워요', days: 5, points: 134, backgroundType: 'COLOR', backgroundValue: PASTEL_COLORS.green, reactions: [['🔥', 19], ['👤', 22], ['❤️', 12]] },
  { name: '아침 30분 영어 회화 스파링', description: '커피 한 잔과 함께 오늘의 주제를 말해봐요', days: 11, points: 98, backgroundType: 'COLOR', backgroundValue: PASTEL_COLORS.yellow, reactions: [['👤', 15], ['👍', 18], ['🔥', 6]] },
  { name: '타입스크립트 타입 마스터반', description: 'any 대신 제네릭으로 이겨내는 법을 연구해요', days: 22, points: 251, backgroundType: 'COLOR', backgroundValue: PASTEL_COLORS.blue, reactions: [['🔥', 45], ['❤️', 24], ['💬', 13]] },
  { name: '책 한 권 완독하기 클럽', description: '한 달에 한 권, 같이 읽고 서평을 나눠요', days: 29, points: 183, backgroundType: 'COLOR', backgroundValue: PASTEL_COLORS.green, reactions: [['❤️', 33], ['💬', 21], ['👤', 9]] },
  { name: '리액트 컴포넌트 설계 연구회', description: '재사용과 관심사 분리를 매주 고민해요', days: 33, points: 298, backgroundType: 'COLOR', backgroundValue: PASTEL_COLORS.yellow, reactions: [['🔥', 36], ['👤', 26], ['👍', 17]] },
  { name: '일본어 왕초보 탈출기', description: '히라가나부터 시작해 드라마로 마무리해요', days: 41, points: 161, backgroundType: 'COLOR', backgroundValue: PASTEL_COLORS.blue, reactions: [['👤', 19], ['🔥', 12], ['❤️', 27]] },
  { name: '늦은 밤 루틴 지키기 반', description: '자는 시간을 약속하고 함께 지켜요', days: 52, points: 217, backgroundType: 'COLOR', backgroundValue: PASTEL_COLORS.green, reactions: [['❤️', 40], ['👤', 12], ['👍', 23]] },
  { name: '매일 20분 홈트 챌린지', description: '런닝머신 없이, 요가매트 하나면 충분해요', days: 61, points: 143, backgroundType: 'COLOR', backgroundValue: PASTEL_COLORS.yellow, reactions: [['🔥', 29], ['👤', 16], ['👍', 11]] },
  { name: 'SQL 쿼리 최적화 실험실', description: '인덱스의 세계에서 응답 시간을 줄여봐요', days: 68, points: 331, backgroundType: 'COLOR', backgroundValue: PASTEL_COLORS.blue, reactions: [['🔥', 24], ['❤️', 19], ['👤', 21]] },
  { name: '클래식 음악 감상 메모', description: '들었던 곡과 감상을 한 줄씩 적어요', days: 76, points: 176, backgroundType: 'COLOR', backgroundValue: PASTEL_COLORS.green, reactions: [['❤️', 37], ['💬', 14], ['👤', 8]] },
  { name: '포트폴리오 한 판 완성반', description: '내 작업을 남에게 보여줄 준비를 같이 해요', days: 84, points: 388, backgroundType: 'COLOR', backgroundValue: PASTEL_COLORS.yellow, reactions: [['🔥', 41], ['👤', 30], ['❤️', 22]] },
  { name: '취미 삼아 조리기능사 도전', description: '플레이팅보다 맛이 먼저인 기록장', days: 95, points: 245, backgroundType: 'COLOR', backgroundValue: PASTEL_COLORS.blue, reactions: [['💬', 25], ['❤️', 28], ['👍', 15]] },
];

const HABIT_NAMES = [
  '미라클모닝 5시 기상',
  '물 2L 마시기',
  '30분 독서',
  '운동 1시간',
  '코딩 10시간',
  '영어 단어 30개',
  '일기 쓰기',
  '명상 10분',
  '아침 식사',
  '스트레칭',
];

const POINTS_PER_10_MINUTES = 1;
const BASE_POINTS = 3;

const calculateEarnedPoint = (durationSeconds) => {
  const minutes = Math.floor(durationSeconds / 60);
  const tenMinuteBlocks = Math.floor(minutes / 10);
  return BASE_POINTS + tenMinuteBlocks * POINTS_PER_10_MINUTES;
};

// mock points와 pointTotal을 일치시키되 "pointTotal = 포인트 이력 합계" 규칙도 유지.
// 완료 세션 earnedPoint + 나머지를 ADJUSTMENT 이력으로 보정해 합계 = mock points.
const makePointHistory = (studyId, focusSessionId, amount, type) => {
  return {
    studyId,
    focusSessionId,
    amount,
    type,
  };
};

const makeHabit = (studyId, name, order) => {
  return {
    studyId,
    name,
    order,
    isActive: true,
  };
};

const makeHabitRecord = (habitId, dateKey) => {
  const isCompleted = faker.number.int({ min: 1, max: 10 }) <= 7;
  return {
    habitId,
    dateKey,
    isCompleted,
    completedAt: isCompleted ? new Date() : null,
  };
};

const seed = async (prisma) => {
  const passwordHash = await bcrypt.hash('1234', 10);

  const now = Date.now();
  const studyData = STUDIES.map((study) => ({
    creatorNickname: faker.person.firstName(),
    name: study.name,
    description: study.description,
    backgroundType: study.backgroundType,
    backgroundValue: study.backgroundValue,
    createdAt: new Date(now - study.days * DAY_MS),
    passwordHash,
  }));
  const studies = await prisma.study.createManyAndReturn({ data: studyData });

  const reactionData = [];
  for (const [index, study] of studies.entries()) {
    for (const [emoji, count] of STUDIES[index].reactions) {
      reactionData.push({ studyId: study.id, emoji, count });
    }
  }
  await prisma.studyReaction.createMany({ data: reactionData });

  const habitData = [];
  for (const study of studies) {
    const count = faker.number.int({ min: 3, max: 5 });
    const shuffled = faker.helpers.shuffle(HABIT_NAMES);
    for (let i = 0; i < count; i++) {
      habitData.push(makeHabit(study.id, shuffled[i], i));
    }
  }
  const habits = await prisma.habit.createManyAndReturn({ data: habitData });

  const baseDate = new Date();
  const recentDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(baseDate.getTime() - i * DAY_MS);
    return d.toISOString().slice(0, 10);
  });

  const recordData = [];
  const seenRecords = new Set();
  for (const habit of habits) {
    const recordCount = faker.number.int({ min: 2, max: 5 });
    const shuffledDates = faker.helpers.shuffle(recentDates);
    for (let i = 0; i < recordCount; i++) {
      const dateKey = shuffledDates[i];
      const key = `${habit.id}_${dateKey}`;
      if (!seenRecords.has(key)) {
        seenRecords.add(key);
        recordData.push(makeHabitRecord(habit.id, dateKey));
      }
    }
  }
  await prisma.habitRecord.createMany({ data: recordData });

  // 각 스터디마다 완료 집중 세션 1개 (포인트 표시용 + 이력 정합성)
  const COMPLETED_DURATION_MINUTES = [
    25, 40, 60, 90, 10, 50, 30, 75, 20, 100, 45, 15,
    35, 55, 80, 42, 70, 65, 48, 28, 58, 88, 95, 52,
    24, 38, 66, 74, 12, 33,
  ];
  const focusSessionData = studies.map((study, index) => {
    const durationSeconds = COMPLETED_DURATION_MINUTES[index] * 60;
    const startedAt = new Date(now - STUDIES[index].days * DAY_MS);
    const endedAt = new Date(startedAt.getTime() + durationSeconds * 1000);
    return {
      studyId: study.id,
      durationSeconds,
      accumulatedSeconds: durationSeconds,
      status: 'COMPLETED',
      lastResumedAt: startedAt,
      startedAt,
      endedAt,
      earnedPoint: calculateEarnedPoint(durationSeconds),
    };
  });
  const focusSessions = await prisma.focusSession.createManyAndReturn({
    data: focusSessionData,
  });

  // 포인트 이력: 완료 세션 earnedPoint + (mock points - earned) ADJUSTMENT 보정 → 총합 = mock points
  const pointHistoryData = [];
  for (const [index, focusSession] of focusSessions.entries()) {
    const mockPoints = STUDIES[index].points;
    const earned = focusSession.earnedPoint;
    pointHistoryData.push(makePointHistory(focusSession.studyId, focusSession.id, earned, 'FOCUS_COMPLETED'));
    if (mockPoints > earned) {
      pointHistoryData.push(makePointHistory(focusSession.studyId, focusSession.id, mockPoints - earned, 'ADJUSTMENT'));
    }
  }
  await prisma.pointHistory.createMany({ data: pointHistoryData });

  for (const study of studies) {
    const total = pointHistoryData
      .filter((h) => h.studyId === study.id)
      .reduce((sum, h) => sum + h.amount, 0);
    await prisma.study.update({
      where: { id: study.id },
      data: { pointTotal: total },
    });
  }

  return {
    studyCount: studies.length,
    reactionCount: reactionData.length,
    habitCount: habits.length,
    recordCount: recordData.length,
    focusSessionCount: focusSessions.length,
    pointHistoryCount: pointHistoryData.length,
  };
};

const main = async (prisma) => {
  assertSafeSeedTarget({
    databaseUrl: process.env.DATABASE_URL,
    nodeEnv: process.env.NODE_ENV,
    args: process.argv,
  });

  await resetStudyData(prisma);
  const result = await seed(prisma);

  console.log(`${result.studyCount}개의 스터디가 생성되었습니다.`);
  console.log(`${result.reactionCount}개의 응원 이모지가 생성되었습니다.`);
  console.log(`${result.habitCount}개의 습관이 생성되었습니다.`);
  console.log(`${result.recordCount}개의 습관 기록이 생성되었습니다.`);
  console.log(`${result.focusSessionCount}개의 집중 세션이 생성되었습니다.`);
  console.log(`${result.pointHistoryCount}개의 포인트 이력이 생성되었습니다.`);
};

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

main(prisma)
  .catch((error) => {
    console.error('시딩 오류:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });