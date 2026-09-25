---
project: SEBU
type: "reference"
status: "2026-09-26 코드·문서 확인"
created: 2026-09-26
verified: 2026-09-26
tags:
  - sebu
  - sebu/reference
source_ids:
  - "B:src/main/java/com/sebu/backend/global/auth/SecurityConfiguration.java"
  - "B:src/main/java/com/sebu/backend/auth/controller/AuthController.java"
  - "B:src/main/java/com/sebu/backend/auth/controller/MeController.java"
  - "B:src/main/java/com/sebu/backend/laboratory/controller/LaboratoryController.java"
  - "B:src/main/java/com/sebu/backend/college/controller/CollegeController.java"
  - "B:src/main/java/com/sebu/backend/researchfield/category/controller/ResearchFieldCategoryController.java"
  - "B:src/main/java/com/sebu/backend/mypage/controller/MyPageController.java"
  - "B:src/main/java/com/sebu/backend/bookmark/controller/BookmarkController.java"
  - "B:src/main/java/com/sebu/backend/community/post/controller/CommunityPostController.java"
  - "B:src/main/java/com/sebu/backend/community/comment/controller/CommunityCommentController.java"
  - "B:src/main/java/com/sebu/backend/community/reaction/controller/CommunityPostReactionController.java"
  - "B:src/main/java/com/sebu/backend/community/profile/controller/CommunityProfileController.java"
  - "B:src/main/java/com/sebu/backend/laboratoryreview/controller/LaboratoryReviewController.java"
  - "B:src/main/java/com/sebu/backend/global/response/ApiResponse.java"
  - "F:src/api/queries/laboratories.js"
---
# SEBU API 지도

검색·단과대·랩실평가 홈은 같은 연구실 목록 API를 사용한다. 실제 후기 조회·작성, 개인 북마크와 프로필은 별도 API다. 백엔드는 계약을 제공하고 프론트는 화면별로 필요한 요청을 선택한다.

아래 상대 경로 앞에는 모두 `/api/v1`이 붙는다. 이 표는 코드 탐색용이며 요청 DTO·상태 코드 전체 명세를 대체하지 않는다.

| 기능 | 메서드와 상대 경로 | 기존 로그인 필요 |
|---|---|---|
| CSRF 준비 | GET /auth/csrf | 없음 |
| 학교 로그인 | POST /auth/sejong/login | 없음. 입력 학번·비밀번호 검증 |
| 갱신·로그아웃·복구 | POST /auth/refresh, /auth/logout, /auth/recovery | 유효 Access를 일괄 요구하지 않음. 각각 Refresh/Recovery 등 별도 계약 적용 |
| 내 정보·학년 | GET /me, PATCH /me/profile | 필요 |
| 연구실 목록 | GET /laboratories | 없음 |
| 단과대·분류 목록 | GET /colleges, /research-field-categories | 없음 |
| 마이페이지·프로필 | GET /users/me/mypage, PUT /users/me/profile | 필요 |
| 탈퇴 | DELETE /users/me | 필요 |
| 내 연구실 북마크 | GET /users/me/bookmarked-laboratories | 필요 |
| 북마크 저장·해제 | PUT·DELETE /laboratories/{id}/bookmark | 필요 |
| 게시글 | GET·POST /posts, GET·PUT·DELETE /posts/{id} | GET 공개, 변경은 인증·권한 확인 |
| 댓글 | GET·POST /posts/{id}/comments, PATCH·DELETE /posts/{id}/comments/{commentId} | GET 공개, 변경은 인증·권한 확인 |
| 게시글 반응 | PUT·DELETE /posts/{id}/likes, /posts/{id}/bookmarks | 필요 |
| 연구실 후기 | GET·POST /laboratories/{id}/reviews, PUT·DELETE /laboratories/{id}/reviews/{reviewId} | GET 목록 공개, 변경은 인증·권한 확인 |
| 후기 요약 | GET /laboratories/{id}/review-summary | 없음 |
| 내 후기 | GET /laboratories/{id}/reviews/me | 필요 |

`GET /users/{id}/community-profile`은 보안 설정에서 공개 경로지만, 현재 컨트롤러가 익명 정책에 따라 항상 404를 반환한다. 경로가 존재하는 것과 기능을 제공하는 것은 다르다.

## 하나의 목록을 세 화면에서 쓰는 이유

| 화면 | 공통 조회 이후 프론트 처리 |
|---|---|
| 검색 | 검색어·조건 필터링, 선택한 정렬 |
| 단과대 | 단과대·학과로 묶어서 표시 |
| 랩실평가 홈 | `reviewCount` 순으로 연구실 표시 |

