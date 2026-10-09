---
project: SEBU
type: "architecture"
status: "기준 코드 확인"
created: 2026-09-26
verified: 2026-10-09
tags:
  - sebu
  - sebu/architecture
source_ids:
  - "F:package.json"
  - "F:src/App.jsx"
  - "F:src/main.jsx"
  - "F:src/pages/Home/index.jsx"
  - "F:src/pages/Main/index.jsx"
  - "F:src/hooks/useIsMobile.js"
  - "F:src/hooks/useLabBookmark.js"
  - "F:src/constants/navigation.js"
  - "F:src/features/main/hooks/useColleges.js"
  - "F:src/api/client.js"
  - "F:src/api/queryClient.js"
  - "F:src/api/queries/laboratories.js"
  - "F:src/store/authStore.js"
  - "F:src/features/auth/hooks/useAuthRestore.js"
  - "F:src/features/auth/hooks/useLogin.js"
  - "F:vite.config.js"
  - "F:vercel.json"
  - "F:src/components/common/MarkdownDocument.jsx"
  - "F:src/content/privacy/index.js"
  - "F:src/content/terms/index.js"
  - "F:src/constants/links.js"
  - "F:src/features/auth/components/LoginForm.jsx"
  - "F:src/features/search/hooks/useLabFilter.js"
---
# SEBU 프론트엔드 구조

프론트는 페이지·기능별 훅·API 모듈로 역할을 나누고, 서버 데이터는 TanStack Query, 인증 상태는 Zustand로 관리한다. 홈은 화면 너비에 따라 데스크톱 메인과 모바일 검색 화면으로 나뉘며, 연구실 북마크는 공용 훅을 사용한다. 아래 내용은 기준 코드 검토 결과이며 브라우저·실서버 실행을 확인한 기록은 아니다.

## 어디에서 무엇을 바꾸는가

| 위치 | 역할 | 대표 파일 |
|---|---|---|
| `src/pages` | URL별 화면 구성과 홈 분기 | Home, Main, Search, CollegeView, LabReviewHome, LabReview, LabReviewWrite, MyPage, Privacy, Terms |
| `src/features/main` | 메인 검색·후기 수 요약·단과대 소개 | HeroSection, LabReviewHighlights, CollegeSection, useColleges |
| `src/features/search` | 검색어·필터·정렬과 공용 칩 UI | useLabFilter, labFilterUtils, FilterChip, ScrollableRow |
| `src/features/collegeView` | 단과대·학과별 묶음 | useCollegeStats |
| `src/features/community` | 후기 및 일반 게시판의 훅·API·폼 | useLabList, useLabReviews, communityApi |
| `src/features/auth` | 로그인 전 동의·학교 인증·인증 복원·복구 | LoginForm, PrivacyNoticeModal, useLogin, useAuthRestore, authApi |
| `src/content/privacy`, `src/content/terms` | 시행일별 안내·방침·약관 원문과 현재 버전 지정 | Markdown 원문, index.js |
| `src/components/common/MarkdownDocument.jsx` | 공개 정책 문서의 제목·표·링크 렌더링 | react-markdown, remark-gfm |
| `src/hooks` | 화면 공통 북마크·모바일 판별 | useLabBookmark, useIsMobile |
| `src/constants/navigation.js` | 헤더·모바일 메뉴의 공통 탐색 항목 | NAV_ITEMS |
| `src/constants/links.js` | 공통 신고/제보 폼·고객지원 메일 | REPORT_FORM_URL, SUPPORT_EMAIL |
| `src/api/client.js` | 쿠키 요청, CSRF·인증 재시도, 429 처리 | 공통 Axios client |
| `src/api/queries/laboratories.js` | 연구실 목록 공통 캐시와 북마크 반영 | useLaboratoriesQuery |
| `src/store/authStore.js` | user 및 loading/authenticated/anonymous 상태 | accessToken을 직접 저장하지 않음 |

## 실제 활성 라우트

- `/`: Home이 767px 이하에서는 SearchPage, 768px 이상에서는 MainPage를 렌더링한다. 모바일도 주소는 `/`를 유지한다.
- `/search`: 연구실 검색, `/colleges`: 단과대별 보기.
- `/login`, `/mypage`, `/design-system`, `/privacy`, `/terms`.
- `/community/labs`: 후기 대상 연구실 목록.
- `/community/labs/:laboratoryId`: 해당 연구실 후기 목록.
- `/community/labs/:laboratoryId/write`: 후기 작성.
- 일반 게시글의 `/community`, 작성·상세·수정 라우트는 코드에 있지만 App.jsx에서 주석 처리되어 있다.

App은 라우트 바깥에 Footer, 요청·429 표시, 경로 이동 시 스크롤 처리와 맨 위로 버튼을 공통 배치한다. 개인정보 안내·처리방침과 이용약관은 Markdown 본문으로 연결됐으며 두 페이지와 로그인 안내 모달은 lazy/Suspense로 불러온다. 로그인 전 동의 UI와 서버 동의 이력 저장은 구분한다. [[SEBU 메인과 모바일 화면]] · [[SEBU 인증과 CSRF]]

