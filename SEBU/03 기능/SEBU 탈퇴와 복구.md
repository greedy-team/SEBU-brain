---
project: SEBU
type: "feature"
status: "현재 정책 확인"
created: 2026-09-26
verified: 2026-10-09
tags:
  - sebu
  - sebu/feature
source_ids:
  - "B:src/main/resources/db/migration/V38__add_account_recovery_and_anonymization.sql"
  - "B:src/main/resources/db/migration/V39__add_app_user_auth_version.sql"
  - "F:src/pages/MyPage/index.jsx"
  - "F:src/features/auth/hooks/useLogin.js"
  - "F:src/content/terms/terms-2026-10-09.md"
  - "F:src/content/privacy/privacy-policy-2026-10-07.md"
---
# SEBU 탈퇴와 복구

회원 탈퇴는 즉시 접근을 차단하고, 30일의 복구 기간 후 개인정보를 익명화하는 단계적 처리다. 탈퇴와 모든 작성물 삭제는 같은 동작이 아니다.

| 시점 | 처리 |
|---|---|
| 탈퇴 즉시 | deleted_at 기록, auth_version 증가, Refresh·복구 토큰 삭제, 공개 작성자 마스킹 |
| 탈퇴 후 1시간 미만 | 복구 대기시간 |
| 대기시간 후 ~ 탈퇴 30일 미만 | 학교 인증 후 명시적 복구 확인 가능 |
| 30일 이상 | 개인정보·인증 식별자 익명화, 좋아요·북마크 삭제 |

## 무엇을 보존하는가

게시글·댓글·연구실 후기와 내부 author_id는 유지한다. 30일 안에 복구하면 기존 사용자 ID와 프로필·작성물·반응이 다시 활성화된다. 30일 뒤 같은 학번으로 로그인하면 신규 계정이 되며 이전 작성물의 소유권을 이어받지 않는다.

탈퇴 사용자의 좋아요·북마크는 복구를 위해 남아 있어도 집계에서는 즉시 제외한다.

## 복구는 별도 사용자 의사다

학교 인증 성공이 자동 복구를 뜻하지 않는다. RECOVERY_REQUIRED 응답에는 짧은 수명의 recovery_token 쿠키가 발급되고, /auth/recovery에서 확인한 뒤 복구한다.

## 프론트 탈퇴 안내

9월 30일 반영된 MyPage 탈퇴 모달은 ‘1시간 이내 복구 불가 → 1시간 이후 30일 이내 복구 가능 → 30일 이후 신규 가입’의 세 단계로 안내한다. 문구의 ‘재로그인하면 복구할 수 있다’는 학교 인증 뒤 복구 확인을 할 수 있다는 뜻이다. 자동 복구로 설명하지 않는다.

이 변경은 FE 안내 문구 정비이며 BE의 복구 대기시간이나 보존 기간을 바꾼 커밋은 아니다.

공개 이용약관·개인정보 처리방침에는 복구를 원하지 않는 사용자의 즉시 삭제 요청과 작성물 삭제 요청을 고객지원으로 접수하는 절차가 추가됐다. 이는 문서에 적힌 운영 절차다. 해당 문구만으로 BE에 즉시 파기 API나 관리자 화면이 추가됐다고 해석하지 않는다. 작성물 수정·삭제의 FE 연결 차이는 [[SEBU 커뮤니티와 후기]]에서 확인한다.

## auth_version의 이유

탈퇴 시 증가한 auth_version을 복구 시 되돌리지 않는다. 과거 Access JWT와 현재 사용자 버전을 비교해, 복구 후 탈퇴 전 토큰이 다시 살아나는 것을 막는다.

학교 인증 성공·현재 계정 상태·현재 토큰 유효성은 각각 별도로 판단해야 한다.

[[SEBU 인증과 CSRF]] · [[SEBU 커뮤니티와 후기]] · [[SEBU 데이터 모델]]

## 이전된 상세 문서

- [[SEBU 백엔드 탈퇴와 복구 계약]]
- [[SEBU 백엔드 쿠키 인증 계약]]

<!-- sources:start -->
## 근거 파일

- [백엔드 · src/main/resources/db/migration/V38__add_account_recovery_and_anonymization.sql](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/main/resources/db/migration/V38__add_account_recovery_and_anonymization.sql)
- [백엔드 · src/main/resources/db/migration/V39__add_app_user_auth_version.sql](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/main/resources/db/migration/V39__add_app_user_auth_version.sql)
- [프론트 · src/pages/MyPage/index.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/pages/MyPage/index.jsx)
- [프론트 · src/features/auth/hooks/useLogin.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/features/auth/hooks/useLogin.js)
- [프론트 · src/content/terms/terms-2026-10-09.md](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/content/terms/terms-2026-10-09.md)
- [프론트 · src/content/privacy/privacy-policy-2026-10-07.md](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/content/privacy/privacy-policy-2026-10-07.md)

기준 커밋은 [[SEBU 저장소와 기준 버전]]에서 확인한다.
<!-- sources:end -->

---
[[SEBU 홈]] · [[SEBU 지식 지도]]
