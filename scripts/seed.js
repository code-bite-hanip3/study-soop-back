import { faker } from '@faker-js/faker';
import { PrismaClient } from '#generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';
import { assertSafeSeedTarget, resetStudyData } from './seed-safety.js';

const NUM_STUDIES = 3;

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

const STUDY_BACKGROUNDS = [
  { type: 'COLOR', value: '#DDEED9' },
  { type: 'COLOR', value: '#E3EFE1' },
  { type: 'COLOR', value: '#F3E6BD' },
];

const EMOJIS = ['👍', '🔥', '❤️', '💪', '🎉', '✨', '🙌', '👏'];

const POINTS_PER_10_MINUTES = 1;
const BASE_POINTS = 3;

const makeStudy = (index) => {
  const bg = STUDY_BACKGROUNDS[index % STUDY_BACKGROUNDS.length];
  return {
    creatorNickname: faker.person.firstName(),
    name: `${faker.company.name()} 스터디`,
    description: faker.lorem.sentence(),
    backgroundType: bg.type,
    backgroundValue: bg.value,
  };
};

const makeReaction = (studyId, emoji) => {
  return {
    studyId,
    emoji,
    count: faker.number.int({ min: 5, max: 50 }),
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

const calculateEarnedPoint = (durationSeconds) => {
  const minutes = Math.floor(durationSeconds / 60);
  const tenMinuteBlocks = Math.floor(minutes / 10);
  return BASE_POINTS + tenMinuteBlocks * POINTS_PER_10_MINUTES;
};

const makeFocusSessionCOMPLETED = (studyId) => {
  const durationSeconds = 1500;
  const startedAt = new Date('2026-09-01T10:00:00.000Z');
  const endedAt = new Date(startedAt.getTime() + durationSeconds * 1000);
  return {
    studyId,
    durationSeconds,
    accumulatedSeconds: durationSeconds,
    status: 'COMPLETED',
    lastResumedAt: startedAt,
    startedAt,
    endedAt,
    earnedPoint: calculateEarnedPoint(durationSeconds),
  };
};

const makeFocusSessionPAUSED = (studyId) => {
  const durationSeconds = 1500;
  const accumulatedSeconds = faker.number.int({ min: 600, max: 1200 });
  const startedAt = new Date('2026-09-02T14:00:00.000Z');
  return {
    studyId,
    durationSeconds,
    accumulatedSeconds,
    status: 'PAUSED',
    lastResumedAt: startedAt,
    startedAt,
    endedAt: null,
    earnedPoint: 0,
  };
};

const makePointHistory = (studyId, focusSessionId, amount) => {
  return {
    studyId,
    focusSessionId,
    amount,
    type: 'FOCUS_COMPLETED',
  };
};

const seed = async (prisma) => {
  const passwordHash = await bcrypt.hash('1234', 10);

  const studyData = Array.from({ length: NUM_STUDIES }, (_, i) => ({
    ...makeStudy(i),
    passwordHash,
  }));
  const studies = await prisma.study.createManyAndReturn({ data: studyData });

  const reactionData = [];
  for (const study of studies) {
    const count = faker.number.int({ min: 3, max: 5 });
    const shuffled = faker.helpers.shuffle(EMOJIS);
    for (let i = 0; i < count; i++) {
      reactionData.push(makeReaction(study.id, shuffled[i]));
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

  const baseDate = new Date('2026-09-04');
  const DAY_MS = 24 * 60 * 60 * 1000;
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

  const focusSessionData = studies.map((study, i) => {
    if (i < 2) return makeFocusSessionCOMPLETED(study.id);
    return makeFocusSessionPAUSED(study.id);
  });
  const focusSessions = await prisma.focusSession.createManyAndReturn({
    data: focusSessionData,
  });

  const pointHistoryData = [];
  for (const fs of focusSessions) {
    if (fs.status === 'COMPLETED' && fs.earnedPoint > 0) {
      pointHistoryData.push(
        makePointHistory(fs.studyId, fs.id, fs.earnedPoint),
      );
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
