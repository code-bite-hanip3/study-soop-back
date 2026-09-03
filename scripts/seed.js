import { faker } from '@faker-js/faker';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '#generated/prisma/client.ts';
import { assertSafeSeedTarget, resetBlogData } from './seed-safety.js';

const NUM_TO_CREATE_STUDY = 5;

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const makeStudies = () => ({
  creatorNickname: faker.internet.username(),
  name: `${faker.word.adjective()} ${faker.word.noun()} Room`,
  description: faker.lorem.sentence(5),
  backgroundType: faker.image.urlPicsumPhotos({ width: 200, height: 300 }),
  backgroundValue: faker.color.rgb(),
  passwordHash: faker.internet.password(), // 해시되기 전 비밀번호
  pointTotal: faker.number.int({ min: 0, max: 300 }),
});

const makeStudyReactionEmoji = (studyId) => ({
  emoji: faker.internet.emoji(),
  count: faker.number.int({ min: 1, max: 8 }),
  studyId,
});

const makeHabit = (index, studyId) => ({
  name: faker.git.commitMessage(),
  setOrder: index,
  isActive: faker.datatype.boolean(),
  studyId,
});

const baseDate = new Date();
const oneDay = 24 * 60 * 60 * 1000; // 하루

const dummyDate = Array.from(
  { length: NUM_TO_CREATE_STUDY },
  (_, index) => new Date(baseDate.getTime() - index * oneDay),
);
const makeHabitRecord = (dayOffset, habitId) => {
  const dateKey = dummyDate[dayOffset];
  const isCompleted = faker.datatype.boolean();
  return {
    dateKey,
    isCompleted,
    completedAt: isCompleted ? new Date() : null,
    habitId,
  };
};

// lastResumedAt, startedAt, endedAt 시드에서는 생략
const EARN_AMOUNT = 30;

const makeFocusSession = (studyId) => {
  const durationSeconds = 3000;
  const accumulateSeconds = faker.number.int({ min: 2500, max: 3500 });
  let status;
  let earnedPoint;

  if (accumulateSeconds === 0) {
    status = 'READY';
    earnedPoint = 0;
  } else if (accumulateSeconds >= durationSeconds) {
    status = 'COMPLETED';
    earnedPoint = EARN_AMOUNT;
  } else if (accumulateSeconds < durationSeconds) {
    status = 'PAUSED';
    earnedPoint = 0;
  }

  return {
    durationSeconds,
    accumulateSeconds,
    status,
    studyId,
    earnedPoint,
  };
};

const makePointHistory = (studyId, focusSessionId, status) => {
  if (status !== 'COMPLETED') return null;

  return {
    amount: EARN_AMOUNT,
    type: 'COMPLETED',
    studyId,
    focusSessionId,
  };
};

async function seed(prisma) {
  const studyData = Array.from({ length: NUM_TO_CREATE_STUDY }, () =>
    makeStudies(),
  );

  const studies = await prisma.study.createManyAndReturn({ data: studyData });

  const emojiData = [];
  for (const study of studies) {
    const count = faker.number.int({ min: 1, max: 5 });
    for (let i = 0; i < count; i++) {
      emojiData.push(makeStudyReactionEmoji(study.id));
    }
  }

  await prisma.studyReaction.createMany({
    data: emojiData,
    skipDuplicates: true,
  });

  const habitData = [];
  for (const study of studies) {
    const count = faker.number.int({ min: 1, max: 3 });
    for (let i = 0; i < count; i++) {
      habitData.push(makeHabit(i, study.id));
    }
  }

  const habits = await prisma.habit.createManyAndReturn({ data: habitData });

  const habitRecordData = [];
  for (const habit of habits) {
    const count = faker.number.int({ min: 1, max: 3 });
    for (let i = 0; i < count; i++) {
      habitRecordData.push(makeHabitRecord(i, habit.id));
    }
  }

  await prisma.habitRecord.createMany({ data: habitRecordData });

  const focusSessionData = [];
  for (const study of studies) {
    focusSessionData.push(makeFocusSession(study.id));
  }

  const histories = await prisma.focusSession.createManyAndReturn({
    data: focusSessionData,
  });

  const pointHistoryData = [];
  for (const history of histories) {
    pointHistoryData.push(
      makePointHistory(history.studyId, history.id, history.status),
    );
  }
  await prisma.pointHistory.createMany({
    data: pointHistoryData.filter((h) => h !== null),
  });
}

async function main(prisma) {
  assertSafeSeedTarget({
    databaseUrl: process.env.DATABASE_URL,
    nodeEnv: process.env.NODE_ENV,
    args: process.argv,
  });

  await resetBlogData(prisma);
  await seed(prisma);
}

main(prisma)
  .catch((error) => {
    console.error('시딩 오류:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
