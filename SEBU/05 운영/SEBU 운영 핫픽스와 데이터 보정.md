---
project: SEBU
type: "runbook"
status: "V50·V51 운영 반영 사례와 절차 확인"
created: 2026-10-09
verified: 2026-10-10
tags:
  - sebu
  - sebu/runbook
source_ids:
  - "B:.github/workflows/ci.yml"
  - "B:ops/deploy/deploy.py"
  - "B:src/main/resources/db/migration/V50__add_missing_physics_astronomy_laboratory_links.sql"
  - "B:src/main/java/com/sebu/backend/laboratory/domain/Laboratory.java"
  - "B:src/test/java/com/sebu/backend/laboratory/repository/PhysicsAstronomyLaboratoryLinksMigrationContract.java"
  - "B:src/test/java/com/sebu/backend/laboratory/repository/PhysicsAstronomyLaboratoryLinksMigrationTest.java"
  - "B:src/test/java/com/sebu/backend/laboratory/repository/PhysicsAstronomyLaboratoryLinksMySqlMigrationTest.java"
  - "B:src/main/resources/db/migration/V51__add_missing_aerospace_laboratory_links.sql"
  - "B:src/test/java/com/sebu/backend/laboratory/repository/AerospaceLaboratoryLinksMigrationContract.java"
  - "B:src/test/java/com/sebu/backend/laboratory/repository/AerospaceLaboratoryLinksMigrationTest.java"
  - "B:src/test/java/com/sebu/backend/laboratory/repository/AerospaceLaboratoryLinksMySqlMigrationTest.java"
  - "B:src/test/resources/aerospace-laboratory-links.csv"
---
# SEBU 운영 핫픽스와 데이터 보정

**운영의 작은 오류는 현재 `main`에서 필요한 변경만 분리해 검증하고, 기존 배포 경로로 적용한 뒤 `develop`에도 같은 변경을 반영한다.** 연구실 링크처럼 DB 값의 보정이 필요할 때는 기존 행과 연결을 유지하는 새 Flyway 마이그레이션으로 변경 범위를 명시한다. 실제 사례는 [[SEBU 물리천문학과 링크 보완 기록 - 2026-10-09]]와 [[SEBU 항공우주공학과 링크 보완 기록 - 2026-10-10]]에 정리했다.

이 문서는 V50·V51 사례에서 재사용할 절차다. 각 환경의 실제 배포 상태는 별도 확인하며, 운영 단계가 끝나면 결과를 브리핑하고 사용자의 다음 진행 지시를 따른다.

## 먼저 변경 대상을 구분한다

| 변경 대상 | 관리 위치와 반영 방식 | 확인할 점 |
|---|---|---|
| API 처리·검증·응답 같은 애플리케이션 동작 | 소스 코드 수정 → 테스트 → 이미지 빌드·배포 | 코드가 배포돼야 동작이 바뀜 |
| 테이블·컬럼·제약 조건 | 새 Flyway 마이그레이션 → 대상 DB 적용 | 기존 앱과의 호환성, 데이터 보존, 적용 이력 |
| 검증된 연구실 홈페이지 등 연구 정보 | DB 데이터. 이번 사례는 새 Flyway SQL로 조건부 보정 | 같은 코드라도 개발·운영의 기존 값과 대상 행이 다를 수 있음 |
| 회원·후기·북마크 등 사용자 활동 | 각 환경의 DB에서 발생·보존 | 개발 DB 전체 복사나 연구실 재생성으로 덮어쓰지 않음 |
| 최초 운영 연구 정보 이관 | 별도 이관 절차 | [[SEBU 운영 전환과 연구 정보 이관]] 참조. 일상적인 핫픽스와 구분 |

Git 머지는 소스 변경을 합치는 작업이다. **`main`과 `develop`의 코드가 같아져도 두 DB가 복사되거나 동기화되지는 않는다.** 이미지에 포함된 새 마이그레이션은 각 환경에 실제 배포될 때 해당 DB의 Flyway 이력과 현재 데이터에 따라 적용된다.

## 핫픽스의 순서

