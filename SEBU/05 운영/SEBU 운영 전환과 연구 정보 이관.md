---
project: SEBU
type: "runbook"
status: "운영 이관·배포·백업 완료, FE 인증 기능 검증 남음"
created: 2026-10-08
verified: 2026-10-10
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
  - "F:vercel.json"
  - "B:src/main/resources/db/migration/V50__add_missing_physics_astronomy_laboratory_links.sql"
---
# SEBU 운영 전환과 연구 정보 이관

**별도 운영 EC2에 `main`을 배포하고 개발 DB의 전체 연구 정보를 이관했다. 테스트 회원·후기는 이관하지 않았으며, FE 공개 API도 운영 서버로 연결됐다.** 10월 8일 2단계 준비 이후 실제 3~6단계의 서버·HTTPS·배포·이관·백업 검증까지 완료했다. 7단계의 공개 HTTP 확인은 마쳤지만 실제 학교 로그인과 인증 후 기능 검증은 FE 담당자에게 남아 있다.

이 노트는 현재 운영 구조와 최초 이관 절차를 설명한다. [[SEBU 백엔드 EC2 자동 배포 안내]]는 develop만 지원하던 이전 원문이다. 준비 검증은 [[SEBU 운영 준비 검증 기록 - 2026-10-08]], 실제 실행 결과와 남은 검증은 [[SEBU 운영 배포 완료 기록 - 2026-10-09]]를 따른다.

## 브랜치와 서버를 연결하는 방법

| 구분 | 개발 | 운영 |
|---|---|---|
| 반영 브랜치 | `develop` | `main` |
| 비공개 GHCR 이미지 포인터 | `sebu-backend:develop` | `sebu-backend:main` |
| 커밋별 이미지 태그 | `develop-sha-<commit>` | `main-sha-<commit>` |
| 설정 예시 | `config.example.json`, `backend.develop.env.example` | `config.main.example.json`, `backend.main.env.example` |
| 백엔드·MySQL | 기존 개발 EC2의 컨테이너 | 별도 운영 EC2의 `sebu-prod-backend`, `sebu-prod-mysql` |
| DB·볼륨 예시 | `sebu`, `sebu-mysql-data` | `sebu_prod`, `sebu-prod-mysql-data` |
| 서버 설정의 FE 주소 예시 | `https://sebu-frontend.vercel.app` | `https://sebu.kr`, `https://www.sebu.kr` |

FE는 `dev`를 운영 배포 브랜치로 사용한다. 현재 `vercel.json`은 `/api/:path*`를 `https://api.sebu.kr/api/:path*`로 전달하고, 기존 Vercel 주소의 비 API 화면 접속은 `https://www.sebu.kr`로 리다이렉트한다. FE 구현·배포·브라우저 기능 검사는 FE 담당자가 진행한다.

1. PR에서는 테스트만 한다. `develop` 또는 `main`의 push·수동 실행에서 테스트와 이미지 검증을 통과하면 해당 브랜치 이미지를 게시한다.
2. 게시 중 브랜치 HEAD가 달라졌다면 커밋별 이미지만 남기고 해당 브랜치 포인터는 갱신하지 않는다.
3. 각 서버의 Pull 도구는 지정한 채널, 저장소, 커밋, 마이그레이션 지문, 아키텍처를 확인한다. 개발 이미지로 운영을 교체하거나 반대로 교체하는 요청은 거부한다.
4. 준비된 서버의 타이머가 새 digest를 확인하고 DB 백업 → 백엔드 교체 → readiness와 공개 API 점검을 수행한다. 단일 컨테이너 교체이므로 짧은 중단이 있다.

개발·운영의 Java 코드를 각각 다르게 유지하는 방식이 아니다. 검증된 변경을 `develop → main`으로 머지하면 운영 버전이 따라간다. `develop`에서 V2를 진행해도 `main`에 반영하기 전에는 운영 코드가 바뀌지 않는다. 개발 서버가 꺼져 있으면 CI는 이미지를 게시할 수 있지만 서버 교체와 기능 확인은 서버를 켠 뒤에 가능하다.

## 운영 서버 설정의 전제

