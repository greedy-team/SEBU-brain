---
project: SEBU
type: "project"
status: "기준 코드 확인"
created: 2026-09-26
verified: 2026-10-09
tags:
  - sebu
  - sebu/project
source_ids:
  - "B:README.md"
  - "F:src/App.jsx"
---
# SEBU 프로젝트 개요

SEBU는 학생이 연구실을 찾고 관심 정보를 저장하며 연구실 경험을 공유하도록 만드는 서비스다. 데이터 수집과 검수도 이 제품을 유지하는 기반이다.

운영 서비스는 [www.sebu.kr](https://www.sebu.kr/), 운영 API는 [api.sebu.kr](https://api.sebu.kr/api/v1/laboratories)이다. BE main은 운영, BE develop은 개발이며 FE는 dev를 운영 브랜치로 사용한다. 실제 배포·데이터 규모·백업의 확인 시점은 [[SEBU 운영 배포 완료 기록 - 2026-10-09]]에 남긴다.

## 사용자가 얻는 가치

| 영역 | 역할 | 연결 |
|---|---|---|
| 탐색 | 연구실·교수·소속·연구 분야를 비교 | [[SEBU 연구실 탐색]] |
| 개인화 | 프로필과 관심 연구실 관리 | [[SEBU 마이페이지와 북마크]] |
| 경험 공유 | 연구실 후기와 게시글·댓글 API | [[SEBU 커뮤니티와 후기]] |

현재 프론트는 메인, 검색, 단과대, 로그인, 마이페이지, 랩실 후기 홈·상세·작성과 약관·개인정보처리방침 라우트를 활성화한다. 일반 게시판 화면 파일은 있지만 해당 라우트는 주석 상태다. 파일 존재와 사용자 접근 가능을 구분한다. 신고·관리자 관련 요구사항은 [[SEBU 신고와 관리자 검토]]에서 현재 외부 접수 기능과 구분한다.

## 대표 사용자 흐름

연구실 목록 탐색 → 관심 연구실의 상세·후기 확인 → 로그인 → 북마크 또는 후기 작성 → 마이페이지에서 관심 정보 확인.

공개 정보 조회는 비로그인에게도 제공한다. 외부 사이트의 브라우저 호출 허용과 사용자 인증은 별도 조건이다. [[SEBU 공개 API와 CORS]]

## 데이터 기반

[[SEBU 크롤링과 승격]]으로 공개 원천을 후보로 수집하고 검수 후 서비스 데이터에 반영한다. 출처와 수기 관리값을 보존하는 이유는 [[SEBU 결정 - 복수 학과와 출처 보존]]에 있다.

<!-- sources:start -->
## 근거 파일

- [백엔드 · README.md](https://github.com/greedy-team/SEBU-backend/blob/7d4839b46ca8cdc6c608ec9934ee02e018e54893/README.md)
- [프론트 · src/App.jsx](https://github.com/greedy-team/SEBU-frontend/blob/e7e54deff631adfef08b9b9e0dac9af5c398c317/src/App.jsx)

기준 커밋은 [[SEBU 저장소와 기준 버전]]에서 확인한다.
<!-- sources:end -->

---
[[SEBU 홈]] · [[SEBU 지식 지도]]