1. **운영 기준과 범위를 고정한다.** 현재 `main` 커밋, 배포된 이미지, 증상과 영향 대상을 확인한다. 변경 전 API 값·대상 수·보존할 식별자와 관련 데이터를 기록한다.
2. **로컬 작업 저장소에서 `main` 기반 브랜치를 만든다.** 예시는 `codex/hotfix-...`다. 운영 서버 안에서 브랜치를 만들어 직접 코드를 고치는 절차가 아니다. `develop`에 미출시 기능이 있다면 그 전체를 운영 핫픽스에 섞지 않는다.
3. **필요한 수정과 검증을 준비한다.** DB 보정이면 새 버전의 Flyway 파일을 추가하고 정확한 대상 조건과 보존 조건을 테스트한다. 기존에 적용된 SQL·Java 마이그레이션은 수정하지 않는다.
4. **`main` PR을 검토하고 CI를 통과시킨다.** PR 검사 성공과 머지는 배포 전 검증이다. 병합 후 해당 커밋의 push CI와 이미지 게시 결과까지 확인한다.
5. **기존 운영 배포 경로와 실제 결과를 확인한다.** 서버가 새 이미지를 적용했는지, Flyway 이력이 정상인지, 공개 API와 서비스 화면이 기대대로 바뀌었는지를 구분해 확인한다. 이미지 게시 성공만으로 운영 반영을 완료 처리하지 않는다.
6. **`develop`에도 동일한 변경을 반영한다.** 후속 기능 출시에서 핫픽스가 빠지지 않도록 별도 PR로 반영한다. 같은 Flyway 버전은 동일한 원본 파일과 체크섬을 유지한다. 개발 이미지 게시와 개발 DB 적용도 별도로 구분한다.

2026-10-09에는 `main` 병합 후 운영 배포 확인과 `develop` CI·이미지 게시를 병행했고 모두 성공했다. 이는 당시 실행 순서이며, `develop` 병합이 운영 검증을 대신했다는 뜻은 아니다. 개발 서버를 별도로 시작하지 않았으므로 개발 DB의 V50 적용 완료로 기록하지 않는다.

## 기존 연구실을 보정하는 기준

연구실의 ID는 후기·북마크·연구 분야 연결의 기준이다. 링크 하나를 고치려고 연구실을 삭제 후 재생성하면 기존 연결을 잃을 수 있으므로 해당 행을 유지한다. 환경마다 숫자 ID가 다를 수 있어, V50은 숫자 ID를 고정하지 않고 교수명·이메일·단과대·학과·연구실명을 함께 대조한다.

V50의 조건과 변경 범위는 다음과 같다.

| 항목 | V50 동작 |
|---|---|
| 대상 신원 | 교수명·이메일, 자연과학대학·물리천문학과, 연구실명 모두 일치 |
| 대상 상태 | `deleted_at IS NULL`인 연구실이며 `website_url IS NULL` |
| 변경 컬럼 | `website_url`, `website_url_source`, `updated_at` |
| 링크 출처 | `MANUAL`로 기록. 현재 `Laboratory`의 크롤링 승격 로직은 이 값을 보존 |
| 기존 값 | 이미 URL이 있거나 이후 다른 URL이 등록된 행은 보존 |
| 연관 데이터 | 연구실 ID와 그 밖의 컬럼, 교수·소속·연구 분야·후기·북마크 연결 유지 |
| 대상 없음 | 새 교수나 연구실을 만들지 않음 |
| 다시 실행 | URL이 이미 채워진 행은 갱신하지 않아 수정 시각도 바뀌지 않음 |

이 조건은 **누락값 보완**에 적합하다. 이미 잘못된 값이 들어 있는 경우에는 변경 전 값을 조건으로 대조하는 등 별도 설계가 필요하다. 미확정 링크는 추정해서 입력하지 않고 보류 사유를 남긴다. 공식 개인 교수 홈페이지, 독립 연구실 홈페이지, 외부 연구실 프로필도 구분해 기록한다.

적용이 끝난 마이그레이션에서 주소를 바꾸지 않는다. 이후 주소가 잘못됐거나 변경됐다면 새 마이그레이션으로 보정해 어떤 변경이 언제 적용됐는지 추적할 수 있게 한다.