- 같은 AWS 프로젝트, 선택 리전 `ap-southeast-2`에 개발·운영 EC2를 분리했다. 운영은 상시, 개발은 필요할 때만 켜는 방식으로 합의했다. 사용자가 예상한 주 1회 약 2시간은 이용 계획이며 자동 기동·중지 예약을 설정했다는 뜻이 아니다. 개발 서버의 현재 실행·중지 상태는 별도 확인한다.
- 운영은 `t3.small`, 암호화한 30 GiB gp3와 별도 MySQL 컨테이너·볼륨을 사용한다. RDS를 새로 만드는 구성은 선택하지 않았다. 10월 8일 마지막 플랜 확인은 FREE·ACTIVE, 잔여 크레딧 USD 72.86, 만료 2027-03-06 14:19 KST였다. 유료 전환은 하지 않았다. 이 금액은 당시 기록이며 새 배포 결정 때 재확인한다.
- 당시 운영 기본 추정은 월 USD 25.802였다. 730시간의 EC2·공인 IPv4와 30 GiB gp3 기준으로 백업·초과 트래픽·세금은 제외한 값이다. 무료 플랜·크레딧을 사용한다고 리소스 비용 자체가 0인 것은 아니다. S3 분리 백업은 사용자 승인 후 추가했다.
- 환경 파일은 서버에서 작성한다. DB 계정·비밀번호와 JWT 비밀값은 환경별로 분리하고 Git에 넣지 않는다. `prod` 프로필은 MySQL·HTTPS 설정을 의미하며 `main` 브랜치와 동의어가 아니다. 10월 10일 운영은 기존 `prod`에 `monitoring`을 추가하고 전용 수집 인증을 설정했다. 서버 재구성 시에도 두 프로필과 비밀값을 복구한다. [[SEBU 운영 모니터링과 대시보드 해석]]
- 운영 설정 예시의 `.invalid` API 주소는 의도적인 미확정 값이다. 실제 HTTPS 주소로 바꾸지 않으면 배포 도구가 거부한다.
- `install.sh main` 전에 운영 `config.json`과 `backend.env`, MySQL과 정상 상태의 최초 백엔드를 준비한다. 설치는 타이머를 켜거나 컨테이너를 재시작하지 않는다. 기존 개발 호스트 설정을 `main`으로 바꾸어 운영으로 재사용하지 않는다.
- FE의 운영 API 연결과 공개 API의 직접·프록시 응답 일치는 확인했다. 도메인·쿠키·CORS·CSRF의 전체 인증 흐름은 깨끗한 브라우저 세션과 기존 로그인 세션 각각에서 별도로 확인한다.

## 초기 데이터와 전체 연구 정보의 차이

최초 운영 배포 당시 빈 DB에서 Flyway V1~V49를 실행하자 교수·연구실 각 **321개**가 생성됐다. 이것은 코드에 포함된 기본 데이터이며 개발 DB 전체가 아니다. 2026-10-08 개발 DB의 교수·연구실 각 **622개**를 실제 운영에 이관해 자연과학대·생명과학대·인공지능융합대 정보를 포함한 전체 카탈로그를 맞췄다. V50·V51은 누락된 URL 보완이며 이 초기 이관을 대신하지 않는다. [[SEBU 항공우주공학과 링크 보완 기록 - 2026-10-10]]

같은 코드로 운영 스키마를 만든 뒤 `catalog_transfer.py`로 개발 DB의 전체 연구 정보를 교체 복원했다. 기존 V1~V49를 고쳐 넣거나 개발 DB 전체 덤프를 그대로 복원한 것은 아니다.

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

## 최초 이관에 사용한 실행 순서

아래 절차는 **아직 사용자 데이터가 없는 새 운영 DB**를 위해 10월 8일 사용한 절차다. 이미 공개되어 사용자 활동이 생긴 운영 DB에 반복 적용하지 않는다. 현재 운영 데이터를 개발 스냅샷으로 덮어쓰는 동기화 도구로 사용해서도 안 된다. 명령 예시는 절차 보존용이며 이번 문서 갱신에서 다시 실행하지 않았다.

