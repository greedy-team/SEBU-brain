---
project: SEBU
type: "feature"
status: "기준 코드 확인"
created: 2026-09-26
verified: 2026-10-07
tags:
  - sebu
  - sebu/feature
source_ids:
  - "F:src/api/labApi.js"
  - "F:src/api/queries/laboratories.js"
  - "F:src/features/search/hooks/useLabFilter.js"
  - "F:src/features/search/utils/labFilterUtils.js"
  - "F:src/pages/Search/index.jsx"
  - "F:src/features/search/components/SearchBar.jsx"
  - "F:src/features/search/components/CollegeChips.jsx"
  - "F:src/features/search/components/ResearchFieldChips.jsx"
  - "F:src/features/search/components/FilterChip.jsx"
  - "F:src/features/search/components/ScrollableRow.jsx"
  - "F:src/features/collegeView/hooks/useCollegeStats.js"
  - "F:src/pages/CollegeView/index.jsx"
  - "F:src/features/collegeView/components/CollegeAccordionItem.jsx"
  - "F:src/features/collegeView/components/CollegeAccordionList.jsx"
  - "F:src/features/collegeView/components/DepartmentList.jsx"
  - "F:src/features/search/components/RecommendedLabs.jsx"
  - "F:src/components/common/LabCard.jsx"
  - "F:src/components/common/LabDetailModal.jsx"
  - "F:src/features/main/api/mainApi.js"
  - "F:src/features/main/components/CollegeSection.jsx"
  - "F:src/hooks/useLabBookmark.js"
  - "B:src/main/java/com/sebu/backend/laboratory/controller/LaboratoryController.java"
  - "B:src/main/java/com/sebu/backend/laboratory/dto/LaboratoriesResponse.java"
---
# SEBU 연구실 탐색

연구실 탐색은 전체 연구실 목록을 공통 API로 가져온 뒤 프론트에서 검색·필터·정렬한다. 검색어는 URL의 `keyword`와 동기화되며, 카드와 인기 연구실 모달의 북마크는 같은 훅을 사용한다. 아래 흐름은 코드에서 확인했으며 브라우저 실행 검증은 별도다.

## 조회에서 표시까지

1. `fetchLaboratories()`가 `GET /api/v1/laboratories`를 요청한다.
2. `response.data.data.laboratories`를 `["laboratories"]` 캐시에 저장한다.
3. 검색 화면은 useLabFilter, 단과대 화면은 useCollegeStats, 랩실평가 홈은 useLabList로 같은 목록을 다르게 가공한다. 메인의 인기 연구실·후기 수 요약도 이 캐시를 읽는다.
4. 일반 연구실 카드와 인기 연구실에서 상세 모달을 열 때는 전달받은 lab 데이터를 사용한다. 모달 자체가 별도 연구실 상세 조회를 하지 않는다.

기본 목록 응답에는 연구실·교수·단과대·학과, 연구 분야, 모집 상태, 북마크 수, 내 북마크 여부, 후기 수 등이 들어 있다. 후기 본문은 목록 응답과 구분된다. [[SEBU 화면과 API 공유]]

## 검색어와 URL

SearchBar는 폼 제출로 검색을 실행한다. useLabFilter의 검색 기준은 `searchParams.get("keyword")`이며, 입력을 제출하면 양끝 공백을 제거해 `?keyword=...`를 저장한다. 빈 검색어는 쿼리를 비운다. 뒤로가기나 외부 검색 링크로 URL의 keyword가 바뀌면 입력창도 그 값으로 동기화한다.

입력창에서 글자만 지우고 아직 제출하지 않았다면 적용된 URL 검색어는 남는다. 이 상태에서 카테고리를 선택하면 기존 검색어와 새 필터를 함께 적용한다. 검색 버튼 또는 Enter로 빈 검색을 제출해야 검색어 조건이 해제된다.

