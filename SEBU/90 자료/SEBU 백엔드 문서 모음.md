---
project: SEBU
type: "source-index"
status: "백엔드 문서 이관·내용 보존 확인"
created: 2026-10-08
verified: 2026-10-08
tags:
  - sebu
  - sebu/source-index
source_ids: []
source_repository: "greedy-team/SEBU-backend"
source_commit: "21bd49e5133210978b4991a99d7e3cb6a33e6a7a"
---
# SEBU 백엔드 문서 모음

백엔드의 상세 문서와 시작 안내 원문을 이 모음으로 옮겼다. **`docs/`의 문서 9개·CSV 1개·SQL 1개와 기존 `README.md`를 합친 원본 12개 파일**을 보존한다. 기능별 요약과 구현 현황은 기존 지식 노트에서 읽고, 계약의 전체 설명·명령·예제가 필요할 때 아래 원문을 연다.

현재 운영 전환 안내는 [[SEBU 운영 전환과 연구 정보 이관]], 실행 검증은 [[SEBU 운영 준비 검증 기록 - 2026-10-08]]에 있다. 아래 과거 EC2 문서의 develop 전용 흐름을 현재 운영 설정으로 그대로 적용하지 않는다.

## 원본 기준과 검증 범위

- 원본 저장소: [SEBU-backend](https://github.com/greedy-team/SEBU-backend/blob/21bd49e5133210978b4991a99d7e3cb6a33e6a7a/README.md).
- 원본 스냅샷: [`21bd49e`](https://github.com/greedy-team/SEBU-backend/commit/21bd49e5133210978b4991a99d7e3cb6a33e6a7a). 이전 후 백엔드에서 문서를 정리해도 이 커밋의 원문을 계속 비교할 수 있다.
- 이관 검증일: **2026-10-08**. 표의 원문 마지막 수정일과 각 문서의 정책·구현 시점은 별개다. 원문의 ‘현재’, ‘이번 PR’, ‘검증’은 작성 당시의 설명이며, 이번 이관에서 실서버·학교 인증·DB 작업을 새로 실행한 사실을 뜻하지 않는다.
- 보존 방식: 문서 첫 제목을 유일한 노트 제목으로 바꾸고, 원래 제목은 `source_title`에 기록했다. frontmatter와 출처·실행 위치 안내를 추가하고 문서·첨부 참조 6곳을 이전 위치로 연결했다. 나머지 본문, 명령, 표, Mermaid, SQL 예제는 삭제하거나 요약하지 않았다.
- 근거 구분: 이 원문집은 각 노트의 `source_commit`·`source_path`·`source_sha256`과 별도 고정 링크로 출처를 관리한다. `source_ids: []`는 출처가 없다는 뜻이 아니며, 기능 요약의 `metadata/source-baseline.json` 연결과 분리한 이관 기록이다.

## 원본 12개 파일 대응표

| 백엔드 원본 경로 | SEBU Brain 이전 위치 | 원문 마지막 수정일 |
|---|---|---|
| `README.md` | [SEBU 백엔드 시작 안내 원문](<백엔드 문서/SEBU 백엔드 시작 안내 원문.md>) | 2026-09-25 |
| `docs/account-withdrawal-recovery.md` | [SEBU 백엔드 탈퇴와 복구 계약](<백엔드 문서/SEBU 백엔드 탈퇴와 복구 계약.md>) | 2026-09-25 |
| `docs/cookie-authentication.md` | [SEBU 백엔드 쿠키 인증 계약](<백엔드 문서/SEBU 백엔드 쿠키 인증 계약.md>) | 2026-10-07 |
| `docs/ec2-pull-deploy.md` | [SEBU 백엔드 EC2 자동 배포 안내](<백엔드 문서/SEBU 백엔드 EC2 자동 배포 안내.md>) | 2026-09-25 |
| `docs/erd.md` | [SEBU 백엔드 연구실 ERD](<백엔드 문서/SEBU 백엔드 연구실 ERD.md>) | 2026-10-07 |
| `docs/life-science-research-field-categories.md` | [SEBU 백엔드 생명과학대 연구 분야 분류](<백엔드 문서/SEBU 백엔드 생명과학대 연구 분야 분류.md>) | 2026-09-25 |
| `docs/logging.md` | [SEBU 백엔드 운영 보안 로깅](<백엔드 문서/SEBU 백엔드 운영 보안 로깅.md>) | 2026-09-25 |
| `docs/professor-crawling.md` | [SEBU 백엔드 교수 크롤링 실행 안내](<백엔드 문서/SEBU 백엔드 교수 크롤링 실행 안내.md>) | 2026-09-25 |
| `docs/professor-promotion.md` | [SEBU 백엔드 교수 후보 승격 실행 안내](<백엔드 문서/SEBU 백엔드 교수 후보 승격 실행 안내.md>) | 2026-09-25 |
| `docs/research-field-promotion.md` | [SEBU 백엔드 연구 분야 후보 승격 실행 안내](<백엔드 문서/SEBU 백엔드 연구 분야 후보 승격 실행 안내.md>) | 2026-09-25 |
| `docs/data/research-field-category-classification.csv` | [data/research-field-category-classification.csv](<백엔드 문서/data/research-field-category-classification.csv>) | 2026-09-25 |
| `docs/sql/verify-life-science-research-field-categories.sql` | [sql/verify-life-science-research-field-categories.sql](<백엔드 문서/sql/verify-life-science-research-field-categories.sql>) | 2026-09-25 |

## 명령과 첨부 파일을 사용하는 위치

Gradle·Docker 실행, 코드·설정·마이그레이션 경로는 **SEBU-backend 저장소 루트**를 기준으로 한다. SEBU Brain에서 애플리케이션을 실행하지 않는다. 문서의 `<프로젝트_루트>`도 백엔드 체크아웃을 뜻한다. EC2 문서의 `/opt/sebu-deploy` 등 서버 경로는 당시 운영 구조를 설명한다.

첨부 SQL은 [생명과학대 조회 검증 SQL](백엔드%20문서/sql/verify-life-science-research-field-categories.sql)을 열어 확인할 수 있다. 이 파일은 조회 전용이지만 실행 대상은 원문에 적힌 `sebu` DB와 당시 출처 ID 조건이다. 이전 검증에서는 SQL을 실행하지 않았으며, 경로는 이제 SEBU Brain의 `SEBU/90 자료/백엔드 문서/sql/`이다.

[연구 분야 분류 CSV](백엔드%20문서/data/research-field-category-classification.csv)는 원본 분류표를 그대로 보존한다. 백엔드 테스트가 읽는 동일 자료는 백엔드의 `src/test/resources/fixtures/`에 테스트 fixture로 보관하며, 이 사본과 용도를 구분한다. 백엔드 테스트 경로를 이 문서 보관함의 개인 체크아웃에 연결하지 않는다.

## 보존 검증

문서 10개는 원본 Git blob의 SHA-256을 각 노트에 기록했다. 이 해시는 메타데이터와 바뀐 제목·링크를 포함하는 이관 노트 전체가 아니라 **원래 백엔드 파일**의 해시다. 제목·링크 치환을 되돌린 본문과 고정 커밋의 원문을 비교해 누락을 확인했다.

CSV와 SQL은 Git blob 바이트를 그대로 복사했다. 두 첨부의 SHA-256은 다음과 같다.

- `data/research-field-category-classification.csv`: `c75253ebf2bd99893912a00a0baf312bc1dffe4a68dc7cc9948f7346f5432797`
- `sql/verify-life-science-research-field-categories.sql`: `c2d4e751d1c077e5aab7f4c27f689a537c2919ddb4aa85b9bbec526765aa01a1`

원문의 역사적 수치와 정책 설명은 최신 값으로 일괄 덮어쓰지 않았다. 현재 구현을 판단할 때는 [[SEBU 저장소와 기준 버전]], [[SEBU 구현 현황]], [[SEBU 변경 검토 목록]]과 해당 코드의 기준 커밋을 함께 확인한다.

[[SEBU 원본 자료]] · [[SEBU 홈]] · [[SEBU 지식 지도]]
