---
project: SEBU
type: "feature"
status: "기준 코드 및 계약 차이 확인"
created: 2026-09-26
verified: 2026-10-07
tags:
  - sebu
  - sebu/feature
source_ids:
  - "F:src/App.jsx"
  - "F:src/components/layout/Header.jsx"
  - "F:src/constants/navigation.js"
  - "F:src/components/common/LabCard.jsx"
  - "F:src/features/main/components/LabReviewHighlights.jsx"
  - "F:src/features/community/api/communityApi.js"
  - "F:src/features/community/hooks/useLabList.js"
  - "F:src/features/community/hooks/useLabReviews.js"
  - "F:src/pages/LabReview/index.jsx"
  - "F:src/pages/LabReviewWrite/index.jsx"
  - "F:src/features/community/components/LabReviewForm.jsx"
  - "F:src/features/community/components/ReviewTagSummary.jsx"
  - "B:src/main/java/com/sebu/backend/laboratoryreview/controller/LaboratoryReviewController.java"
  - "B:src/main/java/com/sebu/backend/laboratoryreview/dto/LaboratoryReviewCreateRequest.java"
  - "B:src/main/java/com/sebu/backend/laboratoryreview/dto/LaboratoryReviewListResponse.java"
---
# SEBU 커뮤니티와 후기

랩실평가는 연구실 선택 목록과 후기 조회·작성 화면까지 프론트 라우트에 연결되어 있다. 메인 후기 수 요약과 연구실 카드에서도 후기 목록으로 이동할 수 있다. 일반 게시판은 관련 코드가 있지만 라우트가 주석 처리되어 있다. 아래 내용은 기준 코드 확인 결과이며 실제 후기 등록을 실행한 기록은 아니다.

## 랩실평가의 세 단계

| 단계 | 화면 경로 | API |
|---|---|---|
| 연구실 선택 | /community/labs | GET /api/v1/laboratories |
| 해당 연구실 후기 읽기 | /community/labs/{laboratoryId} | GET /api/v1/laboratories/{id}/reviews?page=0&size=20 |
| 후기 작성 | /community/labs/{laboratoryId}/write | POST /api/v1/laboratories/{id}/reviews |

첫 단계는 검색·단과대와 같은 연구실 목록 캐시를 쓴다. 후기 본문을 조회하는 단계에서는 useLabReviews가 별도로 요청하며, 20개 단위와 더 보기 흐름이 있다. [[SEBU 화면과 API 공유]]

메인의 LabReviewHighlights는 공통 목록에서 reviewCount가 1개 이상인 연구실을 후기 수 내림차순으로 최대 9개 고르고 3개씩 표시한다. 연구실·교수·학과·후기 수는 목록 응답에서 읽으며 하드코딩된 후기 샘플은 아니다. 다만 후기 본문·작성일·최신 후기 API는 사용하지 않으므로 최신 후기 피드라고 설명하지 않는다. LabCard의 '후기' 링크와 메인 요약 항목은 해당 연구실 후기 목록으로 이동한다.

후기 목록 응답은 laboratory, reviewedByMe, reviews, page, size, totalElements, hasNext다. 현재 백엔드 laboratory 요약은 id·name으로 구성되어 있으며 프론트도 교수·학과 등 부가값이 없을 수 있도록 표시를 방어한다. 목록 후기에는 작성자 정보 없이 참여 시기·평가 항목·태그·본문 등을 제공한다.

## 작성과 권한 표시

작성 화면은 비로그인 상태에 로그인 안내를 표시하고, reviewedByMe가 true면 기존 후기 존재 안내를 표시한다. 새 후기 폼은 분류, 참여 연도·학기, 연구 강도·인건비·분위기, 선택 태그, 본문을 전송한다. 프론트는 trim한 본문 20자 이상과 최대 2000자를 기준으로 입력을 제한한다.

후기 작성 화면의 로그인 링크는 현재 `pathname + search`를 state.from에 담아 로그인 후 작성 화면으로 돌아갈 수 있게 한다. 자동 작성이나 작성 내용 보존을 추가한 것은 아니다.

프론트에서 작성 폼을 숨기는 것은 사용자 안내다. 실제 인증·권한 판단은 서버가 수행한다. 작성 성공 후에는 해당 연구실 후기 목록으로 이동하지만 공통 연구실 목록 캐시의 reviewCount를 갱신하는 코드는 현재 작성 흐름에 없다.