URL에 저장하는 값은 검색어뿐이다. 단과대·모집·연구 분야·홈페이지 필터와 정렬은 컴포넌트 상태에 있으므로 새로고침이나 화면을 떠났다가 돌아올 때 복원되는 계약은 아니다. 모바일 홈은 `/`에서 SearchPage를 직접 렌더링하므로 홈에서 검색하면 `/?keyword=...`가 될 수 있다. [[SEBU 메인과 모바일 화면]]

## 검색 규칙

- 연구실 이름·교수 이름·연구 분야 문자열을 소문자로 바꾸어 검색어 포함 여부를 검사한다.
- 단과대, 모집 상태, 분야 카테고리, 개별 분야, 홈페이지 유무 필터를 조합한다.
- 모집 중 묶음인 OPEN은 RECRUITING 또는 ALWAYS_OPEN이다.
- 개별 분야를 선택하면 분야 ID 기준을 사용하고, 없으면 카테고리 ID 기준을 사용한다.
- 카테고리를 바꾸면 선택했던 개별 분야를 초기화한다.
- 인기순은 bookmarkCount 내림차순, 이름순은 오름차순·내림차순이다. 기본 RECENT는 서버가 준 배열 순서를 유지하며 프론트에서 작성일 비교를 하지 않는다.

카테고리는 목록 응답에서 추출해 이름순으로 나열한다. 현재 FE는 별도 카테고리 목록 API와 `parentId`를 사용하지 않으므로 로봇 부모 선택 시 하위 카테고리를 모두 포함하는 동작은 구현되지 않았다. [[SEBU 연구 분야 분류]]

단과대·분야 칩은 FilterChip과 ScrollableRow를 공통 사용한다. 단과대 칩은 모바일에서 가로 스크롤, 데스크톱에서 줄바꿈으로 표시한다. 모바일 검색 화면은 검색어가 비어 있으면 소개 문구를 보이고 인기 연구실 사이드 영역은 숨긴다.

검색 화면에는 로딩과 오류 표시가 있다. 단과대 useCollegeStats는 현재 data만 받아 빈 배열을 기본값으로 사용하므로 해당 화면의 로딩·오류·실제 0건 구분은 추가 검토가 필요하다.

## 단과대 이동과 펼침

메인 단과대 카드는 API의 실제 `college.id`로 `/colleges?college={id}`에 연결된다. 단과대 화면은 이 값을 읽어 일치하는 아코디언의 초기 열린 상태를 정하고 해당 항목으로 스크롤한다. 모션 줄이기 설정에서는 스크롤 애니메이션을 사용하지 않는다. 이미 마운트된 항목에서 쿼리만 바뀌는 경우에는 `defaultOpen`이 열림 상태를 다시 설정하지 않으므로 별도 확인이 필요하다.

단과대 화면은 lab.college와 lab.department로 목록을 묶고 연구실 수를 센다. 현재 묶음 로직은 응답의 복수 소속 `affiliations` 전체를 펼치지 않는다. 메인 소개용 `GET /api/v1/colleges`는 별도 호출이므로 그 응답에 있는 단과대라도 공통 연구실 목록에 대응 항목이 없으면 펼칠 대상이 없을 수 있다. 학과 목록은 모바일에서 상단 가로 스크롤, 데스크톱에서 왼쪽 세로 목록으로 표시한다.

## 인기 연구실과 카드 연결

인기 연구실은 받아온 전체 목록에서 북마크 수 상위 5개를 고른다. '실시간'과 '오늘 HH:00 기준' 문구가 있지만 시각은 브라우저에서 생성하고, 서버의 집계 시각이나 실시간 스트림을 읽지 않는다. 메인에서는 항상 펼치고 검색 화면에서는 접기·펼치기와 티커를 사용한다.

