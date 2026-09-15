const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

const getRemoteAllowedHosts = () =>
  new Set(
    (process.env.SEED_REMOTE_ALLOWED_HOSTS ?? '')
      .split(',')
      .map((host) => host.trim())
      .filter(Boolean),
  );

export function assertSafeSeedTarget({ databaseUrl, nodeEnv, args }) {
  let target;
  try {
    target = new URL(databaseUrl);
  } catch {
    throw new Error('DATABASE_URL must be a valid URL');
  }

  const databaseName = decodeURIComponent(target.pathname.slice(1));
  const isPostgres = ['postgresql:', 'postgres:'].includes(target.protocol);
  const isConfirmed = args.includes(`--allow-reset=${databaseName}`);
  const isAllowedHost =
    LOCAL_HOSTS.has(target.hostname) ||
    getRemoteAllowedHosts().has(target.hostname);

  if (
    nodeEnv !== 'development' ||
    !isPostgres ||
    !isAllowedHost ||
    !isConfirmed
  ) {
    throw new Error('로컬 또는 명시 승인된 호스트가 아니면 시드 리셋을 거부합니다');
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
