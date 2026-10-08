---
project: SEBU
type: "reference"
status: "PR 94 develop 머지와 운영 준비 검증 반영"
created: 2026-09-26
verified: 2026-10-08
tags:
  - sebu
  - sebu/reference
---
# SEBU 저장소와 기준 버전

백엔드는 2026-10-08에 확인한 develop 커밋, 프론트는 2026-10-07에 검토한 dev 커밋을 기준으로 한다. 운영 배포 상태와 개인의 미커밋 작업은 이 기준과 구분한다.

| 저장소 | 기준 브랜치 | 반영한 커밋 | 반영 범위 |
|---|---|---|---|
| [SEBU-backend](https://github.com/greedy-team/SEBU-backend) | develop | [d1010d4](https://github.com/greedy-team/SEBU-backend/commit/d1010d405abfcb5f9b01b155c48032da01ee1d2d) | PR #93 문서 이전·PR #94 배포 채널 분리와 전체 연구 정보 이관 |
| [SEBU-frontend](https://github.com/greedy-team/SEBU-frontend) | dev | [88eee80](https://github.com/greedy-team/SEBU-frontend/commit/88eee80d88016b3e3067ac224651143b1d28351f) | 10월 7일 검토 기준 유지 |
| [SEBU-brain](https://github.com/greedy-team/SEBU-brain) | main 및 문서 작업 브랜치 | 이 저장소의 Git 기록 | 팀 지식과 이전된 상세 문서 |

## 이번에 비교한 구간

백엔드 `21bd49e → d1010d4`에서 문서 이전 PR #93, 배포·이관 PR #94의 develop 머지를 확인했다. 일반 상세 문서는 Brain으로 옮기고 테스트 분류 CSV는 `src/test/resources/fixtures/`에 남겼다. 개발·운영 채널, 환경 예시, 11개 연구 정보 테이블 이관, 실제 MySQL 검증을 새 운영 안내와 관련 노트에 반영했다. 애플리케이션 업무 로직과 기존 SQL·Java 마이그레이션은 이번 구간에서 변경하지 않았다.

PR #94는 **2026-10-08 14:09 KST**에 develop으로 머지됐다. main 출시·운영 서버 배포를 의미하지 않는다. 실행 근거와 남은 단계는 [[SEBU 운영 준비 검증 기록 - 2026-10-08]]과 [[SEBU 운영 전환과 연구 정보 이관]]에 있다.

FE 기준은 검토한 `88eee80`을 유지한다. 10월 8일 원격 dev의 더 새 커밋 [4821453](https://github.com/greedy-team/SEBU-frontend/commit/482145344796fd17dd728c16b9cc1cfc09c21642)을 확인했지만 **이번 배포 문서 작업에서는 해당 FE 변경을 검토·반영하지 않았다.** FE 설명을 현재 원격 최신 상태로 단정하지 않는다.

백엔드 `docs/`와 README 상세 본문의 과거 원문은 [[SEBU 백엔드 문서 모음]]에 보존한다. 원문의 `21bd49e` 커밋과 해시는 역사적 출처이므로 현재 코드 기준으로 덮어쓰지 않는다. 이전 BE·FE 갱신 범위는 [[SEBU 갱신 기록 - 2026-10-07]]에 남아 있다.

## 기준의 의미

- 코드의 파일·해시·연결 노트는 `metadata/source-baseline.json`에 기록한다.
- 이전된 문서는 보관함 내부 링크로 연결하고, 각 원문의 과거 GitHub 링크와 해시를 남긴다. 삭제될 `B:docs/...`를 새 코드 기준의 필수 파일로 요구하지 않는다.
- 구현·계약의 코드 확인, PR #94 CI, AWS 내부 격리 복원 실행 결과를 구분한다. 실제 학교 로그인·운영 DB 이관·운영 배포는 아직 검증하지 않았다.
- 로그인 1시간 만료·연장·모달은 여전히 미구현 제안이다. Refresh 12시간 변경과 혼동하지 않는다.
- 이후 변경은 자동 반영되지 않는다. 관련 노트를 검토한 뒤 기준을 갱신한다.

[[SEBU 문서 이전 기록 - 2026-10-08]] · [[SEBU 팀 공유와 업데이트]] · [[SEBU 지식 갱신 방법]]

---
[[SEBU 홈]] · [[SEBU 지식 지도]]
