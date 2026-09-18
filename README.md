# 공부의 숲 (Study Forest) — 팀 프로젝트 소개

> 📌 **1줄 압축**: 스터디 관리 플랫폼 "공부의 숲" — 스터디 목록·만들기·습관/집중 기록·응원 이모지·포인트까지 한 팀에서 완성, Supabase—Render—Netlify 3단 배포 —(작성자: 박순창, 2026-09-17)

---

## 1. 팀 이름

**Hanip3**
(팀 협업 문서 링크: `(팀 협업 문서 링크)`

## 2. 팀원 구성

| 이름              | 담당          | 개인 GitHub 링크                    |
| ----------------- | ------------- | ----------------------------------- |
| **이홍균** (팀장) | 스터디 상세   | https://github.com/cycling-lion-cub |
| **임의균**        | 오늘의 습관   | https://github.com/Limug-g          |
| **김륜희**        | 스터디 만들기 | https://github.com/fbsgml1211-stack |
| **김하경**        | 집중 타이머   | https://github.com/Arden-Sol        |
| **박순창**        | 스터디 목록   | https://github.com/Aidenpark87      |

## 3. 프로젝트 소개

여러 명이 함께 **스터디**를 만들고, 정한 **습관**을 지키고, **집중 시간**을 기록하며
팀원끼리 **응원 이모지**를 보내고 **포인트**를 모으는 스터디 관리 플랫폼입니다.

- 백엔드 5개 도메인 REST API · 프론트 5개 페이지 (목록·만들기·상세·습관·집중)
- **Supabase(DB) — Render(백엔드) — Netlify(프론트)** 3단계 배포
- 쓰기 요청은 스터디 비밀번호 **bcrypt 직접 검증** (토큰 없음 — 단순·안전)

**프로젝트 기간**: 2026.09.01 ~ 2026.09.17

## 4. 기술 스택

| 구분      | 사용 기술                                                            |
| --------- | -------------------------------------------------------------------- |
| Frontend  | JavaScript (ESM), React 19, Vite 8, CSS Modules                      |
| Backend   | Express 5.2, Prisma ORM 7.10 (@prisma/adapter-pg), zod 4.4, bcrypt 6 |
| Database  | PostgreSQL (Supabase)                                                |
| 공통 Tool | GitHub, Discord, Notion                                              |
| 배포      | Netlify (프론트) · Render (백엔드)                                   |

## 5. 팀원별 구현 기능 상세

### 5-1. 이홍균 (팀장) — 스터디 상세

- 공용 컴포넌트
  - 공용으로 사용할 Navigation, Frame, Layout 컴포넌트 구현

- 스터디 상세 페이지
  - fetch(GET)를 사용하여 스터디 상세 정보(이모지, 스터디 이름, 소개, 포인트) 표시
  - fetch(GET)를 사용하여 습관 기록표 데이터(습관 리스트, 습관 기록) 표시

- 응원 이모지 반응 기능
  - 추가 버튼을 클릭해 이모지를 선택해서 이모지 카운트를 업데이트
  - 이모지 선택 시 바로 직관적인 애니메이션 처리, DB 업데이트 실패 시 롤백 처리
  - 열림 / 닫힘 시 팝인, 팝아웃 애니메이션 적용 (CSS Keyframe 사용)

- 비밀번호 확인 플로우
  - 수정하기/스터디 삭제하기/오늘의 습관/오늘의 집중 클릭 시 비밀번호 확인 후 검증이 완료되면 각 페이지로 연결

### 5-3. 임의균 — 오늘의 습관

- 공용 컴포넌트 (버튼, 모달)
  - 버튼, 모달 컴포넌트 구현 및 팀 공유
  - 팀원 요청사항 검토 및 수정 반영

- 오늘의 습관 목록 조회 및 로딩 UI 구현 (HabitList.jsx, useHabit.js)
  - useHabit 커스텀 훅을 사용한 습관 목록 조회
  - keyframes를 활용한 로딩 바 자체 구현

- 오늘의 습관 완료 시 토글 기능 구현 (HabitList.jsx)
  - HabitRecord 필드의 Id와 isCompleted 속성을 활용해 토글 조건 분기(post, patch API)
  - new Set을 사용하여 습관 클릭 시 포함되는 habit Id 를 체크하여 중복 확인

- 오늘의 습관 목록 수정 모달창 구현
  - 모달에서 추가, 삭제를 진행하고 수정완료 버튼으로 이를 한번에 BE로 전송
  - BE에서 /batch 엔드포인트의 patch API 추가
  - 습관 목록 개수 제한, 중복 제한(FE, BE), 엔터키로 등록 기능 구현

- 날짜 시간 정보 실시간 렌더링 구현

- 오늘의 습관 진입 시 스터디 이름 연동하여 렌더링, 반응형 css 적용

### 5-4. 김륜희 — 스터디 만들기

- 공용 컴포넌트 ‘Input’
  - 공용으로 사용할 Input 컴포넌트 구현

- ‘스터디 만들기’ 페이지
  - fetch(POST)를 사용하여 스터디생성 API 연동 및 입력 창(닉네임, 스터디 이름, 소개, 배경 선택 옵션, 비밀번호, 비밀번호 확인) 구현

- 비밀번호 확인 modal 컴퍼넌트
  - 스터디 수정, 삭제에 필요한 비밀번호 인증 modal 구현

- ‘수정하기’ 페이지
  - fetch(GET, PATCH)를 사용하여 기존 스터디 정보 조회 및 수정 기능 구현

### 5-5. 김하경 — 집중 타이머

- 공용 컴포넌트
  - 알림 토스트 기능 구현(예시: 비밀번호가 일치하지 않습니다. 다시 입력해주세요.)
  - 총 점수 태그 구현(예시: 87P획득)

- 오늘의 집중 페이지
  - 사용자가 설정한 집중 시간을 기준으로 동작하는 카운트다운 타이머 기능 구현 (시작/일시정지/재개/완료 상태 관리)
  - 타이머 대기 상태에서 1분/5분/10분 단위로 시간을 추가할 수 있는 버튼 구현
  - 집중 세션의 학습 시간을 저장하기 위한 API 연동
  - 커서 기반 페이지네이션으로 목록을 추가 로드하도록 구현

### 5-6. 박순창 — 스터디 목록(List) 페이지 + 공용 컴포넌트 + 배포·문서

#### 목록(List) 페이지 — 백엔드

- **스터디 목록·생성 API 구현** — `GET /studies` (페이지네이션·검색·정렬), `POST /studies`
- 실패 응답 형식 **`{ success: false, message }`** 확립 (팀원 리뷰로 `fail()` 헬퍼 반영)
- 비밀번호 해시(`passwordHash`) 응답 비노출 — 전역 `omit` 적용
- **시드 30장 스크립트** 확장 — 이미지 18종 + 파스텔 3색 12장, 포인트 이력 정합, DB명 `study_forest`

#### 목록(List) 페이지 — 프론트

- 목록 화면 구현 (30장 카드·이미지·파스텔 배경)
- 목업 → **실API 전환** + 정렬 키 매핑
- 최근 조회 **3장 제한 + 가로 스크롤 힌트** — JS `scrollWidth > clientWidth` 감지 방식
- 최근 조회 폭 버그(`width:100%`) · **스터디 카드 배경 통일**(이미지 카드 흰 글씨 + 어두운 그라디언트)
- **로딩 UX** — 스켈레톤 카드 + 나무 마스코트 로딩

#### 백엔드 보강 · 배포

- 습관 nested+batch · point-histories API, **공용 인증 버그**(전역 omit이 해시를 가려 500) 쿼리별 재정의로 해결
- **배포 설정** — Dockerfile 제거·Render Native Node 전환·seed 안전장치(`seed-safety`) 개정
- Supabase **스키마 드리프트 마이그레이션** · Render 배포 · favicon · **SPA 리다이렉트**

#### 설계 · 문서 · 리뷰

- ERD 초안 + 문제 로그 9건 · API 명세서 3차 개정 + 문제 로그 8건 · 보일러플레이트 구축 및 개선 + 문제 로그 8건
- 팀원 PR 리뷰

## 6. 파일 구조

> 📌 기준: GitHub `development` 브랜치 최신 (front `156d53a` · back `940639b`)
> `node_modules/` · `dist/` · `generated/`(Prisma 산출물) · `.DS_Store` · 백엔드 `env/`(gitignored)는 트리에서 제외했습니다.

```text
백엔드 study-soop-back/
├── package.json · package-lock.json        # Express 5.2 · Prisma 7.10 · zod 4.4 · bcrypt 6 등
├── prisma.config.js                        # Prisma CLI 설정 (스키마 경로·adapter)
├── eslint.config.js · jsconfig.json        # 린트 · 경로 자동완성 설정
├── .gitignore · .nvmrc · .prettierrc · .prettierignore
├── README.md
├── prisma/
│   ├── schema.prisma                       # 6개 모델 (Study·Habit·HabitRecord·StudyReaction·FocusSession·PointHistory)
│   └── migrations/
│       ├── migration_lock.toml
│       ├── 20260904084826_init/
│       │   └── migration.sql               # 초기 스키마
│       └── 20260915151912_resolve_drift/
│           └── migration.sql               # 스키마 드리프트 정리
├── scripts/
│   ├── seed.js                             # 개발용 시드
│   └── seed-safety.js                      # seed 안전장치
└── src/
    ├── server.js                           # 서버 시작점 (미들웨어→라우트→에러핸들러→listen)
    ├── config/
    │   └── config.js                       # zod 환경변수 검증 (PORT·DATABASE_URL)
    ├── db/
    │   └── prisma.js                       # PrismaClient 싱글톤
    ├── constants/
    │   ├── http-status.js                  # HTTP 상태 코드 매핑
    │   └── index.js                        # 세션 상태전이 맵 등 도메인 상수
    ├── errors/
    │   ├── index.js                        # 예외 배럴
    │   ├── http-exception.js               # 예외 기본 클래스
    │   ├── bad-request-exception.js        # 400
    │   ├── unauthorized-exception.js       # 401 (인증 실패)
    │   ├── forbidden-exception.js          # 403
    │   ├── not-found-exception.js          # 404
    │   └── conflict-exception.js           # 409
    ├── middlewares/
    │   ├── index.js                        # 미들웨어 배럴
    │   ├── cors.js                         # CORS 허용
    │   ├── logger.js                       # 요청 로깅
    │   ├── error-handler.js                # 전역 에러 → 공통 응답 JSON
    │   ├── require-auth.js                 # bcrypt 비밀번호 검증 (401)
    │   └── check-status.js                 # 세션 진행 상태 체크
    ├── utils/
    │   ├── index.js                        # 유틸 배럴
    │   ├── responses.js                    # success·fail 응답 헬퍼
    │   ├── koreaServerTime.js              # 한국 서버 시간 유틸
    │   └── calculate-status-update.js      # 세션 상태 업데이트 계산
    ├── routes/
    │   ├── index.js                        # 도메인 라우트 등록 → 에러핸들러 연결
    │   ├── studies.route.js                # 스터디 CRUD + 검색·정렬
    │   ├── habits.route.js                 # 습관 CRUD (nested+batch)
    │   ├── habit-records.route.js          # 습관 기록 체크
    │   ├── focus-sessions.route.js         # 집중 세션
    │   └── point-histories.route.js        # 포인트 이력
    └── repositories/
        ├── index.js                        # 레포지토리 배럴
        ├── study.repository.js             # Prisma 스터디 쿼리
        ├── habits.repository.js            # Prisma 습관 쿼리
        ├── habitRecords.repository.js      # Prisma 습관 기록 쿼리
        ├── focus-sessions.repository.js    # Prisma 집중 세션 쿼리
        └── point-histories.repository.js   # Prisma 포인트 쿼리
```

```text
프론트엔드 study-soop-front/
├── package.json · package-lock.json        # React 19 · Vite 8 등
├── index.html                              # 진입 HTML
├── vite.config.js                          # Vite 설정
├── eslint.config.js · jsconfig.json · .prettierrc
├── netlify.toml                            # SPA 리다이렉트
├── .npmrc                                  # legacy-peer-deps (React 19 호환)
├── .env.example · .gitignore
├── README.md
├── public/
│   ├── ic_favicon_study.svg                # 사이트 파비콘
│   └── fonts/
│       ├── EF_jejudoldam(OTF).otf          # 공용 한글 폰트
│       └── EF_jejudoldam(TTF).ttf
└── src/
    ├── main.jsx                            # 부트스트랩 (Provider 감싸기)
    ├── App.jsx                             # 라우팅 정의
    ├── reset.css                           # 전역 리셋
    ├── api/
    │   ├── client.js                       # 공용 fetch + 쓰기 password 자동 병합
    │   ├── studies.js                      # 스터디 API
    │   ├── habits.js                       # 습관 API
    │   ├── habit-records.js                # 습관 기록 API
    │   └── focusSessions.js                # 집중 세션 API
    ├── assets/
    │   ├── logo_desktop.svg · logo_mobile.svg   # 로고
    │   ├── icon_*.svg (16종)                    # UI 아이콘
    │   ├── btn_visibility_on.svg · btn_visibility_off.svg   # 비밀번호 표시 토글
    │   ├── point_chip_imoji.svg · icon_bg_selected.svg
    │   ├── bg/                             # bg01~bg04.png
    │   ├── images/                         # 카드 커버 배경 6장
    │   └── sticker/                        # 이모지 반응 스티커 18종
    ├── contexts/
    │   └── studyAccessContext.js           # 스터디 접근 인증 컨텍스트
    ├── providers/
    │   └── StudyAccessProvider.jsx         # 접근 인증 공급자
    ├── hooks/
    │   ├── useStudyAccess.js               # 비밀번호·접근 상태
    │   ├── useRecentStudies.js             # 최근 조회 3장 관리
    │   ├── usePagination.js                # 목록 페이지네이션
    │   ├── useCountdown.js                 # 집중 타이머 카운트다운
    │   ├── useHabit.js · useHabitTable.js  # 습관 데이터·테이블 상태
    │   ├── useReactions.js                 # 이모지 반응 상태
    │   └── useRealTime.js                  # 실시간 갱신
    ├── types/
    │   └── index.js                        # 공용 상수·타입 정의
    ├── utils/
    │   └── koreaServerTime.js              # 서버 시간 표기 유틸
    ├── styles/
    │   ├── reset.css                       # 초기화
    │   └── global.css                      # 전역 스타일
    ├── components/
    │   ├── index.js                        # 공용 컴포넌트 배럴
    │   ├── Button/
    │   │   ├── BasicButton/                # 기본 버튼
    │   │   ├── CircleButton/               # 원형 버튼
    │   │   ├── NavButton/                  # 내비게이션 버튼
    │   │   └── RecordButton/               # 기록용 버튼
    │   ├── Frame/                          # 공용 프레임 레이아웃
    │   ├── Header/                         # 상단 헤더 (로고·포인트)
    │   ├── Layout/                         # 공용 레이아웃
    │   ├── Input/                          # 입력 필드
    │   ├── Modal/ · PasswordModal/         # 모달 · 비밀번호 모달
    │   ├── Panel/                          # 내용 패널
    │   ├── Point/ · TotalPointChip/        # 포인트 표시 · 총 포인트 칩
    │   ├── ReactionList/                   # 이모지 반응 UI (공용)
    │   └── Toast/                          # 토스트 알림
    └── pages/
        ├── list/                           # 📋 목록 (순창)
        │   ├── index.jsx · Home.module.css
        │   └── components/
        │       ├── StudyCard/ · StudyCard.module.css      # 스터디 카드
        │       ├── StudyCardSkeleton/                    # 로딩 스켈레톤 카드
        │       ├── MascotLoading/                        # 나무 마스코트 로딩
        │       └── SortDropdown/                         # 정렬 드롭다운
        ├── create/                        # ✏️ 만들기 (륜희)
        ├── detail/                        # 🔍 상세 (홍균)
        │   ├── DetailPage.jsx             # 상세 페이지 래퍼
        │   ├── PageHeader.jsx · .module.css   # 스터디 정보 헤더
        │   ├── PageTable.jsx · .module.css    # 스터디 정보 표
        │   ├── StudyReactions.jsx · .module.css # 이모지 반응·실시간
        │   ├── constants/stickers.js      # 스티커 매핑 상수
        │   ├── utils/getSticker.js        # 스티커 이미지 결정 헬퍼
        │   └── mocks/habits.js            # 습관 목록 목업 (잔존)
        ├── edit/                          # 📝 수정
        │   ├── Edit.js · Edit.jsx · Edit.module.css   # 스터디 수정 폼 (비밀번호 검증 후 수정)
        ├── habits/                        # 🌱 습관 (의균)
        │   ├── HabitsPage.jsx · .module.css · index.js
        │   └── components/
        │       ├── HabitList/             # 습관 목록
        │       ├── HabitOpenModal/        # 습관 상세 확인 모달
        │       └── LoadingBar/            # 진척 로딩바
        └── focus/                         # ⏱ 집중 (하경)
            ├── Focus.jsx · .module.css · index.js
            └── RecordList/                # 집중 기록 목록 컴포넌트
```

## 7. 구현 홈페이지

https://hanip3.netlify.app
