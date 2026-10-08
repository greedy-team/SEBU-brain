---
project: SEBU
type: "decision"
status: "기존 계약 재구성"
created: 2026-09-26
verified: 2026-09-26
tags:
  - sebu
  - sebu/decision
source_ids:
  - "B:src/main/java/com/sebu/backend/global/auth/SecurityConfiguration.java"
---
# SEBU 결정 - 쿠키 인증

Access/Refresh 원문을 프론트 저장소와 JSON 응답에서 제외하고 HttpOnly 쿠키로 전달한다. JWT 검증과 학교 인증 방식은 유지한다.

## 선택의 효과

JavaScript에서 인증 토큰 원문을 직접 읽는 경로를 줄인다. 토큰 발급과 저장 경계가 서버·브라우저 쿠키로 이동하므로 프론트는 사용자 상태와 요청 실패 처리를 관리한다.

이는 문서와 동작에 근거한 효과 설명이며, 비교했던 모든 대안의 회의 기록은 확인하지 않았다.

## 함께 받아들인 비용

- 브라우저가 쿠키를 자동 전송하므로 변경 요청의 CSRF 검증이 필요하다.
- SameSite, Secure, Path, 출처 및 프록시 구성이 함께 맞아야 한다.
- 로그인·복구·로그아웃 등에서 CSRF 토큰이 교체되므로 현재 값을 다시 읽어야 한다.
- 동시 갱신과 응답 유실에 대한 처리가 필요하다.
- HttpOnly만으로 XSS에 의한 요청 대행까지 막을 수는 없다.

## 현재 남아 있는 경계

로그아웃은 현재 로그인 묶음의 Refresh를 폐기한다. 외부에 복사된 Access JWT의 즉시 무효화를 위한 차단 목록은 추가되지 않았다고 계약에 명시되어 있다. 탈퇴의 auth_version 무효화와 혼동하지 않는다.

## 재검토 조건

별도 사이트 간 쿠키 인증으로 옮기거나, 즉시 세션 폐기 요구가 생기거나, 다중 탭 갱신 문제가 발생하면 관련 정책을 다시 검토한다. 이 조건들은 후속 운영을 위한 제안이다.

[[SEBU 인증과 CSRF]] · [[SEBU 탈퇴와 복구]] · [[SEBU 결정 기록]]

## 이전된 상세 문서

- [[SEBU 백엔드 쿠키 인증 계약]]

<!-- sources:start -->
## 근거 파일

- [백엔드 · src/main/java/com/sebu/backend/global/auth/SecurityConfiguration.java](https://github.com/greedy-team/SEBU-backend/blob/d1010d405abfcb5f9b01b155c48032da01ee1d2d/src/main/java/com/sebu/backend/global/auth/SecurityConfiguration.java)

기준 커밋은 [[SEBU 저장소와 기준 버전]]에서 확인한다.
<!-- sources:end -->

---
[[SEBU 홈]] · [[SEBU 지식 지도]]
