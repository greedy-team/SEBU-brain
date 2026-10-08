# SEBU Brain

SEBU의 기능, 구조, 설계 이유와 운영 지식을 연결하는 팀용 Obsidian 보관함입니다.

**기준:** 백엔드 2026-10-08, 프론트 2026-10-07 확인 · [백엔드 develop `21bd49e`](https://github.com/greedy-team/SEBU-backend/commit/21bd49e5133210978b4991a99d7e3cb6a33e6a7a) · [프론트 dev `88eee80`](https://github.com/greedy-team/SEBU-frontend/commit/88eee80d88016b3e3067ac224651143b1d28351f)

## 처음 읽는 팀원

```sh
git clone https://github.com/greedy-team/SEBU-brain.git
cd SEBU-brain
```

Obsidian에서 **기존 폴더를 보관함으로 열기(Open folder as vault)**를 선택하고 복제된 **SEBU-brain 루트**를 엽니다. 그 안의 `SEBU/00 시작/SEBU 홈.md`에서 시작합니다. 추가 플러그인은 필요하지 않습니다.

이후 같은 폴더에서 아래 명령으로 갱신합니다.

```sh
git pull --ff-only
```

별도 폴더로 복사하지 않고 clone한 폴더 자체를 보관함으로 사용합니다. 직접 수정한 노트가 있으면 먼저 브랜치에서 커밋하고 팀 문서 변경과 조정합니다.

## 질문에서 시작하기

| 질문 | 문서 |
|---|---|
| 무엇을 만드는 서비스인가? | [프로젝트 개요](<SEBU/01 프로젝트/SEBU 프로젝트 개요.md>) |
| 백엔드 docs와 실행 안내는 어디에 있는가? | [백엔드 문서 모음](<SEBU/90 자료/SEBU 백엔드 문서 모음.md>) · [이전 기록](<SEBU/07 기록/SEBU 문서 이전 기록 - 2026-10-08.md>) |
| 최근 머지에서 무엇이 바뀌었는가? | [10월 7일 갱신 기록](<SEBU/07 기록/SEBU 갱신 기록 - 2026-10-07.md>) |
| 지금 구현된 것은 무엇인가? | [구현 현황](<SEBU/01 프로젝트/SEBU 구현 현황.md>) |
| 검색·단과대·랩실평가가 같은 API를 쓰는가? | [화면과 API 공유](<SEBU/03 기능/SEBU 화면과 API 공유.md>) |
| 공개 API를 외부 주소창에서 열 수 있는 이유는? | [공개 API와 CORS](<SEBU/03 기능/SEBU 공개 API와 CORS.md>) |
| 로그인·북마크는 어떻게 동작하는가? | [인증과 CSRF](<SEBU/03 기능/SEBU 인증과 CSRF.md>) · [마이페이지와 북마크](<SEBU/03 기능/SEBU 마이페이지와 북마크.md>) |
| 다음에 확인할 과제는? | [변경 검토 목록](<SEBU/05 운영/SEBU 변경 검토 목록.md>) |
| 문서를 언제, 어떻게 갱신하는가? | [팀 공유와 업데이트](<SEBU/90 자료/SEBU 팀 공유와 업데이트.md>) · [갱신 방법](<SEBU/90 자료/SEBU 지식 갱신 방법.md>) |

[전체 문서 목록](INDEX.md) · [SEBU 홈](<SEBU/00 시작/SEBU 홈.md>) · [연결 지도](<SEBU/00 시작/SEBU 연결 지도.canvas>)

Markdown 안의 `[[노트]]` 연결과 Canvas는 Obsidian에서 사용합니다. GitHub에서는 위 링크와 전체 문서 목록을 이용하면 됩니다.

## 코드가 바뀐 뒤

1. 코드 PR을 머지하고 해당 저장소의 원격 ref를 갱신합니다.
2. 달라진 기능·API·정책의 관련 노트를 검토합니다.
3. 원본 기준 커밋·근거 링크를 갱신하고 검사합니다.
4. 문서 브랜치의 PR을 검토·머지합니다.
5. 팀원이 Pull해서 읽습니다.

노트는 자동으로 코드와 동기화되지 않습니다. 코드에서 확인한 사실, 실행 검증, 제안을 구분합니다. 운영 배포 버전은 코드 기준과 별도로 확인합니다.

## 문서 검증과 원본 변경 확인

문서를 읽는 데 개발 도구는 필요하지 않습니다. 갱신 도구는 **Node.js 20 이상과 Git**만 사용하고 외부 npm 패키지는 설치하지 않습니다.

```sh
npm run check
npm test
```

코드와 비교하려면 `sources.example.json`을 `sources.local.json`으로 복사하고 경로를 맞춥니다. PowerShell에서는 `Copy-Item sources.example.json sources.local.json`을 사용할 수 있습니다.

```sh
npm run sources:check
# 노트 검토와 수정이 끝났을 때만 기준 및 근거 링크 기록
npm run sources:record -- --reviewed
npm run check
```

원본 코드 레포의 경로·ref 설정은 각자 관리하며 Git에서 제외합니다. 비교 기준은 [source-baseline.json](metadata/source-baseline.json)에 기록합니다. 새 파일·삭제·이름 변경도 비교하며, 문장 내용의 정확성은 리뷰로 확인합니다.

[기여 방법](CONTRIBUTING.md)에서 갱신 순서와 검증 범위를 확인하세요.
