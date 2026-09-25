---
project: SEBU
type: "feature"
status: "기준 코드 및 연결 차이 확인"
created: 2026-09-26
verified: 2026-09-26
tags:
  - sebu
  - sebu/feature
source_ids:
  - "F:src/features/mypage/api/mypageApi.js"
  - "F:src/features/mypage/hooks/useMyPage.js"
  - "F:src/features/mypage/hooks/useProfileForm.js"
  - "F:src/features/mypage/components/ProfileForm.jsx"
  - "F:src/pages/MyPage/index.jsx"
  - "F:src/api/bookmarkApi.js"
  - "F:src/api/queries/laboratories.js"
  - "F:src/api/queryClient.js"
  - "F:src/components/common/LabCard.jsx"
  - "F:src/components/common/LabDetailModal.jsx"
  - "F:src/features/auth/hooks/useLogin.js"
  - "F:src/store/authStore.js"
  - "B:src/main/java/com/sebu/backend/bookmark/controller/BookmarkController.java"
  - "B:src/main/java/com/sebu/backend/mypage/dto/ProfileUpdateRequest.java"
---
# SEBU 마이페이지와 북마크

북마크 저장·해제는 일반 연구실 카드와 카드에서 연 상세 모달에 연결되어 있다. 비로그인 사용자가 누르면 현재는 로그인 페이지로 이동하며, 로그인 안내 모달과 로그인 후 자동 저장은 아직 제안 단계다.

## API와 현재 역할

| 기능 | API | 프론트 사용 |
|---|---|---|
| 마이페이지 | GET /api/v1/users/me/mypage | 프로필과 북마크 연구실 목록 표시 |
| 프로필 수정 | PUT /api/v1/users/me/profile | grade, gpaBand, introduction 전송 |
| 북마크 저장 | PUT /api/v1/laboratories/{id}/bookmark | 응답 본문 없이 완료 대기 |
| 북마크 해제 | DELETE /api/v1/laboratories/{id}/bookmark | 응답 본문 없이 완료 대기 |
| 독립 북마크 목록 | GET /api/v1/users/me/bookmarked-laboratories | API 함수가 있으며 마이페이지 화면은 합성 응답 사용 |
| 탈퇴 | DELETE /api/v1/users/me | 성공 시 인증·캐시 정리 |

북마크 PUT·DELETE의 서버 성공 응답은 204이고 프론트는 JSON success 필드를 요구하지 않는다. useMyPage는 인증 status가 authenticated일 때만 조회하고, 인증 복원 중에는 로딩으로 표시한다.

## 실제 북마크 클릭 흐름

1. LabCard의 handleBookmark가 이벤트 전파를 막아 카드 상세 열기와 분리한다.
2. user가 없으면 `/login`으로 이동하며 `state.from`에 현재 pathname을 남긴다.
3. user가 있으면 현재 bookmarked 값에 따라 PUT 또는 DELETE를 호출한다.
4. 요청 전 공통 목록 캐시의 bookmarked·bookmarkCount를 낙관적으로 변경한다.
5. 실패하면 이전 목록 캐시로 되돌리고, 성공하면 마이페이지 캐시를 무효화한다.
6. 마이페이지에서 해제 성공 시 해당 항목을 숨기고 4초간 실행취소를 제공한다. 실행취소는 다시 PUT을 보낸다.

`bookmarked: false`는 '현재 사용자가 저장하지 않음'을 나타낸다. 로그인 여부 판별은 authStore의 사용자·상태로 한다. 로그인 사용자도 아직 저장하지 않았다면 false다.

## 로그인 안내에 대해 합의할 내용

현재 useLogin은 성공 시 from 경로 또는 홈으로 돌아간다. 클릭한 연구실 ID를 대기 작업으로 보존하거나 자동으로 저장하는 코드는 없다. from에는 pathname만 담기므로 검색 쿼리나 필터 상태 전체 보존도 보장하지 않는다.

다음은 **미구현 제안**이다.

- 북마크 클릭 시 '로그인하면 관심 연구실을 저장하고 모아볼 수 있어요' 안내와 '계속 둘러보기 / 로그인하고 저장' 선택을 제공한다.
- auth status가 loading인 동안은 판단을 보류한다. 현재 카드의 `!user` 조건은 loading과 anonymous를 구별하지 않는다.
- 로그인하고 저장을 선택한 경우 연구실 ID와 복귀 화면을 보존하고, 성공 후 한 번 저장한다.
- 요청 중 중복 클릭 방지와 실패 안내를 추가한다. 현재 LabCard는 mutation의 isPending을 버튼 비활성화에 사용하지 않는다.

## 프로필 연결에서 남은 차이

이름·전공은 읽기 전용이고 API는 grade/gpaBand/introduction을 보낸다. 이전 노트의 'name/major를 수정 요청으로 보낸다'는 설명은 현재 코드에 맞지 않는다. 백엔드는 선택 nickname도 받으며 grade=5를 졸업생으로 지원하지만 현재 폼 선택지는 1~4학년이다.

MyPage는 useProfileForm을 `(data?.profile, updateUser, callback)`로 호출하고, 훅의 선언은 `(updateUser, onSuccess)`다. 이 인자 불일치는 저장 성공 후 처리 오류를 만들 수 있으므로 우선 수정·실행 확인이 필요하다. 훅 안에는 주석과 달리 마이페이지 캐시를 갱신하는 setQueryData도 없다. 이 노트는 코드 읽기 결과이며 저장 동작 재현 결과가 아니다.

[[SEBU 인증과 CSRF]] · [[SEBU 화면과 API 공유]] · [[SEBU 변경 검토 목록]]

<!-- sources:start -->
## 근거 파일

- [프론트 · src/features/mypage/api/mypageApi.js](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/features/mypage/api/mypageApi.js)
- [프론트 · src/features/mypage/hooks/useMyPage.js](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/features/mypage/hooks/useMyPage.js)
- [프론트 · src/features/mypage/hooks/useProfileForm.js](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/features/mypage/hooks/useProfileForm.js)
- [프론트 · src/features/mypage/components/ProfileForm.jsx](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/features/mypage/components/ProfileForm.jsx)
- [프론트 · src/pages/MyPage/index.jsx](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/pages/MyPage/index.jsx)
- [프론트 · src/api/bookmarkApi.js](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/api/bookmarkApi.js)
- [프론트 · src/api/queries/laboratories.js](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/api/queries/laboratories.js)
- [프론트 · src/api/queryClient.js](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/api/queryClient.js)
- [프론트 · src/components/common/LabCard.jsx](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/components/common/LabCard.jsx)
- [프론트 · src/components/common/LabDetailModal.jsx](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/components/common/LabDetailModal.jsx)
- [프론트 · src/features/auth/hooks/useLogin.js](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/features/auth/hooks/useLogin.js)
- [프론트 · src/store/authStore.js](https://github.com/greedy-team/SEBU-frontend/blob/2fb75666f9f75a062222f8f74b434a4ddd067fef/src/store/authStore.js)
- [백엔드 · src/main/java/com/sebu/backend/bookmark/controller/BookmarkController.java](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/src/main/java/com/sebu/backend/bookmark/controller/BookmarkController.java)
- [백엔드 · src/main/java/com/sebu/backend/mypage/dto/ProfileUpdateRequest.java](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/src/main/java/com/sebu/backend/mypage/dto/ProfileUpdateRequest.java)

기준 커밋은 [[SEBU 저장소와 기준 버전]]에서 확인한다.
<!-- sources:end -->

---
[[SEBU 홈]] · [[SEBU 지식 지도]]
