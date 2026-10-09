---
project: SEBU
type: "decision"
status: "기존 규칙 재구성"
created: 2026-09-26
verified: 2026-09-26
tags:
  - sebu
  - sebu/decision
source_ids:
  - "B:src/main/resources/db/migration/V16__add_multi_department_affiliations.sql"
  - "B:src/main/resources/db/migration/V46__add_laboratory_website_url_source.sql"
---
# SEBU 결정 - 복수 학과와 출처 보존

교수와 연구실의 정체성, 학과 소속, 정보의 출처를 분리해 중복과 덮어쓰기를 줄인다.

## 소속을 별도 연결로 두는 이유

같은 교수라도 여러 학과에 나타날 수 있다. 승격은 이메일과 이름이 모두 같을 때 같은 교수·연구실을 공유하고, 학과별 소속을 professor_department와 laboratory_department에 남긴다.

대표 학과는 기존 컬럼에 유지한다. 이메일이 없으면 서로 다른 출처의 후보를 자동으로 합치지 않는다. 같은 이메일에 이름이 다른 충돌도 조용히 덮어쓰지 않는다.

## 출처가 갱신 우선순위를 결정한다

- 공식 연구실 이름은 OFFICIAL, 교수 이름에서 생성한 이름은 GENERATED다.
- 수집 홈페이지는 CRAWLED, 사람이 검증한 홈페이지는 MANUAL이다.
- MANUAL URL은 후속 수집·승격으로 덮어쓰지 않는다.
- 수집 결과에 URL이 일시 누락돼도 기존 URL을 삭제하지 않는다.

이 모델은 ‘가장 최근 값’ 하나로 모든 충돌을 해결하지 않는다. 값이 만들어진 방식과 운영 판단도 보존한다.

## 화면에 주는 영향

대표 학과만 필터링하면 겸임 소속에서 연구실을 놓칠 수 있다. affiliations를 사용할지, 대표 소속만 보여줄지 명시적인 화면 규칙이 필요하다. [[SEBU 연구실 탐색]]

[[SEBU 데이터 모델]] · [[SEBU 크롤링과 승격]] · [[SEBU 결정 기록]]

## 이전된 상세 문서

- [[SEBU 백엔드 교수 후보 승격 실행 안내]]

<!-- sources:start -->
## 근거 파일

- [백엔드 · src/main/resources/db/migration/V16__add_multi_department_affiliations.sql](https://github.com/greedy-team/SEBU-backend/blob/bb7372518cb2d69f0e83cad2ec760a8920c7f964/src/main/resources/db/migration/V16__add_multi_department_affiliations.sql)
- [백엔드 · src/main/resources/db/migration/V46__add_laboratory_website_url_source.sql](https://github.com/greedy-team/SEBU-backend/blob/bb7372518cb2d69f0e83cad2ec760a8920c7f964/src/main/resources/db/migration/V46__add_laboratory_website_url_source.sql)

기준 커밋은 [[SEBU 저장소와 기준 버전]]에서 확인한다.
<!-- sources:end -->

---
[[SEBU 홈]] · [[SEBU 지식 지도]]
