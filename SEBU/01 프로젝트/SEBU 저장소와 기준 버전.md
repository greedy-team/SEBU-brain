---
project: SEBU
type: "reference"
status: "백엔드 문서 이전과 추가 정책 변경 확인"
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
| [SEBU-backend](https://github.com/greedy-team/SEBU-backend) | develop | [21bd49e](https://github.com/greedy-team/SEBU-backend/commit/21bd49e5133210978b4991a99d7e3cb6a33e6a7a) | Refresh 12시간 설정·계약·테스트, 문서 이전 직전 원본 |
| [SEBU-frontend](https://github.com/greedy-team/SEBU-frontend) | dev | [88eee80](https://github.com/greedy-team/SEBU-frontend/commit/88eee80d88016b3e3067ac224651143b1d28351f) | 10월 7일 검토 기준 유지 |
| [SEBU-brain](https://github.com/greedy-team/SEBU-brain) | main 및 문서 작업 브랜치 | 이 저장소의 Git 기록 | 팀 지식과 이전된 상세 문서 |

## 이번에 비교한 구간

백엔드 `b6cf2e5 → 21bd49e`의 2개 커밋·8개 파일을 읽고 Refresh 12시간 정책과 기존 토큰 전환 조건을 관련 노트에 반영했다. FE는 이번 이전 작업에서 기준을 변경하지 않았다. 이전 BE·FE 갱신 범위와 검수 이력은 [[SEBU 갱신 기록 - 2026-10-07]]에 보존한다.

백엔드 `docs/`와 README의 상세 본문은 [[SEBU 백엔드 문서 모음]]으로 이전했다. 위 BE 커밋은 이전 전 원본의 출처이며, 백엔드 문서 정리 PR의 머지 또는 운영 배포를 뜻하지 않는다. 이전 원문의 내용 확인일과 이전 검증일은 각 노트에서 구분한다.

## 기준의 의미

- 코드의 파일·해시·연결 노트는 `metadata/source-baseline.json`에 기록한다.
- 이전된 문서는 보관함 내부 링크로 연결하고, 각 원문의 과거 GitHub 링크와 해시를 남긴다. 삭제될 `B:docs/...`를 새 코드 기준의 필수 파일로 요구하지 않는다.
- 구현과 계약을 정적으로 확인했다. 실제 학교 로그인·운영 DB·운영 배포는 이번 문서 작업에서 실행 검증하지 않았다.
- 로그인 1시간 만료·연장·모달은 여전히 미구현 제안이다. Refresh 12시간 변경과 혼동하지 않는다.
- 이후 변경은 자동 반영되지 않는다. 관련 노트를 검토한 뒤 기준을 갱신한다.

[[SEBU 문서 이전 기록 - 2026-10-08]] · [[SEBU 팀 공유와 업데이트]] · [[SEBU 지식 갱신 방법]]

---
[[SEBU 홈]] · [[SEBU 지식 지도]]
