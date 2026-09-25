---
project: SEBU
type: "feature"
status: "기준 코드 확인"
created: 2026-09-26
verified: 2026-09-26
tags:
  - sebu
  - sebu/feature
source_ids:
  - "F:src/api/labApi.js"
  - "F:src/api/queries/laboratories.js"
  - "F:src/features/search/hooks/useLabFilter.js"
  - "F:src/features/search/utils/labFilterUtils.js"
  - "F:src/pages/Search/index.jsx"
  - "F:src/features/collegeView/hooks/useCollegeStats.js"
  - "F:src/pages/CollegeView/index.jsx"
  - "F:src/features/search/components/RecommendedLabs.jsx"
  - "F:src/components/common/LabCard.jsx"
  - "F:src/components/common/LabDetailModal.jsx"
  - "F:src/features/main/api/mainApi.js"
  - "B:src/main/java/com/sebu/backend/laboratory/controller/LaboratoryController.java"
  - "B:src/main/java/com/sebu/backend/laboratory/dto/LaboratoriesResponse.java"
---
# SEBU 연구실 탐색

연구실 탐색은 전체 연구실 목록을 공통 API로 가져온 뒤 프론트에서 검색·필터·정렬한다. 검색 화면마다 별도의 검색 API를 호출하는 구조가 아니다.

## 조회에서 표시까지

1. `fetchLaboratories()`가 `GET /api/v1/laboratories`를 요청한다.
2. `response.data.data.laboratories`를 `["laboratories"]` 캐시에 저장한다.
3. 검색 화면은 useLabFilter, 단과대 화면은 useCollegeStats, 랩실평가 홈은 useLabList로 같은 목록을 다르게 가공한다.
4. 일반 연구실 카드에서 상세 모달을 열 때는 전달받은 lab 데이터를 사용한다. 모달 자체가 별도 연구실 상세 조회를 하지 않는다.

기본 목록 응답에는 연구실·교수·단과대·학과, 연구 분야, 모집 상태, 북마크 수, 내 북마크 여부, 후기 수 등이 들어 있다. 후기 본문은 목록 응답과 구분된다. [[SEBU 화면과 API 공유]]

## 검색 규칙

- 연구실 이름·교수 이름·연구 분야 문자열을 소문자로 바꾸어 검색어 포함 여부를 검사한다.
- 단과대, 모집 상태, 분야 카테고리, 개별 분야, 홈페이지 유무 필터를 조합한다.
- 모집 중 묶음인 OPEN은 RECRUITING 또는 ALWAYS_OPEN이다.
- 개별 분야를 선택하면 분야 ID 기준을 사용하고, 없으면 카테고리 ID 기준을 사용한다.
- 카테고리를 바꾸면 선택했던 개별 분야를 초기화한다.
- 인기순은 bookmarkCount 내림차순, 이름순은 오름차순·내림차순이다. 기본 RECENT는 서버가 준 배열 순서를 유지하며 프론트에서 작성일 비교를 하지 않는다.

검색 화면에는 로딩과 오류 표시가 있다. 단과대 useCollegeStats는 현재 data만 받아 빈 배열을 기본값으로 사용하므로 해당 화면의 로딩·오류·실제 0건 구분은 추가 검토가 필요하다.

## 단과대와 추천 영역

단과대 화면은 lab.college와 lab.department로 목록을 묶고 연구실 수를 센다. 현재 묶음 로직은 응답의 복수 소속 `affiliations` 전체를 펼치지 않는다. 메인 화면의 단과대 소개에 사용하는 `GET /api/v1/colleges`와 이 연구실 묶음은 다른 호출이다.

추천 영역은 현재 받아온 목록에서 북마크 수 상위 5개를 고른다. '실시간'과 '오늘 HH:00 기준' 문구가 있지만 시각은 브라우저에서 생성하고, 서버의 집계 시각이나 실시간 스트림을 읽지 않는다.

## 연결 상태와 후속 검토

일반 LabCard가 여는 상세 모달에는 북마크 값과 핸들러가 전달된다. 반면 RecommendedLabs가 여는 상세 모달에는 lab과 onClose만 전달되므로, 그 진입점의 북마크 연결은 추가 작업이 필요하다.

기본 조회는 전체 목록이며, 백엔드는 `sort=REVIEW_COUNT_DESC`인 경우 별도로 페이지 응답을 제공한다. 현재 검색·단과대·랩실평가 홈의 공통 훅은 해당 페이지 옵션을 사용하지 않는다. 데이터가 커지면 목록 크기와 캐시 정책을 측정해 전환 여부를 정하는 것이 제안이다.

[[SEBU 연구 분야 분류]] · [[SEBU 마이페이지와 북마크]] · [[SEBU 변경 검토 목록]]

<!-- sources:start -->
## 근거 파일

- [프론트 · src/api/labApi.js](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/api/labApi.js)
- [프론트 · src/api/queries/laboratories.js](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/api/queries/laboratories.js)
- [프론트 · src/features/search/hooks/useLabFilter.js](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/features/search/hooks/useLabFilter.js)
- [프론트 · src/features/search/utils/labFilterUtils.js](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/features/search/utils/labFilterUtils.js)
- [프론트 · src/pages/Search/index.jsx](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/pages/Search/index.jsx)
- [프론트 · src/features/collegeView/hooks/useCollegeStats.js](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/features/collegeView/hooks/useCollegeStats.js)
- [프론트 · src/pages/CollegeView/index.jsx](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/pages/CollegeView/index.jsx)
- [프론트 · src/features/search/components/RecommendedLabs.jsx](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/features/search/components/RecommendedLabs.jsx)
- [프론트 · src/components/common/LabCard.jsx](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/components/common/LabCard.jsx)
- [프론트 · src/components/common/LabDetailModal.jsx](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/components/common/LabDetailModal.jsx)
- [프론트 · src/features/main/api/mainApi.js](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/features/main/api/mainApi.js)
- [백엔드 · src/main/java/com/sebu/backend/laboratory/controller/LaboratoryController.java](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/src/main/java/com/sebu/backend/laboratory/controller/LaboratoryController.java)
- [백엔드 · src/main/java/com/sebu/backend/laboratory/dto/LaboratoriesResponse.java](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/src/main/java/com/sebu/backend/laboratory/dto/LaboratoriesResponse.java)

기준 커밋은 [[SEBU 저장소와 기준 버전]]에서 확인한다.
<!-- sources:end -->

---
[[SEBU 홈]] · [[SEBU 지식 지도]]
