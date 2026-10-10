---
project: SEBU
type: "runbook"
status: "운영 수집·대시보드·알림 설정 검증 완료"
created: 2026-10-10
verified: 2026-10-10
tags:
  - sebu
  - sebu/runbook
source_ids:
  - "B:src/main/resources/application-monitoring.yml"
  - "B:src/main/java/com/sebu/backend/global/monitoring/MonitoringSecurityConfiguration.java"
  - "B:src/main/java/com/sebu/backend/global/monitoring/MonitoringMetricsConfiguration.java"
  - "B:src/main/java/com/sebu/backend/global/monitoring/HealthCheckSecurityConfiguration.java"
  - "B:ops/deploy/deploy.py"
---
# SEBU 운영 모니터링과 대시보드 해석

**운영 Grafana는 백엔드의 응답·부하·DB 연결 상태를 확인하는 도구이며, 현재 접속자 수를 세는 도구는 아니다.** 2026-10-10에 운영 지표 수집, 14개 패널과 장애 알림을 구성했다. 아래는 설정과 해석 방법이며, 특정 시점의 낮은 사용량을 현재 상태나 전체 기능 정상의 근거로 반복 사용하지 않는다.

| 바로가기 | 용도 |
|---|---|
| [운영 대시보드](https://niftyboxwood1620.grafana.net/d/sebu-prod-monitoring/sebu-production-monitoring) | `SEBU Production Monitoring`, 운영 지표 14개 패널 |
| [개발 대시보드](https://niftyboxwood1620.grafana.net/d/mghlqcj/sebu-backend-monitoring) | 기존 `SEBU Backend Monitoring`, 개발 지표만 조회 |
| [운영 장애 알림](https://niftyboxwood1620.grafana.net/alerting/grafana/fg0ru41k2mwhsd/view) | `SEBU Production Backend Down`, `sebu-email`로 전달 |

## 수집 구조와 환경 구분

운영 백엔드는 `prod,monitoring` 프로필로 제한된 Prometheus 지표를 노출한다. Grafana Cloud의 hosted Metrics Endpoint가 `https://api.sebu.kr/actuator/prometheus`를 전용 Bearer 토큰으로 1분마다 수집한다. 이 토큰은 사용자 로그인 토큰과 별개이며 문서·대시보드 JSON·로그에 기록하지 않는다. 무인증 지표 요청은 401, 올바른 수집 인증은 200을 확인했다.

| 구분 | 선택 기준 |
|---|---|
| 운영 쿼리 | `scrape_job="sebu-prod-backend"` |
| 개발 쿼리 | `scrape_job="sebu-dev-backend"` |
| 공통 데이터 소스 | `grafanacloud-prom` |
| 대시보드 기본 범위·새로고침 | 최근 1시간·1분 |

같은 데이터 소스를 사용하므로 환경 조건을 빼면 개발·운영 지표가 섞일 수 있다. 새 패널을 추가할 때에도 모든 메트릭 선택자에 해당 환경의 `scrape_job`을 지정한다. 개발 대시보드는 기존 9개 패널을 유지하며 조회 범위만 개발로 제한했다.

별도의 운영 Prometheus·Alloy·node_exporter나 추가 EC2를 설치하지 않았다. 당시 Grafana Cloud Free 플랜에서 구성했으며, 무료 한도와 보존 기간은 변경될 수 있으므로 운영 확장 시 다시 확인한다. 무료 모니터링 도구 사용이 AWS 서버·트래픽 전체의 영구 무료를 의미하지는 않는다.

## 먼저 확인할 지표

| 패널 | 의미와 해석 범위 |
|---|---|
| 운영 수집 상태 | `UP`은 Grafana가 지표를 수집하는 데 성공했다는 뜻. 로그인·쓰기 등 모든 기능 성공을 뜻하지 않음 |
| 백엔드 실행 시간 | 현재 프로세스를 시작한 뒤 흐른 시간. 컨테이너 교체·재시작 시 초기화 |
| 요청 / 초 · 최근 5분 | 최근 5분의 요청 카운터 증가율. 순간 접속자나 누적 방문자 수가 아님 |
| 5xx 오류율 · 최근 5분 | 전체 요청 중 5xx 응답 비율. 401 같은 4xx는 이 비율에 포함하지 않음 |
| HTTP 요청 추이 | 상태 코드별 최근 5분 평균 요청률을 시간에 따라 표시 |
| 주요 조회 API p95 | `GET /api/v1/laboratories`, `GET /api/v1/posts`의 최근 5분 응답시간 p95를 경로별로 표시 |
| JVM 프로세스 CPU | 백엔드 JVM 프로세스의 CPU 사용 지표. EC2 전체 CPU 지표와 구분 |
| JVM Heap 사용률·메모리 | JVM Heap의 사용량과 설정된 최대치. EC2 전체 RAM이나 컨테이너 총 메모리와 구분 |
| DB 연결 풀 · 사용 / 최대 | 백엔드 Hikari 연결 풀의 사용·최대 연결 수. DB 서버 전체 상태를 뜻하지 않음 |
| DB 연결 대기·시간 초과 | 연결을 기다리는 요청 수와 최근 5분 연결 획득 시간 초과 증가량 |
| GC 중단 시간 비율 | 최근 5분 중 가비지 컬렉션 중단 시간이 차지한 비율 |
| JVM 스레드 | 살아 있는 JVM 스레드 수 |

p95는 측정된 요청의 약 95%가 그 시간 이내에 처리됐다는 히스토그램 기반 추정치다. 모든 API나 FE 화면 로딩 시간을 대표하지 않으며, 요청이 적으면 변동이 크다. 집계할 요청 증가분이 없거나 수집을 시작한 직후라면 `N/A`·`NaN`일 수 있다. 이를 0ms로 해석하지 않는다. 운영 패널은 지표가 없거나 수집이 실패했을 때 부하 0으로 위장하지 않도록 수집 상태와 함께 조회한다.

## HTTP 요청 추이 읽기

가로축은 시간, 세로축 `req/s`는 **최근 5분 평균 초당 요청 수**다. `0.03 req/s`라면 평균 분당 약 1.8건이다. 이 값은 `rate(...[5m])`의 추정률이므로 그래프 높이를 정확한 요청 건수로 읽지 않는다. 범례의 `Last *`는 선택한 기간에서 마지막으로 유효했던 값(`lastNotNull`), `Max`는 해당 기간에서 가장 높았던 집계값이다.

최신 구간에 데이터가 없으면 HTTP·p95 등 시계열 범례의 `Last *`에 과거 유효값이 남을 수 있다. 숫자 하나로 현재 상태를 판단하지 않고, 즉시 조회하는 운영 수집 상태와 그래프 끝부분의 시각·공백을 함께 확인한다. 요청량 0과 수집 실패로 생긴 결측은 다르다.

현재 계측은 `/api/` 요청을 대상으로 한다. Grafana의 `/actuator/prometheus` 수집 요청과 readiness 점검 요청은 이 HTTP 요청 통계에서 제외한다. 사람이 보낸 요청과 API를 호출하는 자동 요청은 이 그래프만으로 구분하지 못한다.

| 상태 코드 | 의미 | 점검 판단 |
|---|---|---|
| `200` | 정상 처리 후 응답 반환 | 이 응답 하나로 다른 기능까지 정상이라고 단정하지 않음 |
| `204` | 정상 처리했으며 응답 본문 없음 | 어떤 기능의 응답인지는 요청 경로로 확인 |
| `401` | 유효한 인증이 없어 요청 거절 | 비로그인 상태 확인·만료 등에서도 발생 가능. 실제 원인은 경로와 인증 흐름을 대조 |
| `5xx` | 서버 처리 과정의 오류 | 오류 경로·시각·traceId와 서버 로그를 함께 확인 |

그래프의 색상은 범례에 표시된 상태 코드로 읽는다. 로그인한 사용자의 정상 동작에서 401이 반복되면 해당 API, 쿠키 전달, 세션 만료와 재발급 흐름을 확인한다. 그래프만 보고 학교 인증 장애나 세션 만료를 원인으로 확정하지 않는다. [[SEBU 인증과 CSRF]]

한 사용자가 화면 하나를 열어도 목록·카테고리·로그인 상태 확인 등 여러 API 요청을 보낼 수 있고 자동 요청도 발생할 수 있다. 따라서 요청 수를 사용자 수로 환산하지 않는다. 다음은 별도 기능이며 이번 구성에 추가하지 않았다.

- 전체 가입자 수: 회원 데이터 집계 기준이 필요하다.
- 현재 활동 사용자 수: 최근 5분 등 활동 시간 범위와 사용자 중복 제거 기준이 필요하다.
- 비로그인 방문자 수: 방문 분석과 익명 식별·개인정보 처리 기준을 별도로 설계해야 한다.

## 장애 알림과 대응

운영 규칙은 다음 instant query가 `1` 미만인 상태가 2분 지속하는지를 1분마다 평가한다. 데이터 없음과 평가 오류도 `Alerting`으로 설정했으며, 연락처는 기존 `sebu-email`이다.

```promql
min(up{scrape_job="sebu-prod-backend"}) or vector(0)
```

수집·평가·알림 전달 주기가 있어 실제 장애 발생으로부터 정확히 2분 뒤 메일이 도착한다는 보장은 없다. 데이터 소스 조회 자체가 실패하면 수집 대상 장애와 구분해 확인한다. 알림은 **지표 수집 경로의 가용성**을 감시한다. CPU·메모리·응답시간 임계치 알림이나 백업 실패 알림을 추가한 것은 아니다.

1. 운영 대시보드의 수집 상태와 규칙 평가 오류를 확인한다.
2. 공개 API·HTTPS, EC2와 컨테이너·readiness 상태를 확인한다.
3. 서버가 응답하는데 수집만 실패하면 Grafana 수집 설정과 전용 인증 상태를 확인한다. 토큰은 출력하거나 공유하지 않는다.
4. 기능별 오류라면 해당 API의 시각·상태 코드·traceId와 서버 로그를 대조한다.

구축 당시 규칙 `Normal`과 알림 수신 경로를 확인했다. 실제 테스트 메일 발송과 고의 장애 시험은 하지 않았으므로 종단 간 이메일 도착 검증을 완료했다고 기록하지 않는다.

## 현재 범위와 후속 점검

EC2 전체 RAM·디스크·네트워크 지표, MySQL 엔진 전체 지표, Grafana로의 로그 전송, 백업 실패 알림, 사용자 수 집계는 미구현이다. 기존 readiness·JSON 로그·백업 상태 기록과 함께 판단한다. 운영 프로필은 서버 실행 설정에 보존되어 다음 Pull 배포에서도 읽히지만, 서버를 새로 만들 때 Grafana와 런타임 설정을 별도로 복구해야 한다. 백엔드 소스만으로 hosted 수집 작업·대시보드·연락처가 자동 생성되지는 않는다.

실행 근거와 당시 제약은 [[SEBU 운영 모니터링 구축 기록 - 2026-10-10]], 배포·백업 구조는 [[SEBU 배포와 모니터링]]에서 확인한다.

---
[[SEBU 홈]] · [[SEBU 지식 지도]]

<!-- sources:start -->
## 근거 파일

- [백엔드 · src/main/resources/application-monitoring.yml](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/main/resources/application-monitoring.yml)
- [백엔드 · src/main/java/com/sebu/backend/global/monitoring/MonitoringSecurityConfiguration.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/main/java/com/sebu/backend/global/monitoring/MonitoringSecurityConfiguration.java)
- [백엔드 · src/main/java/com/sebu/backend/global/monitoring/MonitoringMetricsConfiguration.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/main/java/com/sebu/backend/global/monitoring/MonitoringMetricsConfiguration.java)
- [백엔드 · src/main/java/com/sebu/backend/global/monitoring/HealthCheckSecurityConfiguration.java](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/src/main/java/com/sebu/backend/global/monitoring/HealthCheckSecurityConfiguration.java)
- [백엔드 · ops/deploy/deploy.py](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/ops/deploy/deploy.py)

기준 커밋은 [[SEBU 저장소와 기준 버전]]에서 확인한다.
<!-- sources:end -->
