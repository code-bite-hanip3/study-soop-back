

## 폴더 구조
```
src/
  server.js            서버 시작점 (Boot: 미들웨어 → 라우트 → 에러핸들러 → listen)
  config/              zod로 환경변수 검증
  db/                  PrismaClient 싱글톤 (adapter-pg + omit)
  constants/           도메인 상수 (세션 상태전이 맵 등)
  middlewares/         cors / logger / error-handler / require-auth (bcrypt 검증 헬퍼)
  utils/               success·fail 응답 헬퍼
  errors/              400/401/403/404/409 예외 클래스 (강사 코드 그대로)
  repositories/        (도메인) Prisma 접근 — 각자 작성
  routes/              (도메인) 각자 라우트 — 뼈대만 제공
prisma/schema.prisma   6개 모델 (Study·Habit·HabitRecord·StudyReaction·FocusSession·PointHistory)
```

## 실행 방법
```bash
# 1) DB 준비 (각자 자신의 PostgreSQL)
#     env/.env.development 의 DATABASE_URL 수정

# 2) 의존성 설치
npm i

# 3) Prisma 설정
npm run prisma:generate
npm run prisma:migrate

# 4) 개발 서버 (포트 30000)
npm run dev
```



## 협업 규칙 (보일러플레이트)
- **공용 코어**(이 폴더): server.js · config · errors · middlewares · utils · constants · prisma 스키마.
  여기는 보일러플레이트 작업자가 만들었고, **합병 시 전원이 이 파일은 되도록 수정하지 마세요.**
- **각 페이지 담당**: 본인 `routes/*.route.js` + `repositories/*` + 프론트 `pages/*`·`api/*`.
- 라우트 등록은 `routes/index.js`에만(공용). 순서: 도메인 → errorHandler.
- 오류는 반드시 `next(error)` 로 넘기고, `errors/` 예외 클래스를 사용하세요.