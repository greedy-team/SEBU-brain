---
project: SEBU
type: "backend-source"
status: "원문 이관·내용 보존 확인"
created: 2026-10-08
verified: 2026-10-08
tags:
  - sebu
  - sebu/backend-source
source_ids: []
source_repository: "greedy-team/SEBU-backend"
source_commit: "21bd49e5133210978b4991a99d7e3cb6a33e6a7a"
source_path: "docs/research-field-promotion.md"
source_title: "검수 완료 연구 분야 후보 승격 실행 안내"
source_last_changed: 2026-09-25
source_sha256: "9d98b5ef27e35f548fad0bfcff22d7f6bf54c8c5cc042a2fd7e2fe66ec1f7bfb"
---
# SEBU 백엔드 연구 분야 후보 승격 실행 안내

이 문서는 [백엔드 원문 · docs/research-field-promotion.md](https://github.com/greedy-team/SEBU-backend/blob/21bd49e5133210978b4991a99d7e3cb6a33e6a7a/docs/research-field-promotion.md)을 SEBU Brain으로 옮긴 자료다. 원문 제목은 **검수 완료 연구 분야 후보 승격 실행 안내**이며, 마지막 수정일은 **2026-09-25**이다. 정책·구현 설명은 원본 커밋 시점의 기록이다.

2026-10-08의 `verified`는 원문 누락·링크·첨부 경로를 확인한 이관 검증일이다. 이 날짜에 실서버·학교 로그인·배포·DB 작업을 실행했다는 뜻은 아니다. 본문의 프로젝트 루트, Gradle·Docker·`src/`·`ops/` 경로는 **SEBU-backend 저장소**를 기준으로 읽는다. 첨부 문서·SQL은 이 노트의 링크를 사용한다.

[백엔드 문서 모음](<../SEBU 백엔드 문서 모음.md>)에서 원본 12개 파일의 이전 위치와 보존 범위를 확인할 수 있다.

<!-- migrated-body:start -->
## 목적

검수가 끝난 현재 연구 분야 후보를 서비스 본 테이블로 옮깁니다.

```text
laboratory_research_field_candidate
    ↓ APPROVED + is_stale = FALSE
research-field-promotion 일회성 실행
    ├─ research_field
    └─ laboratory_research_field
```

일반 서버 실행에서는 승격하지 않습니다. `research-field-promotion` 프로필과
`app.research-field-promotion.enabled=true`를 함께 지정한 경우에만 실행하며, 작업이
끝나면 애플리케이션이 자동으로 종료됩니다.

## 실행 전 확인

먼저 DB를 백업하고 승격 대상이 모두 검수되었는지 확인합니다.

```sql
SELECT review_status,
       is_stale,
       COUNT(*) AS candidate_count
FROM laboratory_research_field_candidate
GROUP BY review_status, is_stale
ORDER BY review_status, is_stale;
```

승격 대상은 `APPROVED`, `is_stale = FALSE`이고, 아직 승격하지 않았거나 승인 이후
재검수된 후보입니다.

## 연구실 한 곳만 실행

프로젝트 루트에서 DB 환경 변수를 설정한 뒤 실행합니다.

```powershell
.\gradlew.bat bootRun --args="--spring.profiles.active=prod,research-field-promotion --app.research-field-promotion.enabled=true --app.research-field-promotion.laboratory-id=<연구실_ID>"
```

`<연구실_ID>`는 `laboratory.id`의 실제 양수 값으로 바꿉니다. 이 실행으로 한 연구실의
결과를 먼저 확인할 수 있습니다.

## 승인 후보 전체 실행

한 연구실의 결과가 올바르면 `laboratory-id`를 빼고 전체 승격을 실행합니다.

```powershell
.\gradlew.bat bootRun --args="--spring.profiles.active=prod,research-field-promotion --app.research-field-promotion.enabled=true"
```

`crawler`, 교수 후보 `promotion`, `research-field-extraction`,
`research-field-manual-split` 프로필과 동시에 실행하면 데이터 처리 전에 실패합니다.
같은 승인본을 다시 실행해도 중복 연구 분야나 중복 연결을 만들지 않습니다.

## 실행 결과 확인

```sql
SELECT c.id AS candidate_id,
       c.laboratory_id,
       c.candidate_name,
       c.review_status,
       c.is_stale,
       c.promoted_at,
       c.promoted_review_revision,
       rf.id AS research_field_id,
       rf.name AS research_field_name,
       (lrf.laboratory_id IS NOT NULL) AS linked_to_laboratory
FROM laboratory_research_field_candidate c
LEFT JOIN research_field rf
       ON rf.id = c.promoted_research_field_id
LEFT JOIN laboratory_research_field lrf
       ON lrf.laboratory_id = c.laboratory_id
      AND lrf.research_field_id = rf.id
WHERE c.review_status = 'APPROVED'
  AND c.is_stale = FALSE
ORDER BY c.laboratory_id, c.id;
```

정상 승격된 후보는 `promoted_at`, `promoted_review_revision`,
`promoted_research_field_id`가 채워지고 `linked_to_laboratory`가 `1`입니다. 일부 후보가
실패해도 나머지 후보 결과를 모두 수집한 뒤, 실행 프로세스는 실패 상태로 종료됩니다.
<!-- migrated-body:end -->