프론트의 `useLaboratoriesQuery()`는 `['laboratories']` 캐시를 재사용한다. 같은 API 사용은 반드시 화면마다 네트워크 요청을 새로 보낸다는 뜻이 아니다. 연구실을 선택해 후기 내용을 읽으면 `GET /laboratories/{id}/reviews`로 요청한다. [[SEBU 연구실 탐색]] · [[SEBU 커뮤니티와 후기]]

백엔드의 `GET /laboratories?sort=REVIEW_COUNT_DESC&page=0&size=20`은 후기 수 순 페이지 조회다. 기본 전체 목록과 응답 구조가 다르고, size는 1~50이다. 현재 세 화면의 공통 훅은 이 옵션을 쓰지 않는다.

## 응답·보안 계약

JSON 공통 형태는 `{ success, data, error }`이며 오류에 code/message/fieldErrors/traceId가 있다. CSRF 준비·북마크 저장/해제·탈퇴 성공은 204처럼 본문이 없는 경우도 있으므로 무조건 JSON 파싱하지 않는다.

공개 조회도 `/api/**` CORS 설정의 대상이며 변경 요청은 CSRF·출처 검증을 받는다. 로그인 API 자체는 기존 로그인 없이 호출해야 한다. [[SEBU 공개 API와 CORS]] · [[SEBU 인증과 CSRF]]

<!-- sources:start -->
## 근거 파일

- [백엔드 · src/main/java/com/sebu/backend/global/auth/SecurityConfiguration.java](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/src/main/java/com/sebu/backend/global/auth/SecurityConfiguration.java)
- [백엔드 · src/main/java/com/sebu/backend/auth/controller/AuthController.java](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/src/main/java/com/sebu/backend/auth/controller/AuthController.java)
- [백엔드 · src/main/java/com/sebu/backend/auth/controller/MeController.java](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/src/main/java/com/sebu/backend/auth/controller/MeController.java)
- [백엔드 · src/main/java/com/sebu/backend/laboratory/controller/LaboratoryController.java](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/src/main/java/com/sebu/backend/laboratory/controller/LaboratoryController.java)
- [백엔드 · src/main/java/com/sebu/backend/college/controller/CollegeController.java](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/src/main/java/com/sebu/backend/college/controller/CollegeController.java)
- [백엔드 · src/main/java/com/sebu/backend/researchfield/category/controller/ResearchFieldCategoryController.java](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/src/main/java/com/sebu/backend/researchfield/category/controller/ResearchFieldCategoryController.java)
- [백엔드 · src/main/java/com/sebu/backend/mypage/controller/MyPageController.java](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/src/main/java/com/sebu/backend/mypage/controller/MyPageController.java)
- [백엔드 · src/main/java/com/sebu/backend/bookmark/controller/BookmarkController.java](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/src/main/java/com/sebu/backend/bookmark/controller/BookmarkController.java)
- [백엔드 · src/main/java/com/sebu/backend/community/post/controller/CommunityPostController.java](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/src/main/java/com/sebu/backend/community/post/controller/CommunityPostController.java)
- [백엔드 · src/main/java/com/sebu/backend/community/comment/controller/CommunityCommentController.java](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/src/main/java/com/sebu/backend/community/comment/controller/CommunityCommentController.java)
- [백엔드 · src/main/java/com/sebu/backend/community/reaction/controller/CommunityPostReactionController.java](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/src/main/java/com/sebu/backend/community/reaction/controller/CommunityPostReactionController.java)
- [백엔드 · src/main/java/com/sebu/backend/community/profile/controller/CommunityProfileController.java](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/src/main/java/com/sebu/backend/community/profile/controller/CommunityProfileController.java)
- [백엔드 · src/main/java/com/sebu/backend/laboratoryreview/controller/LaboratoryReviewController.java](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/src/main/java/com/sebu/backend/laboratoryreview/controller/LaboratoryReviewController.java)
- [백엔드 · src/main/java/com/sebu/backend/global/response/ApiResponse.java](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/src/main/java/com/sebu/backend/global/response/ApiResponse.java)
- [프론트 · src/api/queries/laboratories.js](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/api/queries/laboratories.js)

기준 커밋은 [[SEBU 저장소와 기준 버전]]에서 확인한다.
<!-- sources:end -->

---
[[SEBU 홈]] · [[SEBU 지식 지도]]
