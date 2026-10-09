---
project: SEBU
type: "status"
status: "기준 코드 및 남은 차이 확인"
created: 2026-09-26
verified: 2026-10-09
tags:
  - sebu
  - sebu/status
source_ids:
  - "B:.github/workflows/ci.yml"
  - "B:ops/deploy/deploy.py"
  - "B:ops/deploy/catalog_transfer.py"
  - "B:src/main/resources/db/migration/V50__add_missing_physics_astronomy_laboratory_links.sql"
  - "F:vercel.json"
  - "F:src/features/auth/components/LoginForm.jsx"
  - "F:src/content/privacy/index.js"
  - "F:src/content/terms/index.js"
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

2026-10-09 기준으로 **운영 배포·연구 정보 이관·백업과 홈페이지 14건 보완을 완료했다.** BE 운영은 main, 개발은 develop이며 FE 운영은 dev다. 로그인 1시간 고정 만료와 카테고리 부모·자식 UI는 아직 구현 완료가 아니다.

2026-10-08 백엔드 추가 확인: 새로 발급하는 Refresh 수명이 12시간으로 줄었다. 기존 토큰은 다음 갱신부터 전환되며 로그인 절대 수명은 30일이다. [[SEBU 인증과 CSRF]]

기준 커밋은 [[SEBU 저장소와 기준 버전]]에서 확인한다. 기능 표는 코드 확인과 실제 운영 확인을 구분한다. FE는 dev `e7e54de`까지 다시 검토했다. 실제 학교 로그인과 인증된 북마크·후기 작성·수정·삭제의 수용 검증은 완료 기록이 없으므로 별도로 남긴다.

| 기능 | 현재 코드에서 확인한 내용 | 남은 확인·차이 |
|---|---|---|
| 운영 배포 분리 | 운영 EC2·HTTPS·main 배포 완료, 채널별 이미지 게시와 단일 컨테이너 Pull 배포 | 개발 서버는 필요할 때 실행. 정지 상태에서 새 개발 DB 적용을 단정하지 않음 |
| 전체 연구 정보 이관 | 연구 정보 11개 테이블 이관·해시 검증, 전체 연구실 622개 운영 확인 | 테스트 후기를 이관하지 않았음. 이후 실제 사용 중 생긴 후기는 보존 |
| 백업 | 초기 백업·격리 복원 확인, 로컬 정기 백업과 S3 분리 보관 설정·수동 검증 | 향후 예약 실행과 장애 알림은 지속 확인 대상 |
| 홈페이지 보완 | V50으로 물리천문학과 빈 URL 14개 반영, 양 API·김경호 상세 화면 확인 | 미확정 6개는 빈 값 유지, 신규 교수 생성은 이번 범위 밖 |
| 연구실 목록 | 검색·단과대·랩실평가 홈·메인 후기 소개가 공통 목록·캐시 사용 | 오류·0건 구분, 변경 후 최신성, 복수 소속 표시 |
| 검색어 | history state로 전달·복원. 기존 keyword URL을 읽은 뒤 replace로 URL에서 제거 | 입력 중 값과 제출한 검색어 구분; 필터·정렬 공유 URL 계약은 별도 |
| 로봇 분류 | V47 하위 카테고리 20개, 목록·연구실 응답 parentId | FE는 parentId 미사용, 부모·자식 칩·필터 계약 연결 필요 |
| 예체능 데이터 | V48·V49 및 운영 데이터 이관 반영, 운영에서 예체능 연구실 18개 확인 | 수집 자료의 현재성은 지속 검수 |
| 로그인 | 쿠키·CSRF, /me 복원, Refresh 12시간·절대 30일, 복구 분기 | 오류 구분·갱신 제외 경로, 1시간 고정 만료·안내·연장은 미구현 |
| 도메인 | 운영 www.sebu.kr → api.sebu.kr rewrite, 운영 허용 출처 검증 | 실제 학교 인증을 동반한 쿠키·CSRF 사용자 시나리오는 별도 |
| 북마크 | 공통 useLabBookmark, 카드·추천 상세 저장·해제, 캐시 낙관적 갱신·롤백 | 인증 복원 중 클릭, 중복 클릭·실패 안내 |
| 로그인 복귀 | 헤더·모바일 메뉴·후기 작성은 pathname+search 전달 | 북마크는 pathname만; 안내 모달·로그인 후 자동 저장은 제안 |
| 마이페이지 | 프로필 훅 인자 수정, 응답으로 캐시 반영, 모달 닫기·저장 토스트 | 졸업생 grade=5 선택·표시, 실제 저장 시나리오 확인 |
| 탈퇴 | 1시간 대기·30일 복구·이후 신규 가입의 3단계 안내 | 학교 인증 뒤 명시적 복구 확인은 기존 계약 유지 |
| 메인·모바일 | 검색·단과대 캐러셀·후기 소개·모바일 메뉴, 탐색 문구·로고 갱신 | 기기별 전체 사용자 시나리오 실행은 별도 |
| 약관·개인정보 | 본문 Markdown과 전용 화면, 로그인 전 필수 동의 체크박스 구현 | 서버 동의 이력 저장은 구현되지 않음; 체크박스 상태를 서버 기록으로 간주하지 않음 |
| 신고 | 헤더·푸터에서 외부 신고/제보 폼으로 연결 | 내부 신고 API·로그인 안내·관리자 심사는 요구사항 단계 |
| 일반 게시판 | 화면·API 함수 존재 | App.jsx의 게시글 라우트는 주석 처리 |
| 랩실평가 | 목록·후기 상세·작성 라우트 활성 | 수정·삭제·내 후기·전체 요약 API는 FE 미연결; 안내 문구 정리 |
| 후기 소개·태그 | 메인은 실제 연구실 목록의 후기 수로 요약, 상세 태그는 현재 읽은 후기에서 집계 | 후기 본문·전체 통계를 별도 API와 혼동하지 않기 |

