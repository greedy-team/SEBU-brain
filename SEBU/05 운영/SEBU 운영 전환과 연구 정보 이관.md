---
project: SEBU
type: "runbook"
status: "2단계 준비·복원 검증 완료, 운영 적용 전"
created: 2026-10-08
verified: 2026-10-08
tags:
  - sebu
  - sebu/runbook
source_ids:
  - "B:.github/workflows/ci.yml"
  - "B:ops/deploy/deploy.py"
  - "B:ops/deploy/install.sh"
  - "B:ops/deploy/config.example.json"
  - "B:ops/deploy/config.main.example.json"
  - "B:ops/deploy/backend.develop.env.example"
  - "B:ops/deploy/backend.main.env.example"
  - "B:ops/deploy/sebu-pull-deploy.timer"
  - "B:ops/deploy/catalog_transfer.py"
  - "B:ops/deploy/smoke-prod.sh"
  - "B:ops/deploy/smoke-catalog-transfer.sh"
  - "B:ops/deploy/verify-production-seed.sql"
---
# SEBU 운영 전환과 연구 정보 이관

**개발·운영은 같은 배포 코드로 브랜치를 구분하고, 운영 DB에는 개발 DB의 교수·연구실 정보를 모두 옮기되 테스트 회원·후기는 옮기지 않는다.** 2단계에서 코드와 임시 DB 복원 검증을 마쳤고, PR #94가 develop에 머지됐다. 운영 EC2·DB 생성, 실제 이관, `main` 출시와 FE 전환은 아직 진행하지 않았다.

이 노트는 현재 운영 전환 절차다. [[SEBU 백엔드 EC2 자동 배포 안내]]는 develop만 지원하던 이전 원문이며, 공통 운영 배경을 참고할 수 있다. 검증 이력은 [[SEBU 운영 준비 검증 기록 - 2026-10-08]]을 따른다.

## 브랜치와 서버를 연결하는 방법

| 구분 | 개발 | 운영 |
|---|---|---|
| 반영 브랜치 | `develop` | `main` |
| 비공개 GHCR 이미지 포인터 | `sebu-backend:develop` | `sebu-backend:main` |
| 커밋별 이미지 태그 | `develop-sha-<commit>` | `main-sha-<commit>` |
| 설정 예시 | `config.example.json`, `backend.develop.env.example` | `config.main.example.json`, `backend.main.env.example` |
| 백엔드·MySQL | 기존 개발 EC2의 컨테이너 | 별도 운영 EC2의 `sebu-prod-backend`, `sebu-prod-mysql` |
| DB·볼륨 예시 | `sebu`, `sebu-mysql-data` | `sebu_prod`, `sebu-prod-mysql-data` |
| 허용 FE 주소 예시 | `https://sebu-frontend.vercel.app` | `https://sebu.kr`, `https://www.sebu.kr` |

1. PR에서는 테스트만 한다. `develop` 또는 `main`의 push·수동 실행에서 테스트와 이미지 검증을 통과하면 해당 브랜치 이미지를 게시한다.
2. 게시 중 브랜치 HEAD가 달라졌다면 커밋별 이미지만 남기고 해당 브랜치 포인터는 갱신하지 않는다.
3. 각 서버의 Pull 도구는 지정한 채널, 저장소, 커밋, 마이그레이션 지문, 아키텍처를 확인한다. 개발 이미지로 운영을 교체하거나 반대로 교체하는 요청은 거부한다.
4. 준비된 서버의 타이머가 새 digest를 확인하고 DB 백업 → 백엔드 교체 → readiness와 공개 API 점검을 수행한다. 단일 컨테이너 교체이므로 짧은 중단이 있다.

개발·운영의 Java 코드를 각각 다르게 유지하는 방식이 아니다. 검증된 변경을 `develop → main`으로 머지하면 운영 버전이 따라간다. `develop`에서 V2를 진행해도 `main`에 반영하기 전에는 운영 코드가 바뀌지 않는다. 개발 서버가 꺼져 있으면 CI는 이미지를 게시할 수 있지만 서버 교체와 기능 확인은 서버를 켠 뒤에 가능하다.

