---
project: SEBU
type: "feature"
status: "2026-10-09 코드·분류 원칙 확인"
created: 2026-09-26
verified: 2026-10-09
tags:
  - sebu
  - sebu/feature
source_ids:
  - "B:src/main/java/com/sebu/backend/laboratory/dto/LaboratoriesResponse.java"
  - "B:src/main/resources/db/migration/V23__create_research_field_categories.sql"
  - "B:src/main/resources/db/migration/V47__add_robot_autonomous_subcategories.sql"
  - "B:src/main/resources/db/migration/V49__import_reviewed_arts_sports_research_fields.sql"
  - "B:src/main/java/com/sebu/backend/researchfield/category/controller/ResearchFieldCategoryController.java"
  - "B:src/main/java/com/sebu/backend/researchfield/category/dto/ResearchFieldCategoriesResponse.java"
  - "B:src/main/java/com/sebu/backend/laboratory/repository/LaboratoryResearchFieldCategoryQueryRepository.java"
  - "B:src/main/java/com/sebu/backend/laboratory/service/LaboratoryQueryService.java"
  - "B:src/test/java/com/sebu/backend/researchfield/category/controller/ResearchFieldCategoryApiIntegrationTest.java"
  - "B:src/test/java/com/sebu/backend/researchfield/category/repository/ResearchFieldCategoryMySqlMigrationTest.java"
  - "F:src/features/search/hooks/useLabFilter.js"
  - "F:src/features/search/utils/labFilterUtils.js"
  - "B:src/main/java/com/sebu/backend/researchfield/candidate/domain/LaboratoryResearchFieldCandidate.java"
  - "B:src/main/java/com/sebu/backend/researchfield/promotion/service/ResearchFieldNameNormalizer.java"
---
# SEBU 연구 분야 분류

연구 분야 이름과 화면용 카테고리는 별도 개념이며, 분야별 카테고리 연결을 유지해야 필터 결과를 설명할 수 있다.

| 값 | 의미 |
|---|---|
| researchFields | 화면에 표시할 분야 이름 목록 |
| researchFieldDetails | 각 분야의 researchFieldId, name, categoryIds |
| researchFieldCategoryIds | 연구실 전체에 연결된 카테고리 ID 목록 |
| researchFieldCategories | 연구실에 직접 연결된 카테고리의 id, code, name, parentId |

연구실 전체 카테고리 집합만 보면 어떤 분야 때문에 해당 카테고리에 포함됐는지 알기 어렵다. researchFieldDetails는 이 연결을 보존한다.

## 로봇 하위 분류와 응답 계약

V47은 기존 `ROBOT_AUTONOMOUS`의 ID·코드를 유지하고 하위 카테고리 20개를 추가한다. `research_field_category.parent_id`는 부모 카테고리를 참조하며 최상위는 NULL이다. `GET /api/v1/research-field-categories`는 `id, code, name, description, displayOrder, parentId`를 반환하고, 연구실 목록의 `researchFieldCategories`도 `parentId`를 포함한다.

V47은 기존 로봇 부모에 직접 연결된 분야를 검수된 이름별 대응표에 따라 하위 분류로 옮긴다. 전체 분야–카테고리 연결 수는 유지되고, 기본 데이터에서 `ROBOT_AUTONOMOUS`에 직접 연결된 분야는 0개가 된다. 기존 부모 연결에 대응표에 없는 분야가 있으면 추측해 분류하지 않고 마이그레이션을 중단한다.

| 기존 분야명 예시 | V47의 연결 코드 |
|---|---|
| `로봇 공학` | `ROBOT_AUTONOMOUS_ROBOTICS` |
| `건설작업로봇` | `ROBOT_AUTONOMOUS_FIELD_ROBOTS` |
| `및 지도 작성 설명 가능한 강화학습` | `ROBOT_AUTONOMOUS_PATH_PLANNING` |
| `심층 영상/라이다 위치추정 강화학습(XRL)` | `ROBOT_AUTONOMOUS_NAVIGATION` |
| `수중` | `ROBOT_AUTONOMOUS_UUV` |
| `지상` | `ROBOT_AUTONOMOUS_UNMANNED` |