검색어는 `location.state.keyword`에 저장하고 기존 `?keyword=` 링크는 읽은 뒤 replace로 URL을 정리한다. 단과대·분야 필터와 정렬은 로컬 상태다. 검색어가 주소에서 빠졌으므로 URL만 넘기는 로그인 복귀·공유 링크에서 검색 상태가 유지된다고 가정하지 않는다. [[SEBU 연구실 탐색]]

## 서버 데이터와 인증 상태의 관계

`main.jsx`의 QueryClientProvider가 공통 캐시를 제공한다. 메인의 인기 연구실·후기 수 요약, 검색·단과대·랩실 후기 홈은 동일한 `["laboratories"]`를 사용하며 staleTime은 1시간이다. 메인 단과대 소개는 별도 `["colleges"]` 캐시와 1시간 staleTime을 사용한다. 마이페이지는 `["mypage"]`로 관리한다.

사용자 ID가 바뀌면 queryClient의 store 구독이 마이페이지 캐시를 제거하고 연구실 목록을 무효화하여 다시 조회한다. 연구실 기본정보가 같아도 `bookmarked`는 사용자별 값이기 때문이다. 일반 카드와 인기 연구실 모달은 useLabBookmark로 공통 목록을 낙관적으로 갱신하고 성공 시 마이페이지를 무효화한다. 화면별 관계는 [[SEBU 화면과 API 공유]]에 정리한다.

## 쿠키·CSRF 처리

공통 client의 baseURL은 `/api/v1`이며 `withCredentials: true`, `XSRF-TOKEN` 쿠키와 `X-XSRF-TOKEN` 헤더 이름을 설정한다. 앱 시작 시 CSRF 초기화 → `/me` → 필요 시 refresh → `/me` 흐름이 있다.

CSRF_TOKEN_INVALID 403은 CSRF 초기화 후 한 번 재시도한다. 일부 401에서는 refresh를 공유하고 대기 중인 요청을 다시 보낸다. ACCESS_TOKEN_INVALID는 즉시 인증 상태를 지운다. 현재 401 제외 조건은 정확한 경로 비교가 아니라 `url.includes("/me")` 등을 사용하므로 `/users/me/...` 요청도 갱신 대상에서 빠지는 점은 검토 대상이다. [[SEBU 인증과 CSRF]] · [[SEBU 변경 검토 목록]]

## 실행 환경

package.json은 React 19, Vite 8, React Router 7, Tailwind CSS 4, Zustand 5, TanStack Query 5, MSW 2와 Markdown 렌더링용 react-markdown 10·remark-gfm 4를 선언한다. 설치 결과를 검증한 기록은 아니다.

개발 모드에서 `VITE_USE_MSW`가 문자열 `false`가 아니면 MSW가 시작한다. 실제 백엔드 연결 확인에는 `VITE_USE_MSW=false`가 필요하다. Vite는 `/api`를 설정된 백엔드로 프록시한다. 최신 vercel.json은 `/api/:path*`를 `https://api.sebu.kr/api/:path*`로 전달하고, 기존 Vercel 호스트의 `/api/` 외 페이지를 `https://www.sebu.kr`로 영구 이동시킨다. 상대 경로 요청과 직접 백엔드 호출은 브라우저 출처 관점에서 구분하며 코드 설정을 운영 반영 성공으로 간주하지 않는다.

[[SEBU 로컬 실행]] · [[SEBU 마이페이지와 북마크]] · [[SEBU 커뮤니티와 후기]]

<!-- sources:start -->
## 근거 파일

- [프론트 · package.json](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/package.json)
- [프론트 · src/App.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/App.jsx)
- [프론트 · src/main.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/main.jsx)
- [프론트 · src/pages/Home/index.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/pages/Home/index.jsx)
- [프론트 · src/pages/Main/index.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/pages/Main/index.jsx)
- [프론트 · src/hooks/useIsMobile.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/hooks/useIsMobile.js)
- [프론트 · src/hooks/useLabBookmark.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/hooks/useLabBookmark.js)
- [프론트 · src/constants/navigation.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/constants/navigation.js)
- [프론트 · src/features/main/hooks/useColleges.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/features/main/hooks/useColleges.js)
- [프론트 · src/api/client.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/api/client.js)
- [프론트 · src/api/queryClient.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/api/queryClient.js)
- [프론트 · src/api/queries/laboratories.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/api/queries/laboratories.js)
- [프론트 · src/store/authStore.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/store/authStore.js)
- [프론트 · src/features/auth/hooks/useAuthRestore.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/features/auth/hooks/useAuthRestore.js)
- [프론트 · src/features/auth/hooks/useLogin.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/features/auth/hooks/useLogin.js)
- [프론트 · vite.config.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/vite.config.js)
- [프론트 · vercel.json](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/vercel.json)
- [프론트 · src/components/common/MarkdownDocument.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/components/common/MarkdownDocument.jsx)
- [프론트 · src/content/privacy/index.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/content/privacy/index.js)
- [프론트 · src/content/terms/index.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/content/terms/index.js)
- [프론트 · src/constants/links.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/constants/links.js)
- [프론트 · src/features/auth/components/LoginForm.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/features/auth/components/LoginForm.jsx)
- [프론트 · src/features/search/hooks/useLabFilter.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/features/search/hooks/useLabFilter.js)

기준 커밋은 [[SEBU 저장소와 기준 버전]]에서 확인한다.
<!-- sources:end -->

---
[[SEBU 홈]] · [[SEBU 지식 지도]]
