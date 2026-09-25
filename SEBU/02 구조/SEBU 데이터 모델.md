---
project: SEBU
type: "architecture"
status: "2026-09-26 코드·문서 확인"
created: 2026-09-26
verified: 2026-09-26
tags:
  - sebu
  - sebu/architecture
source_ids:
  - "B:docs/erd.md"
  - "B:docs/professor-promotion.md"
  - "B:src/main/resources/db/migration/V6__add_active_laboratory_name_unique_constraint.sql"
  - "B:src/main/resources/db/migration/V7__add_unknown_recruitment_status.sql"
  - "B:src/main/resources/db/migration/V16__add_multi_department_affiliations.sql"
  - "B:src/main/resources/db/migration/V28__create_community_posting_tables.sql"
  - "B:src/main/resources/db/migration/V29__create_laboratory_reviews.sql"
  - "B:src/main/resources/db/migration/V38__add_account_recovery_and_anonymization.sql"
  - "B:src/main/resources/db/migration/V39__add_app_user_auth_version.sql"
  - "B:src/main/resources/db/migration/V40__allow_graduate_grade.sql"
  - "B:src/main/resources/db/migration/V46__add_laboratory_website_url_source.sql"
  - "B:src/main/java/com/sebu/backend/laboratory/repository/LaboratoryRepository.java"
  - "B:src/main/java/com/sebu/backend/laboratory/service/LaboratoryQueryService.java"
---
# SEBU 데이터 모델

SEBU의 데이터는 연구실 탐색, 복수 소속과 출처, 커뮤니티, 계정 생명주기를 함께 모델링한다. 확인한 마이그레이션 최고 버전은 **V46**이며, 운영 DB 적용 버전을 뜻하지는 않는다.

```mermaid
erDiagram
    COLLEGE ||--o{ DEPARTMENT : contains
    PROFESSOR ||--o{ LABORATORY : leads
    PROFESSOR ||--o{ PROFESSOR_DEPARTMENT : affiliated
    DEPARTMENT ||--o{ PROFESSOR_DEPARTMENT : includes
    LABORATORY ||--o{ LABORATORY_DEPARTMENT : affiliated
    DEPARTMENT ||--o{ LABORATORY_DEPARTMENT : includes
    LABORATORY ||--o{ LABORATORY_RESEARCH_FIELD : classified
    RESEARCH_FIELD ||--o{ LABORATORY_RESEARCH_FIELD : names
    APP_USER ||--o{ BOOKMARK : saves
    LABORATORY ||--o{ BOOKMARK : saved
    APP_USER ||--o{ COMMUNITY_POST : writes
    APP_USER ||--o{ LABORATORY_REVIEW : reviews
    LABORATORY ||--o{ LABORATORY_REVIEW : receives
```

핵심 관계만 축약했다. 후보·인증 토큰·분류 매핑·댓글·반응 테이블은 생략했으므로 전체 제약은 마이그레이션을 확인한다.

## 보존해야 하는 규칙

- 대표 학과 컬럼과 복수 학과 연결 테이블은 별도 역할이다. [[SEBU 결정 - 복수 학과와 출처 보존]]
- 활성 연구실 이름은 대표 학과 내에서 유일하다. 삭제 행의 생성 컬럼 `active_name`은 NULL이 되어 이력 보존과 이름 재사용을 허용한다.
- 모집 상태는 `RECRUITING / ALWAYS_OPEN / CLOSED / UNKNOWN` 네 가지다.
- 북마크는 사용자와 연구실의 관계다. 목록의 `bookmarkCount`는 탈퇴하지 않은 사용자의 북마크 집계이며, `bookmarked`는 요청 사용자 자신의 저장 여부다. 둘 다 DB 단일 컬럼이라고 가정하지 않는다.
- `reviewCount`는 활성 후기 집계다. 연구실 목록에 수가 포함돼도 실제 후기 내용은 별도 후기 API에서 읽는다.
- 연구실 명칭 출처는 `OFFICIAL/GENERATED`, 홈페이지 출처는 `CRAWLED/MANUAL`이다. V46은 URL과 출처의 NULL 여부가 일치하도록 제약한다.
- `grade=5`는 5학년이 아니라 졸업생이다.
- 사용자 `deleted_at`, `anonymized_at`, `auth_version`은 각각 탈퇴, 익명화 완료, 인증 버전을 나타낸다. [[SEBU 탈퇴와 복구]]

## 변경을 반영하는 방법

대표 변화는 V16 복수 소속 → V28 커뮤니티 → V29 후기 → V37~V39 인증·복구 → V40 졸업생 → V46 홈페이지 출처다. 초기 ERD보다 실제 Flyway SQL·엔티티·DTO를 우선 대조한다.

이미 적용한 SQL 파일은 수정하지 않고 새 버전으로 전진 수정한다. 코드 PR과 함께 문서의 관계·제약·기준 커밋을 갱신한다. [[SEBU 지식 갱신 방법]]

<!-- sources:start -->
## 근거 파일

- [백엔드 · docs/erd.md](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/docs/erd.md)
- [백엔드 · docs/professor-promotion.md](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/docs/professor-promotion.md)
- [백엔드 · src/main/resources/db/migration/V6__add_active_laboratory_name_unique_constraint.sql](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/src/main/resources/db/migration/V6__add_active_laboratory_name_unique_constraint.sql)
- [백엔드 · src/main/resources/db/migration/V7__add_unknown_recruitment_status.sql](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/src/main/resources/db/migration/V7__add_unknown_recruitment_status.sql)
- [백엔드 · src/main/resources/db/migration/V16__add_multi_department_affiliations.sql](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/src/main/resources/db/migration/V16__add_multi_department_affiliations.sql)
- [백엔드 · src/main/resources/db/migration/V28__create_community_posting_tables.sql](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/src/main/resources/db/migration/V28__create_community_posting_tables.sql)
- [백엔드 · src/main/resources/db/migration/V29__create_laboratory_reviews.sql](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/src/main/resources/db/migration/V29__create_laboratory_reviews.sql)
- [백엔드 · src/main/resources/db/migration/V38__add_account_recovery_and_anonymization.sql](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/src/main/resources/db/migration/V38__add_account_recovery_and_anonymization.sql)
- [백엔드 · src/main/resources/db/migration/V39__add_app_user_auth_version.sql](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/src/main/resources/db/migration/V39__add_app_user_auth_version.sql)
- [백엔드 · src/main/resources/db/migration/V40__allow_graduate_grade.sql](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/src/main/resources/db/migration/V40__allow_graduate_grade.sql)
- [백엔드 · src/main/resources/db/migration/V46__add_laboratory_website_url_source.sql](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/src/main/resources/db/migration/V46__add_laboratory_website_url_source.sql)
- [백엔드 · src/main/java/com/sebu/backend/laboratory/repository/LaboratoryRepository.java](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/src/main/java/com/sebu/backend/laboratory/repository/LaboratoryRepository.java)
- [백엔드 · src/main/java/com/sebu/backend/laboratory/service/LaboratoryQueryService.java](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/src/main/java/com/sebu/backend/laboratory/service/LaboratoryQueryService.java)

기준 커밋은 [[SEBU 저장소와 기준 버전]]에서 확인한다.
<!-- sources:end -->

---
[[SEBU 홈]] · [[SEBU 지식 지도]]
