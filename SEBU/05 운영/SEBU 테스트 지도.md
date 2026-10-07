---
project: SEBU
type: "reference"
status: "2026-10-07 코드·문서 확인"
created: 2026-09-26
verified: 2026-10-07
tags:
  - sebu
  - sebu/reference
source_ids:
  - "B:build.gradle"
  - "B:.github/workflows/ci.yml"
  - "B:docs/cookie-authentication.md"
  - "B:src/test/java/com/sebu/backend/global/auth/CorsIntegrationTest.java"
  - "B:src/test/java/com/sebu/backend/global/auth/SecurityPublicApiIntegrationTest.java"
  - "B:src/test/java/com/sebu/backend/auth/controller/CookieCsrfIntegrationTest.java"
  - "B:src/test/java/com/sebu/backend/global/auth/ProdContainerHealthcheckIntegrationTest.java"
  - "B:src/test/java/com/sebu/backend/laboratory/LaboratoryReviewCountControllerIntegrationTest.java"
  - "B:ops/deploy/tests/test_deploy.py"
  - "F:package.json"
  - "B:src/test/java/com/sebu/backend/researchfield/category/controller/ResearchFieldCategoryApiIntegrationTest.java"
  - "B:src/test/java/com/sebu/backend/laboratory/controller/LaboratoryResearchFieldDetailsIntegrationTest.java"
  - "B:src/test/java/com/sebu/backend/researchfield/category/repository/ResearchFieldCategoryMySqlMigrationTest.java"
  - "B:src/test/java/com/sebu/backend/crawling/repository/ArtsSportsCatalogMigrationContract.java"
  - "B:src/test/java/com/sebu/backend/crawling/repository/ArtsSportsCatalogMigrationTest.java"
  - "B:src/test/java/com/sebu/backend/crawling/repository/ArtsSportsCatalogMySqlMigrationTest.java"
  - "B:src/test/java/com/sebu/backend/researchfield/category/repository/ArtsSportsResearchFieldMigrationContract.java"
  - "B:src/test/java/com/sebu/backend/researchfield/category/repository/ArtsSportsResearchFieldMigrationTest.java"
  - "B:src/test/java/com/sebu/backend/researchfield/category/repository/ArtsSportsResearchFieldMySqlMigrationTest.java"
---
# SEBU 테스트 지도

기능 변경의 경계에 맞는 테스트를 고르고, 테스트 코드의 존재와 실행 통과를 분리해서 기록한다. **이번 지식 갱신에서는 앱 테스트·학교 로그인·실서버 동작을 실행하지 않았다.**

기준 백엔드 `src/test`에는 이름이 `*Test.java`인 파일 148개가 있다. 파일 수이며 통과한 테스트 케이스 수가 아니다.

| 변경 영역 | 관련 테스트 |
|---|---|
| CORS·공개 API | CorsIntegrationTest, SecurityPublicApiIntegrationTest |
| 쿠키·CSRF·JWT | CookieCsrfIntegrationTest, JwtSecurityIntegrationTest |
| 학교 인증·프로필 | AuthApiIntegrationTest, SejongProfileLoginIntegrationTest |
| 탈퇴·복구 | AccountRecoveryApiIntegrationTest, AccountRecoveryPolicyTest |
| 갱신·탈퇴 경합 | AuthConcurrencyIntegrationTest, AuthConcurrencyMySqlIntegrationTest |
| 북마크 경합 | BookmarkConcurrencyIntegrationTest |
| 후기 수 페이지 조회 | LaboratoryReviewCountControllerIntegrationTest |
| 로봇 parentId·분야 매핑 | ResearchFieldCategoryApiIntegrationTest, LaboratoryResearchFieldDetailsIntegrationTest, ResearchFieldCategoryMySqlMigrationTest |
| 예체능 교수·연구실 V48 | ArtsSportsCatalogMigrationTest, ArtsSportsCatalogMySqlMigrationTest |
| 예체능 연구분야·카테고리 V49 | ArtsSportsResearchFieldMigrationTest, ArtsSportsResearchFieldMySqlMigrationTest |
| 컨테이너 readiness | ProdContainerHealthcheckIntegrationTest |
| 배포 성공·복구·중복 실행 | ops/deploy/tests/test_deploy.py |