이 값들은 SQL에 기록된 실제 분야명이다. V47은 분야명을 정제하거나 다시 분리하는 변경이 아니므로 어색한 원문을 임의로 고쳐 이해하지 않는다. 로봇공학·설계·제어·학습부터 드론·수상정·수중 로봇·자동차 제어까지 20개 하위 분류의 전체 이름과 대응표는 V47을 기준으로 확인한다.

연구실의 `researchFieldDetails.categoryIds`, `researchFieldCategoryIds`, `researchFieldCategories`는 실제 매핑된 카테고리를 담는다. 백엔드가 부모 카테고리까지 자동으로 확장해 넣지는 않는다. 따라서 로봇 하위 분류에 연결된 연구실은 부모 ID만 비교하는 필터로 자동 검색되지 않는다.

## 데이터가 만들어지는 경로

연구 분야 후보를 검수한 뒤 research-field-promotion 프로필과 enabled 설정으로 research_field 및 laboratory_research_field에 승격한다.

승격 대상은 APPROVED, is_stale=false이고 미승격 또는 재검수된 후보다. 같은 승인본 재실행은 중복 연결을 만들지 않도록 설계되어 있다.

일반 서버 실행에서는 승격하지 않으며 크롤링·교수 승격·분야 추출·수동 분리 프로필과의 동시 실행을 제한한다.

## 프론트에 연결할 때

현재 검색 화면은 공통 연구실 목록의 `researchFieldCategories`와 `researchFieldDetails`에서 필터 항목을 만들며 별도 분류 API를 호출하지 않는다. 카테고리를 이름순으로 평탄하게 정렬하고 실제 카테고리 ID를 비교한다. 프론트 기준 `e7e54de`에도 `parentId`를 이용한 계층 표시나 부모 선택 시 자식 ID 확장이 없다. 따라서 API의 계층 정보 제공과 화면의 계층 필터 구현을 구분한다.

검색 유틸은 연구실 이름·교수명·`researchFields` 문자열과 분야 ID·카테고리 필터를 처리한다. 분야 ID를 선택하면 그 ID로 연구실을 찾으며, 카테고리 선택을 바꾸면 선택한 분야 ID를 초기화한다.

## 원문 보존과 개발자 매핑 원칙

분류를 넓히거나 화면의 카테고리를 바꾸는 작업은 **원문을 보존한 상태에서 별도 매핑을 검토하는 작업**이다. 수집 원문을 카테고리명에 맞춰 덮어쓰거나 빈 연구소개에 추정 분야를 채우지 않는다. 개발자는 분야와 카테고리의 연결 근거를 확인해 매핑을 정리하고, 원문 수정·후보 분리·화면 분류 변경은 각각 별도 변경으로 기록한다.

현행 후보 모델은 `rawFieldText`, `candidateName`, 출처 설명 해시, 추출 규칙 버전과 검수 이력을 구분한다. 승격의 이름 정규화는 NFKC·양끝 및 연속 공백 정리 수준이며 원문의 의미를 재작성하는 기능이 아니다. V47의 이름별 대응표와 V49의 검수 데이터는 명시적 매핑의 예다. 어색한 분야명을 정리하려면 원문과 검수 근거를 먼저 대조한다.

이미 적용된 Flyway 파일을 수정하면 이력 검증과 환경별 동일성을 해친다. 분류·연결을 바꿀 때는 새 버전 마이그레이션으로 반영하고, 기존 연구실·분야 ID 및 소속·후기·북마크를 보존한다. `parentId` 계층 제공, 개발자 매핑, FE 계층 선택은 서로 다른 범위다.

[[SEBU 연구실 탐색]] · [[SEBU 크롤링과 승격]] · [[SEBU 데이터 모델]]

## 예체능 분류의 병합과 검수 기록