RecommendedLabs는 선택한 연구실 객체 대신 ID를 보관하고 현재 labs에서 다시 찾는다. 열린 모달은 useLabBookmark로 bookmarked·bookmarkCount·토글 핸들러를 전달받으므로, 이전에 기록한 인기 연구실 모달의 북마크 미연결 문제는 코드에서 해소됐다. 일반 LabCard에는 상세 모달과 별개로 해당 연구실 후기 목록에 바로 가는 링크도 있다.

기본 조회는 전체 목록이며, 백엔드는 `sort=REVIEW_COUNT_DESC`인 경우 별도로 페이지 응답을 제공한다. 현재 검색·단과대·랩실평가 홈의 공통 훅은 해당 페이지 옵션을 사용하지 않는다. 데이터가 커지면 목록 크기와 캐시 정책을 측정해 전환 여부를 정하는 것이 제안이다.

[[SEBU 연구 분야 분류]] · [[SEBU 마이페이지와 북마크]] · [[SEBU 변경 검토 목록]]

<!-- sources:start -->
## 근거 파일

- [프론트 · src/api/labApi.js](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/api/labApi.js)
- [프론트 · src/api/queries/laboratories.js](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/api/queries/laboratories.js)
- [프론트 · src/features/search/hooks/useLabFilter.js](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/search/hooks/useLabFilter.js)
- [프론트 · src/features/search/utils/labFilterUtils.js](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/search/utils/labFilterUtils.js)
- [프론트 · src/pages/Search/index.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/pages/Search/index.jsx)
- [프론트 · src/features/search/components/SearchBar.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/search/components/SearchBar.jsx)
- [프론트 · src/features/search/components/CollegeChips.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/search/components/CollegeChips.jsx)
- [프론트 · src/features/search/components/ResearchFieldChips.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/search/components/ResearchFieldChips.jsx)
- [프론트 · src/features/search/components/FilterChip.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/search/components/FilterChip.jsx)
- [프론트 · src/features/search/components/ScrollableRow.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/search/components/ScrollableRow.jsx)
- [프론트 · src/features/collegeView/hooks/useCollegeStats.js](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/collegeView/hooks/useCollegeStats.js)
- [프론트 · src/pages/CollegeView/index.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/pages/CollegeView/index.jsx)
- [프론트 · src/features/collegeView/components/CollegeAccordionItem.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/collegeView/components/CollegeAccordionItem.jsx)
- [프론트 · src/features/collegeView/components/CollegeAccordionList.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/collegeView/components/CollegeAccordionList.jsx)
- [프론트 · src/features/collegeView/components/DepartmentList.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/collegeView/components/DepartmentList.jsx)
- [프론트 · src/features/search/components/RecommendedLabs.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/search/components/RecommendedLabs.jsx)
- [프론트 · src/components/common/LabCard.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/components/common/LabCard.jsx)
- [프론트 · src/components/common/LabDetailModal.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/components/common/LabDetailModal.jsx)
- [프론트 · src/features/main/api/mainApi.js](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/main/api/mainApi.js)
- [프론트 · src/features/main/components/CollegeSection.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/main/components/CollegeSection.jsx)
- [프론트 · src/hooks/useLabBookmark.js](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/hooks/useLabBookmark.js)
- [백엔드 · src/main/java/com/sebu/backend/laboratory/controller/LaboratoryController.java](https://github.com/greedy-team/SEBU-backend/blob/21bd49e5133210978b4991a99d7e3cb6a33e6a7a/src/main/java/com/sebu/backend/laboratory/controller/LaboratoryController.java)
- [백엔드 · src/main/java/com/sebu/backend/laboratory/dto/LaboratoriesResponse.java](https://github.com/greedy-team/SEBU-backend/blob/21bd49e5133210978b4991a99d7e3cb6a33e6a7a/src/main/java/com/sebu/backend/laboratory/dto/LaboratoriesResponse.java)

기준 커밋은 [[SEBU 저장소와 기준 버전]]에서 확인한다.
<!-- sources:end -->

---
[[SEBU 홈]] · [[SEBU 지식 지도]]
