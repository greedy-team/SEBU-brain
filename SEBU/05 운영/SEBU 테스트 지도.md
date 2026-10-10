---
project: SEBU
type: "reference"
status: "2026-10-10 V51·운영 모니터링 검증 범위 확인"
created: 2026-09-26
verified: 2026-10-10
tags:
  - sebu
  - sebu/reference
source_ids:
  - "B:ops/deploy/tests/test_catalog_transfer.py"
  - "B:ops/deploy/smoke-catalog-transfer.sh"
  - "B:ops/deploy/smoke-prod.sh"
  - "B:ops/deploy/verify-production-seed.sql"
  - "B:build.gradle"
  - "B:.github/workflows/ci.yml"
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
  - "B:src/test/java/com/sebu/backend/laboratory/repository/PhysicsAstronomyLaboratoryLinksMigrationContract.java"
  - "B:src/test/java/com/sebu/backend/laboratory/repository/PhysicsAstronomyLaboratoryLinksMigrationTest.java"
  - "B:src/test/java/com/sebu/backend/laboratory/repository/PhysicsAstronomyLaboratoryLinksMySqlMigrationTest.java"
  - "B:src/main/resources/db/migration/V51__add_missing_aerospace_laboratory_links.sql"
  - "B:src/test/java/com/sebu/backend/laboratory/repository/AerospaceLaboratoryLinksMigrationContract.java"
  - "B:src/test/java/com/sebu/backend/laboratory/repository/AerospaceLaboratoryLinksMigrationTest.java"
  - "B:src/test/java/com/sebu/backend/laboratory/repository/AerospaceLaboratoryLinksMySqlMigrationTest.java"
  - "B:src/test/resources/aerospace-laboratory-links.csv"
  - "F:vercel.json"
---
# SEBU 테스트 지도

**운영 서버·전체 연구 정보 이관·S3 백업 복원과 공개 API 검증은 완료했고, 실제 학교 로그인과 인증 후 쓰기의 브라우저 검증은 남아 있다.** 기능 변경의 경계에 맞는 테스트를 고르며 코드의 존재, 실행 통과, 운영 확인을 분리해서 기록한다. [[SEBU 운영 준비 검증 기록 - 2026-10-08]] · [[SEBU 운영 배포 완료 기록 - 2026-10-09]]

기준 백엔드 `src/test`에는 이름이 `*Test.java`인 파일 152개가 있다. 파일 수이며 통과한 테스트 케이스 수가 아니다.

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
| 물리천문학과 링크 V50·기존 자료 보존 | PhysicsAstronomyLaboratoryLinksMigrationTest, PhysicsAstronomyLaboratoryLinksMySqlMigrationTest |
| 항공우주 링크 V51·공통 소속·기존 자료 보존 | AerospaceLaboratoryLinksMigrationTest, AerospaceLaboratoryLinksMySqlMigrationTest |
| 컨테이너 readiness | ProdContainerHealthcheckIntegrationTest |
| 배포 성공·복구·중복 실행·개발/운영 채널 | ops/deploy/tests/test_deploy.py |
| 전체 연구 정보 이관·활동 제외·해시·롤백 | ops/deploy/tests/test_catalog_transfer.py, smoke-catalog-transfer.sh |
| 빈 DB 마이그레이션·운영 CORS·기본 데이터 | smoke-prod.sh, verify-production-seed.sql |

이전 10월 7일 검토 구간에는 `www.sebu.kr`의 CORS preflight·CSRF 로그인 경계 검사와 V47~V49의 매핑·데이터 보존 검사가 추가·수정됐다. 예체능 검증은 H2와 MySQL에서 공통 계약을 재사용하며, 정해진 교수·연구실·연구분야 연결과 다른 단과대 데이터의 보존을 검사한다. 테스트 파일 존재와 해당 커밋 CI 통과는 별개다.

## 10월 8일 실행 결과