이번 구간에는 `www.sebu.kr`의 CORS preflight·CSRF 로그인 경계 검사와 V47~V49의 매핑·데이터 보존 검사가 추가·수정됐다. 예체능 검증은 H2와 MySQL에서 공통 계약을 재사용하며, 정해진 교수·연구실·연구분야 연결과 다른 단과대 데이터의 보존을 검사한다. 테스트 파일 존재와 해당 커밋 CI 통과는 별개다.

## 백엔드 로컬 명령

아래는 실행 예시이며 이번 작업의 실행 이력이 아니다. Java 21을 사용하는 백엔드 저장소에서 실행한다.

```powershell
.\gradlew.bat test -PexcludeDocker --no-daemon --max-workers=1
.\gradlew.bat test --tests '*MySql*' --tests '*BookmarkConcurrencyIntegrationTest' --no-daemon --max-workers=1
```

`excludeDocker`는 MySql 패턴, BookmarkConcurrencyIntegrationTest, ProdContainerHealthcheckIntegrationTest를 제외한다. 두 번째 예시는 Docker가 필요하다. 제외·skipped 결과를 검증 완료로 적지 않는다. 컨테이너 healthcheck 테스트는 두 번째 명령에 포함되지 않으므로 해당 경계를 변경했다면 별도로 실행한다.

CI는 `clean test` 외에 배포 도구 검사, 컨테이너 빌드, MySQL 8.0을 쓰는 prod 이미지 스모크 검사도 정의한다. 실행 성공 여부는 해당 커밋의 Actions 결과에서 확인해야 한다.

## 프론트

최신 package.json에 Vitest·Testing Library 의존성은 있으나 `test` 스크립트는 없다. 의존성이 있다고 테스트 체계가 구성·실행됐다고 단정하지 않는다.

```powershell
npm run lint
npm run build
```

별도 브라우저 확인에서는 쿠키·CSRF, 새로고침 복원, 401/403/429/서버·네트워크 실패 구분, 비로그인 북마크 이동, 목록 캐시 갱신을 확인한다. [[SEBU 변경 검토 목록]]

## 지식 레포

노트 링크·Canvas 참조·원본 존재·기준 해시 검사는 앱 테스트와 별도다. 문서 검증 통과를 서버나 프론트 기능 통과로 기록하지 않는다. 실행 방법과 결과는 [[SEBU 지식 갱신 방법]]에서 확인한다.

<!-- sources:start -->
## 근거 파일