## V51 사례: 대표 학과와 복수 소속을 함께 확인한다

항공우주 관련 3개 학과의 누락 링크를 보완할 때는 V50의 SQL을 수정하지 않고 새 V51을 추가했다. 공식 교수 페이지에서 확인한 링크 12개만 포함했으며, URL이 없던 다른 교수의 링크는 추정하지 않았다. 공식 페이지의 홈페이지가 개인 교수 페이지인 경우도 있어 모든 링크를 독립 연구실 사이트로 단정하지 않는다.

V51에서 추가로 주의할 조건은 **교수와 연구실의 공통 소속**이다. 교수별 허용 학과 안에서 교수·연구실이 같은 학과 ID를 공유해야 하며, 각각 대표 학과 또는 복수 소속 테이블로 이를 만족할 수 있다. 공과대학이 아닌 동명 학과, 교수 쪽에만 있는 소속, 양쪽에 공통으로 존재하지 않는 소속은 보정 대상이 아니다. 숫자 ID는 고정하지 않는다.

변경 컬럼·NULL 조건·`MANUAL` 출처·기존 URL과 사용자 활동 보존 원칙은 V50과 같다. 이번 변경은 SQL 1개와 공통 계약·H2·MySQL 테스트 3개, 검수 링크 CSV 1개를 추가했으며 서비스 로직과 API 계약은 수정하지 않았다.