[PR #94 검증 CI](https://github.com/greedy-team/SEBU-backend/actions/runs/37728649536)는 전체 Java 테스트, Python 60개, 컨테이너·실제 MySQL 검증을 통과했다. 실제 개발 원문은 AWS 내부의 임시 DB에 복원해 11개 테이블 일치와 후기 0건을 확인했고, CI는 별도 합성 자료로 앱/Hibernate/API까지 검사했다. 로컬 Java 클래스 로딩·Docker 환경 문제로 로컬 전체 테스트는 성공 처리하지 않는다.

이후 [PR #95 main CI](https://github.com/greedy-team/SEBU-backend/actions/runs/37748066938)와 운영 배포가 성공했다. 실제 운영 이관의 11개 테이블 해시 일치·제외 활동 0건, 공개 검사 17개 성공, S3 객체 버전 지정 복원의 24개 테이블·35개 외래 키와 원본 보존을 확인했다. 백업 도구 26개 단위 테스트와 같은 정기 백업 서비스의 수동 실행도 통과했다. 다음 예약 시각의 자동 실행 결과와 외부 실패 알림은 이 검증에 포함되지 않는다.

## 10월 9일 링크 보완 검증

V50 전용 테스트는 H2 22개·MySQL 8.0.45 22개, 총 44개가 실패·오류·건너뜀 없이 통과했다. 빈 DB 전체 마이그레이션, V49→V50 업그레이드, 14개 대상 링크, 기존 값·후기·북마크 보존, 잘못된 신원 제외, 재실행 무변경, Hibernate 검증을 포함한다.

[운영 PR CI](https://github.com/greedy-team/SEBU-backend/actions/runs/37886436466)·[개발 PR CI](https://github.com/greedy-team/SEBU-backend/actions/runs/37886474663), 이어 [main CI·이미지 게시](https://github.com/greedy-team/SEBU-backend/actions/runs/37887826434)·[develop CI·이미지 게시](https://github.com/greedy-team/SEBU-backend/actions/runs/37887953157)가 성공했다. 운영 API와 FE `/api`에서 새 링크 14개·전체 622개·물리천문학과 29개·기존 후기 보존을 확인했고, Aside AI에서 김경호 교수 연구실 링크 표시를 확인했다. 실제 로그인·쓰기 E2E나 개발 DB V50 적용까지 검증했다는 뜻은 아니다.

## 10월 10일 항공우주 링크 보완 검증

V51 전용 테스트는 H2 15개·MySQL 8.0.45 15개, 총 30개가 실패·오류·건너뜀 없이 통과했다. 공통 계약과 검수 링크 CSV를 재사용해 빈 DB 전체 마이그레이션·Hibernate 검증, V50→V51 업그레이드, 12개 URL 반영, 기존 URL·신원·소속·연구 분야·후기·북마크 보존, 재실행 무변경을 검사했다.

복수 소속 검사는 교수와 연구실이 **동일한 허용 학과를 공유하는지**를 구분한다. 대표 학과만으로 만족하거나 양쪽 복수 소속으로 만족하는 경우는 허용하며, 한쪽에만 있는 소속·서로 다른 허용 학과·다른 단과대의 동명 학과는 제외한다.

[운영 PR CI](https://github.com/greedy-team/SEBU-backend/actions/runs/37944781116)·[개발 PR CI](https://github.com/greedy-team/SEBU-backend/actions/runs/37944815668)와 병합 후 [main CI·이미지 게시](https://github.com/greedy-team/SEBU-backend/actions/runs/37947280212)·[develop CI·이미지 게시](https://github.com/greedy-team/SEBU-backend/actions/runs/37947319923)가 성공했다. 00:18 KST 운영 API·FE 프록시 각각에서 전체 622개 유지, 대상 12개 URL 일치, 나머지 610개 URL 보존을 확인했다. 표본 화면 검증은 홍성경 교수의 표시와 실제 링크 주소 일치이며 모든 교수 화면·인증 E2E 검증은 아니다. [[SEBU 운영 핫픽스와 데이터 보정]]

## 10월 10일 운영 모니터링 검증

기존 운영 이미지에 `monitoring` 프로필을 활성화하는 도구의 모의 테스트 24개가 통과했다. 운영에서는 인증된 `/actuator/prometheus` 요청 `200`, 인증 없는 요청 `401`, 컨테이너 정상 상태와 공개 조회 API `200`을 확인했다. 애플리케이션 코드나 DB 마이그레이션을 추가한 작업은 아니다.

운영 대시보드 14개 패널의 쿼리 16개가 정상 실행됐고 개발·운영 수집 대상을 분리했다. 실제 운영 수집 `UP`, 장애 알림 `Normal`, 기존 연락처 `sebu-email` 연결 설정을 확인했다. **실제 장애를 발생시키거나 테스트 메일의 도착을 검증하지는 않았다.** 이 대시보드는 서버 지표를 확인하며 접속 사용자 수나 모든 사용자 기능의 성공을 증명하지 않는다. 상세 설정과 검증 범위는 [[SEBU 운영 모니터링 구축 기록 - 2026-10-10]]에 기록한다.

이번 문서 갱신은 위 작업 당시의 실행 기록과 현재 기준 코드를 대조한 것이며, 실제 서버 변경이나 전체 앱 테스트를 다시 수행한 결과가 아니다. V51의 고정 근거는 [[SEBU 항공우주공학과 링크 보완 기록 - 2026-10-10]]에 남긴다.

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

운영 FE의 공개 HTTP 경로는 확인했지만 전체 FE lint·build·Vitest를 이번 문서 갱신에서 다시 실행하지 않았다. 10월 8일 임시 FE PR #176에서 통과했던 검사 결과는 PR #177 되돌림 이후 현행 코드의 통과 근거로 재사용하지 않는다.

FE 담당자의 별도 브라우저 확인에서는 새 세션·기존 로그인 쿠키, CSRF, 새로고침 복원, 401/403/429/서버·네트워크 실패 구분, 비로그인 북마크 복귀, 프로필·후기 쓰기와 목록 캐시 갱신을 확인한다. 공개 URL의 SPA HTML 200은 화면 기능 성공과 구분한다. [[SEBU 변경 검토 목록]]

## 지식 레포

노트 링크·Canvas 참조·원본 존재·기준 해시 검사는 앱 테스트와 별도다. 문서 검증 통과를 서버나 프론트 기능 통과로 기록하지 않는다. 실행 방법과 결과는 [[SEBU 지식 갱신 방법]]에서 확인한다.

## 이전된 상세 문서

- [[SEBU 백엔드 쿠키 인증 계약]]

<!-- sources:start -->
## 근거 파일

- [백엔드 · ops/deploy/tests/test_catalog_transfer.py](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/ops/deploy/tests/test_catalog_transfer.py)
- [백엔드 · ops/deploy/smoke-catalog-transfer.sh](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/ops/deploy/smoke-catalog-transfer.sh)
- [백엔드 · ops/deploy/smoke-prod.sh](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/ops/deploy/smoke-prod.sh)
- [백엔드 · ops/deploy/verify-production-seed.sql](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/ops/deploy/verify-production-seed.sql)
- [백엔드 · build.gradle](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/build.gradle)
- [백엔드 · .github/workflows/ci.yml](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/.github/workflows/ci.yml)
- [백엔드 · src/test/java/com/sebu/backend/global/auth/CorsIntegrationTest.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/test/java/com/sebu/backend/global/auth/CorsIntegrationTest.java)
- [백엔드 · src/test/java/com/sebu/backend/global/auth/SecurityPublicApiIntegrationTest.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/test/java/com/sebu/backend/global/auth/SecurityPublicApiIntegrationTest.java)
- [백엔드 · src/test/java/com/sebu/backend/auth/controller/CookieCsrfIntegrationTest.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/test/java/com/sebu/backend/auth/controller/CookieCsrfIntegrationTest.java)
- [백엔드 · src/test/java/com/sebu/backend/global/auth/ProdContainerHealthcheckIntegrationTest.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/test/java/com/sebu/backend/global/auth/ProdContainerHealthcheckIntegrationTest.java)
- [백엔드 · src/test/java/com/sebu/backend/laboratory/LaboratoryReviewCountControllerIntegrationTest.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/test/java/com/sebu/backend/laboratory/LaboratoryReviewCountControllerIntegrationTest.java)
- [백엔드 · ops/deploy/tests/test_deploy.py](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/ops/deploy/tests/test_deploy.py)
- [프론트 · package.json](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/package.json)
- [백엔드 · src/test/java/com/sebu/backend/researchfield/category/controller/ResearchFieldCategoryApiIntegrationTest.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/test/java/com/sebu/backend/researchfield/category/controller/ResearchFieldCategoryApiIntegrationTest.java)
- [백엔드 · src/test/java/com/sebu/backend/laboratory/controller/LaboratoryResearchFieldDetailsIntegrationTest.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/test/java/com/sebu/backend/laboratory/controller/LaboratoryResearchFieldDetailsIntegrationTest.java)
- [백엔드 · src/test/java/com/sebu/backend/researchfield/category/repository/ResearchFieldCategoryMySqlMigrationTest.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/test/java/com/sebu/backend/researchfield/category/repository/ResearchFieldCategoryMySqlMigrationTest.java)
- [백엔드 · src/test/java/com/sebu/backend/crawling/repository/ArtsSportsCatalogMigrationContract.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/test/java/com/sebu/backend/crawling/repository/ArtsSportsCatalogMigrationContract.java)
- [백엔드 · src/test/java/com/sebu/backend/crawling/repository/ArtsSportsCatalogMigrationTest.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/test/java/com/sebu/backend/crawling/repository/ArtsSportsCatalogMigrationTest.java)
- [백엔드 · src/test/java/com/sebu/backend/crawling/repository/ArtsSportsCatalogMySqlMigrationTest.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/test/java/com/sebu/backend/crawling/repository/ArtsSportsCatalogMySqlMigrationTest.java)
- [백엔드 · src/test/java/com/sebu/backend/researchfield/category/repository/ArtsSportsResearchFieldMigrationContract.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/test/java/com/sebu/backend/researchfield/category/repository/ArtsSportsResearchFieldMigrationContract.java)
- [백엔드 · src/test/java/com/sebu/backend/researchfield/category/repository/ArtsSportsResearchFieldMigrationTest.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/test/java/com/sebu/backend/researchfield/category/repository/ArtsSportsResearchFieldMigrationTest.java)
- [백엔드 · src/test/java/com/sebu/backend/researchfield/category/repository/ArtsSportsResearchFieldMySqlMigrationTest.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/test/java/com/sebu/backend/researchfield/category/repository/ArtsSportsResearchFieldMySqlMigrationTest.java)
- [백엔드 · src/test/java/com/sebu/backend/laboratory/repository/PhysicsAstronomyLaboratoryLinksMigrationContract.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/test/java/com/sebu/backend/laboratory/repository/PhysicsAstronomyLaboratoryLinksMigrationContract.java)
- [백엔드 · src/test/java/com/sebu/backend/laboratory/repository/PhysicsAstronomyLaboratoryLinksMigrationTest.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/test/java/com/sebu/backend/laboratory/repository/PhysicsAstronomyLaboratoryLinksMigrationTest.java)
- [백엔드 · src/test/java/com/sebu/backend/laboratory/repository/PhysicsAstronomyLaboratoryLinksMySqlMigrationTest.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/test/java/com/sebu/backend/laboratory/repository/PhysicsAstronomyLaboratoryLinksMySqlMigrationTest.java)
- [백엔드 · src/main/resources/db/migration/V51__add_missing_aerospace_laboratory_links.sql](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/main/resources/db/migration/V51__add_missing_aerospace_laboratory_links.sql)
- [백엔드 · src/test/java/com/sebu/backend/laboratory/repository/AerospaceLaboratoryLinksMigrationContract.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/test/java/com/sebu/backend/laboratory/repository/AerospaceLaboratoryLinksMigrationContract.java)
- [백엔드 · src/test/java/com/sebu/backend/laboratory/repository/AerospaceLaboratoryLinksMigrationTest.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/test/java/com/sebu/backend/laboratory/repository/AerospaceLaboratoryLinksMigrationTest.java)
- [백엔드 · src/test/java/com/sebu/backend/laboratory/repository/AerospaceLaboratoryLinksMySqlMigrationTest.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/test/java/com/sebu/backend/laboratory/repository/AerospaceLaboratoryLinksMySqlMigrationTest.java)
- [백엔드 · src/test/resources/aerospace-laboratory-links.csv](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/test/resources/aerospace-laboratory-links.csv)
- [프론트 · vercel.json](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/vercel.json)

기준 커밋은 [[SEBU 저장소와 기준 버전]]에서 확인한다.
<!-- sources:end -->

---
[[SEBU 홈]] · [[SEBU 지식 지도]]
