---
project: SEBU
type: "decision-index"
status: "근거 기반 재구성"
created: 2026-09-26
verified: 2026-10-09
tags:
  - sebu
  - sebu/decision-index
source_ids:
  - "F:src/api/queries/laboratories.js"
  - "F:src/api/queryClient.js"
  - "B:.github/workflows/ci.yml"
  - "B:ops/deploy/deploy.py"
  - "B:src/main/resources/db/migration/V50__add_missing_physics_astronomy_laboratory_links.sql"
  - "F:vercel.json"
---
# SEBU 결정 기록

이 기록은 코드로 확인한 선택과 사용자가 이번 운영 작업에서 직접 정한 방침을 구분해 정리한다. 근거 없는 과거 설계 동기를 복원하지 않는다.

| 선택 | 근거와 의미 | 연결 |
|---|---|---|
| HttpOnly 쿠키로 사용자 토큰 전달 | JWT 검증 유지, CSRF·출처 검증 병행 | [[SEBU 결정 - 쿠키 인증]] |
| 수집·검수·승격 분리 | 승인된 현재 후보만 본 데이터 반영 | [[SEBU 결정 - 검수 후 승격]] |
| 복수 학과와 수기 출처 보존 | 겸임 소속·MANUAL 홈페이지 유지 | [[SEBU 결정 - 복수 학과와 출처 보존]] |
| 세 화면의 연구실 조회 캐시 공유 | 동일 쿼리 키, 화면별 필터·그룹·정렬 | [[SEBU 화면과 API 공유]] |
| 공개 조회와 로그인 권한 분리 | 비로그인 탐색, 저장·작성은 인증 | [[SEBU 공개 API와 CORS]] |
| 단일 컨테이너 EC2 Pull 배포 | 검증된 이미지 배포, 짧은 중단 허용 | [[SEBU 배포와 모니터링]] |
| 검수 링크를 새 마이그레이션으로 보완 | 기존 Flyway·연구실 ID 보존, NULL인 대상만 MANUAL 갱신 | [[SEBU 운영 핫픽스와 데이터 보정]] |

## 사용자가 정한 운영·협업 방침

| 방침 | 적용 의미 | 연결 |
|---|---|---|
| BE main 운영·develop 개발, FE dev 운영 | 저장소마다 브랜치 역할이 다름. FE를 main으로 강제 이전하지 않음 | [[SEBU 저장소와 기준 버전]] |
| 운영 상시, 개발은 필요할 때만 | 주 1회 2시간은 사용 계획이며 자동 스케줄 설정이 아님 | [[SEBU 배포와 모니터링]] |
| 비용 최소화와 S3 별도 백업 | Free Tier·크레딧을 우선 확인하고 S3 추가 보관은 별도 승인해 적용 | [[SEBU 운영 배포 완료 기록 - 2026-10-09]] |
| FE 구현·배포는 FE 담당자 | AI는 명시적 요청 없이 FE 코드·PR·배포를 변경하지 않음 | [[SEBU 협업과 AI 작업 원칙]] |
| 웹은 Aside, AWS는 AWS 도구 우선 | 연결 가능 여부와 실행 결과를 별도로 확인 | [[SEBU 협업과 AI 작업 원칙]] |
| 코드는 코드 레포, 프로젝트 지식은 Brain | 관련 실행·테스트 파일은 코드 레포에 유지, 설명·설계·운영 지식 공유 | [[SEBU 팀 공유와 업데이트]] |

새 결정은 [[SEBU 의사결정 템플릿]]으로 문제·대안·선택·비용·재검토 조건을 남긴다. 구현에서 확인한 동작과 제안은 구분한다.

## 이전된 상세 문서

- [[SEBU 백엔드 쿠키 인증 계약]]
- [[SEBU 백엔드 교수 후보 승격 실행 안내]]
- [[SEBU 백엔드 EC2 자동 배포 안내]]

<!-- sources:start -->
## 근거 파일

- [프론트 · src/api/queries/laboratories.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/api/queries/laboratories.js)
- [프론트 · src/api/queryClient.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/api/queryClient.js)
- [백엔드 · .github/workflows/ci.yml](https://github.com/greedy-team/SEBU-backend/blob/bb7372518cb2d69f0e83cad2ec760a8920c7f964/.github/workflows/ci.yml)
- [백엔드 · ops/deploy/deploy.py](https://github.com/greedy-team/SEBU-backend/blob/bb7372518cb2d69f0e83cad2ec760a8920c7f964/ops/deploy/deploy.py)
- [백엔드 · src/main/resources/db/migration/V50__add_missing_physics_astronomy_laboratory_links.sql](https://github.com/greedy-team/SEBU-backend/blob/bb7372518cb2d69f0e83cad2ec760a8920c7f964/src/main/resources/db/migration/V50__add_missing_physics_astronomy_laboratory_links.sql)
- [프론트 · vercel.json](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/vercel.json)

기준 커밋은 [[SEBU 저장소와 기준 버전]]에서 확인한다.
<!-- sources:end -->

---
[[SEBU 홈]] · [[SEBU 지식 지도]]
