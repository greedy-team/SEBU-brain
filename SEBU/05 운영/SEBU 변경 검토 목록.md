---
project: SEBU
type: "backlog"
status: "제안·실행 미검증"
created: 2026-09-26
verified: 2026-10-08
tags:
  - sebu
  - sebu/backlog
source_ids:
  - "B:ops/deploy/deploy.py"
  - "B:ops/deploy/catalog_transfer.py"
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
  - "F:src/hooks/useLabBookmark.js"
  - "F:src/features/search/hooks/useLabFilter.js"
  - "F:src/features/search/components/SearchBar.jsx"
  - "F:src/features/search/components/ResearchFieldChips.jsx"
  - "F:src/features/main/components/LabReviewHighlights.jsx"
  - "F:src/features/main/hooks/useColleges.js"
  - "F:src/pages/Privacy/index.jsx"
  - "B:src/main/resources/application.yml"
  - "B:src/main/java/com/sebu/backend/auth/config/TokenProperties.java"
---
# SEBU 변경 검토 목록

우선 남은 일은 **인증 오류·만료 정책, 카테고리 계층의 FE 연결, 후기 정책과 운영 반영 확인**이다. 프로필 저장과 추천 상세 북마크의 기존 연결 오류는 최신 코드에서 수정됐다. 아래 미완료 항목은 정적 코드 검토 결과이며 실행 재현이나 수정 완료 기록이 아니다.

## 최신 커밋에서 해결된 항목

- [x] MyPage의 useProfileForm 호출을 훅 선언과 같은 2개 인자로 수정했다.
- [x] 프로필 응답을 마이페이지 캐시에 반영하고 profileCompleted 갱신·모달 닫기·저장 토스트를 연결했다.
- [x] RecommendedLabs 상세에도 공통 useLabBookmark를 연결하고 선택 ID로 최신 목록 항목을 다시 찾는다.
- [x] 검색어 제출·빈 검색 제출·뒤로가기에서 URL keyword와 입력 상태를 동기화했다. 입력만 지우는 행동은 아직 검색 제출과 다르다.
- [x] 기본 허용 출처에 sebu.kr·www.sebu.kr을 추가했다.
- [x] 백엔드 PR #92 머지를 확인하고 전체 코드 기준·예체능 검수 기록을 갱신했다.

위 체크는 코드 변경 확인이며 앱 실행 통과나 운영 DB 반영 완료를 뜻하지 않는다.

## 1. 인증 복원·만료 정책

- [ ] useAuthRestore의 /me 실패와 refresh 실패에서 인증 오류와 네트워크·서버 장애를 구분한다.
- [ ] client의 `url.includes("/me")`가 /users/me/mypage·프로필·탈퇴까지 제외하는 범위를 정확한 경로 조건으로 검토한다.
- [ ] ACCESS_TOKEN_INVALID에는 쿠키 누락도 포함된다. 즉시 clearAuth와 갱신 대상 구분을 점검한다.
- [ ] initCsrf 오류 무시, 동시 401 대기열, 403·429, 로그아웃 실패 후 처리의 실제 동작을 확인한다.
- [ ] 로그인 1시간 고정 만료를 도입할지 확정하고, 도입 시 절대·Refresh 수명과 기존 세션 처리 정책을 함께 변경한다.
- [ ] 5분 전 경고·계속 로그인·만료 모달이 필요하면 BE 만료 시각·명시적 연장 계약과 FE 타이머·탭 복귀 검사를 설계한다. 현행 refresh는 절대 만료를 연장하지 않는다.

현재 기본값은 Access 30분·Refresh 12시간·절대 수명 30일이다. [[SEBU 인증과 CSRF]]

## 2. 북마크·프로필

- [ ] 인증 loading과 anonymous를 구분하고 요청 중 중복 클릭·실패 안내를 정리한다.
- [ ] 북마크 로그인 복귀에 pathname 외 검색어·선택 연구실을 보존할지 정한다. 로그인 안내 모달과 로그인 후 자동 저장은 아직 제안이다.
- [ ] BE grade=5 졸업생과 FE 1~4 선택·학년 표시를 맞추고 nickname·introduction 편집 범위를 결정한다.
- [ ] 프로필 저장 성공·실패, 일반 카드·추천 상세·마이페이지 간 북마크 캐시 일치를 실행 확인한다.

