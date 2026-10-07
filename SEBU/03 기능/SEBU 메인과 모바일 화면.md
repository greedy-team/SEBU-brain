---
project: SEBU
type: "feature"
status: "기준 코드 및 미완성 화면 확인"
created: 2026-10-07
verified: 2026-10-07
tags:
  - sebu
  - sebu/feature
source_ids:
  - "F:src/App.jsx"
  - "F:src/pages/Home/index.jsx"
  - "F:src/pages/Main/index.jsx"
  - "F:src/pages/Search/index.jsx"
  - "F:src/pages/Privacy/index.jsx"
  - "F:src/pages/Login/index.jsx"
  - "F:src/hooks/useIsMobile.js"
  - "F:src/features/main/components/HeroSection.jsx"
  - "F:src/features/main/components/LabReviewHighlights.jsx"
  - "F:src/features/main/components/CollegeSection.jsx"
  - "F:src/features/main/hooks/useColleges.js"
  - "F:src/features/main/api/mainApi.js"
  - "F:src/features/search/components/RecommendedLabs.jsx"
  - "F:src/components/layout/Header.jsx"
  - "F:src/components/layout/MobileMenu.jsx"
  - "F:src/components/layout/Footer.jsx"
  - "F:src/components/common/ScrollToTopButton.jsx"
  - "F:src/constants/navigation.js"
  - "F:src/features/auth/components/PrivacyConsentModal.jsx"
  - "F:src/features/auth/hooks/useLogin.js"
  - "F:src/features/auth/components/LoginForm.jsx"
  - "F:src/features/auth/components/RecoveryModal.jsx"
---
# SEBU 메인과 모바일 화면

홈은 768px 이상에서는 소개·연구실 요약·단과대 화면을, 767px 이하에서는 검색 화면을 보여준다. 메인 순위와 후기 수는 연구실 목록을 프론트에서 가공하며, 개인정보 처리방침은 이동 경로만 연결되고 본문은 미완성이다. 이 노트는 기준 코드 검토 결과이며 실제 기기·브라우저·실서버 동작을 확인한 기록은 아니다.

## 홈 화면 구성

HomePage는 useIsMobile의 `matchMedia("(max-width: 767px)")` 결과로 MainPage와 SearchPage 중 하나를 직접 렌더링한다. 모바일을 `/search`로 리다이렉트하지 않으므로 홈 주소 `/`가 유지된다. 모바일 검색 입력을 제출하면 현재 경로에 keyword 쿼리가 붙는다. 화면 너비가 기준을 넘으면 다른 페이지 컴포넌트로 교체되므로 로컬 필터 상태가 유지된다고 보장하지 않는다.

데스크톱 메인은 다음 순서로 구성된다.

| 영역 | 동작·데이터 |
|---|---|
| 소개와 검색 | HeroSection이 검색어 공백을 제거하고 `/search?keyword=...`로 이동. 빈 검색어는 `/search`로 이동 |
| 연구실 후기 | 공통 연구실 목록에서 후기 수가 있는 연구실을 후기 많은 순으로 최대 9개, 3개씩 표시 |
| 실시간 인기 연구실 | 같은 공통 목록에서 북마크 수 상위 5개. 메인에서는 항상 펼쳐 표시 |
| 단과대학 둘러보기 | 별도 `/api/v1/colleges` 응답으로 이름·연구실 수·학과 수·학과 태그 표시 |

이전 FeatureSection은 제거됐다. Hero는 SVG 일러스트와 검색 폼을 사용하며 화면 높이에 따라 계산하는 최소 높이 값의 상한을 445px로 둔다. 본문 전체 높이가 항상 445px로 제한된다는 의미는 아니다.

연구실 후기 영역은 서버 목록의 reviewCount를 사용한다. 하드코딩 후기 샘플이나 최신 후기 본문을 보여주는 영역이 아니다. 인기 연구실의 '실시간'·'오늘 HH:00 기준'은 브라우저 문구이며 서버 집계 시각이나 실시간 스트림을 확인하지 않는다. [[SEBU 화면과 API 공유]] · [[SEBU 커뮤니티와 후기]]

## 단과대 캐러셀과 실제 ID

useColleges는 `GET /api/v1/colleges`를 `["colleges"]` 캐시에 저장하고 staleTime 1시간을 적용한다. 이전의 연구실 affiliations를 이용한 대체 목록 생성은 제거됐으며, 요청 실패 시 단과대 오류 안내를 표시한다. 로딩·오류·성공 후 0건을 별도로 표시한다.

카드는 API에서 받은 `college.id`를 그대로 `/colleges?college={id}`로 넘긴다. 목적 화면은 연구실 목록의 college.id로 묶은 항목을 찾아 처음 펼친다. 프론트가 별도 단과대 ID를 만들어 매핑하지 않는다. 두 응답에서 대응되는 항목이 실제로 존재하는지는 서버 데이터와 함께 확인해야 한다. [[SEBU 연구실 탐색]]

단과대가 6개 이상이면 복제 카드를 이어 붙여 3.5초 간격으로 순환한다. 마우스가 올라가거나 키보드 포커스로 상호작용할 때는 자동 이동을 멈추고, 비활성 브라우저 탭에서는 넘기지 않는다. 모션 줄이기 설정이면 정지 상태로 시작하며 사용자가 재생·정지할 수 있다. 복제 카드는 스크린리더와 Tab 이동에서 제외한다.

