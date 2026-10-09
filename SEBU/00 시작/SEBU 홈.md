---
project: SEBU
type: "hub"
status: "공유용 정리"
created: 2026-09-26
verified: 2026-10-09
tags:
  - sebu
  - sebu/hub
source_ids:
  - "B:README.md"
  - "F:src/App.jsx"
  - "F:src/api/queries/laboratories.js"
---
# SEBU 홈

SEBU의 구조, 실제 구현, 설계 이유와 남은 과제를 연결하는 팀 지식 보관함이다. **2026-10-09에 확인한 백엔드 main·develop과 프론트 dev의 커밋**을 기준으로 한다. 서비스 주소는 [www.sebu.kr](https://www.sebu.kr/)이다.

> [!important] 현재 구현
> 운영 EC2·HTTPS·main 배포, 연구 정보 이관, 초기 백업·복원 및 정기 백업을 완료했다. 운영 연구실 622개를 확인했고, 물리천문학과 빈 홈페이지 14개를 V50으로 보완했다. 기존 후기와 ID는 유지했다. [[SEBU 운영 배포 완료 기록 - 2026-10-09]] · [[SEBU 물리천문학과 링크 보완 기록 - 2026-10-09]]
>
> BE는 main이 운영, develop이 개발이다. FE는 팀 방침에 따라 dev가 운영 브랜치이며 FE 담당자가 구현·배포한다. FE API 목적지는 운영 API로 전환됐다. 로그인 1시간 고정 만료·연장 모달, 연구 분야 계층 UI, 서비스 내부 신고·관리자 기능은 완료된 기능과 구분한다. 실제 학교 로그인 및 인증된 작성·수정·삭제의 최종 수용 검증도 별도다. [[SEBU 구현 현황]] · [[SEBU 변경 검토 목록]]

## 하려는 일에서 시작하기

| 목적 | 읽을 노트 |
|---|---|
| 처음 프로젝트 이해하기 | [[SEBU 프로젝트 개요]] → [[SEBU 시스템 구조]] |
| 백엔드 상세 계약·실행 안내 읽기 | [[SEBU 백엔드 문서 모음]] · [[SEBU 문서 이전 기록 - 2026-10-08]] |
| 최근 변경 확인하기 | [[SEBU 갱신 기록 - 2026-10-09]] · [[SEBU 운영 배포 완료 기록 - 2026-10-09]] |
| 여러 화면이 같은 API를 쓰는 이유 | [[SEBU 화면과 API 공유]] |
| 공개 API와 도메인 제한 이해하기 | [[SEBU 공개 API와 CORS]] |
| 로그인·북마크 구현 찾기 | [[SEBU 인증과 CSRF]] · [[SEBU 마이페이지와 북마크]] |
| 수정할 파일 찾기 | [[SEBU 프론트엔드 구조]] · [[SEBU 백엔드 구조]] · [[SEBU API 지도]] |
| 설계 이유 설명하기 | [[SEBU 결정 기록]] · [[SEBU 데이터 모델]] |
| 운영 전환과 전체 연구 정보 이관 | [[SEBU 운영 전환과 연구 정보 이관]] |
| 운영 중 긴급 수정·누락 링크 보완 | [[SEBU 운영 핫픽스와 데이터 보정]] · [[SEBU 물리천문학과 링크 보완 기록 - 2026-10-09]] |
| 신고 요구사항과 현재 접수 방식 | [[SEBU 신고와 관리자 검토]] |
| 개발·운영 시작하기 | [[SEBU 로컬 실행]] · [[SEBU 배포와 모니터링]] · [[SEBU 테스트 지도]] |
| 다음 작업 고르기 | [[SEBU 구현 현황]] · [[SEBU 변경 검토 목록]] |
| 지식 기록·갱신하기 | [[SEBU 팀 공유와 업데이트]] · [[SEBU 지식 갱신 방법]] · [[SEBU 협업과 AI 작업 원칙]] |
| 전체 관계 보기 | [[SEBU 지식 지도]] · [[SEBU 연결 지도.canvas]] |

## 이 보관함을 읽는 기준

- 각 노트의 근거 링크는 특정 코드 커밋을 가리킨다. [[SEBU 저장소와 기준 버전]]
- ‘구현 확인’은 코드를 읽었다는 뜻이며 실제 배포·사용자 시나리오의 통과를 뜻하지 않는다.
- ‘제안’과 ‘검토 필요’를 구현 완료로 읽지 않는다.
- 의미 있는 변경이 코드에 머지되면 관련 노트와 원본 기준을 함께 갱신한다.
- 처음 사용하거나 GitHub에서 읽는 팀원은 저장소 루트 README에서 시작한다. 추가 플러그인 없이 Obsidian 기본 기능으로 읽을 수 있다.

메모는 [[SEBU 수집함]], 학습은 [[SEBU 학습 연결]], 이번 갱신 내용은 [[SEBU 갱신 기록 - 2026-10-09]]에 남긴다. 과거 기록은 당시 상태를 보존하며 현재 상태는 위 현황 문서로 확인한다.

<!-- sources:start -->
## 근거 파일

- [백엔드 · README.md](https://github.com/greedy-team/SEBU-backend/blob/bb7372518cb2d69f0e83cad2ec760a8920c7f964/README.md)
- [프론트 · src/App.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/App.jsx)
- [프론트 · src/api/queries/laboratories.js](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/api/queries/laboratories.js)

기준 커밋은 [[SEBU 저장소와 기준 버전]]에서 확인한다.
<!-- sources:end -->