[운영 PR #98](https://github.com/greedy-team/SEBU-backend/pull/98)과 [개발 PR #99](https://github.com/greedy-team/SEBU-backend/pull/99)는 병합됐고 각각의 push CI·이미지 게시도 성공했다. 2026-10-10 00:18 KST 운영 API와 FE 프록시에서 전체 622개를 유지한 채 대상 URL 12개 반영, 나머지 610개 URL 보존을 확인했다. Aside에서는 홍성경 교수 상세 화면의 표시와 실제 링크 주소가 일치함을 확인했다. 이 기록은 전체 화면·로그인·쓰기 기능이나 개발 DB V51 적용 확인으로 확대하지 않는다. [[SEBU 테스트 지도]]

## 검증과 배포 완료를 구분한다

| 확인 단계 | 알 수 있는 것 | 별도로 확인할 것 |
|---|---|---|
| H2·MySQL 마이그레이션 테스트 | 대상·비대상 구분, 데이터 보존, 재실행, 스키마 호환성 | 실제 운영 데이터와 이미지 적용 |
| PR CI | 해당 PR 코드의 테스트·빌드·이미지 검사 결과 | 병합 커밋의 게시·운영 적용 |
| main push CI·이미지 게시 | 운영 채널 이미지가 검증·게시됨 | EC2가 해당 이미지를 실제 사용 중인지 |
| 서버·Flyway 확인 | 이미지 교체, DB 적용 이력, readiness | 사용자에게 보이는 API·화면 결과 |
| 운영 API·FE 프록시 API 비교 | 실제 응답의 값·식별자·건수 일치 | 상세 화면의 링크 표시와 사용자 동작 |
| Aside에서 실제 화면 확인 | 사용자가 보는 화면의 결과 | 확인하지 않은 다른 기능 전체 |

V50의 테스트는 14개 대상 각각의 보정과 후기·북마크·연구 분야 보존, 기존 URL 보존, 삭제된 행 제외, 신원·소속·연구실명 불일치 제외, 빈 DB 전체 마이그레이션과 Hibernate 검증을 포함한다. 테스트 통과를 실제 사용자 데이터 전체에 대한 직접 검사로 표현하지 않는다.

운영 확인에서는 변경 대상뿐 아니라 **변경하지 않아야 할 대상**도 비교한다. 사용자 활동 건수는 동시 접속으로 정상적으로 달라질 수 있으므로 변동이 생기면 실제 활동인지 확인하고, 단순 수치 차이를 곧바로 보정 오류로 단정하지 않는다.

FE 코드를 바꿀 필요가 있는 작업은 화면 증상·기대 동작·관련 API·검증 결과를 FE 담당자에게 전달한다. 이번 사례는 데이터 보정 후 기존 상세 화면에서 링크가 표시됐으므로 FE 코드 변경은 수행하지 않았다.

## 되돌리기는 이미지와 DB를 나눠 판단한다

이전 이미지를 다시 실행해도 새 마이그레이션으로 바뀐 DB 값은 자동으로 복구되지 않는다. 현재 배포 도구는 교체 전 DB 백업과 이전 컨테이너를 보존하며, 실패 시 마이그레이션 지문과 시작 상태를 확인한다. 후보 앱이 시작돼 다른 마이그레이션을 적용했을 가능성이 있으면 자동 복구를 제한하고 수동 DB 검토를 요구한다.

SQL 지문이 같다는 조건만으로 Java 마이그레이션 변경까지 안전하다고 판단하지 않는다. 복구 판단에는 실제 적용 이력과 코드·DB의 호환성을 함께 확인한다.

링크 보정의 취소가 필요하면 변경 전 값, 현재 값, 이후 발생한 수정과 사용자 활동을 확인해 보정 마이그레이션 또는 검증한 복구 절차를 선택한다. 전체 백업 복원은 백업 이후의 사용자 활동도 되돌릴 수 있으므로 영향 범위를 먼저 확인한다. `flyway repair`나 과거 파일 수정으로 적용 이력을 감추지 않는다.

[[SEBU 배포와 모니터링]] · [[SEBU 데이터 모델]] · [[SEBU 테스트 지도]] · [[SEBU 변경 검토 목록]]

---
[[SEBU 홈]] · [[SEBU 지식 지도]]

<!-- sources:start -->
## 근거 파일

- [백엔드 · .github/workflows/ci.yml](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/.github/workflows/ci.yml)
- [백엔드 · ops/deploy/deploy.py](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/ops/deploy/deploy.py)
- [백엔드 · src/main/resources/db/migration/V50__add_missing_physics_astronomy_laboratory_links.sql](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/main/resources/db/migration/V50__add_missing_physics_astronomy_laboratory_links.sql)
- [백엔드 · src/main/java/com/sebu/backend/laboratory/domain/Laboratory.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/main/java/com/sebu/backend/laboratory/domain/Laboratory.java)
- [백엔드 · src/test/java/com/sebu/backend/laboratory/repository/PhysicsAstronomyLaboratoryLinksMigrationContract.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/test/java/com/sebu/backend/laboratory/repository/PhysicsAstronomyLaboratoryLinksMigrationContract.java)
- [백엔드 · src/test/java/com/sebu/backend/laboratory/repository/PhysicsAstronomyLaboratoryLinksMigrationTest.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/test/java/com/sebu/backend/laboratory/repository/PhysicsAstronomyLaboratoryLinksMigrationTest.java)
- [백엔드 · src/test/java/com/sebu/backend/laboratory/repository/PhysicsAstronomyLaboratoryLinksMySqlMigrationTest.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/test/java/com/sebu/backend/laboratory/repository/PhysicsAstronomyLaboratoryLinksMySqlMigrationTest.java)
- [백엔드 · src/main/resources/db/migration/V51__add_missing_aerospace_laboratory_links.sql](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/main/resources/db/migration/V51__add_missing_aerospace_laboratory_links.sql)
- [백엔드 · src/test/java/com/sebu/backend/laboratory/repository/AerospaceLaboratoryLinksMigrationContract.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/test/java/com/sebu/backend/laboratory/repository/AerospaceLaboratoryLinksMigrationContract.java)
- [백엔드 · src/test/java/com/sebu/backend/laboratory/repository/AerospaceLaboratoryLinksMigrationTest.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/test/java/com/sebu/backend/laboratory/repository/AerospaceLaboratoryLinksMigrationTest.java)
- [백엔드 · src/test/java/com/sebu/backend/laboratory/repository/AerospaceLaboratoryLinksMySqlMigrationTest.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/test/java/com/sebu/backend/laboratory/repository/AerospaceLaboratoryLinksMySqlMigrationTest.java)
- [백엔드 · src/test/resources/aerospace-laboratory-links.csv](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/test/resources/aerospace-laboratory-links.csv)

기준 커밋은 [[SEBU 저장소와 기준 버전]]에서 확인한다.
<!-- sources:end -->
