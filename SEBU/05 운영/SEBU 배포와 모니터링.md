---
project: SEBU
type: "runbook"
status: "운영 배포·이관·백업·Grafana 수집과 알림 확인, 인증 기능 검증 남음"
created: 2026-09-26
verified: 2026-10-10
tags:
  - sebu
  - sebu/runbook
source_ids:
  - "B:ops/deploy/config.main.example.json"
  - "B:ops/deploy/backend.main.env.example"
  - "B:ops/deploy/catalog_transfer.py"
  - "B:.github/workflows/ci.yml"
  - "B:Dockerfile"
  - "B:src/main/resources/application.yml"
  - "B:src/main/resources/application-prod.yml"
  - "B:src/main/resources/application-monitoring.yml"
  - "B:src/main/java/com/sebu/backend/global/monitoring/HealthCheckSecurityConfiguration.java"
  - "B:src/main/java/com/sebu/backend/global/monitoring/MonitoringSecurityConfiguration.java"
  - "B:src/main/java/com/sebu/backend/global/monitoring/MonitoringMetricsConfiguration.java"
  - "B:ops/deploy/deploy.py"
  - "B:ops/deploy/sebu-pull-deploy.timer"
  - "F:vercel.json"
  - "B:src/main/resources/db/migration/V50__add_missing_physics_astronomy_laboratory_links.sql"
---
# SEBU 배포와 모니터링

**운영 API 배포, 전체 연구 정보 이관, Pull 자동 배포, S3 백업·복원 검증에 이어 운영 Grafana 수집과 장애 알림을 구성했다.** GitHub Actions에서 검증한 비공개 GHCR 이미지를 EC2가 Pull하여 단일 백엔드 컨테이너를 교체한다. BE는 `develop` 개발·`main` 운영으로 환경 설정과 DB를 분리하며, FE는 `dev`가 운영 배포 브랜치다. FE 브랜치 이름을 BE의 개발 환경과 혼동하지 않는다.

운영 화면은 `https://www.sebu.kr`, API는 `https://api.sebu.kr`다. FE의 상대 `/api` 요청은 Vercel rewrite를 통해 운영 API로 전달한다. 실제 학교 로그인과 인증 후 쓰기 기능은 FE 담당자의 별도 검증 항목이다. 설정 절차는 [[SEBU 운영 전환과 연구 정보 이관]], 준비 검증은 [[SEBU 운영 준비 검증 기록 - 2026-10-08]], 실제 적용 결과는 [[SEBU 운영 배포 완료 기록 - 2026-10-09]]를 따른다.

```mermaid
flowchart LR
    A[develop 또는 main 머지] --> B[테스트와 이미지 스모크 검사]
    B --> C[브랜치별 커밋 SHA 이미지 게시]
    C --> D[해당 브랜치 포인터 갱신]
    D --> E[EC2 digest 확인과 DB 백업]
    E --> F[백엔드 교체]
    F --> G[readiness 확인]
```

## CI와 배포의 역할

- `ci.yml`은 배포 스크립트 단위 테스트·셸 문법 검사, Java 테스트, 컨테이너 빌드, 일회용 MySQL 8.0에서 prod 이미지 스모크 검사를 정의한다.
- develop·main의 push 또는 수동 실행 publish 작업은 채널·커밋·마이그레이션 지문을 이미지에 기록한다. 게시 중 해당 브랜치 HEAD가 달라지면 브랜치별 SHA 이미지만 남기고 포인터는 옮기지 않는다. EC2는 자신의 채널과 다른 이미지의 적용을 거부한다.
- 운영 EC2의 배포 도구 설치와 최초 실행을 마쳤고, 10월 8일 연구 정보 이관 후 `main` 채널 타이머의 활성화와 첫 성공 실행을 확인했다. 약 2분마다 새 digest를 확인한다. 이는 해당 시점 실행 기록이며 타이머 코드의 존재만으로 판단한 결과가 아니다.
- 단일 백엔드 컨테이너 교체이므로 짧은 중단이 생길 수 있다. 블루그린 배포는 구성하지 않았다.

실패 시 기존·신규 Flyway SQL 지문이 같으면 보존한 이전 컨테이너 시작을 시도한다. SQL이 바뀐 경우 DB 적용 상태를 수동 확인하며 코드·DB를 자동 원복하지 않는다. 이 배포 지문은 SQL 기준이므로 Java 마이그레이션 변경 시 자동 복구 안전성의 충분한 근거로 삼지 않는다. 실제 절차는 현재 runbook과 `deploy.py`를 따른다.