## 운영 서버 설정의 전제

- 같은 AWS 프로젝트, 선택 리전 `ap-southeast-2`에 개발·운영 EC2를 분리하는 구성을 정했다. 운영은 상시, 개발은 필요 시 주 1회 약 2시간 사용한다. 현재 FE가 개발 API에 의존하는 동안에는 개발 서버를 먼저 중지하지 않는다.
- 비용을 줄이기 위해 운영 EC2의 별도 MySQL 컨테이너·볼륨을 사용하며 RDS를 새로 만드는 구성은 선택하지 않았다. 실제 생성과 크레딧 재확인은 3단계다.
- 환경 파일은 서버에서 작성한다. DB 계정·비밀번호와 JWT 비밀값은 환경별로 분리하고 Git에 넣지 않는다. 두 환경 모두 `prod` 프로필을 사용하는 것은 MySQL·HTTPS 설정을 의미하며 `main` 브랜치와 동의어가 아니다.
- 운영 설정 예시의 `.invalid` API 주소는 의도적인 미확정 값이다. 실제 HTTPS 주소로 바꾸지 않으면 배포 도구가 거부한다.
- `install.sh main` 전에 운영 `config.json`과 `backend.env`, MySQL과 정상 상태의 최초 백엔드를 준비한다. 설치는 타이머를 켜거나 컨테이너를 재시작하지 않는다. 기존 개발 호스트 설정을 `main`으로 바꾸어 운영으로 재사용하지 않는다.
- 운영 FE 전환 전에 개발 허용 주소를 템플릿 값으로 좁히면 현재 접속에 영향을 줄 수 있다. 도메인·쿠키·CORS·CSRF와 FE의 API 주소는 전환 시점에 함께 확인한다.

## 초기 데이터와 전체 연구 정보의 차이

빈 DB에서 Flyway 49개를 실행하면 교수·연구실 각 **321개**가 생성된다. 이것은 코드에 포함된 기본 데이터이며 개발 DB 전체가 아니다. 2026-10-08 개발 DB에는 교수·연구실 각 **622개**가 있어, 초기 마이그레이션만 실행하고 공개하면 자연과학대·생명과학대·인공지능융합대 일부 정보가 빠진다.

따라서 같은 코드로 운영 스키마를 만든 뒤 `catalog_transfer.py`로 개발 DB의 전체 연구 정보를 교체 복원한다. 기존 V1~V49를 고쳐 넣거나 개발 DB 전체 덤프를 그대로 복원하지 않는다.

| 이관 대상 11개 테이블 | 보존 내용 |
|---|---|
| `college`, `department` | 단과대·학과와 ID |
| `crawl_source` | 수집 출처 메타데이터 |
| `professor`, `laboratory` | 교수·연구실, 홈페이지·설명·출처·시각·삭제 상태 등 일반 컬럼 전체 |
| `professor_department`, `laboratory_department` | 대표·복수 학과 관계 |
| `research_field`, `laboratory_research_field` | 실제 연구 분야와 연구실 연결 |
| `research_field_category`, `research_field_category_mapping` | 대·하위 카테고리와 분야 매핑 |

생성 컬럼은 대상 스키마가 계산한다. 이름만 재등록하는 방식이 아니므로 ID와 관계를 유지한다. `flyway_schema_history`는 이관하지 않고 소스·대상의 이력이 정확히 같은지 비교한다.

제외하는 12개 테이블은 `app_user`, `refresh_token`, `account_recovery_token`, `bookmark`, `community_post`, `community_comment`, `community_post_like`, `community_post_bookmark`, `laboratory_review`, `laboratory_review_tag`, `professor_crawl_candidate`, `laboratory_research_field_candidate`다. 후보 검수 전 자료도 공개 연구 정보와 구분한다. 개발 DB의 임시 후기 8건은 원본에 보존하고 복원 대상에는 0건이어야 한다.

## 실제 전환 시 실행 순서

