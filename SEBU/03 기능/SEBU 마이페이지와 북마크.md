---
project: SEBU
type: "feature"
status: "기준 코드 및 연결 차이 확인"
created: 2026-09-26
verified: 2026-10-09
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
  - "F:src/hooks/useLabBookmark.js"
  - "F:src/features/search/components/RecommendedLabs.jsx"
  - "F:src/features/mypage/components/BookmarkedLabs.jsx"
  - "F:src/components/layout/Header.jsx"
  - "F:src/components/layout/MobileMenu.jsx"
  - "F:src/pages/LabReviewWrite/index.jsx"
  - "F:src/features/auth/hooks/useLogin.js"
  - "F:src/store/authStore.js"
  - "B:src/main/java/com/sebu/backend/bookmark/controller/BookmarkController.java"
  - "B:src/main/java/com/sebu/backend/mypage/dto/ProfileUpdateRequest.java"
  - "F:src/features/auth/hooks/useAuthRestore.js"
  - "F:src/features/search/hooks/useLabFilter.js"
  - "B:src/main/java/com/sebu/backend/auth/controller/MeController.java"
---
# SEBU 마이페이지와 북마크

북마크 저장·해제는 일반 연구실 카드·상세 모달과 인기 연구실 모달에 공용 useLabBookmark로 연결되어 있다. 프로필 저장의 훅 인자 불일치와 캐시 미갱신도 기준 코드에서 수정됐다. 아래 내용은 코드 검토 결과이며 실제 저장·복귀·모바일 표시를 실행 검증한 기록은 아니다.

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

1. 카드와 인기 연구실 모달이 useLabBookmark를 호출한다. toggleBookmark는 이벤트 전파를 막아 카드 상세 열기와 분리한다.
2. user가 없으면 `/login`으로 이동하며 `state.from`에 현재 pathname을 남긴다.
3. user가 있으면 현재 bookmarked 값에 따라 PUT 또는 DELETE를 호출한다.
4. 요청 전 공통 목록 캐시의 bookmarked·bookmarkCount를 낙관적으로 변경한다.
5. 실패하면 이전 목록 캐시로 되돌리고, 성공하면 마이페이지 캐시를 무효화한다.
6. 마이페이지에서 해제 성공 시 해당 항목을 숨기고 4초간 실행취소를 제공한다. 실행취소는 다시 PUT을 보낸다.

인기 연구실은 선택한 객체 대신 ID를 보관하고 현재 목록에서 연구실을 다시 찾으므로 공통 캐시 변경을 모달 props에 반영한다. 마이페이지의 실행취소 토스트는 모바일 화면 너비 안에 들어오도록 최대 너비를 제한한다.

`bookmarked: false`는 '현재 사용자가 저장하지 않음'을 나타낸다. 로그인 여부 판별은 authStore의 사용자·상태로 한다. 로그인 사용자도 아직 저장하지 않았다면 false다.

`GET /api/v1/me`는 현재 쿠키가 유효한 사용자 자격인지 확인하는 개인 정보 API다. 비로그인 접근의 401과 공개 연구실 목록의 `bookmarked:false`는 서로 다른 의미다. 북마크를 누를 때마다 `/me`를 먼저 조회하는 구조도 아니다. 앱 시작 때 인증 복원으로 채운 authStore를 공용 훅이 사용하고, 실제 저장 요청의 인증은 BE가 다시 검증한다. [[SEBU 공개 API와 CORS]]

## 로그인 안내에 대해 합의할 내용

현재 useLogin은 성공 시 from 경로 또는 홈으로 돌아간다. 헤더·모바일 메뉴·후기 작성 화면은 `pathname + search`를 전달하고 useLabBookmark는 pathname만 담는다. 최신 검색어는 URL 대신 `location.state.keyword`에 있으므로 두 방식 모두 로그인 복귀 시 검색어를 넘기지 않는다. 필터·정렬도 컴포넌트 상태에만 있어 별도 보존하지 않는다.

클릭한 연구실 ID를 대기 작업으로 보존하거나 로그인 후 자동으로 저장하는 코드는 없다. 로그인 안내 모달과 자동 저장은 제안 단계다.

다음은 **미구현 제안**이다.

- 북마크 클릭 시 '로그인하면 관심 연구실을 저장하고 모아볼 수 있어요' 안내와 '계속 둘러보기 / 로그인하고 저장' 선택을 제공한다.
- auth status가 loading인 동안은 판단을 보류한다. 현재 공용 훅의 `!user` 조건은 loading과 anonymous를 구별하지 않는다.
- 로그인하고 저장을 선택한 경우 연구실 ID와 복귀 화면을 보존하고, 성공 후 한 번 저장한다.
- 요청 중 중복 클릭 방지와 실패 안내를 추가한다. 현재 공용 훅은 mutation의 isPending을 반환하지 않고 호출 버튼도 요청 중 비활성화하지 않는다.

