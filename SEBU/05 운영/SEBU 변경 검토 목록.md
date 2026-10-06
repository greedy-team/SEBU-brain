---
project: SEBU
type: "backlog"
status: "제안·실행 미검증"
created: 2026-09-26
verified: 2026-09-26
tags:
  - sebu
  - sebu/backlog
source_ids:
  - "F:src/api/client.js"
  - "F:src/features/auth/api/authApi.js"
  - "F:src/features/auth/hooks/useAuthRestore.js"
  - "F:src/features/mypage/hooks/useProfileForm.js"
  - "F:src/pages/MyPage/index.jsx"
  - "F:src/features/mypage/components/ProfileForm.jsx"
  - "F:src/components/common/LabCard.jsx"
  - "F:src/features/search/components/RecommendedLabs.jsx"
  - "F:src/features/collegeView/hooks/useCollegeStats.js"
  - "F:src/features/community/components/LabReviewForm.jsx"
  - "F:src/features/community/components/ReviewTagSummary.jsx"
  - "F:src/pages/LabReviewWrite/index.jsx"
  - "F:src/App.jsx"
  - "B:src/main/java/com/sebu/backend/mypage/dto/ProfileUpdateRequest.java"
  - "B:src/main/java/com/sebu/backend/laboratoryreview/controller/LaboratoryReviewController.java"
---
# SEBU 변경 검토 목록

현재 검토 우선순위는 이미 구현된 인증 전환을 다시 만드는 것보다, 프로필 저장 연결과 일부 북마크 진입점의 차이를 정리하고 후기 정책을 맞추는 것이다. 아래는 코드로 발견한 검토 항목이며 오류 재현·수정 완료 기록은 아니다.

## 1. 프로필 저장 후 처리

- [ ] MyPage의 useProfileForm 호출 인자 3개와 훅 선언 인자 2개의 불일치를 수정한다. 첫 인자로 profile 객체가 넘어가므로 성공 콜백에서 함수로 호출될 수 있다.
- [ ] 저장 후 응답을 사용자 상태·마이페이지 캐시에 반영하고 모달이 닫히도록 연결한다. 현재 훅에 setQueryData 구현은 없다.
- [ ] 백엔드 grade=5 졸업생과 프론트 1~4 선택·표시를 맞춘다. nickname·introduction의 편집 범위도 제품 범위와 대조한다.

**완료 조건 제안:** 실제 저장 성공 뒤 모달이 정상적으로 닫히고, 화면과 재조회 결과가 동일하다.

## 2. 북마크 진입점과 로그인 유도

- [ ] RecommendedLabs가 여는 LabDetailModal에도 북마크 상태·핸들러를 연결한다.
- [ ] 인증 loading과 anonymous를 구분하고, 인증 복원 중 클릭의 처리 기준을 정한다.
- [ ] 요청 중 중복 클릭을 막고 오류·서버 제한을 사용자에게 안내한다.
- [ ] 로그인 안내 모달과 로그인 후 선택 연구실 자동 저장의 도입 여부를 정한다. 현재는 /login 즉시 이동이다.
- [ ] 복귀 pathname뿐 아니라 필요한 검색어·필터·선택 연구실을 보존하고 대기 동작의 중복 실행을 막는다.

**완료 조건 제안:** 일반 카드·추천 상세·마이페이지에서 동일한 권한과 저장 상태가 적용되며, 실패·연속 클릭·로그인 복귀가 의도대로 처리된다.

## 3. 인증 복원과 오류 구분

- [ ] useAuthRestore는 /me 실패 종류를 나누지 않고 refresh를 시도하며, 최종 실패·예외를 clearAuth로 처리한다. 네트워크 장애와 인증 실패를 구분한다.
- [ ] client의 `url.includes("/me")` 제외 조건이 `/users/me/mypage`·프로필·탈퇴 요청까지 포함한다. 의도한 정확한 경로만 갱신에서 제외하는지 검토한다.
- [ ] ACCESS_TOKEN_INVALID 즉시 로그아웃, 일반 401 갱신, CSRF 403 초기화·재시도, 동시 401 요청 큐의 구분을 실제 백엔드에서 확인한다.
- [ ] initCsrf의 오류 무시와 로그아웃 실패 시 로컬 상태 정리 정책을 점검한다.
- [ ] 실제 서버 확인 때 MSW를 끄고 쿠키·CSRF·프록시 설정을 함께 확인한다.

**완료 조건 제안:** 로그인 → /me → 새로고침 → 토큰 만료 후 보호된 요청 → 로그아웃이 확인되며, 네트워크 단절을 확정 비로그인으로 오인하지 않는다.

