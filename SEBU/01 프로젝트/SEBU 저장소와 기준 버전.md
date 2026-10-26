---
project: SEBU
type: "reference"
status: "V51 코드·운영 모니터링 실행 기록 대조"
created: 2026-09-26
verified: 2026-10-26
tags:
  - sebu
  - sebu/reference
---
# SEBU 저장소와 기준 버전

2026-10-26에 원격을 갱신해 BE main·develop과 FE dev를 재확인했다. 세 브랜치 모두 10월 10일 문서 기준과 같은 커밋이다. BE는 main이 운영, develop이 개발이며 FE는 dev가 운영 브랜치다. 아래 코드 기준과 과거 운영 실행 확인을 구분한다.

| 저장소 | 기준 브랜치 | 반영한 커밋 | 반영 범위 |
|---|---|---|---|
| [SEBU-backend 운영](https://github.com/greedy-team/SEBU-backend) | main | [3c7445e](https://github.com/greedy-team/SEBU-backend/commit/3c7445e173528b22c40c9abb47b0fb35ad81ff6e) | PR #98 V51 항공우주공학과 링크 보완. 10월 10일 운영 이미지·API와 monitoring 프로필 활성화 확인 |
| [SEBU-backend 개발·코드 근거](https://github.com/greedy-team/SEBU-backend) | develop | [7d4839b](https://github.com/greedy-team/SEBU-backend/commit/7d4839b46ca8cdc6c608ec9934ee02e018e54893) | PR #99로 동일 V51 반영. 확인한 운영 main과 파일 내용이 같음 |
| [SEBU-frontend 운영](https://github.com/greedy-team/SEBU-frontend) | dev | [e7e54de](https://github.com/greedy-team/SEBU-frontend/commit/e7e54deff631adfef08b9b9e0dac9af5c398c317) | 10월 26일 원격 재확인. 이번 작업에서 FE 구현·배포 변경 없음 |
| [SEBU-brain](https://github.com/greedy-team/SEBU-brain) | main 및 문서 작업 브랜치 | 이 저장소의 Git 기록 | 팀 지식과 이전된 상세 문서 |

## 이번에 비교한 구간

- BE develop `7d4839b → 7d4839b`, main `3c7445e → 3c7445e`: 두 브랜치 모두 새 커밋이 없다. main과 develop의 파일 트리도 같다.
- FE dev `e7e54de → e7e54de`: 새 커밋이나 변경 파일이 없다.
- Brain 원격 main은 `7ada8ec`이며 기존 문서 브랜치 HEAD와 같다. 원격 main 자체의 새 문서 커밋은 없었다.
- 깨끗한 비교용 코드 저장소만 최신 원격 커밋으로 fast-forward했다. 별도 작업 폴더의 미커밋 변경·분기 이력과 기존 문서 초안은 보존했다.
- 10월 10일에 비교했던 BE `bb73725 → 7d4839b`의 V51 보완 결과는 [[SEBU 갱신 기록 - 2026-10-10]]에 남긴다.

## 아직 병합되지 않은 작업

2026-10-26 GitHub 조회에서 BE와 Brain의 열린 PR은 없고, FE에는 아래 3개가 있다. PR 설명·메타데이터와 실제 운영 dev를 구분한다.

| PR | 확인한 상태 | 현황에 반영하는 범위 |
|---|---|---|
| [FE #180 — feat: add consent-gated production GA4 pageviews](https://github.com/greedy-team/SEBU-frontend/pull/180) | Draft, open, 미병합 | `feat/ga4-consent-analytics`의 `cdf2b6b` 초안. 선택 동의 기반 GA4 페이지 조회 수집을 App.jsx에 추가하는 변경이며 운영 적용 완료가 아님 |
| [FE #78 — 48 feat e2e 테스트 구현](https://github.com/greedy-team/SEBU-frontend/pull/78) | open, 미병합 | Playwright·MSW 기반 테스트 제안. 현재 dev의 테스트 체계로 간주하지 않음 |
| [FE #21 — chore: 실제 백엔드(로컬) 연동 및 MSW 비활성화 (#20)](https://github.com/greedy-team/SEBU-frontend/pull/21) | open, 미병합 | 과거 로컬 연동 PR. 비슷한 기능의 현재 구현 여부는 dev 코드로 판단하며 PR을 자동 병합하지 않음 |

PR #180의 본문에 남은 실제 프로젝트 빌드·동의/철회·SPA 네트워크·GA4 수신과 보관 설정 검증은 이번 문서 갱신에서 실행하지 않았다. FE 담당자의 검증·병합·배포가 필요한 대기 작업이다. [[SEBU 갱신 기록 - 2026-10-26]]

FE의 dev를 BE의 개발 환경과 같은 의미로 해석하지 않는다. FE 브랜치를 main으로 옮기는 것은 이번 팀 운영 방식이 아니다. FE 코드·배포는 FE 담당자가 관리한다.

2026-10-09 14:38 KST에 운영 API와 서비스 프록시에서 홈페이지 14건 반영, 전체 연구실 622개와 물리천문학과 29개 유지를 확인했다. Aside로 김경호 교수 연구실 상세의 링크 표시도 확인했다. 이 결과로 학교 계정 로그인·후기 작성·수정·삭제까지 모두 통과했다고 판단하지 않는다.

FE 원격 dev 커밋 확인은 Vercel 콘솔에서 동일 배포 SHA를 확인했다는 뜻이 아니다. 공개 서비스의 API 연결과 일부 화면 실행 검증은 [[SEBU 운영 배포 완료 기록 - 2026-10-09]] 및 [[SEBU 물리천문학과 링크 보완 기록 - 2026-10-09]]에서 구분한다.

[[SEBU 운영 준비 검증 기록 - 2026-10-08]]의 “운영 배포 전”은 당시 상태다. 현재 상태를 설명하는 노트만 갱신하고 과거 기록을 배포 완료 기록으로 바꾸지 않는다. 백엔드 원문은 [[SEBU 백엔드 문서 모음]]에 보존하며, `21bd49e` 원본 출처·해시는 역사적 증거이므로 새 코드 기준으로 덮어쓰지 않는다.

## 10월 10일 추가 운영 확인

00:18:35 KST에 V51 12개 홈페이지 반영과 전체 연구실 622개·다른 610개 URL 보존을 확인했다. 이후 운영 모니터링 설정 시 같은 main 커밋과 이미지 digest를 유지한 채 `prod,monitoring` 프로필·전용 수집 토큰만 활성화했다. Grafana 운영 수집 UP·알림 Normal 및 14패널의 16개 쿼리를 검증했다. [[SEBU 항공우주공학과 링크 보완 기록 - 2026-10-10]] · [[SEBU 운영 모니터링 구축 기록 - 2026-10-10]]

이 결과는 기록한 시점의 확인이다. 문서 갱신을 위해 운영 서버 재배포나 실제 로그인·쓰기 검사를 다시 수행하지 않았다.

## 기준의 의미

- 코드의 파일·해시·연결 노트는 `metadata/source-baseline.json`에 B=develop, F=dev로 기록한다. BE 운영 main 커밋은 위 표와 배포 기록에 별도로 남긴다. 이번 BE 두 커밋은 이력이 다르지만 트리가 같으므로 B 근거의 구현이 확인한 운영 코드와 일치한다.
- 이전된 문서는 보관함 내부 링크로 연결하고, 각 원문의 과거 GitHub 링크와 해시를 남긴다. 삭제될 `B:docs/...`를 새 코드 기준의 필수 파일로 요구하지 않는다.
- 코드 확인, CI 통과, 서버 적용, 실제 사용자 시나리오 검증을 구분한다. 운영 배포·DB 이관은 완료 기록이 있고, 실제 학교 로그인과 인증된 쓰기 수용 검증은 별도다.
- 로그인 1시간 만료·연장·모달은 여전히 미구현 제안이다. Refresh 12시간 변경과 혼동하지 않는다.
- 이후 변경은 자동 반영되지 않는다. 관련 노트를 검토한 뒤 기준을 갱신한다.

[[SEBU 갱신 기록 - 2026-10-10]] · [[SEBU 갱신 기록 - 2026-10-09]] · [[SEBU 문서 이전 기록 - 2026-10-08]] · [[SEBU 팀 공유와 업데이트]] · [[SEBU 지식 갱신 방법]]

---
[[SEBU 홈]] · [[SEBU 지식 지도]]
