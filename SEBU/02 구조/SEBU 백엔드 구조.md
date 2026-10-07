---
project: SEBU
type: "architecture"
status: "2026-10-07 코드·문서 확인"
created: 2026-09-26
verified: 2026-10-07
tags:
  - sebu
  - sebu/architecture
source_ids:
  - "B:build.gradle"
  - "B:src/main/java/com/sebu/backend/laboratory/controller/LaboratoryController.java"
  - "B:src/main/java/com/sebu/backend/laboratory/service/LaboratoryQueryService.java"
  - "B:src/main/java/com/sebu/backend/laboratory/query/LaboratorySummaryAssembler.java"
  - "B:src/main/java/com/sebu/backend/laboratory/repository/LaboratoryRepository.java"
  - "B:src/main/java/com/sebu/backend/global/auth/SecurityConfiguration.java"
  - "B:src/main/resources/application-prod.yml"
  - "B:src/main/java/com/sebu/backend/laboratory/dto/LaboratoriesResponse.java"
  - "B:src/main/java/com/sebu/backend/laboratory/repository/LaboratoryResearchFieldCategoryQueryRepository.java"
  - "B:src/main/java/com/sebu/backend/researchfield/category/dto/ResearchFieldCategoriesResponse.java"
  - "B:src/main/resources/db/migration/V47__add_robot_autonomous_subcategories.sql"
  - "B:src/main/resources/db/migration/V48__import_reviewed_arts_sports_professors.sql"
  - "B:src/main/resources/db/migration/V49__import_reviewed_arts_sports_research_fields.sql"
---
# SEBU 백엔드 구조

백엔드는 기능별 패키지 안에서 Controller → Service → Repository를 따라가는 구조다. Java 21, Spring Boot 3.5.3, JPA, Spring Security, Flyway를 사용하며 최신 기준은 [[SEBU 저장소와 기준 버전]]에 기록한다.

| 패키지 | 책임 |
|---|---|
| laboratory, college, department, professor | 연구실·교수·소속 조회와 관리 |
| researchfield | 분야 추출·수동 분리·승격·카테고리 |
| auth, account, user | 학교 인증·쿠키·토큰·탈퇴와 복구 |
| mypage, bookmark | 내 프로필·관심 연구실 |
| community, laboratoryreview | 게시글·댓글·반응·연구실 후기 |
| crawling, promotion | 외부 수집과 검수된 교수 후보 승격 |
| global | 공통 응답·보안·요청 제한·로깅·모니터링 |

## 연구실 요청을 따라가기

1. Spring Security가 출처, CSRF, 인증 규칙을 적용한다. 공개 GET은 로그인 없이 통과할 수 있다.
2. `LaboratoryController.getAll`이 `sort/page/size`를 해석한다.
3. `LaboratoryQueryService`가 현재 사용자 ID를 선택적으로 구하고 Repository 조회를 조합한다.
4. `LaboratorySummaryAssembler`와 응답 DTO가 교수·대표 소속·복수 소속·분야·북마크·후기 수를 하나의 목록 응답으로 만든다.

카테고리 조회는 분야별 실제 매핑에 `parent_id`를 함께 가져온다. 서비스와 DTO가 이를 연구실 `researchFieldCategories[].parentId`로 전달하며, 별도 분류 API도 `parentId`를 제공한다. 부모까지 연결을 확장하는 조회는 없으므로 계층 표시·부모 선택 시 자식 포함은 별도 클라이언트 처리 대상이다. [[SEBU 연구 분야 분류]]

기본 `GET /api/v1/laboratories`는 전체 활성 연구실 목록이다. `sort=REVIEW_COUNT_DESC`일 때만 후기 수 정렬·페이지 조회로 분기한다. 현재 프론트의 검색·단과대·랩실평가 홈은 기본 목록을 함께 사용한다. 화면이 세 개라고 백엔드 API가 세 개 필요한 것은 아니다. [[SEBU API 지도]] · [[SEBU 연구실 탐색]]

## 실행 경계

크롤링·승격은 일반 HTTP 컨트롤러 대신 전용 Runner와 프로필·enabled 설정으로 실행한다. 일반 서버를 시작한다고 자동 실행되지 않는다. [[SEBU 크롤링과 승격]]

검수 데이터의 배포용 Flyway 마이그레이션은 이 Runner와 별도다. 현재 최고 버전은 V49이며 V47은 로봇 하위 분류, V48~V49는 예체능 교수·연구실·분야·분류를 반영한다. SQL이 `develop`에 병합됐다는 사실과 실행 환경에서 실제 적용됐다는 사실은 구분한다. [[SEBU 데이터 모델]]

