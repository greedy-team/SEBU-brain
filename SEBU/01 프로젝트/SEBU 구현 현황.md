---
project: SEBU
type: "status"
status: "기준 코드 및 남은 차이 확인"
created: 2026-09-26
verified: 2026-10-08
tags:
  - sebu
  - sebu/status
source_ids:
  - "B:.github/workflows/ci.yml"
  - "B:ops/deploy/deploy.py"
  - "B:ops/deploy/catalog_transfer.py"
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
  - "F:src/hooks/useLabBookmark.js"
  - "F:src/features/search/hooks/useLabFilter.js"
  - "F:src/features/search/components/SearchBar.jsx"
  - "F:src/components/layout/Header.jsx"
  - "F:src/components/layout/MobileMenu.jsx"
  - "F:src/pages/LabReviewWrite/index.jsx"
  - "F:src/pages/Home/index.jsx"
  - "F:src/pages/Privacy/index.jsx"
  - "F:src/features/main/components/LabReviewHighlights.jsx"
  - "B:src/main/resources/application.yml"
  - "B:src/main/resources/db/migration/V47__add_robot_autonomous_subcategories.sql"
  - "B:src/main/resources/db/migration/V48__import_reviewed_arts_sports_professors.sql"
  - "B:src/main/resources/db/migration/V49__import_reviewed_arts_sports_research_fields.sql"
---
# SEBU 구현 현황

2026-10-07 기준으로 **도메인 허용·로봇 하위 분류·예체능 데이터가 BE에 머지됐고, 북마크·프로필 저장·검색어 동기화와 메인·모바일 화면이 FE에서 갱신됐다.** 로그인 1시간 만료와 카테고리 부모·자식 UI는 아직 구현 완료가 아니다.

2026-10-08 백엔드 추가 확인: 새로 발급하는 Refresh 수명이 12시간으로 줄었다. 기존 토큰은 다음 갱신부터 전환되며 로그인 절대 수명은 30일이다. [[SEBU 인증과 CSRF]]

기준 커밋은 [[SEBU 저장소와 기준 버전]]에서 확인한다. 기능 표는 각 근거 커밋의 코드 상태다. 10월 8일 배포·이관 CI와 격리 복원 결과는 별도 기록으로 연결하며, 운영 배포·학교 로그인 성공을 뜻하지 않는다. FE는 10월 7일 검토 기준을 유지했다.

| 기능 | 현재 코드에서 확인한 내용 | 남은 확인·차이 |
|---|---|---|
| 운영 배포 분리 | develop/main별 이미지·서버 설정, 채널 검증 구현 | 실제 운영 EC2·DB·도메인 생성과 main 출시 미실행 |
| 전체 연구 정보 이관 | 교수·연구실 각 622개 복원 검증, 테스트 후기 0개·원본 8개 보존 | 전환 직전 최신 스냅샷으로 새 운영 DB 이관 필요 |
| 연구실 목록 | 검색·단과대·랩실평가 홈·메인 후기 소개가 공통 목록·캐시 사용 | 오류·0건 구분, 변경 후 최신성, 복수 소속 표시 |
| 검색어 | URL keyword를 기준으로 검색, 제출 시 trim·빈 값 제거, 입력창이 뒤로가기에 동기화 | 입력만 지우고 미제출한 상태와 적용된 검색어 구분; 필터·정렬 URL 미저장 |
| 로봇 분류 | V47 하위 카테고리 20개, 목록·연구실 응답 parentId | FE는 parentId 미사용, 부모·자식 칩·필터 계약 연결 필요 |
| 예체능 데이터 | PR #92의 V48·V49 머지, 교수·연구실 및 분야 분류 추가 | 운영 Flyway·API 반영 확인 별도 |
| 로그인 | 쿠키·CSRF, /me 복원, Refresh 12시간·절대 30일, 복구 분기 | 오류 구분·갱신 제외 경로, 1시간 고정 만료·안내·연장은 미구현 |
| 도메인 | 기본 CORS·CSRF 허용 목록에 sebu.kr·www.sebu.kr 추가 | 운영 설정·쿠키·프록시 연동 확인 |
| 북마크 | 공통 useLabBookmark, 카드·추천 상세 저장·해제, 캐시 낙관적 갱신·롤백 | 인증 복원 중 클릭, 중복 클릭·실패 안내 |
| 로그인 복귀 | 헤더·모바일 메뉴·후기 작성은 pathname+search 전달 | 북마크는 pathname만; 안내 모달·로그인 후 자동 저장은 제안 |
| 마이페이지 | 프로필 훅 인자 수정, 응답으로 캐시 반영, 모달 닫기·저장 토스트 | 졸업생 grade=5 선택·표시, 실제 저장 시나리오 확인 |
| 탈퇴 | 1시간 대기·30일 복구·이후 신규 가입의 3단계 안내 | 학교 인증 뒤 명시적 복구 확인은 기존 계약 유지 |
| 메인·모바일 | 데스크톱 메인, 모바일 홈에서 검색, 단과대 캐러셀·후기 소개·모바일 메뉴 | 화면 크기별 실행 확인, 개인정보처리방침 본문 미완성 |
| 일반 게시판 | 화면·API 함수 존재 | App.jsx의 게시글 라우트는 주석 처리 |
| 랩실평가 | 목록·후기 상세·작성 라우트 활성 | 수정·삭제·내 후기·전체 요약 API는 FE 미연결; 안내 문구 정리 |
| 후기 소개·태그 | 메인은 실제 연구실 목록의 후기 수로 요약, 상세 태그는 현재 읽은 후기에서 집계 | 후기 본문·전체 통계를 별도 API와 혼동하지 않기 |

