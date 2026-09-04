// PrismaClient 싱글톤 — 공용 코어(보일러플레이트)에서 한 번만 생성합니다.

import { config } from '#config';
import { PrismaClient } from '#generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: config.DATABASE_URL,
});

export const prisma = new PrismaClient({
  adapter,
  omit: { study: { passwordHash: true } },   // 응답에 passwordHash 절대 미출력 (명세 원칙)
});

export const connectDB = async () => {
  await prisma.$connect();
};