## 3. 카테고리·검색·단과대

- [ ] API의 parentId로 자식 있는 부모와 독립 카테고리를 구분하는 FE 그룹·칩 UI를 연결한다.
- [ ] 부모 선택 시 모든 자식을 포함할지, 분야·카테고리 복수 선택의 AND/OR 조건을 계약으로 확정한다. 현재 부모 ID를 선택한다고 자식 전체가 자동 포함되지 않는다.
- [ ] 검색창을 비우기만 한 상태와 빈 검색 제출의 차이가 사용자에게 명확한지 확인한다. 필터·정렬을 URL에 저장할 범위도 정한다.
- [ ] 메인 /colleges와 연구실 목록에서 추출하는 검색 칩의 표시 범위 차이, 로딩·오류·실제 0건을 구분한다.
- [ ] 복수 소속 affiliations를 그룹·검색·통계에 반영할 범위를 정한다.

## 4. 후기·화면·문구

- [ ] BE 후기 수정·삭제 API와 FE ‘수정 및 삭제가 불가능’ 안내를 통일한다. reviews/me·수정·삭제의 노출 범위도 정한다.
- [ ] 후기 작성 후 공통 목록 reviewCount를 갱신하고, 일부 후기 태그 집계와 전체 통계를 구분한다.
- [ ] 메인 후기 소개는 실제 연구실 목록의 후기 수 요약이다. 후기 본문을 표시하려면 별도 조회 계약이 필요하다.
- [ ] 개인정보처리방침 페이지의 ‘추후 내용 확정 예정’ 본문을 실제 운영 정책으로 완성한다.
- [ ] 모바일 홈·메뉴·카드·필터 스크롤을 화면 크기별로 확인한다. 추천 영역의 브라우저 생성 시각을 서버 데이터 갱신 시각으로 오인하지 않도록 정리한다.
- [ ] 일반 게시판은 코드 존재와 라우트 비활성을 구분해 출시 범위를 기록한다.

## 5. 운영 반영

- [x] develop/main별 이미지·설정과 교차 채널 적용 거부를 구현하고 CI를 통과했다.
- [x] 빈 MySQL에 마이그레이션 49개를 적용했다. 개발 연구 정보 11개 테이블의 전체 이관과 후기 제외를 임시 DB에서 검증했다.
- [ ] 운영 EC2·DB·도메인·HTTPS를 준비하고 환경별 비밀값을 주입한다.
- [ ] 운영 공개 전 이관 시점에 최신 개발 연구 정보를 내보낸다. 대상의 Pull 타이머·진행 중 배포와 앱을 멈추고, 동일 Flyway·스키마와 사용자 활동 0건을 확인한 새 운영 DB에 이관한다.
- [ ] 교수·연구실·연구 분야·관계의 전체 해시와 자연과학대·생명과학대·인공지능융합대 건수, 후기 0건을 대조한다.
- [ ] FE 연결과 팀 내부 기능 검사 뒤 초기 백업·복원·정기 백업을 마치고 공개한다.

준비·실행 구분과 현재 단계는 [[SEBU 운영 전환과 연구 정보 이관]], 실행 근거는 [[SEBU 운영 준비 검증 기록 - 2026-10-08]]을 따른다.


- [ ] 실제 배포 이미지 커밋·Flyway V47~V49 적용 이력·API 응답을 확인한다. PR #92 머지나 과거 격리 DB 검증을 운영 성공으로 대체하지 않는다.
- [ ] 운영 CORS·CSRF 출처, 쿠키·프록시, 실제 학교 로그인 및 모니터링 수집·알림을 별도로 확인한다.

[[SEBU 구현 현황]] · [[SEBU 마이페이지와 북마크]] · [[SEBU 연구 분야 분류]] · [[SEBU 메인과 모바일 화면]] · [[SEBU 예체능대학 크롤링 검수 - 2026-10-06]]

