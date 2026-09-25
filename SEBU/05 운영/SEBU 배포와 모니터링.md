---
project: SEBU
type: "runbook"
status: "2026-09-26 코드·문서 확인"
created: 2026-09-26
verified: 2026-09-26
tags:
  - sebu
  - sebu/runbook
source_ids:
  - "B:docs/ec2-pull-deploy.md"
  - "B:.github/workflows/ci.yml"
  - "B:Dockerfile"
  - "B:src/main/resources/application.yml"
  - "B:src/main/resources/application-prod.yml"
  - "B:src/main/resources/application-monitoring.yml"
  - "B:src/main/java/com/sebu/backend/global/monitoring/HealthCheckSecurityConfiguration.java"
  - "B:src/main/java/com/sebu/backend/global/monitoring/MonitoringSecurityConfiguration.java"
  - "B:src/main/java/com/sebu/backend/global/monitoring/MonitoringMetricsConfiguration.java"
  - "B:docs/logging.md"
  - "B:ops/deploy/deploy.py"
---
# SEBU 배포와 모니터링

배포 코드는 GitHub Actions에서 검증한 비공개 GHCR 이미지를 EC2가 Pull하여 교체하는 흐름이다. 코드·설정이 존재하는 것과 현재 서버에서 해당 커밋이 실행되는 것은 구분한다.

```mermaid
flowchart LR
    A[develop 머지] --> B[테스트와 이미지 스모크 검사]
    B --> C[커밋 SHA 이미지 게시]
    C --> D[최신 develop 포인터 갱신]
    D --> E[EC2 digest 확인과 DB 백업]
    E --> F[백엔드 교체]
    F --> G[readiness 확인]
```

## CI와 배포의 역할

- `ci.yml`은 배포 스크립트 단위 테스트·셸 문법 검사, Java 테스트, 컨테이너 빌드, 일회용 MySQL 8.0에서 prod 이미지 스모크 검사를 정의한다.
- develop push 또는 수동 실행의 publish 작업은 커밋·마이그레이션 지문을 이미지에 기록한다. 게시 중 더 최신 develop이 생기면 해당 SHA 이미지만 남기고 develop 포인터는 옮기지 않는다.
- EC2 배포 도구의 설치·최초 실행·타이머 활성화는 별도 운영 단계다. 소스에 타이머가 있다고 활성화 상태를 단정하지 않는다.
- 단일 백엔드 컨테이너 교체이므로 짧은 중단이 생길 수 있다.

실패 시 기존·신규 Flyway SQL이 같으면 보존한 이전 컨테이너 시작을 시도한다. SQL이 바뀐 경우 DB 적용 상태를 수동 확인하며 코드·DB를 자동 원복하지 않는다. 실제 절차는 원본 runbook과 `deploy.py`를 따른다.

## 최신 응답 압축

백엔드 기준 커밋 `f06c597bab64fb1559754644e633aea92be4fd2e`의 `application-prod.yml`에는 `server.compression.enabled=true`, `mime-types=application/json`, `min-response-size=2KB`가 있다.

압축 협상과 서버 조건을 만족하는 JSON 전달 크기를 줄이는 설정이다. 기본 연구실 목록을 페이지 목록으로 바꾸거나 응답 필드를 줄인 것은 아니다. 배포 후 실제 `Content-Encoding`과 전달 크기는 별도 확인한다.

## 상태 확인·지표·로그

| 수단 | 현재 코드 | 확인 범위 |
|---|---|---|
| readiness | GET /actuator/health/readiness, 기본 그룹에 db 포함 | DB 연결과 상태 확인. 모든 사용자 기능 성공을 보증하지 않음 |
| Docker healthcheck | 컨테이너 내부 위 경로, X-Forwarded-Proto: https, status UP 확인 | 컨테이너 교체의 상태 판정 |
| Prometheus | monitoring 프로필 + 전용 MONITORING_TOKEN | 허용한 HTTP·JVM·DB 풀 지표 |
| JSON 로그 | 요청 요약·보안 사건·traceId | 원인 추적. 수집 전달·보존은 별도 운영 설정 |

`HealthCheckSecurityConfiguration`은 monitoring 프로필이나 수집 토큰 없이 readiness GET만 공개하고 다른 health 경로는 거부한다. Prometheus용 Bearer 토큰은 일반 사용자 쿠키 인증과 다른 관리 경로다.

> [!warning] 원본 문서의 오래된 설명
> `docs/logging.md`에는 Docker 상태 확인이 `/api/v1/laboratories`를 호출한다는 문장이 남아 있다. 현재 `Dockerfile`과 보안 설정은 `/actuator/health/readiness`를 사용한다. 이 노트는 구현을 기준으로 정리했으며 원본 코드 레포 문서는 이번에 수정하지 않았다.

`X-Request-ID`, 응답 오류의 `traceId`, 서버 로그를 연결해 추적한다. 원문 비밀번호·토큰·본문·개인정보는 로그에 넣지 않는 계약이다. 출력 큐가 넘치면 보안·ERROR 로그도 유실될 수 있고 `logging.events.dropped`에 기록된다.

현재 배포 digest, 타이머 실행, 프록시의 쿠키 보존, 실제 메트릭 수집·알림은 이번 문서 갱신에서 검증하지 않았다. [[SEBU 테스트 지도]] · [[SEBU 데이터 모델]] · [[SEBU 인증과 CSRF]]

<!-- sources:start -->
## 근거 파일

- [백엔드 · docs/ec2-pull-deploy.md](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/docs/ec2-pull-deploy.md)
- [백엔드 · .github/workflows/ci.yml](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/.github/workflows/ci.yml)
- [백엔드 · Dockerfile](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/Dockerfile)
- [백엔드 · src/main/resources/application.yml](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/src/main/resources/application.yml)
- [백엔드 · src/main/resources/application-prod.yml](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/src/main/resources/application-prod.yml)
- [백엔드 · src/main/resources/application-monitoring.yml](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/src/main/resources/application-monitoring.yml)
- [백엔드 · src/main/java/com/sebu/backend/global/monitoring/HealthCheckSecurityConfiguration.java](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/src/main/java/com/sebu/backend/global/monitoring/HealthCheckSecurityConfiguration.java)
- [백엔드 · src/main/java/com/sebu/backend/global/monitoring/MonitoringSecurityConfiguration.java](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/src/main/java/com/sebu/backend/global/monitoring/MonitoringSecurityConfiguration.java)
- [백엔드 · src/main/java/com/sebu/backend/global/monitoring/MonitoringMetricsConfiguration.java](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/src/main/java/com/sebu/backend/global/monitoring/MonitoringMetricsConfiguration.java)
- [백엔드 · docs/logging.md](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/docs/logging.md)
- [백엔드 · ops/deploy/deploy.py](https://github.com/greedy-team/SEBU-backend/blob/f06c597bab64fb1559754644e633aea92be4fd2e/ops/deploy/deploy.py)

기준 커밋은 [[SEBU 저장소와 기준 버전]]에서 확인한다.
<!-- sources:end -->

---
[[SEBU 홈]] · [[SEBU 지식 지도]]
