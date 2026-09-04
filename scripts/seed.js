
import { faker } from '@faker-js/faker';
import { PrismaClient } from '#generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';
import { assertSafeSeedTarget, resetStudyData } from './seed-safety.js';

async function main(prisma) {
  assertSafeSeedTarget({
    databaseUrl: process.env.DATABASE_URL,
    nodeEnv: process.env.NODE_ENV,
    args: process.argv,
  });

  await resetStudyData(prisma);

  const passwordHash = await bcrypt.hash('1234', 10);

  const studies = await prisma.study.createManyAndReturn({
    data: Array.from({ length: 3 }, (_, i) => ({
      creatorNickname: faker.person.firstName(),
      name: `${faker.company.name()} 스터디`,
      description: faker.lorem.sentence(),
      backgroundType: 'COLOR',
      backgroundValue: '#DDEED9',
      passwordHash,
    })),
  });

  for (const study of studies) {
    const habits = await prisma.habit.createManyAndReturn({
      data: Array.from({ length: 5 }, (_, i) => ({
        studyId: study.id,
        name: faker.lorem.word(),
        order: i,
      })),
    });

    for (const habit of habits) {
      await prisma.habitRecord.create({
        data: {
          habitId: habit.id,
          dateKey: '2026-09-01',
          isCompleted: true,
          completedAt: new Date(),
        },
      });
    }
  }

  console.log(`${studies.length}개의 스터디가 생성되었습니다.`);
}

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