## 4. 후기 API와 안내 정책

- [ ] 백엔드 수정·삭제 API와 프론트 '수정 및 삭제가 불가능' 안내의 정책을 통일한다.
- [ ] review-summary를 활용할지 정하고, 현재 일부 후기의 태그 집계를 전체 통계처럼 표시하지 않는다.
- [ ] 후기 작성 후 공통 목록의 reviewCount·정렬이 갱신되도록 캐시 무효화 또는 반영 정책을 정한다.
- [ ] reviews/me·수정·삭제 기능의 프론트 노출 범위를 정한다.
- [ ] 일반 게시판은 코드 존재와 라우트 비활성 상태를 구분하고 출시 범위를 기록한다.

## 5. 목록 표시와 운영 확인

- [ ] 단과대 화면에서 로딩·오류·실제 0건을 구분한다.
- [ ] 복수 소속 affiliations를 화면 그룹·검색·통계에 반영할 범위를 정한다.
- [ ] 추천 영역의 '실시간'·브라우저 생성 기준 시각을 실제 데이터 갱신 주기와 맞춘다.
- [ ] 배포 커밋, 실제 CORS 설정, 모니터링 수집·알림은 운영 환경에서 별도로 확인한다.

## 새로 만들 필요 없이 코드에 있는 항목

쿠키 client, CSRF 초기화·재시도, /me 복원, refresh 요청 큐, 복구 분기, 일반 카드 북마크 PUT·DELETE, 사용자 변경 시 캐시 정리, NAME_DESC 정렬, 후기 조회·작성 라우트는 이미 존재한다. 코드가 있다는 사실만으로 실행 확인까지 완료 처리하지 않는다.

## 2026-10-06 크롤링 기록의 후속 확인

- [ ] 백엔드 PR #92의 머지 여부와 실제 배포 버전을 확인하고 [[SEBU 예체능대학 크롤링 검수 - 2026-10-06]]의 상태를 갱신한다.
- [ ] 머지 후 교수·연구실과 연구분야·카테고리 연결의 실제 적용을 확인한다. 격리 DB의 검증 성공을 운영 반영 성공으로 대체하지 않는다.
- [ ] [[SEBU 저장소와 기준 버전]]에 기록한 전체 코드 차이를 별도로 검토한 뒤 전역 기준과 관련 구현 노트를 갱신한다.

[[SEBU 구현 현황]] · [[SEBU 인증과 CSRF]] · [[SEBU 마이페이지와 북마크]] · [[SEBU 커뮤니티와 후기]] · [[SEBU 주간 회고 템플릿]]

<!-- sources:start -->
## 근거 파일

- [프론트 · src/api/client.js](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/api/client.js)
- [프론트 · src/features/auth/api/authApi.js](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/features/auth/api/authApi.js)
- [프론트 · src/features/auth/hooks/useAuthRestore.js](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/features/auth/hooks/useAuthRestore.js)
- [프론트 · src/features/mypage/hooks/useProfileForm.js](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/features/mypage/hooks/useProfileForm.js)
- [프론트 · src/pages/MyPage/index.jsx](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/pages/MyPage/index.jsx)
- [프론트 · src/features/mypage/components/ProfileForm.jsx](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/features/mypage/components/ProfileForm.jsx)
- [프론트 · src/components/common/LabCard.jsx](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/components/common/LabCard.jsx)
- [프론트 · src/features/search/components/RecommendedLabs.jsx](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/features/search/components/RecommendedLabs.jsx)
- [프론트 · src/features/collegeView/hooks/useCollegeStats.js](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/features/collegeView/hooks/useCollegeStats.js)
- [프론트 · src/features/community/components/LabReviewForm.jsx](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/features/community/components/LabReviewForm.jsx)
- [프론트 · src/features/community/components/ReviewTagSummary.jsx](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/features/community/components/ReviewTagSummary.jsx)
- [프론트 · src/pages/LabReviewWrite/index.jsx](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/pages/LabReviewWrite/index.jsx)
- [프론트 · src/App.jsx](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/App.jsx)
- [백엔드 · src/main/java/com/sebu/backend/mypage/dto/ProfileUpdateRequest.java](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/src/main/java/com/sebu/backend/mypage/dto/ProfileUpdateRequest.java)
- [백엔드 · src/main/java/com/sebu/backend/laboratoryreview/controller/LaboratoryReviewController.java](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/src/main/java/com/sebu/backend/laboratoryreview/controller/LaboratoryReviewController.java)

기준 커밋은 [[SEBU 저장소와 기준 버전]]에서 확인한다.
<!-- sources:end -->

---
[[SEBU 홈]] · [[SEBU 지식 지도]]