PR #92는 `b6cf2e5`에서 `develop`에 병합됐다. V49는 최상위 `MUSIC_PERFORMING_ARTS`(음악·공연예술), `SPORTS_PHYSICAL_EDUCATION`(체육·스포츠)를 추가하며 V47의 로봇 부모 관계를 보존한다. 빈 DB에 전체 마이그레이션을 적용하는 코드·테스트 기준 카테고리는 기존 32개 → V47 52개 → V49 54개다. 이는 운영 서비스의 현재 DB 건수를 확인한 결과가 아니다.

예체능 15개 연구실에 고유 분야 55개, 연구실–분야 61개, 분야–카테고리 69개를 연결한다. 기존 `영화`와 `DESIGN_ARTS` 연결을 재사용하므로 V48 대비 신규 분야는 54개, 신규 분류 연결은 68개다. 소개가 없는 3개 연구실에는 분야를 만들지 않는다. 원문 검수와 당시 실행 검증은 [[SEBU 예체능대학 크롤링 검수 - 2026-10-06]]에 보존하고, 재사용 절차는 [[SEBU 크롤링 스킬]]에 연결한다.

## 이전된 상세 문서

- [[SEBU 백엔드 연구 분야 후보 승격 실행 안내]]

<!-- sources:start -->
## 근거 파일

- [백엔드 · src/main/java/com/sebu/backend/laboratory/dto/LaboratoriesResponse.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/main/java/com/sebu/backend/laboratory/dto/LaboratoriesResponse.java)
- [백엔드 · src/main/resources/db/migration/V23__create_research_field_categories.sql](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/main/resources/db/migration/V23__create_research_field_categories.sql)
- [백엔드 · src/main/resources/db/migration/V47__add_robot_autonomous_subcategories.sql](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/main/resources/db/migration/V47__add_robot_autonomous_subcategories.sql)
- [백엔드 · src/main/resources/db/migration/V49__import_reviewed_arts_sports_research_fields.sql](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/main/resources/db/migration/V49__import_reviewed_arts_sports_research_fields.sql)
- [백엔드 · src/main/java/com/sebu/backend/researchfield/category/controller/ResearchFieldCategoryController.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/main/java/com/sebu/backend/researchfield/category/controller/ResearchFieldCategoryController.java)
- [백엔드 · src/main/java/com/sebu/backend/researchfield/category/dto/ResearchFieldCategoriesResponse.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/main/java/com/sebu/backend/researchfield/category/dto/ResearchFieldCategoriesResponse.java)
- [백엔드 · src/main/java/com/sebu/backend/laboratory/repository/LaboratoryResearchFieldCategoryQueryRepository.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/main/java/com/sebu/backend/laboratory/repository/LaboratoryResearchFieldCategoryQueryRepository.java)
- [백엔드 · src/main/java/com/sebu/backend/laboratory/service/LaboratoryQueryService.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/main/java/com/sebu/backend/laboratory/service/LaboratoryQueryService.java)
- [백엔드 · src/test/java/com/sebu/backend/researchfield/category/controller/ResearchFieldCategoryApiIntegrationTest.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/test/java/com/sebu/backend/researchfield/category/controller/ResearchFieldCategoryApiIntegrationTest.java)
- [백엔드 · src/test/java/com/sebu/backend/researchfield/category/repository/ResearchFieldCategoryMySqlMigrationTest.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/test/java/com/sebu/backend/researchfield/category/repository/ResearchFieldCategoryMySqlMigrationTest.java)
- [프론트 · src/features/search/hooks/useLabFilter.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/features/search/hooks/useLabFilter.js)
- [프론트 · src/features/search/utils/labFilterUtils.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/features/search/utils/labFilterUtils.js)
- [백엔드 · src/main/java/com/sebu/backend/researchfield/candidate/domain/LaboratoryResearchFieldCandidate.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/main/java/com/sebu/backend/researchfield/candidate/domain/LaboratoryResearchFieldCandidate.java)
- [백엔드 · src/main/java/com/sebu/backend/researchfield/promotion/service/ResearchFieldNameNormalizer.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/main/java/com/sebu/backend/researchfield/promotion/service/ResearchFieldNameNormalizer.java)

기준 커밋은 [[SEBU 저장소와 기준 버전]]에서 확인한다.
<!-- sources:end -->

---
[[SEBU 홈]] · [[SEBU 지식 지도]]