## 프로필 저장 수정과 남은 차이

이름·전공은 읽기 전용이고 API는 grade/gpaBand/introduction을 보낸다. 백엔드는 선택 nickname도 받으며 grade=5를 졸업생으로 지원하지만 현재 폼 선택지는 1~4학년이다.

MyPage는 이제 훅 선언과 같은 `useProfileForm(updateUser, callback)`으로 호출한다. 저장 성공 시 서버가 반환한 프로필로 기존 `["mypage"].profile`을 교체하고 authStore의 profileCompleted를 true로 갱신한다. 그 뒤 모달을 닫고 2초간 '저장됐어요' 토스트를 표시한다. 이전 검토의 인자 불일치·캐시 갱신 누락은 코드에서 해소됐으며 실제 서버 저장 성공과 즉시 표시 여부는 실행 확인이 남아 있다.

현재 ProfileForm은 introduction을 초기값에서 읽어 요청에 포함하지만 자기소개 입력란은 렌더링하지 않는다. 따라서 API 필드가 있다는 이유로 해당 폼에서 자기소개를 편집할 수 있다고 해석하면 안 된다.

## 탈퇴 안내

탈퇴 확인 모달은 '1시간 미만 복구 불가 → 1시간 이후 복구 가능 기간 → 30일 이상 복구 불가·재로그인 시 신규 계정 처리'의 세 단계 안내를 표시한다. 이 변경은 프론트 안내 문구이며 서버의 시간 경계·정리 작업과 실제 복구 동작은 [[SEBU 인증과 CSRF]]에서 구분한다.

[[SEBU 인증과 CSRF]] · [[SEBU 화면과 API 공유]] · [[SEBU 변경 검토 목록]]

<!-- sources:start -->
## 근거 파일

- [프론트 · src/features/mypage/api/mypageApi.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/features/mypage/api/mypageApi.js)
- [프론트 · src/features/mypage/hooks/useMyPage.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/features/mypage/hooks/useMyPage.js)
- [프론트 · src/features/mypage/hooks/useProfileForm.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/features/mypage/hooks/useProfileForm.js)
- [프론트 · src/features/mypage/components/ProfileForm.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/features/mypage/components/ProfileForm.jsx)
- [프론트 · src/pages/MyPage/index.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/pages/MyPage/index.jsx)
- [프론트 · src/api/bookmarkApi.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/api/bookmarkApi.js)
- [프론트 · src/api/queries/laboratories.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/api/queries/laboratories.js)
- [프론트 · src/api/queryClient.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/api/queryClient.js)
- [프론트 · src/components/common/LabCard.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/components/common/LabCard.jsx)
- [프론트 · src/components/common/LabDetailModal.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/components/common/LabDetailModal.jsx)
- [프론트 · src/hooks/useLabBookmark.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/hooks/useLabBookmark.js)
- [프론트 · src/features/search/components/RecommendedLabs.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/features/search/components/RecommendedLabs.jsx)
- [프론트 · src/features/mypage/components/BookmarkedLabs.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/features/mypage/components/BookmarkedLabs.jsx)
- [프론트 · src/components/layout/Header.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/components/layout/Header.jsx)
- [프론트 · src/components/layout/MobileMenu.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/components/layout/MobileMenu.jsx)
- [프론트 · src/pages/LabReviewWrite/index.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/pages/LabReviewWrite/index.jsx)
- [프론트 · src/features/auth/hooks/useLogin.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/features/auth/hooks/useLogin.js)
- [프론트 · src/store/authStore.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/store/authStore.js)
- [백엔드 · src/main/java/com/sebu/backend/bookmark/controller/BookmarkController.java](https://github.com/greedy-team/SEBU-backend/blob/bb7372518cb2d69f0e83cad2ec760a8920c7f964/src/main/java/com/sebu/backend/bookmark/controller/BookmarkController.java)
- [백엔드 · src/main/java/com/sebu/backend/mypage/dto/ProfileUpdateRequest.java](https://github.com/greedy-team/SEBU-backend/blob/bb7372518cb2d69f0e83cad2ec760a8920c7f964/src/main/java/com/sebu/backend/mypage/dto/ProfileUpdateRequest.java)
- [프론트 · src/features/auth/hooks/useAuthRestore.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/features/auth/hooks/useAuthRestore.js)
- [프론트 · src/features/search/hooks/useLabFilter.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/features/search/hooks/useLabFilter.js)
- [백엔드 · src/main/java/com/sebu/backend/auth/controller/MeController.java](https://github.com/greedy-team/SEBU-backend/blob/bb7372518cb2d69f0e83cad2ec760a8920c7f964/src/main/java/com/sebu/backend/auth/controller/MeController.java)

기준 커밋은 [[SEBU 저장소와 기준 버전]]에서 확인한다.
<!-- sources:end -->

---
[[SEBU 홈]] · [[SEBU 지식 지도]]
