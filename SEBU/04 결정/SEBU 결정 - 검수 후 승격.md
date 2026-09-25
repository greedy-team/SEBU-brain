---
project: SEBU
type: "decision"
status: "기존 설계 재구성"
created: 2026-09-26
verified: 2026-09-26
tags:
  - sebu
  - sebu/decision
source_ids:
  - "B:docs/professor-crawling.md"
  - "B:docs/professor-promotion.md"
  - "B:docs/research-field-promotion.md"
---
# SEBU 결정 - 검수 후 승격

외부 페이지에서 수집한 값은 후보로 보관하고, 검수된 현재 승인본만 사용자에게 제공할 본 데이터로 승격한다.

## 해결하는 문제

원본 페이지는 이름·연락처·홈페이지가 빠지거나 변경될 수 있고, 파서 결과가 잘못될 수도 있다. 수집과 서비스 반영 사이에 검수 경계를 두면 변경 근거와 승인 시점을 추적할 수 있다.

## 설계 장치

- review_status는 승인 여부를, is_stale은 현재 수집 대상인지 나타낸다.
- review_revision은 어느 승인본인지 식별한다.
- promoted_review_revision은 어떤 승인본이 반영됐는지 기록한다.
- 출처 스냅샷과 잠금 버전은 추적 및 동시 변경 확인에 쓰인다.
- 같은 승인본 재실행은 중복 데이터를 만들지 않는다.
- 원본에서 사라진 데이터의 본 테이블 삭제는 별도 운영 판단이다.

## 비용과 적용 범위

검수와 승격이라는 운영 단계가 필요하고, 승인 상태·현재성·반영 상태를 함께 이해해야 한다. 자동화 수준을 높이더라도 이 상태들의 의미를 섞지 않는 것이 핵심이다.

재실행해도 결과가 불필요하게 늘지 않는 멱등성, 외부 데이터를 신뢰하기 전에 경계를 두는 사고방식을 다른 수집 프로젝트에도 적용할 수 있다. [[SEBU 학습 연결]]

[[SEBU 크롤링과 승격]] · [[SEBU 연구 분야 분류]] · [[SEBU 결정 기록]]

<!-- sources:start -->
## 근거 파일

- [백엔드 · docs/professor-crawling.md](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/docs/professor-crawling.md)
- [백엔드 · docs/professor-promotion.md](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/docs/professor-promotion.md)
- [백엔드 · docs/research-field-promotion.md](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/docs/research-field-promotion.md)

기준 커밋은 [[SEBU 저장소와 기준 버전]]에서 확인한다.
<!-- sources:end -->

---
[[SEBU 홈]] · [[SEBU 지식 지도]]