## 최신 응답 압축

9월 26일 `f06c597`에서 추가되어 이번 기준에도 유지되는 `application-prod.yml`에는 `server.compression.enabled=true`, `mime-types=application/json`, `min-response-size=2KB`가 있다.

압축 협상과 서버 조건을 만족하는 JSON 전달 크기를 줄이는 설정이다. 기본 연구실 목록을 페이지 목록으로 바꾸거나 응답 필드를 줄인 것은 아니다. 배포 후 실제 `Content-Encoding`과 전달 크기는 별도 확인한다.

## 운영 반영과 백업

10월 8일 PR #95로 `main`을 출시했고, CI가 게시한 정확한 digest의 첫 배포와 V1~V49의 실제 적용을 확인했다. 이어 교수·연구실 각 622개를 포함한 11개 연구 정보 테이블을 이관해 전체 해시 일치와 제외 테이블 0건을 검증했다. 10월 9일에는 V50 링크 보완 핫픽스의 운영 자동 배포와 14개 URL의 공개 API 반영을 확인했다. 이후 V51 항공우주 분야 링크 보완을 포함한 `main`의 `3c7445e` 이미지가 운영 중이며, 10월 10일 모니터링 활성화는 이 이미지를 유지한 실행 설정 변경이었다. 최초 배포 시점의 321개 기본 자료와 전체 이관 이후 622개를 구분한다.

초기 전체 DB 백업은 S3에 별도 보관하고, 지정한 객체 버전을 AWS 내부의 임시 DB로 실제 복원해 24개 테이블·35개 외래 키와 원본 보존을 확인했다. 정기 백업은 매일 03:00 KST 타이머로 운영한다. 최초 수동 실행에 이어 10월 10일 서버 점검에서는 당일 03:00:24~03:00:26 KST의 일일 백업 성공과 S3 검증 기록도 확인했다. 이는 해당 시점 결과이며 이후 매일의 성공이나 외부 실패 알림까지 보증하지 않는다.

로컬 일일 백업은 검증된 최신 7개, S3 일일 백업은 7일 만료와 비현재 버전 1일 만료를 설정했다. 초기 기준 백업에는 자동 만료가 없다. S3 버킷은 비공개·버전 관리·SSE-S3·HTTPS 전용이며, EC2 역할에는 지정 백업 경로의 업로드·읽기 권한만 부여했다. 원본 백업과 비밀값은 지식 저장소에 보관하지 않는다.

## 상태 확인·지표·로그

| 수단 | 현재 코드 | 확인 범위 |
|---|---|---|
| readiness | GET /actuator/health/readiness, 기본 그룹에 db 포함 | DB 연결과 상태 확인. 모든 사용자 기능 성공을 보증하지 않음 |
| Docker healthcheck | 컨테이너 내부 위 경로, X-Forwarded-Proto: https, status UP 확인 | 컨테이너 교체의 상태 판정 |
| Prometheus | 운영 `prod,monitoring` 프로필 + 전용 MONITORING_TOKEN, Grafana hosted Metrics Endpoint가 1분마다 수집 | 허용한 HTTP·JVM·DB 풀 지표. 운영 수집 `UP` 확인 |
| Grafana 장애 알림 | 운영 `up`이 1 미만인 상태가 2분 지속하면 `sebu-email`로 전달하도록 설정 | 지표 수집 가용성. 1분 평가, 실제 발송까지 추가 지연 가능 |
| JSON 로그 | 요청 요약·보안 사건·traceId | 원인 추적. 수집 전달·보존은 별도 운영 설정 |

`HealthCheckSecurityConfiguration`은 monitoring 프로필이나 수집 토큰 없이 readiness GET만 공개하고 다른 health 경로는 거부한다. Prometheus용 Bearer 토큰은 일반 사용자 쿠키 인증과 다른 관리 경로다.

> [!warning] 원본 문서의 오래된 설명
> `docs/logging.md`에는 Docker 상태 확인이 `/api/v1/laboratories`를 호출한다는 문장이 남아 있다. 현재 `Dockerfile`과 보안 설정은 `/actuator/health/readiness`를 사용한다. 이 노트는 구현을 기준으로 정리했으며 이전 원문 [[SEBU 백엔드 운영 보안 로깅]]에는 역사적 설명을 보존했다. 현재 상태 확인 경로는 코드와 이 노트를 기준으로 확인한다.