이전 문서의 ‘프로필 저장 인자 불일치’, ‘추천 상세 북마크 미연결’, ‘PR #92 미머지’는 이번 기준에서 해소됐다. 기존 쿠키 인증·일반 카드 북마크·후기 라우트는 재구현할 항목이 아니다.

[[SEBU 운영 준비 검증 기록 - 2026-10-08]] · [[SEBU 운영 전환과 연구 정보 이관]] · [[SEBU 갱신 기록 - 2026-10-07]] · [[SEBU 변경 검토 목록]] · [[SEBU 메인과 모바일 화면]] · [[SEBU 연구 분야 분류]]

<!-- sources:start -->
## 근거 파일

- [백엔드 · .github/workflows/ci.yml](https://github.com/greedy-team/SEBU-backend/blob/d1010d405abfcb5f9b01b155c48032da01ee1d2d/.github/workflows/ci.yml)
- [백엔드 · ops/deploy/deploy.py](https://github.com/greedy-team/SEBU-backend/blob/d1010d405abfcb5f9b01b155c48032da01ee1d2d/ops/deploy/deploy.py)
- [백엔드 · ops/deploy/catalog_transfer.py](https://github.com/greedy-team/SEBU-backend/blob/d1010d405abfcb5f9b01b155c48032da01ee1d2d/ops/deploy/catalog_transfer.py)
- [프론트 · src/App.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/App.jsx)
- [프론트 · src/api/client.js](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/api/client.js)
- [프론트 · src/api/queryClient.js](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/api/queryClient.js)
- [프론트 · src/api/queries/laboratories.js](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/api/queries/laboratories.js)
- [프론트 · src/features/auth/hooks/useAuthRestore.js](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/auth/hooks/useAuthRestore.js)
- [프론트 · src/features/auth/hooks/useLogin.js](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/auth/hooks/useLogin.js)
- [프론트 · src/components/common/LabCard.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/components/common/LabCard.jsx)
- [프론트 · src/features/search/components/RecommendedLabs.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/search/components/RecommendedLabs.jsx)
- [프론트 · src/features/mypage/api/mypageApi.js](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/mypage/api/mypageApi.js)
- [프론트 · src/features/mypage/hooks/useProfileForm.js](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/mypage/hooks/useProfileForm.js)
- [프론트 · src/pages/MyPage/index.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/pages/MyPage/index.jsx)
- [프론트 · src/features/community/api/communityApi.js](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/community/api/communityApi.js)
- [프론트 · src/features/community/components/LabReviewForm.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/community/components/LabReviewForm.jsx)
- [프론트 · src/features/community/components/ReviewTagSummary.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/community/components/ReviewTagSummary.jsx)
- [백엔드 · src/main/java/com/sebu/backend/laboratoryreview/controller/LaboratoryReviewController.java](https://github.com/greedy-team/SEBU-backend/blob/d1010d405abfcb5f9b01b155c48032da01ee1d2d/src/main/java/com/sebu/backend/laboratoryreview/controller/LaboratoryReviewController.java)
- [프론트 · src/hooks/useLabBookmark.js](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/hooks/useLabBookmark.js)
- [프론트 · src/features/search/hooks/useLabFilter.js](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/search/hooks/useLabFilter.js)
- [프론트 · src/features/search/components/SearchBar.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/search/components/SearchBar.jsx)
- [프론트 · src/components/layout/Header.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/components/layout/Header.jsx)
- [프론트 · src/components/layout/MobileMenu.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/components/layout/MobileMenu.jsx)
- [프론트 · src/pages/LabReviewWrite/index.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/pages/LabReviewWrite/index.jsx)
- [프론트 · src/pages/Home/index.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/pages/Home/index.jsx)
- [프론트 · src/pages/Privacy/index.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/pages/Privacy/index.jsx)
- [프론트 · src/features/main/components/LabReviewHighlights.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/main/components/LabReviewHighlights.jsx)
- [백엔드 · src/main/resources/application.yml](https://github.com/greedy-team/SEBU-backend/blob/d1010d405abfcb5f9b01b155c48032da01ee1d2d/src/main/resources/application.yml)
- [백엔드 · src/main/resources/db/migration/V47__add_robot_autonomous_subcategories.sql](https://github.com/greedy-team/SEBU-backend/blob/d1010d405abfcb5f9b01b155c48032da01ee1d2d/src/main/resources/db/migration/V47__add_robot_autonomous_subcategories.sql)
- [백엔드 · src/main/resources/db/migration/V48__import_reviewed_arts_sports_professors.sql](https://github.com/greedy-team/SEBU-backend/blob/d1010d405abfcb5f9b01b155c48032da01ee1d2d/src/main/resources/db/migration/V48__import_reviewed_arts_sports_professors.sql)
- [백엔드 · src/main/resources/db/migration/V49__import_reviewed_arts_sports_research_fields.sql](https://github.com/greedy-team/SEBU-backend/blob/d1010d405abfcb5f9b01b155c48032da01ee1d2d/src/main/resources/db/migration/V49__import_reviewed_arts_sports_research_fields.sql)

기준 커밋은 [[SEBU 저장소와 기준 버전]]에서 확인한다.
<!-- sources:end -->

---
[[SEBU 홈]] · [[SEBU 지식 지도]]
