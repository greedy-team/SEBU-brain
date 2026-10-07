---
project: SEBU
type: "runbook"
status: "명령 안내"
created: 2026-09-26
verified: 2026-09-26
tags:
  - sebu
  - sebu/runbook
source_ids:
  - "B:README.md"
  - "B:build.gradle"
  - "F:package.json"
  - "F:src/main.jsx"
  - "F:vite.config.js"
  - "F:src/api/client.js"
---
# SEBU 로컬 실행

백엔드와 프론트를 각각 실행하고 /api 프록시로 연결한다. 아래는 개발용 안내이며 이번 지식 갱신에서 앱이나 실제 계정 로그인을 실행하지 않았다.

## 폴더 배치 예

```text
workspace/
  SEBU-brain/
  SEBU-backend/
  SEBU-frontend/
```

팀원이 선택한 다른 경로도 가능하다. 지식 갱신 도구의 경로만 sources.local.json에 맞춘다.

## 백엔드

Java 21이 필요하다. 실제 키를 공유 문서에 넣지 않고 백엔드 README의 JWT_SECRET_BASE64 설정 방법을 따른다. 설정 후 백엔드 루트에서 실행한다.

```powershell
.\gradlew.bat bootRun
```

macOS/Linux에서는 `./gradlew bootRun`을 사용한다. 기본 local 프로필은 H2 인메모리이며 API 기본 포트는 8080이다.

- 목록: http://localhost:8080/api/v1/laboratories
- 로컬 Swagger: http://localhost:8080/swagger-ui/index.html

## 프론트

별도 터미널의 프론트 루트에서 PowerShell 예시로 실행한다.

```powershell
$env:VITE_USE_MSW = 'false'
$env:VITE_API_PROXY_TARGET = 'http://localhost:8080'
npm ci
npm run dev
```

실제 접속 주소는 Vite 출력에서 확인한다. local 백엔드 허용 출처와 포트가 맞아야 한다. development에서 VITE_USE_MSW가 false가 아니면 MSW가 시작되므로 실제 API 연결인지 먼저 확인한다.

VITE_API_PROXY_TARGET은 프록시 전달 대상이며 브라우저의 출처·쿠키 정책을 바꾸는 설정은 아니다.

## 로그인·검증

현재 프론트에는 쿠키 인증, /me 복원, CSRF 처리가 구현되어 있다. 구현 존재와 정상 동작 검증은 구분한다. [[SEBU 인증과 CSRF]] · [[SEBU 테스트 지도]]

<!-- sources:start -->
## 근거 파일

- [백엔드 · README.md](https://github.com/greedy-team/SEBU-backend/blob/b6cf2e5eacfe7b076c8f7553e01243b5e3304fed/README.md)
- [백엔드 · build.gradle](https://github.com/greedy-team/SEBU-backend/blob/b6cf2e5eacfe7b076c8f7553e01243b5e3304fed/build.gradle)
- [프론트 · package.json](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/package.json)
- [프론트 · src/main.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/main.jsx)
- [프론트 · vite.config.js](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/vite.config.js)
- [프론트 · src/api/client.js](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/api/client.js)

기준 커밋은 [[SEBU 저장소와 기준 버전]]에서 확인한다.
<!-- sources:end -->

---
[[SEBU 홈]] · [[SEBU 지식 지도]]
