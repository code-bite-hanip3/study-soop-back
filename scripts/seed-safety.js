const DATABASE_NAME = 'study_soop_test';
const RESET_CONFIRMATION = `--allow-reset=${DATABASE_NAME}`;
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

export function assertSafeSeedTarget({ databaseUrl, nodeEnv, args }) {
  let target;
  try {
    target = new URL(databaseUrl);
  } catch {
    throw new Error('DATABASE_URL must be a valid URL');
  }

  const databaseName = decodeURIComponent(target.pathname.slice(1));
  const isPostgres = ['postgresql:', 'postgres:'].includes(target.protocol);
  const isConfirmed = args.includes(RESET_CONFIRMATION);

  if (
    nodeEnv !== 'development' ||
    !isPostgres ||
    !LOCAL_HOSTS.has(target.hostname) ||
    databaseName !== DATABASE_NAME ||
    !isConfirmed
  ) {
    throw new Error('로컬 개발 DB가 아니면 시드 리셋을 거부합니다');
  }

  return true;
}

export function resetStudyData(prisma) {
  return prisma.$transaction([
    prisma.habitRecord.deleteMany(),
    prisma.habit.deleteMany(),
    prisma.studyReaction.deleteMany(),
    prisma.pointHistory.deleteMany(),
    prisma.focusSession.deleteMany(),
    prisma.study.deleteMany(),
  ]);
}
