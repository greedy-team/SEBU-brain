---
project: SEBU
type: "reference"
status: "원격 기준 커밋과 변경 내용 확인"
created: 2026-09-26
verified: 2026-10-07
tags:
  - sebu
  - sebu/reference
---
# SEBU 저장소와 기준 버전

2026-10-07에 확인한 **백엔드 develop과 프론트 dev의 머지된 커밋**을 반영했다. 개별 컴퓨터의 미커밋 작업과 운영 서버의 배포 상태는 이 기준과 구분한다.

| 저장소 | 기준 브랜치 | 반영한 커밋 | 마지막 커밋 내용 |
|---|---|---|---|
| [SEBU-backend](https://github.com/greedy-team/SEBU-backend) | develop | [b6cf2e5](https://github.com/greedy-team/SEBU-backend/commit/b6cf2e5eacfe7b076c8f7553e01243b5e3304fed) | PR #92 예체능 데이터 머지 |
| [SEBU-frontend](https://github.com/greedy-team/SEBU-frontend) | dev | [88eee80](https://github.com/greedy-team/SEBU-frontend/commit/88eee80d88016b3e3067ac224651143b1d28351f) | 로고·메뉴 선택 표시·로그인 복귀 정비 |
| [SEBU-brain](https://github.com/greedy-team/SEBU-brain) | main 및 문서 작업 브랜치 | 이 문서 레포의 Git 기록 | 팀 지식 |

## 이번에 비교한 구간

| 저장소 | 이전 기준 → 이번 기준 | 비교 범위 |
|---|---|---|
| BE | f06c597 → b6cf2e5 | 10개 커밋(머지 포함), 변경 파일 26개 |
| FE | 2fb7566 → 88eee80 | 18개 커밋, 변경 파일 45개 |

사용자가 Pull한 IntelliJ 백엔드의 HEAD도 위 BE 기준과 일치하는 것을 확인했다. 깨끗한 코드 사본에서 이전 기준 이후의 커밋과 전체 파일 차이를 검토했으며 사용자의 미커밋 파일은 수정하지 않았다. 새 API·동작·정책은 관련 기능 노트에 반영하고, 시각 스타일처럼 구조를 바꾸지 않는 변경은 [[SEBU 메인과 모바일 화면]]에 묶었다.

[[SEBU 예체능대학 크롤링 검수 - 2026-10-06]]의 PR #92는 이제 머지된 코드에 포함된다. 당시 격리 DB 검증 이력은 보존하고 운영 적용 여부는 계속 별도 확인 항목으로 둔다.

## 기준의 의미

- 기준 파일·해시·연결 노트는 루트 metadata/source-baseline.json에 기록한다.
- 자동 근거 링크는 이번 기준 커밋으로 고정한다. 본문을 갱신한 노트의 verified 날짜를 바꾸며, 변경되지 않은 노트와 과거 검수 기록의 작성일·검증 이력은 보존한다.
- 코드 존재와 계약을 정적으로 확인했다. 운영 배포 버전, 실제 학교 로그인, 앱 테스트 통과는 이번 갱신의 결과가 아니다.
- 1시간 로그인 만료·연장·모달처럼 대화에서 제안한 사항은 실제 코드 반영 여부를 따로 적는다.
- 이후 커밋은 자동 반영되지 않는다. 다음 갱신에서도 차이를 검토한 뒤 기준을 옮긴다.

[[SEBU 갱신 기록 - 2026-10-07]] · [[SEBU 팀 공유와 업데이트]] · [[SEBU 지식 갱신 방법]]

---
[[SEBU 홈]] · [[SEBU 지식 지도]]