`X-Request-ID`, 응답 오류의 `traceId`, 서버 로그를 연결해 추적한다. 원문 비밀번호·토큰·본문·개인정보는 로그에 넣지 않는 계약이다. 출력 큐가 넘치면 보안·ERROR 로그도 유실될 수 있고 `logging.events.dropped`에 기록된다.

운영 배포 digest·컨테이너 상태·Pull 타이머의 실행과 비로그인 공개 API 경로는 확인했다. 10월 10일에는 운영 Grafana 14개 패널·16개 쿼리의 실행, 수집 `UP`, 장애 규칙 `Normal`과 기존 `sebu-email` 연결을 확인했다. 개발 대시보드도 개발 수집 대상만 조회하도록 분리했다. 실제 테스트 메일 발송이나 고의 장애 시험은 하지 않았다.

[운영 대시보드](https://niftyboxwood1620.grafana.net/d/sebu-prod-monitoring/sebu-production-monitoring)와 [운영 장애 규칙](https://niftyboxwood1620.grafana.net/alerting/grafana/fg0ru41k2mwhsd/view)의 사용법은 [[SEBU 운영 모니터링과 대시보드 해석]], 적용 근거는 [[SEBU 운영 모니터링 구축 기록 - 2026-10-10]]을 따른다. HTTP 요청 수는 접속자 수가 아니며, JVM CPU·Heap 지표는 EC2 전체 CPU·메모리·디스크 사용량과 다르다.

프록시를 거치는 실제 로그인 쿠키·CSRF·세션 전환과 사용자 기능은 아직 완료 처리하지 않는다. 사용자 수 집계, EC2 전체 자원 수집, 외부 로그 전송, 백업 실패의 이메일·채팅 알림은 이번에 추가하지 않았다. 백업 실패는 systemd 결과와 서버의 비공개 상태 기록으로 진단한다. [[SEBU 테스트 지도]] · [[SEBU 데이터 모델]] · [[SEBU 인증과 CSRF]]

## 이전된 상세 문서

- [[SEBU 백엔드 EC2 자동 배포 안내]]
- [[SEBU 백엔드 운영 보안 로깅]]

<!-- sources:start -->
## 근거 파일

- [백엔드 · ops/deploy/config.main.example.json](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/ops/deploy/config.main.example.json)
- [백엔드 · ops/deploy/backend.main.env.example](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/ops/deploy/backend.main.env.example)
- [백엔드 · ops/deploy/catalog_transfer.py](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/ops/deploy/catalog_transfer.py)
- [백엔드 · .github/workflows/ci.yml](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/.github/workflows/ci.yml)
- [백엔드 · Dockerfile](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/Dockerfile)
- [백엔드 · src/main/resources/application.yml](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/main/resources/application.yml)
- [백엔드 · src/main/resources/application-prod.yml](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/main/resources/application-prod.yml)
- [백엔드 · src/main/resources/application-monitoring.yml](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/main/resources/application-monitoring.yml)
- [백엔드 · src/main/java/com/sebu/backend/global/monitoring/HealthCheckSecurityConfiguration.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/main/java/com/sebu/backend/global/monitoring/HealthCheckSecurityConfiguration.java)
- [백엔드 · src/main/java/com/sebu/backend/global/monitoring/MonitoringSecurityConfiguration.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/main/java/com/sebu/backend/global/monitoring/MonitoringSecurityConfiguration.java)
- [백엔드 · src/main/java/com/sebu/backend/global/monitoring/MonitoringMetricsConfiguration.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/main/java/com/sebu/backend/global/monitoring/MonitoringMetricsConfiguration.java)
- [백엔드 · ops/deploy/deploy.py](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/ops/deploy/deploy.py)
- [백엔드 · ops/deploy/sebu-pull-deploy.timer](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/ops/deploy/sebu-pull-deploy.timer)
- [프론트 · vercel.json](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/vercel.json)
- [백엔드 · src/main/resources/db/migration/V50__add_missing_physics_astronomy_laboratory_links.sql](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/main/resources/db/migration/V50__add_missing_physics_astronomy_laboratory_links.sql)

기준 커밋은 [[SEBU 저장소와 기준 버전]]에서 확인한다.
<!-- sources:end -->

---
[[SEBU 홈]] · [[SEBU 지식 지도]]
