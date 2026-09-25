---
project: SEBU
type: "reference"
status: "원격 기준 커밋 확인"
created: 2026-09-26
verified: 2026-09-26
tags:
  - sebu
  - sebu/reference
---
# SEBU 저장소와 기준 버전

이 문서는 팀의 머지된 코드 커밋을 기준으로 한다. 개별 컴퓨터의 오래된 작업 폴더나 미커밋 파일을 팀의 최신 구현으로 취급하지 않는다.

| 저장소 | 기준 브랜치 | 반영한 커밋 | 커밋 내용 |
|---|---|---|---|
| [SEBU-backend](https://github.com/greedy-team/SEBU-backend) | develop | [f06c597](https://github.com/greedy-team/SEBU-backend/commit/f06c597bab64fb1559754644e633aea92be4fd2e) | 운영 JSON 응답 gzip 압축 활성화 |
| [SEBU-frontend](https://github.com/greedy-team/SEBU-frontend) | dev | [2fb7566](https://github.com/greedy-team/SEBU-frontend/commit/2fb75666f9f75a062222f8f74b434a4ddd067fef) | 카드 로컬 상태를 제거하고 캐시로 북마크 관리 |
| [SEBU-brain](https://github.com/greedy-team/SEBU-brain) | main | 이 문서 레포의 Git 기록 | 팀 지식 |

확인일은 2026-09-26이다. 구체적인 파일·해시·연결 노트는 저장소 루트의 `metadata/source-baseline.json`에 기록한다. 향후 갱신 시 이 표도 함께 수정한다.

## 기준의 의미

- 코드 구조와 계약은 위 커밋에서 확인한 사실이다.
- 운영 배포 버전과 실제 학교 로그인 성공은 이번 문서 갱신에서 검증하지 않았다.
- 과거 개인 노트의 Bearer 기반 프론트·북마크 미연결 설명은 현재 dev의 상태와 다르므로 갱신했다.
- API 명세와 구현이 다르면 차이를 [[SEBU 변경 검토 목록]]에 기록한다.
- 기록된 커밋 이후 변경은 자동으로 반영되지 않는다.

팀 갱신 절차: [[SEBU 팀 공유와 업데이트]] · [[SEBU 지식 갱신 방법]]

---
[[SEBU 홈]] · [[SEBU 지식 지도]]