<!-- sources:start -->
## 근거 파일

- [백엔드 · ops/deploy/deploy.py](https://github.com/greedy-team/SEBU-backend/blob/d1010d405abfcb5f9b01b155c48032da01ee1d2d/ops/deploy/deploy.py)
- [백엔드 · ops/deploy/catalog_transfer.py](https://github.com/greedy-team/SEBU-backend/blob/d1010d405abfcb5f9b01b155c48032da01ee1d2d/ops/deploy/catalog_transfer.py)
- [프론트 · src/api/client.js](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/api/client.js)
- [프론트 · src/features/auth/api/authApi.js](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/auth/api/authApi.js)
- [프론트 · src/features/auth/hooks/useAuthRestore.js](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/auth/hooks/useAuthRestore.js)
- [프론트 · src/features/mypage/hooks/useProfileForm.js](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/mypage/hooks/useProfileForm.js)
- [프론트 · src/pages/MyPage/index.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/pages/MyPage/index.jsx)
- [프론트 · src/features/mypage/components/ProfileForm.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/mypage/components/ProfileForm.jsx)
- [프론트 · src/components/common/LabCard.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/components/common/LabCard.jsx)
- [프론트 · src/features/search/components/RecommendedLabs.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/search/components/RecommendedLabs.jsx)
- [프론트 · src/features/collegeView/hooks/useCollegeStats.js](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/collegeView/hooks/useCollegeStats.js)
- [프론트 · src/features/community/components/LabReviewForm.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/community/components/LabReviewForm.jsx)
- [프론트 · src/features/community/components/ReviewTagSummary.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/community/components/ReviewTagSummary.jsx)
- [프론트 · src/pages/LabReviewWrite/index.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/pages/LabReviewWrite/index.jsx)
- [프론트 · src/App.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/App.jsx)
- [백엔드 · src/main/java/com/sebu/backend/mypage/dto/ProfileUpdateRequest.java](https://github.com/greedy-team/SEBU-backend/blob/d1010d405abfcb5f9b01b155c48032da01ee1d2d/src/main/java/com/sebu/backend/mypage/dto/ProfileUpdateRequest.java)
- [백엔드 · src/main/java/com/sebu/backend/laboratoryreview/controller/LaboratoryReviewController.java](https://github.com/greedy-team/SEBU-backend/blob/d1010d405abfcb5f9b01b155c48032da01ee1d2d/src/main/java/com/sebu/backend/laboratoryreview/controller/LaboratoryReviewController.java)
- [프론트 · src/hooks/useLabBookmark.js](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/hooks/useLabBookmark.js)
- [프론트 · src/features/search/hooks/useLabFilter.js](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/search/hooks/useLabFilter.js)
- [프론트 · src/features/search/components/SearchBar.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/search/components/SearchBar.jsx)
- [프론트 · src/features/search/components/ResearchFieldChips.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/search/components/ResearchFieldChips.jsx)
- [프론트 · src/features/main/components/LabReviewHighlights.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/main/components/LabReviewHighlights.jsx)
- [프론트 · src/features/main/hooks/useColleges.js](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/features/main/hooks/useColleges.js)
- [프론트 · src/pages/Privacy/index.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/pages/Privacy/index.jsx)
- [백엔드 · src/main/resources/application.yml](https://github.com/greedy-team/SEBU-backend/blob/d1010d405abfcb5f9b01b155c48032da01ee1d2d/src/main/resources/application.yml)
- [백엔드 · src/main/java/com/sebu/backend/auth/config/TokenProperties.java](https://github.com/greedy-team/SEBU-backend/blob/d1010d405abfcb5f9b01b155c48032da01ee1d2d/src/main/java/com/sebu/backend/auth/config/TokenProperties.java)

기준 커밋은 [[SEBU 저장소와 기준 버전]]에서 확인한다.
<!-- sources:end -->

---
[[SEBU 홈]] · [[SEBU 지식 지도]]