최신 `prod` 프로필에는 2KB 이상 `application/json` 응답 압축 설정이 있다. 전달 크기를 줄이는 설정이며 API의 데이터 범위나 권한을 바꾸지 않는다. [[SEBU 배포와 모니터링]]

이 노트는 저장소 구현을 설명한다. 테스트 통과, 현재 서버 배포·DB 적용 여부는 별도 증거가 필요하다.

<!-- sources:start -->
## 근거 파일

- [백엔드 · build.gradle](https://github.com/greedy-team/SEBU-backend/blob/b6cf2e5eacfe7b076c8f7553e01243b5e3304fed/build.gradle)
- [백엔드 · src/main/java/com/sebu/backend/laboratory/controller/LaboratoryController.java](https://github.com/greedy-team/SEBU-backend/blob/b6cf2e5eacfe7b076c8f7553e01243b5e3304fed/src/main/java/com/sebu/backend/laboratory/controller/LaboratoryController.java)
- [백엔드 · src/main/java/com/sebu/backend/laboratory/service/LaboratoryQueryService.java](https://github.com/greedy-team/SEBU-backend/blob/b6cf2e5eacfe7b076c8f7553e01243b5e3304fed/src/main/java/com/sebu/backend/laboratory/service/LaboratoryQueryService.java)
- [백엔드 · src/main/java/com/sebu/backend/laboratory/query/LaboratorySummaryAssembler.java](https://github.com/greedy-team/SEBU-backend/blob/b6cf2e5eacfe7b076c8f7553e01243b5e3304fed/src/main/java/com/sebu/backend/laboratory/query/LaboratorySummaryAssembler.java)
- [백엔드 · src/main/java/com/sebu/backend/laboratory/repository/LaboratoryRepository.java](https://github.com/greedy-team/SEBU-backend/blob/b6cf2e5eacfe7b076c8f7553e01243b5e3304fed/src/main/java/com/sebu/backend/laboratory/repository/LaboratoryRepository.java)
- [백엔드 · src/main/java/com/sebu/backend/global/auth/SecurityConfiguration.java](https://github.com/greedy-team/SEBU-backend/blob/b6cf2e5eacfe7b076c8f7553e01243b5e3304fed/src/main/java/com/sebu/backend/global/auth/SecurityConfiguration.java)
- [백엔드 · src/main/resources/application-prod.yml](https://github.com/greedy-team/SEBU-backend/blob/b6cf2e5eacfe7b076c8f7553e01243b5e3304fed/src/main/resources/application-prod.yml)
- [백엔드 · src/main/java/com/sebu/backend/laboratory/dto/LaboratoriesResponse.java](https://github.com/greedy-team/SEBU-backend/blob/b6cf2e5eacfe7b076c8f7553e01243b5e3304fed/src/main/java/com/sebu/backend/laboratory/dto/LaboratoriesResponse.java)
- [백엔드 · src/main/java/com/sebu/backend/laboratory/repository/LaboratoryResearchFieldCategoryQueryRepository.java](https://github.com/greedy-team/SEBU-backend/blob/b6cf2e5eacfe7b076c8f7553e01243b5e3304fed/src/main/java/com/sebu/backend/laboratory/repository/LaboratoryResearchFieldCategoryQueryRepository.java)
- [백엔드 · src/main/java/com/sebu/backend/researchfield/category/dto/ResearchFieldCategoriesResponse.java](https://github.com/greedy-team/SEBU-backend/blob/b6cf2e5eacfe7b076c8f7553e01243b5e3304fed/src/main/java/com/sebu/backend/researchfield/category/dto/ResearchFieldCategoriesResponse.java)
- [백엔드 · src/main/resources/db/migration/V47__add_robot_autonomous_subcategories.sql](https://github.com/greedy-team/SEBU-backend/blob/b6cf2e5eacfe7b076c8f7553e01243b5e3304fed/src/main/resources/db/migration/V47__add_robot_autonomous_subcategories.sql)
- [백엔드 · src/main/resources/db/migration/V48__import_reviewed_arts_sports_professors.sql](https://github.com/greedy-team/SEBU-backend/blob/b6cf2e5eacfe7b076c8f7553e01243b5e3304fed/src/main/resources/db/migration/V48__import_reviewed_arts_sports_professors.sql)
- [백엔드 · src/main/resources/db/migration/V49__import_reviewed_arts_sports_research_fields.sql](https://github.com/greedy-team/SEBU-backend/blob/b6cf2e5eacfe7b076c8f7553e01243b5e3304fed/src/main/resources/db/migration/V49__import_reviewed_arts_sports_research_fields.sql)

기준 커밋은 [[SEBU 저장소와 기준 버전]]에서 확인한다.
<!-- sources:end -->

---
[[SEBU 홈]] · [[SEBU 지식 지도]]