이전 문서의 ‘운영 EC2·배포 미실행’, ‘연구 정보 이관 전’, ‘개인정보처리방침 본문 미완성’은 현재 상태와 다르므로 갱신했다. 기존 쿠키 인증·일반 카드 북마크·후기 라우트는 재구현할 항목이 아니다.

[[SEBU 운영 배포 완료 기록 - 2026-10-09]] · [[SEBU 물리천문학과 링크 보완 기록 - 2026-10-09]] · [[SEBU 갱신 기록 - 2026-10-09]] · [[SEBU 변경 검토 목록]] · [[SEBU 메인과 모바일 화면]] · [[SEBU 신고와 관리자 검토]]

<!-- sources:start -->
## 근거 파일

- [백엔드 · .github/workflows/ci.yml](https://github.com/greedy-team/SEBU-backend/blob/bb7372518cb2d69f0e83cad2ec760a8920c7f964/.github/workflows/ci.yml)
- [백엔드 · ops/deploy/deploy.py](https://github.com/greedy-team/SEBU-backend/blob/bb7372518cb2d69f0e83cad2ec760a8920c7f964/ops/deploy/deploy.py)
- [백엔드 · ops/deploy/catalog_transfer.py](https://github.com/greedy-team/SEBU-backend/blob/bb7372518cb2d69f0e83cad2ec760a8920c7f964/ops/deploy/catalog_transfer.py)
- [백엔드 · src/main/resources/db/migration/V50__add_missing_physics_astronomy_laboratory_links.sql](https://github.com/greedy-team/SEBU-backend/blob/bb7372518cb2d69f0e83cad2ec760a8920c7f964/src/main/resources/db/migration/V50__add_missing_physics_astronomy_laboratory_links.sql)
- [프론트 · vercel.json](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/vercel.json)
- [프론트 · src/features/auth/components/LoginForm.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/features/auth/components/LoginForm.jsx)
- [프론트 · src/content/privacy/index.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/content/privacy/index.js)
- [프론트 · src/content/terms/index.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/content/terms/index.js)
- [프론트 · src/App.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/App.jsx)
- [프론트 · src/api/client.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/api/client.js)
- [프론트 · src/api/queryClient.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/api/queryClient.js)
- [프론트 · src/api/queries/laboratories.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/api/queries/laboratories.js)
- [프론트 · src/features/auth/hooks/useAuthRestore.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/features/auth/hooks/useAuthRestore.js)
- [프론트 · src/features/auth/hooks/useLogin.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/features/auth/hooks/useLogin.js)
- [프론트 · src/components/common/LabCard.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/components/common/LabCard.jsx)
- [프론트 · src/features/search/components/RecommendedLabs.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/features/search/components/RecommendedLabs.jsx)
- [프론트 · src/features/mypage/api/mypageApi.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/features/mypage/api/mypageApi.js)
- [프론트 · src/features/mypage/hooks/useProfileForm.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/features/mypage/hooks/useProfileForm.js)
- [프론트 · src/pages/MyPage/index.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/pages/MyPage/index.jsx)
- [프론트 · src/features/community/api/communityApi.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/features/community/api/communityApi.js)
- [프론트 · src/features/community/components/LabReviewForm.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/features/community/components/LabReviewForm.jsx)
- [프론트 · src/features/community/components/ReviewTagSummary.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/features/community/components/ReviewTagSummary.jsx)
- [백엔드 · src/main/java/com/sebu/backend/laboratoryreview/controller/LaboratoryReviewController.java](https://github.com/greedy-team/SEBU-backend/blob/bb7372518cb2d69f0e83cad2ec760a8920c7f964/src/main/java/com/sebu/backend/laboratoryreview/controller/LaboratoryReviewController.java)
- [프론트 · src/hooks/useLabBookmark.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/hooks/useLabBookmark.js)
- [프론트 · src/features/search/hooks/useLabFilter.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/features/search/hooks/useLabFilter.js)
- [프론트 · src/features/search/components/SearchBar.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/features/search/components/SearchBar.jsx)
- [프론트 · src/components/layout/Header.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/components/layout/Header.jsx)
- [프론트 · src/components/layout/MobileMenu.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/components/layout/MobileMenu.jsx)
- [프론트 · src/pages/LabReviewWrite/index.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/pages/LabReviewWrite/index.jsx)
- [프론트 · src/pages/Home/index.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/pages/Home/index.jsx)
- [프론트 · src/pages/Privacy/index.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/pages/Privacy/index.jsx)
- [프론트 · src/features/main/components/LabReviewHighlights.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/features/main/components/LabReviewHighlights.jsx)
- [백엔드 · src/main/resources/application.yml](https://github.com/greedy-team/SEBU-backend/blob/bb7372518cb2d69f0e83cad2ec760a8920c7f964/src/main/resources/application.yml)
- [백엔드 · src/main/resources/db/migration/V47__add_robot_autonomous_subcategories.sql](https://github.com/greedy-team/SEBU-backend/blob/bb7372518cb2d69f0e83cad2ec760a8920c7f964/src/main/resources/db/migration/V47__add_robot_autonomous_subcategories.sql)
- [백엔드 · src/main/resources/db/migration/V48__import_reviewed_arts_sports_professors.sql](https://github.com/greedy-team/SEBU-backend/blob/bb7372518cb2d69f0e83cad2ec760a8920c7f964/src/main/resources/db/migration/V48__import_reviewed_arts_sports_professors.sql)
- [백엔드 · src/main/resources/db/migration/V49__import_reviewed_arts_sports_research_fields.sql](https://github.com/greedy-team/SEBU-backend/blob/bb7372518cb2d69f0e83cad2ec760a8920c7f964/src/main/resources/db/migration/V49__import_reviewed_arts_sports_research_fields.sql)

기준 커밋은 [[SEBU 저장소와 기준 버전]]에서 확인한다.
<!-- sources:end -->

---
[[SEBU 홈]] · [[SEBU 지식 지도]]
