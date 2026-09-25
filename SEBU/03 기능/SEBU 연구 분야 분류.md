---
project: SEBU
type: "feature"
status: "로컬 근거 확인"
created: 2026-09-26
verified: 2026-09-26
tags:
  - sebu
  - sebu/feature
source_ids:
  - "B:docs/research-field-promotion.md"
  - "B:src/main/java/com/sebu/backend/laboratory/dto/LaboratoriesResponse.java"
  - "B:src/main/resources/db/migration/V23__create_research_field_categories.sql"
  - "B:src/main/java/com/sebu/backend/researchfield/category/controller/ResearchFieldCategoryController.java"
  - "F:src/features/search/hooks/useLabFilter.js"
  - "F:src/features/search/utils/labFilterUtils.js"
---
# SEBU 연구 분야 분류

연구 분야 이름과 화면용 카테고리는 별도 개념이며, 분야별 카테고리 연결을 유지해야 필터 결과를 설명할 수 있다.

| 값 | 의미 |
|---|---|
| researchFields | 화면에 표시할 분야 이름 목록 |
| researchFieldDetails | 각 분야의 researchFieldId, name, categoryIds |
| researchFieldCategoryIds | 연구실 전체에 연결된 카테고리 ID 목록 |
| researchFieldCategories | 카테고리 id, code, name |

연구실 전체 카테고리 집합만 보면 어떤 분야 때문에 해당 카테고리에 포함됐는지 알기 어렵다. researchFieldDetails는 이 연결을 보존한다.

## 데이터가 만들어지는 경로

연구 분야 후보를 검수한 뒤 research-field-promotion 프로필과 enabled 설정으로 research_field 및 laboratory_research_field에 승격한다.

승격 대상은 APPROVED, is_stale=false이고 미승격 또는 재검수된 후보다. 같은 승인본 재실행은 중복 연결을 만들지 않도록 설계되어 있다.

일반 서버 실행에서는 승격하지 않으며 크롤링·교수 승격·분야 추출·수동 분리 프로필과의 동시 실행을 제한한다.

## 프론트에 연결할 때

백엔드는 GET /api/v1/research-field-categories를 제공한다. 현재 검색 화면은 공통 연구실 목록의 researchFieldCategories와 researchFieldDetails에서 필터 항목을 만든다. 검색 유틸은 이름·교수명·researchFields 문자열과 분야 ID·카테고리 필터를 처리한다. 별도 분류 API의 존재와 화면이 실제로 호출하는 경로를 구분한다.

[[SEBU 연구실 탐색]] · [[SEBU 크롤링과 승격]] · [[SEBU 데이터 모델]]

<!-- sources:start -->
## 근거 파일

- [백엔드 · docs/research-field-promotion.md](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/docs/research-field-promotion.md)
- [백엔드 · src/main/java/com/sebu/backend/laboratory/dto/LaboratoriesResponse.java](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/src/main/java/com/sebu/backend/laboratory/dto/LaboratoriesResponse.java)
- [백엔드 · src/main/resources/db/migration/V23__create_research_field_categories.sql](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/src/main/resources/db/migration/V23__create_research_field_categories.sql)
- [백엔드 · src/main/java/com/sebu/backend/researchfield/category/controller/ResearchFieldCategoryController.java](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/src/main/java/com/sebu/backend/researchfield/category/controller/ResearchFieldCategoryController.java)
- [프론트 · src/features/search/hooks/useLabFilter.js](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/features/search/hooks/useLabFilter.js)
- [프론트 · src/features/search/utils/labFilterUtils.js](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/features/search/utils/labFilterUtils.js)

기준 커밋은 [[SEBU 저장소와 기준 버전]]에서 확인한다.
<!-- sources:end -->

---
[[SEBU 홈]] · [[SEBU 지식 지도]]
