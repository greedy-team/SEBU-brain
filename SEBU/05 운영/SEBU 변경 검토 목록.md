---
project: SEBU
type: "backlog"
status: "최신 코드·운영 완료 범위 확인, 남은 제안·인증 기능 검증 구분"
created: 2026-09-26
verified: 2026-10-10
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
  - "F:vercel.json"
  - "F:src/features/auth/components/LoginForm.jsx"
  - "F:src/features/auth/components/PrivacyNoticeModal.jsx"
  - "F:src/pages/Terms/index.jsx"
---
# SEBU 변경 검토 목록

우선 남은 일은 **FE의 실제 인증·쓰기 기능 검증, 인증 오류·만료 정책, 카테고리 계층 연결과 후기 정책 정리**다. 운영 배포·전체 연구 정보 이관·S3 백업 복원·V51 링크 보완·운영 Grafana 모니터링은 완료됐다. 체크된 코드 변경, 과거 운영 실행 성공, 아직 제안인 항목을 아래에서 구분한다. FE 변경과 기능 검사는 FE 담당자가 진행한다.

## 최신 커밋에서 해결된 항목

- [x] MyPage의 useProfileForm 호출을 훅 선언과 같은 2개 인자로 수정했다.
- [x] 프로필 응답을 마이페이지 캐시에 반영하고 profileCompleted 갱신·모달 닫기·저장 토스트를 연결했다.
- [x] RecommendedLabs 상세에도 공통 useLabBookmark를 연결하고 선택 ID로 최신 목록 항목을 다시 찾는다.
- [x] 검색어를 `history.state.keyword`로 이동·복원하고 기존 `?keyword=` 링크는 읽은 뒤 주소에서 제거하도록 바꿨다. 입력만 지우는 행동은 검색 제출과 다르다.
- [x] 기본 허용 출처에 sebu.kr·www.sebu.kr을 추가했다.
- [x] 백엔드 PR #92 머지를 확인하고 전체 코드 기준·예체능 검수 기록을 갱신했다.
- [x] FE `dev`의 운영 API rewrite와 기존 Vercel 주소의 비 API 페이지 리다이렉트를 확인했다.
- [x] 개인정보처리방침·수집 이용 안내와 서비스 이용약관 페이지를 추가하고 매 로그인 전 필수 동의 체크박스를 연결했다. 문서 내용의 법적 검토나 서버 동의 이력 저장 완료를 뜻하지 않는다.

위 체크는 코드 변경 확인이며 앱 실행 통과나 운영 DB 반영 완료를 뜻하지 않는다.

## 1. 인증 복원·만료 정책

- [ ] useAuthRestore의 /me 실패와 refresh 실패에서 인증 오류와 네트워크·서버 장애를 구분한다.
- [ ] client의 `url.includes("/me")`가 /users/me/mypage·프로필·탈퇴까지 제외하는 범위를 정확한 경로 조건으로 검토한다.
- [ ] ACCESS_TOKEN_INVALID에는 쿠키 누락도 포함된다. 즉시 clearAuth와 갱신 대상 구분을 점검한다.
- [ ] initCsrf 오류 무시, 동시 401 대기열, 403·429, 로그아웃 실패 후 처리의 실제 동작을 확인한다.
- [ ] 운영 API 전환 후 새 세션과 기존 로그인 쿠키가 있는 세션을 각각 검사한다. 되돌린 FE PR #176의 자동 재시도·세션 보호를 현행 구현으로 가정하지 않는다.
- [ ] 로그인 1시간 고정 만료를 도입할지 확정하고, 도입 시 절대·Refresh 수명과 기존 세션 처리 정책을 함께 변경한다.
- [ ] 5분 전 경고·계속 로그인·만료 모달이 필요하면 BE 만료 시각·명시적 연장 계약과 FE 타이머·탭 복귀 검사를 설계한다. 현행 refresh는 절대 만료를 연장하지 않는다.

