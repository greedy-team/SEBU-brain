---
project: SEBU
type: "feature"
status: "2026-10-09 코드·문서 확인"
created: 2026-09-26
verified: 2026-10-09
tags:
  - sebu
  - sebu/feature
source_ids:
  - "B:src/main/java/com/sebu/backend/global/auth/SecurityConfiguration.java"
  - "B:src/main/java/com/sebu/backend/global/auth/TrustedOriginFilter.java"
  - "B:src/main/java/com/sebu/backend/auth/config/AuthCsrfProperties.java"
  - "B:src/main/resources/application.yml"
  - "B:src/main/resources/application-local.yml"
  - "B:src/test/java/com/sebu/backend/global/auth/CorsIntegrationTest.java"
  - "B:src/test/java/com/sebu/backend/auth/controller/CookieCsrfIntegrationTest.java"
  - "B:src/main/java/com/sebu/backend/laboratory/controller/LaboratoryController.java"
  - "B:src/main/java/com/sebu/backend/laboratory/repository/LaboratoryRepository.java"
  - "B:src/main/java/com/sebu/backend/global/ratelimit/web/RateLimitRequestPolicyResolver.java"
  - "B:src/main/java/com/sebu/backend/global/ratelimit/service/InMemoryRateLimiter.java"
  - "F:vercel.json"
---
# SEBU 공개 API와 CORS

**공개 API는 로그인 없이 조회하도록 열려 있고, CORS는 공개·인증 API 모두에 적용된다.** 따라서 ‘비로그인에게 보여주려고 도메인 제한을 없앴다’는 설명은 현재 구현과 다르다.

## 서로 다른 세 가지 조건

| 조건 | 확인하는 것 | SEBU의 예 |
|---|---|---|
| 인증 | 요청 사용자가 유효한 로그인 자격을 갖췄는가 | 연구실 조회는 불필요, 북마크 저장은 필요 |
| CORS | 브라우저의 다른 출처 호출을 허용하는가 | `/api/**` 전체에 정확한 출처 허용 목록 |
| CSRF·출처 검증 | 쿠키를 쓰는 변경 요청에 올바른 토큰과 출처가 있는가 | 로그인·북마크·글쓰기의 POST/PUT/PATCH/DELETE |

Origin은 스킴·호스트·포트의 조합이다. CORS와 CSRF가 함께 쓰는 허용 목록의 기본값은 `https://sebu-frontend.vercel.app`, `https://sebu.kr`, `https://www.sebu.kr`이며, local 프로필은 `http://localhost:5173`과 `http://localhost:8080`이다. 새 두 도메인은 PR #90으로 `develop`에 병합됐다. 실제 배포의 설정 덮어쓰기는 별도 확인 대상이다.

허용 여부는 정확한 출처 문자열로 비교한다. `https://preview.sebu.kr`, `http://www.sebu.kr`, `https://sebu.kr.evil.example` 등은 허용 목록에 포함되지 않는다. `CookieCsrfIntegrationTest`에는 세 기본 출처의 쿠키 포함 로그인 사전 요청 허용, CSRF 토큰 없는 로그인 거부, 토큰을 갖춘 로그인 성공과 유사 출처 거부를 확인하는 테스트가 있다. 이번 갱신은 코드 확인이며 해당 테스트를 다시 실행한 결과는 아니다.

**‘세부 사이트에 들어왔다’와 ‘세부에 로그인했다’는 별개다.** 세부 사이트의 비로그인 방문자도 허용된 출처에서 공개 연구실 정보를 볼 수 있다. 북마크·글쓰기에는 로그인 확인이 추가된다. 로그인 API 자체는 기존 로그인 없이 호출하고, 학교 인증·CSRF·출처 검증으로 로그인 절차를 진행한다.

## 외부에서 주소를 직접 열면 목록이 나오는 이유

현재 코드와 `CorsIntegrationTest`가 명시하는 동작은 다음과 같다. 이번 갱신에서는 테스트 실행·실서버 응답을 다시 확인하지 않았다.

| 요청 | 동작 |
|---|---|
| `GET /api/v1/laboratories`, Origin 없음 | 로그인 없이 목록 반환 |
| 허용된 Origin의 공개 GET | CORS 허용 헤더와 함께 반환 |
| 허용되지 않은 다른 Origin의 GET·사전 요청 | CORS 처리에서 403 |
| 허용된 Origin이지만 로그인 쿠키 없는 `GET /api/v1/me` | 인증 401 |
| 허용된 Origin이지만 CSRF 없는 변경 요청 | CSRF 403 |

주소창 직접 조회나 Postman·외부 서버 호출에는 Origin이 없을 수 있다. 공개 GET은 이 이유로 거부하지 않는다. 변경 요청은 다르다. `TrustedOriginFilter`가 Origin을 먼저 확인하고, 없으면 Referer 출처를 확인하며, 둘 다 없거나 신뢰할 수 없으면 거부한다.

CORS는 외부 서버의 데이터 수집을 막는 인증 수단이 아니다. 비브라우저 클라이언트는 Origin을 생략하거나 지정할 수 있다. 허용 출처를 안다는 사실만으로 보호 API의 인증·CSRF를 통과하는 것도 아니다.

