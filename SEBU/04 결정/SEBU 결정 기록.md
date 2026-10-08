---
project: SEBU
type: "decision-index"
status: "근거 기반 재구성"
created: 2026-09-26
verified: 2026-09-26
tags:
  - sebu
  - sebu/decision-index
source_ids:
  - "F:src/api/queries/laboratories.js"
  - "F:src/api/queryClient.js"
---
# SEBU 결정 기록

이 기록은 코드와 계약 문서에서 확인한 선택을 정리한 것이다. 별도 회의에서 새로 합의했거나 알 수 없는 과거 동기를 복원한 기록은 아니다.

| 선택 | 근거와 의미 | 연결 |
|---|---|---|
| HttpOnly 쿠키로 사용자 토큰 전달 | JWT 검증 유지, CSRF·출처 검증 병행 | [[SEBU 결정 - 쿠키 인증]] |
| 수집·검수·승격 분리 | 승인된 현재 후보만 본 데이터 반영 | [[SEBU 결정 - 검수 후 승격]] |
| 복수 학과와 수기 출처 보존 | 겸임 소속·MANUAL 홈페이지 유지 | [[SEBU 결정 - 복수 학과와 출처 보존]] |
| 세 화면의 연구실 조회 캐시 공유 | 동일 쿼리 키, 화면별 필터·그룹·정렬 | [[SEBU 화면과 API 공유]] |
| 공개 조회와 로그인 권한 분리 | 비로그인 탐색, 저장·작성은 인증 | [[SEBU 공개 API와 CORS]] |
| 단일 컨테이너 EC2 Pull 배포 | 검증된 이미지 배포, 짧은 중단 허용 | [[SEBU 배포와 모니터링]] |

새 결정은 [[SEBU 의사결정 템플릿]]으로 문제·대안·선택·비용·재검토 조건을 남긴다. 구현에서 확인한 동작과 제안은 구분한다.

## 이전된 상세 문서

- [[SEBU 백엔드 쿠키 인증 계약]]
- [[SEBU 백엔드 교수 후보 승격 실행 안내]]
- [[SEBU 백엔드 EC2 자동 배포 안내]]

<!-- sources:start -->
## 근거 파일

- [프론트 · src/api/queries/laboratories.js](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/api/queries/laboratories.js)
- [프론트 · src/api/queryClient.js](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/api/queryClient.js)

기준 커밋은 [[SEBU 저장소와 기준 버전]]에서 확인한다.
<!-- sources:end -->

---
[[SEBU 홈]] · [[SEBU 지식 지도]]