현재 기본값은 Access 30분·Refresh 12시간·절대 수명 30일이다. [[SEBU 인증과 CSRF]]

## 2. 북마크·프로필

- [ ] 인증 loading과 anonymous를 구분하고 요청 중 중복 클릭·실패 안내를 정리한다.
- [ ] 북마크 로그인 복귀에 pathname 외 `history.state` 검색어·선택 연구실을 보존할지 정한다. 검색어가 URL에서 빠져 pathname·search만으로는 복원되지 않는다. 로그인 안내 모달과 로그인 후 자동 저장은 아직 제안이다.
- [ ] BE grade=5 졸업생과 FE 1~4 선택·학년 표시를 맞추고 nickname·introduction 편집 범위를 결정한다.
- [ ] 프로필 저장 성공·실패, 일반 카드·추천 상세·마이페이지 간 북마크 캐시 일치를 실행 확인한다.

## 3. 카테고리·검색·단과대

- [ ] API의 parentId로 자식 있는 부모와 독립 카테고리를 구분하는 FE 그룹·칩 UI를 연결한다.
- [ ] 부모 선택 시 모든 자식을 포함할지, 분야·카테고리 복수 선택의 AND/OR 조건을 계약으로 확정한다. 현재 부모 ID를 선택한다고 자식 전체가 자동 포함되지 않는다.
- [ ] 검색창을 비우기만 한 상태와 빈 검색 제출의 차이가 사용자에게 명확한지 확인한다. 검색 공유·다른 탭 이동에서 `history.state`가 전달되지 않는 범위와 필터·정렬 보존 정책도 정한다.
- [ ] 메인 /colleges와 연구실 목록에서 추출하는 검색 칩의 표시 범위 차이, 로딩·오류·실제 0건을 구분한다.
- [ ] 복수 소속 affiliations를 그룹·검색·통계에 반영할 범위를 정한다.

## 4. 후기·화면·문구

- [ ] BE 후기 수정·삭제 API와 FE ‘수정 및 삭제가 불가능’ 안내를 통일한다. reviews/me·수정·삭제의 노출 범위도 정한다.
- [ ] 후기 작성 후 공통 목록 reviewCount를 갱신하고, 일부 후기 태그 집계와 전체 통계를 구분한다.
- [ ] 메인 후기 소개는 실제 연구실 목록의 후기 수 요약이다. 후기 본문을 표시하려면 별도 조회 계약이 필요하다.
- [ ] 추가된 개인정보처리방침·수집 이용 안내·약관의 실제 운영 정책 일치를 검토한다. 로그인 요청에 동의 버전·시각을 전달하거나 서버에 저장하는 계약은 아직 없으므로 필요 여부를 결정한다.
- [ ] 약관 안내 모달의 초기 포커스·포커스 가두기·닫은 뒤 복원을 점검한다. role과 Escape 처리만으로 키보드 사용 검증을 완료 처리하지 않는다.
- [ ] 모바일 홈·메뉴·카드·필터 스크롤을 화면 크기별로 확인한다. 추천 영역의 브라우저 생성 시각을 서버 데이터 갱신 시각으로 오인하지 않도록 정리한다.
- [ ] 일반 게시판은 코드 존재와 라우트 비활성을 구분해 출시 범위를 기록한다.

## 5. 운영 반영과 남은 확인

