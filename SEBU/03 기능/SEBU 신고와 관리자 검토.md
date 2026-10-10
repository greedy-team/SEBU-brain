---
project: SEBU
type: "feature"
status: "외부 접수 구현·신고 요구·관리자 설계 검토 분리"
created: 2026-10-09
verified: 2026-10-09
tags:
  - sebu
  - sebu/feature
source_ids:
  - "F:src/constants/links.js"
  - "F:src/components/layout/Header.jsx"
  - "F:src/components/layout/Footer.jsx"
  - "F:src/App.jsx"
  - "F:src/content/terms/terms-2026-10-09.md"
  - "B:src/main/java/com/sebu/backend/global/auth/SecurityConfiguration.java"
  - "B:src/main/java/com/sebu/backend/laboratoryreview/controller/LaboratoryReviewController.java"
  - "B:src/main/java/com/sebu/backend/community/post/controller/CommunityPostController.java"
  - "B:src/main/java/com/sebu/backend/community/comment/controller/CommunityCommentController.java"
---
# SEBU 신고와 관리자 검토

현재 신고/제보는 외부 Google Form과 고객지원 메일로 연결된다. **로그인 사용자가 특정 후기·게시글·댓글을 신고하고 관리자가 처리하는 기능은 요구사항이며, 확정된 API 명세나 구현 완료 상태로 기록하지 않는다.**

## 현재 코드에 있는 접수 창구

`REPORT_FORM_URL`을 데스크톱 헤더의 신고/제보 아이콘과 공통 푸터가 함께 사용한다. 링크는 새 탭으로 외부 폼을 열며 앱의 로그인 여부로 막지 않는다. 푸터에는 고객지원 메일도 있다. 현재 폼의 항목·접수 결과·접근 권한은 이번 문서 작업에서 확인하지 않았다.

2026년 10월 9일자 이용약관은 신고 시 대상 주소·사유·확인 자료를 제시하고, 운영자가 검토 후 필요한 조치를 하며 사유 안내와 이의제기를 제공한다고 설명한다. 공개 문서의 운영 절차와 서비스 내부 관리자 기능은 별개다. 기준 FE App에는 관리자 화면 라우트가 없고, 기준 BE 컨트롤러 목록에서도 신고 접수·신고 목록·관리자 조치 API를 확인하지 못했다.

## 대화에서 확인된 요구사항

다음은 사용자가 요청한 기능 방향이다. 현재 코드 동작과 구분해서 보존한다.

| 항목 | 요청 내용 |
|---|---|
| 신고 대상 | 부적절한 랩실 후기, 커뮤니티 게시글, 댓글 |
| 신고 가능 사용자 | 로그인한 사용자 |
| 비로그인 클릭 | ‘로그인 후 사용해주세요’ 안내 |
| 신고 사유 | 스팸·광고, 욕설·혐오, 허위사실, 개인정보, 음란물, 기타 직접 입력 |
| 향후 관리자 확인 | 피신고자의 닉네임과 신고 대상 글을 확인하고 관리 |

일반 커뮤니티 라우트는 현재 MVP에서 주석 처리되어 있으므로 게시글·댓글 신고 요구가 있다는 이유로 해당 화면이 공개됐다고 해석하지 않는다. 랩실 후기는 공개 응답에서 작성자 정보를 숨기는 익명 정책이 있다. 관리자에게 필요한 식별정보를 공개 후기 응답에 추가하는 방식으로 처리하지 않는다. [[SEBU 커뮤니티와 후기]]

## 명세에서 정해야 할 내용

아래는 요구를 구현 가능한 계약으로 만들기 위한 **설계 검토 항목**이다. 필드명·메서드·경로·응답 형식·상태 코드·관리자 역할은 아직 확정하지 않았다.

- 신고 대상 종류와 식별자, 허용 사유, 기타 사유 입력 조건, 중복 신고와 이미 삭제된 대상의 처리.
- 신고자는 로그인 세션으로 식별하고, 피신고자는 대상 작성자를 서버에서 확인하는 방식. 클라이언트가 보낸 닉네임만으로 사용자를 특정하지 않는 원칙.
- 관리자 권한 확인, 목록·상세 조회 범위, 피신고자 닉네임·대상 내용과 접수 시점 기록의 보존 범위.
- 접수·검토·조치 등 처리 상태와 사유, 담당자·처리시각 기록, 사용자 안내와 이의제기 절차.
- 탈퇴·익명화 또는 글 수정·삭제가 발생했을 때의 표시·보존 정책. 공개 익명성, 운영 검토 목적과 개인정보 최소 접근을 함께 정할 것.

신고가 들어왔다는 이유만으로 위반이 확정되거나 자동 삭제·제재된다는 규칙은 확인되지 않았다. 실제 신고·관리자 계약이 확정되면 API 지도, 데이터 모델, 권한·검토 목록을 함께 갱신한다.

## 근거와 확인 범위

현재 구현은 FE `e7e54de`와 BE `bb73725`의 Git 소스를 대조했다. 위 기능 요구는 프로젝트 대화에서 추출한 기록이며 source_ids의 코드가 구현을 보증하지 않는다. 기존 [Notion 참고 문서](https://www.notion.so/3d9749199ba780c68a61ef63bad3e59b)는 명세 확정 근거로 재검토하지 않았다. 새 브라우저 확인이 필요하면 사용자가 Aside AI에서 진행하고 결과를 문서에 반영한다.

[[SEBU API 지도]] · [[SEBU 데이터 모델]] · [[SEBU 커뮤니티와 후기]] · [[SEBU 변경 검토 목록]]

<!-- sources:start -->
## 근거 파일

- [프론트 · src/constants/links.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/constants/links.js)
- [프론트 · src/components/layout/Header.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/components/layout/Header.jsx)
- [프론트 · src/components/layout/Footer.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/components/layout/Footer.jsx)
- [프론트 · src/App.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/App.jsx)
- [프론트 · src/content/terms/terms-2026-10-09.md](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/content/terms/terms-2026-10-09.md)
- [백엔드 · src/main/java/com/sebu/backend/global/auth/SecurityConfiguration.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/main/java/com/sebu/backend/global/auth/SecurityConfiguration.java)
- [백엔드 · src/main/java/com/sebu/backend/laboratoryreview/controller/LaboratoryReviewController.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/main/java/com/sebu/backend/laboratoryreview/controller/LaboratoryReviewController.java)
- [백엔드 · src/main/java/com/sebu/backend/community/post/controller/CommunityPostController.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/main/java/com/sebu/backend/community/post/controller/CommunityPostController.java)
- [백엔드 · src/main/java/com/sebu/backend/community/comment/controller/CommunityCommentController.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/main/java/com/sebu/backend/community/comment/controller/CommunityCommentController.java)

기준 커밋은 [[SEBU 저장소와 기준 버전]]에서 확인한다.
<!-- sources:end -->

---
[[SEBU 홈]] · [[SEBU 지식 지도]]