## 모바일 메뉴와 공통 UI

데스크톱 헤더와 모바일 메뉴는 NAV_ITEMS의 연구실 탐색·단과대별 보기·랩실 평가 항목을 공유한다. 모바일 `/`에서는 연구실 탐색 메뉴가 선택된 것으로 표시한다. 헤더와 로그인 화면의 SEBU 로고는 홈 링크다.

모바일 메뉴는 body에 포털로 렌더링하는 오른쪽 서랍이다. 열림 중 배경 스크롤을 막으며 닫기 버튼·배경 클릭·Esc·메뉴 선택으로 닫는다. 검색 칩·학과 목록·카드 버튼과 토스트는 좁은 화면에 맞게 배치됐다. 맨 위로 버튼은 App 공통 위치로 옮겨져 검색·랩실평가 홈 외의 경로에서도 스크롤 조건에 따라 표시된다.

헤더·모바일 메뉴의 로그인 링크는 `state.from`에 pathname과 search를 전달한다. 기존 일반 로그인·신규 사용자 동의 완료·복구 완료 흐름이 이 값을 읽어 돌아가며, 값이 없거나 `/login`이면 홈으로 이동한다. 해시와 로컬 필터 상태까지 보존하지는 않는다. 북마크 로그인 유도는 pathname만 전달하는 예외가 남아 있다. [[SEBU 마이페이지와 북마크]] · [[SEBU 인증과 CSRF]]

## 개인정보 처리방침과 푸터

`/privacy`는 헤더가 있는 별도 화면으로 연결된다. 푸터에 개인정보 처리방침 링크가 있고, 신규 사용자 동의 모달의 '전문 보기'는 이 경로를 새 탭으로 연다. 그러나 페이지 본문은 '추후 내용 확정 예정'이므로 방침 전문 작성이 완료됐다고 기록하지 않는다. 푸터에는 서비스 탐색과 GitHub 링크도 있다.

## 실행 확인과 후속 검토

- 모바일 메뉴의 키보드 포커스 이동·가두기·복원 코드는 없다. 메뉴가 열린 채 `/search` 등의 너비를 데스크톱으로 바꾸면 서랍은 CSS로 숨겨져도 body 스크롤 잠금이 남을 가능성이 있어 실행 확인이 필요하다.
- 메인 후기 요약은 데이터가 줄어들 때 현재 페이지를 보정하지 않는다. 뒤쪽 페이지에서 목록을 다시 받을 경우 빈 영역이나 전체 페이지 수보다 큰 현재 번호가 표시될 수 있다.
- 단과대 링크의 초기 펼침·스크롤, 캐러셀 순환, 화면 너비 전환, 로그인 복귀, 실제 개인정보 처리방침 문구는 각각 구현 검토와 실행·내용 확정을 나누어 확인한다.

[[SEBU 프론트엔드 구조]] · [[SEBU 변경 검토 목록]]

---
[[SEBU 홈]] · [[SEBU 지식 지도]]

<!-- sources:start -->
## 근거 파일

- [프론트 · src/App.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/App.jsx)
- [프론트 · src/pages/Home/index.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/pages/Home/index.jsx)
- [프론트 · src/pages/Main/index.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/pages/Main/index.jsx)
- [프론트 · src/pages/Search/index.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/pages/Search/index.jsx)
- [프론트 · src/pages/Privacy/index.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/pages/Privacy/index.jsx)
- [프론트 · src/pages/Login/index.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/pages/Login/index.jsx)
- [프론트 · src/hooks/useIsMobile.js](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/hooks/useIsMobile.js)
- [프론트 · src/features/main/components/HeroSection.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/main/components/HeroSection.jsx)
- [프론트 · src/features/main/components/LabReviewHighlights.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/main/components/LabReviewHighlights.jsx)
- [프론트 · src/features/main/components/CollegeSection.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/main/components/CollegeSection.jsx)
- [프론트 · src/features/main/hooks/useColleges.js](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/main/hooks/useColleges.js)
- [프론트 · src/features/main/api/mainApi.js](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/main/api/mainApi.js)
- [프론트 · src/features/search/components/RecommendedLabs.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/search/components/RecommendedLabs.jsx)
- [프론트 · src/components/layout/Header.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/components/layout/Header.jsx)
- [프론트 · src/components/layout/MobileMenu.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/components/layout/MobileMenu.jsx)
- [프론트 · src/components/layout/Footer.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/components/layout/Footer.jsx)
- [프론트 · src/components/common/ScrollToTopButton.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/components/common/ScrollToTopButton.jsx)
- [프론트 · src/constants/navigation.js](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/constants/navigation.js)
- [프론트 · src/features/auth/components/PrivacyConsentModal.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/auth/components/PrivacyConsentModal.jsx)
- [프론트 · src/features/auth/hooks/useLogin.js](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/auth/hooks/useLogin.js)
- [프론트 · src/features/auth/components/LoginForm.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/auth/components/LoginForm.jsx)
- [프론트 · src/features/auth/components/RecoveryModal.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/auth/components/RecoveryModal.jsx)

기준 커밋은 [[SEBU 저장소와 기준 버전]]에서 확인한다.
<!-- sources:end -->