## 최신 백엔드와 프론트 노출의 차이

| 백엔드에 있는 API | 현재 프론트 연결 |
|---|---|
| GET /laboratories/{id}/review-summary | 호출하지 않음. 불러온 후기의 태그만 프론트에서 집계 |
| GET /laboratories/{id}/reviews/me | 현재 communityApi에 함수 없음 |
| PUT /laboratories/{id}/reviews/{reviewId} | 후기 수정 화면·함수 없음 |
| DELETE /laboratories/{id}/reviews/{reviewId} | 후기 삭제 화면·함수 없음 |

표의 경로는 /api/v1 아래다. 후기 폼에 남은 '수정 및 삭제가 불가능' 문구는 현재 백엔드의 기능과 차이가 있다. 이를 제품 정책으로 유지할지, 수정·삭제를 연결하고 안내를 바꿀지는 팀 결정이 필요하다.

태그 요약은 현재 페이지까지 로드한 후기만 세므로 전체 후기의 통계로 해석하면 안 된다. 전체 통계가 필요하면 이미 존재하는 review-summary 응답과 UI의 표시 요구를 대조한다.

## 일반 커뮤니티

communityApi에는 게시글 목록·상세·작성·수정·삭제, 댓글, 좋아요, 글 북마크 함수가 있다. 하지만 App.jsx의 일반 게시판 라우트는 주석 처리되어 있다. Header와 모바일 메뉴가 함께 쓰는 NAV_ITEMS에는 연구실 탐색·단과대별 보기·랩실 평가만 있으며 일반 커뮤니티는 MVP 제외 설명이 남아 있다. 일반 게시판 코드의 존재와 사용자에게 노출된 화면을 구분한다.

[[SEBU API 지도]] · [[SEBU 구현 현황]] · [[SEBU 변경 검토 목록]]

<!-- sources:start -->
## 근거 파일

- [프론트 · src/App.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/App.jsx)
- [프론트 · src/components/layout/Header.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/components/layout/Header.jsx)
- [프론트 · src/constants/navigation.js](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/constants/navigation.js)
- [프론트 · src/components/common/LabCard.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/components/common/LabCard.jsx)
- [프론트 · src/features/main/components/LabReviewHighlights.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/main/components/LabReviewHighlights.jsx)
- [프론트 · src/features/community/api/communityApi.js](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/community/api/communityApi.js)
- [프론트 · src/features/community/hooks/useLabList.js](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/community/hooks/useLabList.js)
- [프론트 · src/features/community/hooks/useLabReviews.js](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/community/hooks/useLabReviews.js)
- [프론트 · src/pages/LabReview/index.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/pages/LabReview/index.jsx)
- [프론트 · src/pages/LabReviewWrite/index.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/pages/LabReviewWrite/index.jsx)
- [프론트 · src/features/community/components/LabReviewForm.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/community/components/LabReviewForm.jsx)
- [프론트 · src/features/community/components/ReviewTagSummary.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/community/components/ReviewTagSummary.jsx)
- [백엔드 · src/main/java/com/sebu/backend/laboratoryreview/controller/LaboratoryReviewController.java](https://github.com/greedy-team/SEBU-backend/blob/d1010d405abfcb5f9b01b155c48032da01ee1d2d/src/main/java/com/sebu/backend/laboratoryreview/controller/LaboratoryReviewController.java)
- [백엔드 · src/main/java/com/sebu/backend/laboratoryreview/dto/LaboratoryReviewCreateRequest.java](https://github.com/greedy-team/SEBU-backend/blob/d1010d405abfcb5f9b01b155c48032da01ee1d2d/src/main/java/com/sebu/backend/laboratoryreview/dto/LaboratoryReviewCreateRequest.java)
- [백엔드 · src/main/java/com/sebu/backend/laboratoryreview/dto/LaboratoryReviewListResponse.java](https://github.com/greedy-team/SEBU-backend/blob/d1010d405abfcb5f9b01b155c48032da01ee1d2d/src/main/java/com/sebu/backend/laboratoryreview/dto/LaboratoryReviewListResponse.java)

기준 커밋은 [[SEBU 저장소와 기준 버전]]에서 확인한다.
<!-- sources:end -->

---
[[SEBU 홈]] · [[SEBU 지식 지도]]