- [x] develop/main별 이미지·설정과 교차 채널 적용 거부를 구현하고 CI를 통과했다.
- [x] 빈 MySQL에 마이그레이션 49개를 적용했다. 개발 연구 정보 11개 테이블의 전체 이관과 후기 제외를 임시 DB에서 검증했다.
- [x] 별도 운영 EC2·DB·도메인·HTTPS와 재부팅 후 DB 영속성을 확인했다.
- [x] PR #95 main CI·정확한 이미지 digest·V1~V49 실제 적용·readiness를 확인했다.
- [x] 신규 운영 DB에 최신 개발 연구 정보 11개 테이블을 이관하고 전체 해시·자연과학대·생명과학대·인공지능융합대 건수를 대조했다. 이관 직후 제외 12개 테이블은 0건이었다.
- [x] `main` Pull 타이머 활성화와 첫 성공 실행을 확인했다. 블루그린이 아닌 단일 컨테이너 교체다.
- [x] 사용자 승인에 따른 S3 분리 백업과 버전 지정 실제 복원을 검증했다. 24개 테이블·35개 외래 키·원본 보존과 임시 자원 제거를 확인했다.
- [x] 매일 03:00 KST 백업 타이머를 활성화하고 같은 서비스의 수동 실행·S3 업로드를 성공시켰다.
- [x] FE 운영 API 연결과 인증 없는 공개 API 3종의 직접·프록시 응답 일치를 확인했다.
- [x] PR #96·#97의 V50 코드·CI와 운영 14개 링크 반영·기존 자료 보존을 확인했다.
- [ ] 실제 학교 로그인·기존 쿠키 전환·프록시 쿠키·CSRF·로그아웃과 북마크·프로필·후기 쓰기를 FE 담당자가 확인한다.
- [x] 10월 10일 정기 백업의 예약 실행 성공과 S3 검증 결과를 확인했다. 최초 수동 실행 성공과 별도로 기록한다.
- [ ] 이후 예약 백업의 지속 성공과 S3 접근 로그 도착을 점검한다.
- [x] 운영 monitoring 프로필·전용 토큰을 활성화하고 Grafana Hosted Metrics Endpoint의 실제 수집, 운영 14패널과 개발 쿼리 분리를 확인했다.
- [x] 운영 수집 실패가 2분 지속되면 sebu-email로 알리도록 설정하고 현재 Normal 상태를 확인했다. [[SEBU 운영 모니터링 구축 기록 - 2026-10-10]]
- [ ] 실제 장애·복구 상황에서 이메일 수신까지 검증할지는 별도로 결정한다. 현재 수행한 것은 규칙·연락처 설정과 정상 평가 확인이다.
- [ ] 백업 실패 이메일·채팅 알림은 별도 설정 여부를 결정한다. 운영 수집 실패 알림으로 백업 성공을 감시할 수는 없다.
- [ ] 사용자 수가 필요하면 가입자·최근 활동 회원·비로그인 방문자 중 집계 대상을 먼저 정한다. 현재 요청량 지표로 사람 수를 계산하지 않는다. [[SEBU 운영 모니터링과 대시보드 해석]]
- [x] PR #98·#99로 V51 홈페이지 12개를 반영하고 운영 전체 622개·나머지 610개 URL 보존을 확인했다. [[SEBU 항공우주공학과 링크 보완 기록 - 2026-10-10]]
- [ ] 개발 서버를 다음에 사용할 때 최신 이미지와 V51 적용을 확인한다. 주 1회 약 2시간은 이용 예상이며 자동 기동·중지 예약은 확인되지 않았다.

준비·실행 구분과 현재 구조는 [[SEBU 운영 전환과 연구 정보 이관]], 1~2단계는 [[SEBU 운영 준비 검증 기록 - 2026-10-08]], 실제 3~7단계 결과는 [[SEBU 운영 배포 완료 기록 - 2026-10-09]]를 따른다. 이관 직후 후기 0건은 과거 검증 조건이며 이미 공개된 현재 DB를 다시 비워야 한다는 요구가 아니다.

## 6. 신고·관리자 요구사항

- [ ] 현재 외부 신고/제보 폼과 서비스 내부 신고 API의 역할을 구분한다.
- [ ] 평가·게시글·댓글의 대상 식별, 신고 사유와 기타 입력, 중복 신고, 인증·오류 응답을 합의한다.
- [ ] 비로그인 안내는 FE, 신고자의 인증·권한 검증은 BE에서 처리하도록 계약을 정한다.
- [ ] 관리자 목록·상세·처리 결과와 피신고자·대상 콘텐츠 확인 범위를 함께 설계한다. 현재 구현 완료된 관리 화면은 없다.

