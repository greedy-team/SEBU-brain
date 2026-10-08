---
project: SEBU
type: "source-index"
status: "공개 저장소 근거"
created: 2026-09-26
verified: 2026-10-08
tags:
  - sebu
  - sebu/source-index
source_ids:
  - "B:README.md"
  - "F:src/App.jsx"
  - "F:src/api/queries/laboratories.js"
  - "F:src/api/client.js"
---
# SEBU 원본 자료

각 노트의 source_ids와 근거 링크는 공개 코드 저장소의 특정 커밋으로 이어진다. 팀원이 같은 로컬 폴더 경로를 쓸 필요는 없다.

## 출처 구분

| 접두어 | 원본 | 기준 |
|---|---|---|
| B: | SEBU-backend | [[SEBU 저장소와 기준 버전]]의 develop 커밋 |
| F: | SEBU-frontend | 같은 노트의 dev 커밋 |
| 출처 없음 | 팀 기록 규칙·템플릿·탐색 지도 | 작성 지침이며 실행 사실이 아님 |

원본 파일의 Git blob SHA, SHA-256, 연결 노트는 metadata/source-baseline.json에 기록한다. Git blob을 읽어 비교하므로 Windows와 다른 OS의 작업 파일 개행 차이로 기준이 달라지지 않는다.

## 백엔드 문서 이전

백엔드 `docs/`의 상세 문서와 기존 README 본문은 [[SEBU 백엔드 문서 모음]]에서 관리한다. 각 이전 노트의 원본 경로·커밋·해시는 이전 시점의 이력을 보존한다. PR #93 머지 후 백엔드에서 제거된 `B:docs/...`는 자동 추적 출처에서 제외하고 보관함 내부 링크로 연결했다. 코드 근거는 기존 `B:`·`F:` 체계를 유지한다.

## 출처끼리 다를 때

최신 기준의 controller/DTO/호출 코드를 먼저 확인하고, 계약 문서의 의도와 대조한다. 불일치는 [[SEBU 변경 검토 목록]]에 남긴다.

초기 ERD·과거 TODO·배포 문서의 설명이 항상 현재 전체 구현을 반영하는 것은 아니다. 예를 들어 logging.md의 상태 확인 경로 설명은 현재 Dockerfile과 차이가 있다.

## 공유 범위

이 보관함에는 SEBU 프로젝트 지식과 템플릿만 포함한다. 개인 보관함의 다른 노트·플러그인 설정·실제 환경 변수·계정 정보는 공유하지 않는다. 실행 결과가 아닌 코드에서 읽은 사실은 그 범위로만 설명한다.

[[SEBU 지식 갱신 방법]] · [[SEBU 팀 공유와 업데이트]]

## 이전된 상세 문서

- [[SEBU 백엔드 쿠키 인증 계약]]
- [[SEBU 백엔드 탈퇴와 복구 계약]]
- [[SEBU 백엔드 교수 크롤링 실행 안내]]
- [[SEBU 백엔드 교수 후보 승격 실행 안내]]
- [[SEBU 백엔드 연구 분야 후보 승격 실행 안내]]
- [[SEBU 백엔드 연구실 ERD]]
- [[SEBU 백엔드 EC2 자동 배포 안내]]
- [[SEBU 백엔드 운영 보안 로깅]]

<!-- sources:start -->
## 근거 파일

- [백엔드 · README.md](https://github.com/greedy-team/SEBU-backend/blob/d1010d405abfcb5f9b01b155c48032da01ee1d2d/README.md)
- [프론트 · src/App.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/App.jsx)
- [프론트 · src/api/queries/laboratories.js](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/api/queries/laboratories.js)
- [프론트 · src/api/client.js](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/api/client.js)

기준 커밋은 [[SEBU 저장소와 기준 버전]]에서 확인한다.
<!-- sources:end -->

---
[[SEBU 홈]] · [[SEBU 지식 지도]]
