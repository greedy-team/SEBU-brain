---
project: SEBU
type: "status"
status: "기준 코드 및 남은 차이 확인"
created: 2026-09-26
verified: 2026-09-26
tags:
  - sebu
  - sebu/status
source_ids:
  - "F:src/App.jsx"
  - "F:src/api/client.js"
  - "F:src/api/queryClient.js"
  - "F:src/api/queries/laboratories.js"
  - "F:src/features/auth/hooks/useAuthRestore.js"
  - "F:src/features/auth/hooks/useLogin.js"
  - "F:src/components/common/LabCard.jsx"
  - "F:src/features/search/components/RecommendedLabs.jsx"
  - "F:src/features/mypage/api/mypageApi.js"
  - "F:src/features/mypage/hooks/useProfileForm.js"
  - "F:src/pages/MyPage/index.jsx"
  - "F:src/features/community/api/communityApi.js"
  - "F:src/features/community/components/LabReviewForm.jsx"
  - "F:src/features/community/components/ReviewTagSummary.jsx"
  - "B:src/main/java/com/sebu/backend/laboratoryreview/controller/LaboratoryReviewController.java"
---
# SEBU 구현 현황

2026-09-26 기준 스냅샷에서는 프론트의 쿠키·CSRF 전환, 연구실 공통 캐시, 북마크 연결, 랩실평가 조회·작성이 코드에 존재한다. 코드 존재와 실제 배포·연동 성공은 별도로 판단한다.

기준 커밋은 [[SEBU 저장소와 기준 버전]]에서 확인한다. 이 표는 정적 코드 확인 결과이며 앱 실행, 실제 로그인, API 통합 테스트 통과를 뜻하지 않는다.

| 기능 | 현재 코드에서 확인한 내용 | 남은 확인·차이 |
|---|---|---|
| 연구실 목록 | 검색·단과대·랩실평가 홈이 같은 목록 API·캐시 사용 | 목록 크기, 변경 후 최신성, 화면별 오류 표시 |
| 로그인 | 쿠키 client, CSRF 준비, /me 복원, refresh, 복구 분기 | 네트워크 오류와 비로그인 구분 및 갱신 제외 경로 |
| 사용자 변경 | user.id 변화 시 마이페이지 제거·연구실 목록 무효화 | 실제 계정 전환 시 표시 검증 |
| 북마크 | 카드·카드 상세에서 저장·해제, 낙관적 갱신·롤백 | 추천 영역 상세는 핸들러 미전달, 중복 클릭·실패 안내 |
| 비로그인 북마크 | /login 이동 및 pathname 복귀 정보 전달 | 안내 모달·로그인 후 자동 저장은 미구현 제안 |
| 마이페이지 | 인증 완료 후 조회, 프로필 변경 API, 탈퇴·해제 실행취소 | useProfileForm 인자 불일치와 저장 후 캐시 반영 |
| 일반 게시판 | 화면·API 함수 존재 | App.jsx의 게시글 라우트는 주석 처리 |
| 랩실평가 | 목록·후기 상세·작성 라우트 활성 | 수정·삭제·내 후기·전체 요약 API는 프론트 미연결 |
| 후기 태그 요약 | 현재 읽은 후기 배열을 프론트에서 집계 | 전체 통계와 구분 필요, 서버 요약 API 존재 |

## 이전 설명에서 바뀐 점

- '프론트는 Bearer 토큰 기반'이라는 이전 설명은 현재 기준에 맞지 않는다.
- '북마크 버튼이 연결되지 않음'은 일반 카드와 카드 상세에는 해당하지 않는다. 추천 영역 상세는 별도 확인 지점이다.
- '커뮤니티·후기 라우트가 없음'은 너무 넓은 표현이다. 후기는 활성이고 일반 게시판만 주석 처리되어 있다.
- 이전 대화의 로그인 안내 모달·로그인 후 자동 저장은 제안이다. 현재 구현이라고 기록하지 않는다.
- 후기 폼의 '수정·삭제 불가' 안내와 최신 백엔드의 수정·삭제 기능은 서로 다르다.

운영 서버의 배포 커밋, 학교 인증 성공, 수집·알림 상태는 이번 문서 갱신에서 재검증한 사실이 아니다. 남은 항목의 우선순위는 [[SEBU 변경 검토 목록]]에 기록한다.

## 기준 이후의 미머지 작업

2026-10-06 예체능대학 교수·연구실 수집과 연구분야 분리·분류는 백엔드 PR #92의 검수 결과로 [[SEBU 예체능대학 크롤링 검수 - 2026-10-06]]에 별도 기록했다. PR 검증과 운영 적용을 구분하며, 위 2026-09-26 구현 현황 표와 전체 코드 기준은 이번 문서 이동으로 갱신하지 않았다.

[[SEBU 화면과 API 공유]] · [[SEBU 인증과 CSRF]] · [[SEBU 마이페이지와 북마크]] · [[SEBU 커뮤니티와 후기]]

<!-- sources:start -->
## 근거 파일

- [프론트 · src/App.jsx](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/App.jsx)
- [프론트 · src/api/client.js](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/api/client.js)
- [프론트 · src/api/queryClient.js](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/api/queryClient.js)
- [프론트 · src/api/queries/laboratories.js](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/api/queries/laboratories.js)
- [프론트 · src/features/auth/hooks/useAuthRestore.js](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/features/auth/hooks/useAuthRestore.js)
- [프론트 · src/features/auth/hooks/useLogin.js](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/features/auth/hooks/useLogin.js)
- [프론트 · src/components/common/LabCard.jsx](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/components/common/LabCard.jsx)
- [프론트 · src/features/search/components/RecommendedLabs.jsx](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/features/search/components/RecommendedLabs.jsx)
- [프론트 · src/features/mypage/api/mypageApi.js](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/features/mypage/api/mypageApi.js)
- [프론트 · src/features/mypage/hooks/useProfileForm.js](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/features/mypage/hooks/useProfileForm.js)
- [프론트 · src/pages/MyPage/index.jsx](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/pages/MyPage/index.jsx)
- [프론트 · src/features/community/api/communityApi.js](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/features/community/api/communityApi.js)
- [프론트 · src/features/community/components/LabReviewForm.jsx](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/features/community/components/LabReviewForm.jsx)
- [프론트 · src/features/community/components/ReviewTagSummary.jsx](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/features/community/components/ReviewTagSummary.jsx)
- [백엔드 · src/main/java/com/sebu/backend/laboratoryreview/controller/LaboratoryReviewController.java](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/src/main/java/com/sebu/backend/laboratoryreview/controller/LaboratoryReviewController.java)

기준 커밋은 [[SEBU 저장소와 기준 버전]]에서 확인한다.
<!-- sources:end -->

---
[[SEBU 홈]] · [[SEBU 지식 지도]]