[[SEBU 구현 현황]] · [[SEBU 마이페이지와 북마크]] · [[SEBU 연구 분야 분류]] · [[SEBU 메인과 모바일 화면]] · [[SEBU 신고와 관리자 검토]] · [[SEBU 예체능대학 크롤링 검수 - 2026-10-06]]

<!-- sources:start -->
## 근거 파일

- [백엔드 · ops/deploy/deploy.py](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/ops/deploy/deploy.py)
- [백엔드 · ops/deploy/catalog_transfer.py](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/ops/deploy/catalog_transfer.py)
- [프론트 · src/api/client.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/api/client.js)
- [프론트 · src/features/auth/api/authApi.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/features/auth/api/authApi.js)
- [프론트 · src/features/auth/hooks/useAuthRestore.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/features/auth/hooks/useAuthRestore.js)
- [프론트 · src/features/mypage/hooks/useProfileForm.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/features/mypage/hooks/useProfileForm.js)
- [프론트 · src/pages/MyPage/index.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/pages/MyPage/index.jsx)
- [프론트 · src/features/mypage/components/ProfileForm.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/features/mypage/components/ProfileForm.jsx)
- [프론트 · src/components/common/LabCard.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/components/common/LabCard.jsx)
- [프론트 · src/features/search/components/RecommendedLabs.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/features/search/components/RecommendedLabs.jsx)
- [프론트 · src/features/collegeView/hooks/useCollegeStats.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/features/collegeView/hooks/useCollegeStats.js)
- [프론트 · src/features/community/components/LabReviewForm.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/features/community/components/LabReviewForm.jsx)
- [프론트 · src/features/community/components/ReviewTagSummary.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/features/community/components/ReviewTagSummary.jsx)
- [프론트 · src/pages/LabReviewWrite/index.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/pages/LabReviewWrite/index.jsx)
- [프론트 · src/App.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/App.jsx)
- [백엔드 · src/main/java/com/sebu/backend/mypage/dto/ProfileUpdateRequest.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/main/java/com/sebu/backend/mypage/dto/ProfileUpdateRequest.java)
- [백엔드 · src/main/java/com/sebu/backend/laboratoryreview/controller/LaboratoryReviewController.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/main/java/com/sebu/backend/laboratoryreview/controller/LaboratoryReviewController.java)
- [프론트 · src/hooks/useLabBookmark.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/hooks/useLabBookmark.js)
- [프론트 · src/features/search/hooks/useLabFilter.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/features/search/hooks/useLabFilter.js)
- [프론트 · src/features/search/components/SearchBar.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/features/search/components/SearchBar.jsx)
- [프론트 · src/features/search/components/ResearchFieldChips.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/features/search/components/ResearchFieldChips.jsx)
- [프론트 · src/features/main/components/LabReviewHighlights.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/features/main/components/LabReviewHighlights.jsx)
- [프론트 · src/features/main/hooks/useColleges.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/features/main/hooks/useColleges.js)
- [프론트 · src/pages/Privacy/index.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/pages/Privacy/index.jsx)
- [백엔드 · src/main/resources/application.yml](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/main/resources/application.yml)
- [백엔드 · src/main/java/com/sebu/backend/auth/config/TokenProperties.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/main/java/com/sebu/backend/auth/config/TokenProperties.java)
- [프론트 · vercel.json](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/vercel.json)
- [프론트 · src/features/auth/components/LoginForm.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/features/auth/components/LoginForm.jsx)
- [프론트 · src/features/auth/components/PrivacyNoticeModal.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/features/auth/components/PrivacyNoticeModal.jsx)
- [프론트 · src/pages/Terms/index.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/pages/Terms/index.jsx)

기준 커밋은 [[SEBU 저장소와 기준 버전]]에서 확인한다.
<!-- sources:end -->

---
[[SEBU 홈]] · [[SEBU 지식 지도]]