최신 FE 설정은 사이트의 상대 `/api` 요청을 `https://api.sebu.kr`로 전달한다. 사용자가 API 주소를 주소창에서 직접 여는 것은 사이트의 JavaScript가 다른 출처로 호출하는 상황과 다르므로, 공개 연구실 목록이 보인다는 사실만으로 CORS가 해제됐다고 판단하지 않는다. 이번 검토에서는 새 실서버 요청을 보내지 않았다.

기본 연구실 API에서 모든 활성 연구실이 나오는 것은 `LaboratoryController`의 전체 목록 계약 때문이다. CORS와 응답 범위는 별도 설정이다. `bookmarked:false`도 비로그인의 증거가 아니라 ‘이 요청 사용자에게 저장된 상태가 아님’을 나타낸다.

## 공개 조회를 유지할지

**제안: 연구실 기본정보 조회는 공개로 유지하고, 개인 정보·저장·작성은 인증으로 관리한다.** 연구실을 먼저 탐색한 뒤 관심이 생길 때 로그인하는 SEBU의 사용 흐름에 맞는 제안이며, 새 팀 의사결정이 확정됐다는 뜻은 아니다.

| 공개 조회의 장점 | 비용과 검토할 점 |
|---|---|
| 가입·로그인 전 바로 탐색 가능 | 수집·재사용을 CORS로 막을 수 없음 |
| 공유받은 정보에 쉽게 접근 | 공개 가능한 필드만 응답해야 함 |
| 학교 인증 장애 중에도 기본 탐색 가능 | 익명 요청의 부하·응답 크기를 관리해야 함 |

현재 요청 제한 코드는 존재하며 인메모리 방식이다. 다중 서버의 전체 한도를 자동으로 공유한다고 가정하지 않는다. 데이터량·트래픽이 커지면 페이지 조회, 검색 방식, 관측 지표와 분산 제한 필요성을 다시 판단한다. 공개 GET도 잘못된 Access 쿠키가 전송되면 JWT 필터에서 401이 날 수 있으므로 클라이언트 오류 처리는 필요하다.

## 팀원에게 설명할 문장

> 공개 API도 CORS는 허용된 프론트 출처로 제한돼 있어. 연구실 조회는 로그인 없이 열어 뒀고 북마크·글쓰기는 로그인이 추가로 필요해. 주소창이나 서버에서의 직접 공개 조회는 가능하고, 그걸 CORS로 완전히 막는 구조는 아니야.

[[SEBU API 지도]] · [[SEBU 인증과 CSRF]] · [[SEBU 연구실 탐색]] · [[SEBU 마이페이지와 북마크]]

## 이전된 상세 문서

- [[SEBU 백엔드 쿠키 인증 계약]]

<!-- sources:start -->
## 근거 파일

- [백엔드 · src/main/java/com/sebu/backend/global/auth/SecurityConfiguration.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/main/java/com/sebu/backend/global/auth/SecurityConfiguration.java)
- [백엔드 · src/main/java/com/sebu/backend/global/auth/TrustedOriginFilter.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/main/java/com/sebu/backend/global/auth/TrustedOriginFilter.java)
- [백엔드 · src/main/java/com/sebu/backend/auth/config/AuthCsrfProperties.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/main/java/com/sebu/backend/auth/config/AuthCsrfProperties.java)
- [백엔드 · src/main/resources/application.yml](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/main/resources/application.yml)
- [백엔드 · src/main/resources/application-local.yml](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/main/resources/application-local.yml)
- [백엔드 · src/test/java/com/sebu/backend/global/auth/CorsIntegrationTest.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/test/java/com/sebu/backend/global/auth/CorsIntegrationTest.java)
- [백엔드 · src/test/java/com/sebu/backend/auth/controller/CookieCsrfIntegrationTest.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/test/java/com/sebu/backend/auth/controller/CookieCsrfIntegrationTest.java)
- [백엔드 · src/main/java/com/sebu/backend/laboratory/controller/LaboratoryController.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/main/java/com/sebu/backend/laboratory/controller/LaboratoryController.java)
- [백엔드 · src/main/java/com/sebu/backend/laboratory/repository/LaboratoryRepository.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/main/java/com/sebu/backend/laboratory/repository/LaboratoryRepository.java)
- [백엔드 · src/main/java/com/sebu/backend/global/ratelimit/web/RateLimitRequestPolicyResolver.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/main/java/com/sebu/backend/global/ratelimit/web/RateLimitRequestPolicyResolver.java)
- [백엔드 · src/main/java/com/sebu/backend/global/ratelimit/service/InMemoryRateLimiter.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/main/java/com/sebu/backend/global/ratelimit/service/InMemoryRateLimiter.java)
- [프론트 · vercel.json](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/vercel.json)

기준 커밋은 [[SEBU 저장소와 기준 버전]]에서 확인한다.
<!-- sources:end -->

---
[[SEBU 홈]] · [[SEBU 지식 지도]]