아래 절차는 **아직 사용자 데이터가 없는 새 운영 DB**를 위한 것이다. 운영 중인 DB 동기화 도구로 사용하지 않는다. 명령은 백엔드 저장소의 검증된 커밋과 승인된 AWS 서버 안에서 실행한다.

1. 같은 코드 버전으로 새 대상 DB에 Flyway를 적용한다. 소스·대상의 테이블, 컬럼, 키·제약, Flyway 버전·체크섬이 같아야 한다. 차이가 있으면 중단하고 먼저 같은 스키마로 맞춘다.
2. 대상의 Pull 배포 타이머를 끄고 활성화 마커를 해제한다. 실행 중인 배포 서비스가 끝난 것을 확인한 다음 대상 앱을 중지한다. DB 마이그레이션·크롤링·다른 쓰기 작업도 동시에 실행하지 않는다. 이관 도구는 앱 중지를 검사하지만 타이머까지 자동으로 끄지는 않는다.
3. 전환 직전에 개발 DB에서 **최신 스냅샷**을 다시 만든다. `export`는 일관된 읽기 전용 트랜잭션을 사용하고 소스를 바꾸지 않는다. 전환 중 연구 정보 변경을 멈춰 내보내기 이후 변경이 누락되지 않게 한다.
4. 스냅샷은 제한된 권한으로 AWS 내부에만 보관·전달한다. 실제 경로·DB 행·계정 식별자·비밀값을 문서나 Git에 넣지 않는다. 원본 파일은 `0600` 권한으로 생성된다.
5. 대상에 기존 사용자 활동·후보가 없는지 확인하고, 필요한 대상 백업을 보존한다. DB 이름을 재확인한 뒤 `restore`를 실행한다. 소스 자신에게 복원하는 요청과 사용자 활동이 있는 대상은 거부한다.
6. `verify`로 11개 테이블의 행 수와 전체 일반 컬럼 해시, 스키마·이력 일치, 제외 테이블 0건을 확인한다. 외래 키를 켠 상태에서 복원하며 개수·해시·AUTO_INCREMENT를 커밋 전에 검사한다. SQL 오류는 대상 연구 정보 교체 트랜잭션을 롤백한다.
7. 앱을 시작해 Hibernate 검증·readiness·실제 연구실/API 응답과 후기 0건을 확인한다. 단과대별 전체 건수와 자연과학대·생명과학대·인공지능융합대 정보를 별도로 확인한다.
8. 팀 내부 FE 기능 검사, 초기 백업·복원 확인과 정기 백업 설정까지 마친 뒤 공개한다. Pull 배포 자동화를 다시 켜는 것은 첫 배포와 데이터 점검을 마친 후다.

실제 비밀값·파일 위치를 노출하지 않는 명령 형태는 다음과 같다. 변수는 담당자가 AWS 내부에서 확인한 값으로 설정한다.

```sh
python3 ops/deploy/catalog_transfer.py export \
  --container "$SOURCE_MYSQL" --database "$SOURCE_DATABASE" \
  --output "$PRIVATE_CATALOG_FILE"

python3 ops/deploy/catalog_transfer.py restore \
  --container "$TARGET_MYSQL" --database "$TARGET_DATABASE" \
  --input "$PRIVATE_CATALOG_FILE" --confirm-target "$TARGET_DATABASE" \
  --app-container "$STOPPED_TARGET_APP"

python3 ops/deploy/catalog_transfer.py verify \
  --container "$TARGET_MYSQL" --database "$TARGET_DATABASE" \
  --input "$PRIVATE_CATALOG_FILE"
```

`--confirm-target`은 이름 확인 장치이며 대상 백업을 대신하지 않는다. 도구가 활동 0건을 확인하더라도 공개된 운영 DB에 재사용하는 근거로 삼지 않는다.

## 단계별 진행 경계

