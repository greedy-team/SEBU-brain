---
project: SEBU
type: "hub"
status: "공유용 정리"
created: 2026-09-26
verified: 2026-10-08
tags:
  - sebu
  - sebu/hub
source_ids:
  - "B:README.md"
  - "F:src/App.jsx"
  - "F:src/api/queries/laboratories.js"
---
# SEBU 홈

SEBU의 구조, 실제 구현, 설계 이유와 남은 과제를 연결하는 팀 지식 보관함이다. **2026-10-08에 확인한 백엔드 develop과 2026-10-07에 확인한 프론트 dev의 커밋**을 기준으로 한다.

> [!important] 현재 구현
> 개발·운영 배포 채널과 전체 연구 정보 이관 코드를 준비하고 격리 DB에서 교수·연구실 622개와 후기 0건을 검증했다. 운영 EC2 생성·실제 배포·FE 전환은 아직이다. [[SEBU 운영 전환과 연구 정보 이관]]
>
> 백엔드 상세 문서는 [[SEBU 백엔드 문서 모음]]으로 이전했다. Refresh 기본 수명은 12시간이며 절대 수명은 30일이다. sebu.kr 허용, 로봇 하위 분류, 예체능 데이터가 BE에 머지됐다. FE는 추천 상세 북마크·프로필 저장·검색어 URL 동기화를 수정하고 메인·모바일 화면을 갱신했다. 카테고리 계층 UI와 1시간 로그인 만료·연장·만료 모달은 아직 구현되지 않았다. 운영 반영은 별도 확인한다.

## 하려는 일에서 시작하기

| 목적 | 읽을 노트 |
|---|---|
| 처음 프로젝트 이해하기 | [[SEBU 프로젝트 개요]] → [[SEBU 시스템 구조]] |
| 백엔드 상세 계약·실행 안내 읽기 | [[SEBU 백엔드 문서 모음]] · [[SEBU 문서 이전 기록 - 2026-10-08]] |
| 최근 변경 확인하기 | [[SEBU 운영 준비 검증 기록 - 2026-10-08]] · [[SEBU 갱신 기록 - 2026-10-07]] · [[SEBU 메인과 모바일 화면]] |
| 여러 화면이 같은 API를 쓰는 이유 | [[SEBU 화면과 API 공유]] |
| 공개 API와 도메인 제한 이해하기 | [[SEBU 공개 API와 CORS]] |
| 로그인·북마크 구현 찾기 | [[SEBU 인증과 CSRF]] · [[SEBU 마이페이지와 북마크]] |
| 수정할 파일 찾기 | [[SEBU 프론트엔드 구조]] · [[SEBU 백엔드 구조]] · [[SEBU API 지도]] |
| 설계 이유 설명하기 | [[SEBU 결정 기록]] · [[SEBU 데이터 모델]] |
| 운영 전환과 전체 연구 정보 이관 | [[SEBU 운영 전환과 연구 정보 이관]] |
| 개발·운영 시작하기 | [[SEBU 로컬 실행]] · [[SEBU 배포와 모니터링]] · [[SEBU 테스트 지도]] |
| 다음 작업 고르기 | [[SEBU 구현 현황]] · [[SEBU 변경 검토 목록]] |
| 지식 기록·갱신하기 | [[SEBU 팀 공유와 업데이트]] · [[SEBU 지식 갱신 방법]] |
| 전체 관계 보기 | [[SEBU 지식 지도]] · [[SEBU 연결 지도.canvas]] |

## 이 보관함을 읽는 기준

- 각 노트의 근거 링크는 특정 코드 커밋을 가리킨다. [[SEBU 저장소와 기준 버전]]
- ‘구현 확인’은 코드를 읽었다는 뜻이며 실제 배포·사용자 시나리오의 통과를 뜻하지 않는다.
- ‘제안’과 ‘검토 필요’를 구현 완료로 읽지 않는다.
- 의미 있는 변경이 코드에 머지되면 관련 노트와 원본 기준을 함께 갱신한다.
- 처음 사용하거나 GitHub에서 읽는 팀원은 저장소 루트 README에서 시작한다. 추가 플러그인 없이 Obsidian 기본 기능으로 읽을 수 있다.

메모는 [[SEBU 수집함]], 학습은 [[SEBU 학습 연결]], 이번 갱신 내용은 [[SEBU 갱신 기록 - 2026-10-07]]에 남긴다.

<!-- sources:start -->
## 근거 파일

- [백엔드 · README.md](https://github.com/greedy-team/SEBU-backend/blob/d1010d405abfcb5f9b01b155c48032da01ee1d2d/README.md)
- [프론트 · src/App.jsx](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/App.jsx)
- [프론트 · src/api/queries/laboratories.js](https://github.com/greedy-team/SEBU-frontend/blob/88eee80d88016b3e3067ac224651143b1d28351f/src/api/queries/laboratories.js)

기준 커밋은 [[SEBU 저장소와 기준 버전]]에서 확인한다.
<!-- sources:end -->
