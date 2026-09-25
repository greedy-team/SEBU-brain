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
  - "F:src/api/queryClient.js"
  - "F:src/features/search/hooks/useLabFilter.js"
  - "F:src/features/collegeView/hooks/useCollegeStats.js"
  - "F:src/features/community/hooks/useLabList.js"
  - "F:src/features/community/hooks/useLabReviews.js"
  - "F:src/features/community/api/communityApi.js"
  - "F:src/features/main/api/mainApi.js"
  - "B:src/main/java/com/sebu/backend/laboratory/controller/LaboratoryController.java"
  - "B:src/main/java/com/sebu/backend/laboratoryreview/controller/LaboratoryReviewController.java"
---
# SEBU 화면과 API 공유

검색·단과대·랩실평가 홈은 모두 GET /api/v1/laboratories를 사용하고, 조회된 데이터 캐시도 공유한다. 특정 연구실의 후기 내용을 읽거나 작성할 때는 별도 API를 호출한다.

## '같은 API를 공유한다'는 뜻

화면 하나마다 API 하나를 따로 만들어야 하는 것은 아니다. 세 화면은 모두 연구실 목록이 필요하므로 동일한 주소·메서드로 데이터를 요청하고, 화면 목적에 맞게 가공한다.

| 화면 | 데이터 처리 훅 | 공통 목록을 사용하는 방식 |
|---|---|---|
| 검색 /search | useLabFilter | 이름·교수·분야 검색, 단과대·모집·분야 필터, 정렬 |
| 단과대 /colleges | useCollegeStats | 단과대·학과별로 묶어 표시하고 개수 집계 |
| 랩실평가 홈 /community/labs | useLabList | 이름 검색, 후기 수 내림차순 또는 이름순 정렬 |

세 훅 모두 `useLaboratoriesQuery()` → `fetchLaboratories()` → `GET /api/v1/laboratories`를 사용한다. 공유하는 데이터는 연구실 이름과 소속·교수·분야·bookmarked·bookmarkCount·reviewCount 등이다.

메인 화면의 단과대 소개용 `GET /api/v1/colleges`는 별도로 존재한다. 여기서 말하는 '단과대 화면과 연구실 목록 API 공유'와 혼동하지 않는다.

## 요청 주소 공유와 데이터 캐시 공유

현재는 두 가지를 모두 공유한다.

1. **API 공유:** 세 화면이 같은 서버 계약을 이용한다.
2. **캐시 공유:** 동일한 QueryClient의 `["laboratories"]`를 읽는다.

staleTime이 1시간이므로 캐시가 존재하고 유효하면 화면 이동 때마다 매번 새 요청을 보낼 필요가 없다. 1시간 동안 무조건 요청이 없다는 뜻은 아니다. 사용자 변경 시 명시적 무효화 등으로 다시 요청할 수 있다.

로그인·로그아웃·계정 변경으로 사용자 ID가 달라지면 공통 목록을 다시 받는다. `bookmarked`가 개인별 값이므로 다른 사용자에게 이전 값을 보여주지 않기 위한 처리다.

## 랩실평가가 별도 API를 쓰는 지점

```text
평가할 연구실을 고르는 화면
GET /api/v1/laboratories
        ↓ 연구실 선택
그 연구실의 후기 본문·작성 여부·페이지 정보
GET /api/v1/laboratories/{id}/reviews
        ↓ 로그인한 사용자의 후기 등록
POST /api/v1/laboratories/{id}/reviews
```

'랩실평가까지 같은 API를 쓴다'는 말은 첫 목록 화면에 해당한다. 후기 내용·작성까지 연구실 목록 API 하나로 처리한다는 뜻은 아니다. 같은 경로라도 GET은 읽기, POST는 생성이므로 서로 다른 API 작업이다.

## 프론트와 백엔드의 역할

- 백엔드는 주소·메서드별로 조회·저장·권한·응답 형식을 구현한다.
- 프론트는 화면에서 필요한 API를 골라 호출하고, 캐시·필터·정렬·표시를 담당한다.
- 어떤 기능을 서버에서 처리하고 어떤 기능을 프론트에서 처리할지는 함께 정한 계약이다. 현재는 이 세 목록 화면의 검색·정렬을 프론트에서 수행한다.

백엔드는 `GET /laboratories?sort=REVIEW_COUNT_DESC&page=0&size=20`으로 후기 수 순 페이지 목록도 제공한다. 프론트 communityApi에 이를 부르는 getLabs가 있지만, 현재 useLabList는 그 함수를 사용하지 않고 공통 전체 목록을 사용한다. 함수가 있다는 것과 화면에서 호출한다는 것은 구분해야 한다.

[[SEBU 연구실 탐색]] · [[SEBU 커뮤니티와 후기]] · [[SEBU 프론트엔드 구조]] · [[SEBU API 지도]]

<!-- sources:start -->
## 근거 파일

- [프론트 · src/api/labApi.js](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/api/labApi.js)
- [프론트 · src/api/queries/laboratories.js](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/api/queries/laboratories.js)
- [프론트 · src/api/queryClient.js](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/api/queryClient.js)
- [프론트 · src/features/search/hooks/useLabFilter.js](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/features/search/hooks/useLabFilter.js)
- [프론트 · src/features/collegeView/hooks/useCollegeStats.js](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/features/collegeView/hooks/useCollegeStats.js)
- [프론트 · src/features/community/hooks/useLabList.js](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/features/community/hooks/useLabList.js)
- [프론트 · src/features/community/hooks/useLabReviews.js](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/features/community/hooks/useLabReviews.js)
- [프론트 · src/features/community/api/communityApi.js](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/features/community/api/communityApi.js)
- [프론트 · src/features/main/api/mainApi.js](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/features/main/api/mainApi.js)
- [백엔드 · src/main/java/com/sebu/backend/laboratory/controller/LaboratoryController.java](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/src/main/java/com/sebu/backend/laboratory/controller/LaboratoryController.java)
- [백엔드 · src/main/java/com/sebu/backend/laboratoryreview/controller/LaboratoryReviewController.java](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/src/main/java/com/sebu/backend/laboratoryreview/controller/LaboratoryReviewController.java)

기준 커밋은 [[SEBU 저장소와 기준 버전]]에서 확인한다.
<!-- sources:end -->

---
[[SEBU 홈]] · [[SEBU 지식 지도]]