1. 같은 코드 버전으로 새 대상 DB에 Flyway를 적용한다. 소스·대상의 테이블, 컬럼, 키·제약, Flyway 버전·체크섬이 같아야 한다. 차이가 있으면 중단하고 먼저 같은 스키마로 맞춘다.
2. 대상의 Pull 배포 타이머를 끄고 활성화 마커를 해제한다. 실행 중인 배포 서비스가 끝난 것을 확인한 다음 대상 앱을 중지한다. DB 마이그레이션·크롤링·다른 쓰기 작업도 동시에 실행하지 않는다. 이관 도구는 앱 중지를 검사하지만 타이머까지 자동으로 끄지는 않는다.
3. 전환 직전에 개발 DB에서 **최신 스냅샷**을 다시 만든다. `export`는 일관된 읽기 전용 트랜잭션을 사용하고 소스를 바꾸지 않는다. 전환 중 연구 정보 변경을 멈춰 내보내기 이후 변경이 누락되지 않게 한다.
4. 스냅샷은 제한된 권한으로 AWS 내부에만 보관·전달한다. 실제 경로·DB 행·계정 식별자·비밀값을 문서나 Git에 넣지 않는다. 원본 파일은 `0600` 권한으로 생성된다.
5. 대상에 기존 사용자 활동·후보가 없는지 확인하고, 필요한 대상 백업을 보존한다. DB 이름을 재확인한 뒤 `restore`를 실행한다. 소스 자신에게 복원하는 요청과 사용자 활동이 있는 대상은 거부한다.
6. `verify`로 11개 테이블의 행 수와 전체 일반 컬럼 해시, 스키마·이력 일치, 제외 테이블 0건을 확인한다. 외래 키를 켠 상태에서 복원하며 개수·해시·AUTO_INCREMENT를 커밋 전에 검사한다. SQL 오류는 대상 연구 정보 교체 트랜잭션을 롤백한다.
7. 앱을 시작해 Hibernate 검증·readiness·실제 연구실/API 응답과 후기 0건을 확인한다. 단과대별 전체 건수와 자연과학대·생명과학대·인공지능융합대 정보를 별도로 확인한다.
8. 첫 배포와 데이터 점검 뒤 Pull 배포 타이머를 켜고 첫 성공 실행을 확인한다. 초기 백업·복원과 정기 백업 설정, FE 인증 기능 검사는 각각 별도 완료 근거를 남긴다. 실제로 백업 단계와 공개 HTTP 확인은 완료됐고 FE 인증 검사는 남아 있다.

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
| 3. 운영 EC2·DB·도메인·HTTPS | 완료. 재부팅 후 DB 영속성·고정 IP와 실제 DNS/TLS 확인 |
| 4. `main` 출시·운영 배포 | 완료. PR #95, main CI·digest, Flyway 49개·readiness·공개 API 확인 |
| 5. 전체 연구 정보 이관·FE 내부 검사 | 백엔드 완료. 11개 테이블 해시 일치·제외 12개 테이블 0건·공개 검사 17개 통과. Pull 자동 배포 활성화. 실제 로그인·쓰기는 남음 |
| 6. 초기 백업·복원·정기 백업 | 완료. S3 버전 지정 복원·24개 테이블·35개 외래 키 검증, 매일 03:00 KST 타이머 활성화와 동일 서비스 수동 실행 성공. 10월 10일 예약 실행 성공·S3 검증을 추가 확인. 이후 지속 성공은 정기 점검 |
| 7. 사용자 공개·운영 확인 | FE `/api` 운영 연결·공개 HTTP 확인 완료. 실제 인증 브라우저 수용 검증은 FE 담당자에게 인계 |

운영 작업은 한 단계를 마칠 때마다 결과를 보고하고 다음 진행 지시를 기다리는 원칙을 유지한다. 표의 완료는 과거 실행 기록을 정리한 것이며 새 작업 승인으로 해석하지 않는다. [[SEBU 배포와 모니터링]] · [[SEBU 테스트 지도]] · [[SEBU 변경 검토 목록]]

---
[[SEBU 홈]] · [[SEBU 지식 지도]]

<!-- sources:start -->
## 근거 파일

- [백엔드 · .github/workflows/ci.yml](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/.github/workflows/ci.yml)
- [백엔드 · ops/deploy/deploy.py](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/ops/deploy/deploy.py)
- [백엔드 · ops/deploy/install.sh](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/ops/deploy/install.sh)
- [백엔드 · ops/deploy/config.example.json](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/ops/deploy/config.example.json)
- [백엔드 · ops/deploy/config.main.example.json](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/ops/deploy/config.main.example.json)
- [백엔드 · ops/deploy/backend.develop.env.example](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/ops/deploy/backend.develop.env.example)
- [백엔드 · ops/deploy/backend.main.env.example](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/ops/deploy/backend.main.env.example)
- [백엔드 · ops/deploy/sebu-pull-deploy.timer](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/ops/deploy/sebu-pull-deploy.timer)
- [백엔드 · ops/deploy/catalog_transfer.py](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/ops/deploy/catalog_transfer.py)
- [백엔드 · ops/deploy/smoke-prod.sh](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/ops/deploy/smoke-prod.sh)
- [백엔드 · ops/deploy/smoke-catalog-transfer.sh](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/ops/deploy/smoke-catalog-transfer.sh)
- [백엔드 · ops/deploy/verify-production-seed.sql](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/ops/deploy/verify-production-seed.sql)
- [프론트 · vercel.json](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/vercel.json)
- [백엔드 · src/main/resources/db/migration/V50__add_missing_physics_astronomy_laboratory_links.sql](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/main/resources/db/migration/V50__add_missing_physics_astronomy_laboratory_links.sql)

기준 커밋은 [[SEBU 저장소와 기준 버전]]에서 확인한다.
<!-- sources:end -->