- [백엔드 · build.gradle](https://github.com/greedy-team/SEBU-backend/blob/b6cf2e5eacfe7b076c8f7553e01243b5e3304fed/build.gradle)
- [백엔드 · .github/workflows/ci.yml](https://github.com/greedy-team/SEBU-backend/blob/b6cf2e5eacfe7b076c8f7553e01243b5e3304fed/.github/workflows/ci.yml)
- [백엔드 · docs/cookie-authentication.md](https://github.com/greedy-team/SEBU-backend/blob/b6cf2e5eacfe7b076c8f7553e01243b5e3304fed/docs/cookie-authentication.md)
- [백엔드 · src/test/java/com/sebu/backend/global/auth/CorsIntegrationTest.java](https://github.com/greedy-team/SEBU-backend/blob/b6cf2e5eacfe7b076c8f7553e01243b5e3304fed/src/test/java/com/sebu/backend/global/auth/CorsIntegrationTest.java)
- [백엔드 · src/test/java/com/sebu/backend/global/auth/SecurityPublicApiIntegrationTest.java](https://github.com/greedy-team/SEBU-backend/blob/b6cf2e5eacfe7b076c8f7553e01243b5e3304fed/src/test/java/com/sebu/backend/global/auth/SecurityPublicApiIntegrationTest.java)
- [백엔드 · src/test/java/com/sebu/backend/auth/controller/CookieCsrfIntegrationTest.java](https://github.com/greedy-team/SEBU-backend/blob/b6cf2e5eacfe7b076c8f7553e01243b5e3304fed/src/test/java/com/sebu/backend/auth/controller/CookieCsrfIntegrationTest.java)
- [백엔드 · src/test/java/com/sebu/backend/global/auth/ProdContainerHealthcheckIntegrationTest.java](https://github.com/greedy-team/SEBU-backend/blob/b6cf2e5eacfe7b076c8f7553e01243b5e3304fed/src/test/java/com/sebu/backend/global/auth/ProdContainerHealthcheckIntegrationTest.java)
- [백엔드 · src/test/java/com/sebu/backend/laboratory/LaboratoryReviewCountControllerIntegrationTest.java](https://github.com/greedy-team/SEBU-backend/blob/b6cf2e5eacfe7b076c8f7553e01243b5e3304fed/src/test/java/com/sebu/backend/laboratory/LaboratoryReviewCountControllerIntegrationTest.java)
- [백엔드 · ops/deploy/tests/test_deploy.py](https://github.com/greedy-team/SEBU-backend/blob/b6cf2e5eacfe7b076c8f7553e01243b5e3304fed/ops/deploy/tests/test_deploy.py)
- [프론트 · package.json](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/package.json)
- [백엔드 · src/test/java/com/sebu/backend/researchfield/category/controller/ResearchFieldCategoryApiIntegrationTest.java](https://github.com/greedy-team/SEBU-backend/blob/b6cf2e5eacfe7b076c8f7553e01243b5e3304fed/src/test/java/com/sebu/backend/researchfield/category/controller/ResearchFieldCategoryApiIntegrationTest.java)
- [백엔드 · src/test/java/com/sebu/backend/laboratory/controller/LaboratoryResearchFieldDetailsIntegrationTest.java](https://github.com/greedy-team/SEBU-backend/blob/b6cf2e5eacfe7b076c8f7553e01243b5e3304fed/src/test/java/com/sebu/backend/laboratory/controller/LaboratoryResearchFieldDetailsIntegrationTest.java)
- [백엔드 · src/test/java/com/sebu/backend/researchfield/category/repository/ResearchFieldCategoryMySqlMigrationTest.java](https://github.com/greedy-team/SEBU-backend/blob/b6cf2e5eacfe7b076c8f7553e01243b5e3304fed/src/test/java/com/sebu/backend/researchfield/category/repository/ResearchFieldCategoryMySqlMigrationTest.java)
- [백엔드 · src/test/java/com/sebu/backend/crawling/repository/ArtsSportsCatalogMigrationContract.java](https://github.com/greedy-team/SEBU-backend/blob/b6cf2e5eacfe7b076c8f7553e01243b5e3304fed/src/test/java/com/sebu/backend/crawling/repository/ArtsSportsCatalogMigrationContract.java)
- [백엔드 · src/test/java/com/sebu/backend/crawling/repository/ArtsSportsCatalogMigrationTest.java](https://github.com/greedy-team/SEBU-backend/blob/b6cf2e5eacfe7b076c8f7553e01243b5e3304fed/src/test/java/com/sebu/backend/crawling/repository/ArtsSportsCatalogMigrationTest.java)
- [백엔드 · src/test/java/com/sebu/backend/crawling/repository/ArtsSportsCatalogMySqlMigrationTest.java](https://github.com/greedy-team/SEBU-backend/blob/b6cf2e5eacfe7b076c8f7553e01243b5e3304fed/src/test/java/com/sebu/backend/crawling/repository/ArtsSportsCatalogMySqlMigrationTest.java)
- [백엔드 · src/test/java/com/sebu/backend/researchfield/category/repository/ArtsSportsResearchFieldMigrationContract.java](https://github.com/greedy-team/SEBU-backend/blob/b6cf2e5eacfe7b076c8f7553e01243b5e3304fed/src/test/java/com/sebu/backend/researchfield/category/repository/ArtsSportsResearchFieldMigrationContract.java)
- [백엔드 · src/test/java/com/sebu/backend/researchfield/category/repository/ArtsSportsResearchFieldMigrationTest.java](https://github.com/greedy-team/SEBU-backend/blob/b6cf2e5eacfe7b076c8f7553e01243b5e3304fed/src/test/java/com/sebu/backend/researchfield/category/repository/ArtsSportsResearchFieldMigrationTest.java)
- [백엔드 · src/test/java/com/sebu/backend/researchfield/category/repository/ArtsSportsResearchFieldMySqlMigrationTest.java](https://github.com/greedy-team/SEBU-backend/blob/b6cf2e5eacfe7b076c8f7553e01243b5e3304fed/src/test/java/com/sebu/backend/researchfield/category/repository/ArtsSportsResearchFieldMySqlMigrationTest.java)

기준 커밋은 [[SEBU 저장소와 기준 버전]]에서 확인한다.
<!-- sources:end -->

---
[[SEBU 홈]] · [[SEBU 지식 지도]]