| 단계 | 상태와 다음 행동 |
|---|---|
| 1. 플랜·크레딧·구성 | 10월 8일 확인 완료. FREE 플랜, 별도 운영 EC2와 간헐적 개발 실행 선택 |
| 2. 배포 분리·DB 검증 | 코드·CI·개발 연구 정보 복원 검증 완료. 세부 결과는 검증 기록 참고 |
| 3. 운영 EC2·DB·도메인·HTTPS | 미착수. 사용자 다음 진행 지시 후 시작 |
| 4. `main` 출시·운영 배포 | 미실행. develop 준비 PR 머지와 구분 |
| 5. 전체 연구 정보 이관·FE 내부 검사 | 미실행. 최신 스냅샷으로 운영 대상에 재검증 필요 |
| 6. 초기 백업·복원·정기 백업 | 운영 대상 미실행 |
| 7. 사용자 공개·운영 확인 | 미실행 |

한 단계를 마칠 때마다 결과를 보고하고 다음 진행 지시를 기다린다. [[SEBU 배포와 모니터링]] · [[SEBU 테스트 지도]] · [[SEBU 변경 검토 목록]]

---
[[SEBU 홈]] · [[SEBU 지식 지도]]

<!-- sources:start -->
## 근거 파일

- [백엔드 · .github/workflows/ci.yml](https://github.com/greedy-team/SEBU-backend/blob/d1010d405abfcb5f9b01b155c48032da01ee1d2d/.github/workflows/ci.yml)
- [백엔드 · ops/deploy/deploy.py](https://github.com/greedy-team/SEBU-backend/blob/d1010d405abfcb5f9b01b155c48032da01ee1d2d/ops/deploy/deploy.py)
- [백엔드 · ops/deploy/install.sh](https://github.com/greedy-team/SEBU-backend/blob/d1010d405abfcb5f9b01b155c48032da01ee1d2d/ops/deploy/install.sh)
- [백엔드 · ops/deploy/config.example.json](https://github.com/greedy-team/SEBU-backend/blob/d1010d405abfcb5f9b01b155c48032da01ee1d2d/ops/deploy/config.example.json)
- [백엔드 · ops/deploy/config.main.example.json](https://github.com/greedy-team/SEBU-backend/blob/d1010d405abfcb5f9b01b155c48032da01ee1d2d/ops/deploy/config.main.example.json)
- [백엔드 · ops/deploy/backend.develop.env.example](https://github.com/greedy-team/SEBU-backend/blob/d1010d405abfcb5f9b01b155c48032da01ee1d2d/ops/deploy/backend.develop.env.example)
- [백엔드 · ops/deploy/backend.main.env.example](https://github.com/greedy-team/SEBU-backend/blob/d1010d405abfcb5f9b01b155c48032da01ee1d2d/ops/deploy/backend.main.env.example)
- [백엔드 · ops/deploy/sebu-pull-deploy.timer](https://github.com/greedy-team/SEBU-backend/blob/d1010d405abfcb5f9b01b155c48032da01ee1d2d/ops/deploy/sebu-pull-deploy.timer)
- [백엔드 · ops/deploy/catalog_transfer.py](https://github.com/greedy-team/SEBU-backend/blob/d1010d405abfcb5f9b01b155c48032da01ee1d2d/ops/deploy/catalog_transfer.py)
- [백엔드 · ops/deploy/smoke-prod.sh](https://github.com/greedy-team/SEBU-backend/blob/d1010d405abfcb5f9b01b155c48032da01ee1d2d/ops/deploy/smoke-prod.sh)
- [백엔드 · ops/deploy/smoke-catalog-transfer.sh](https://github.com/greedy-team/SEBU-backend/blob/d1010d405abfcb5f9b01b155c48032da01ee1d2d/ops/deploy/smoke-catalog-transfer.sh)
- [백엔드 · ops/deploy/verify-production-seed.sql](https://github.com/greedy-team/SEBU-backend/blob/d1010d405abfcb5f9b01b155c48032da01ee1d2d/ops/deploy/verify-production-seed.sql)

기준 커밋은 [[SEBU 저장소와 기준 버전]]에서 확인한다.
<!-- sources:end -->
