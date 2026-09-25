import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { START, END, baselinePath, configuredRepositories, diffChanges, git, isHash, readJson, readNotes, safeRelative, sha256, sourceBlock } from './lib.mjs';

export function checkSources(root, log = console.log) {
  const baseline = readJson(path.join(root, baselinePath));
  const configured = configuredRepositories(root, baseline);
  let review = false;
  for (const [key, config] of Object.entries(configured)) {
    const before = baseline.repositories[key].commit;
    if (!isHash(before)) throw new Error(`${key}: 기준 커밋이 올바르지 않습니다.`);
    const changes = diffChanges(config.directory, before, config.commit);
    log(`${key}: ${before.slice(0, 12)} -> ${config.commit.slice(0, 12)} (${config.ref})`);
    if (before !== config.commit) {
      review = true;
      log(`  기준과 ref가 다릅니다. 전체 저장소 변경 ${changes.length}개를 검토하세요.`);
    }
    for (const change of changes) {
      review = true;
      const sources = baseline.files.filter(source => source.repository === key && (source.path === change.path || source.path === change.oldPath));
      const notes = [...new Set(sources.flatMap(source => source.notes))].sort();
      log(`  ${change.status} ${change.oldPath ? `${change.oldPath} -> ` : ''}${change.path}`);
      log(notes.length ? `    영향 노트: ${notes.join(', ')}` : '    미등록 출처: 새 근거/노트가 필요한지 검토하세요.');
    }
    if (config.dirty) {
      review = true;
      log('  WARNING 미커밋/미추적 변경이 있습니다. 위 비교와 기록은 지정한 ref의 커밋만 사용합니다.');
      // Porcelain -z safely preserves spaces and non-ASCII paths; rename pairs are shown on separate lines.
      for (const item of config.dirty.split('\0').filter(Boolean)) log(`    ${item}`);
    }
  }
  log(review ? '검토 필요: 본문과 source_ids를 검토한 후 sources:record -- --reviewed를 실행하세요.' : '기준 커밋과 로컬 ref가 같고 미커밋 변경이 없습니다.');
  log('네트워크 요청을 하지 않았습니다. 원격 최신 상태가 필요하면 코드 저장소에서 먼저 git fetch를 실행하세요.');
  return review ? 1 : 0;
}

export function recordSources(root, reviewed, log = console.log) {
  if (!reviewed) throw new Error('기준 기록은 본문 검토 후에만 가능합니다: npm run sources:record -- --reviewed');
  const current = readJson(path.join(root, baselinePath));
  if (current.schemaVersion !== 1 || !current.repositories) throw new Error('지원하지 않는 source-baseline 형식입니다.');
  const configured = configuredRepositories(root, current);
  const notes = readNotes(root);
  const sourceNotes = new Map();
  for (const note of notes) {
    const ids = note.meta.source_ids ?? [];
    if (new Set(ids).size !== ids.length) throw new Error(`${note.relative}: 중복 source_ids`);
    for (const id of ids) {
      const divider = id.indexOf(':');
      const repository = id.slice(0, divider);
      const relative = id.slice(divider + 1);
      if (divider < 1 || !Object.hasOwn(configured, repository) || !safeRelative(relative)) throw new Error(`${note.relative}: 잘못된 source_id ${id}`);
      if (!sourceNotes.has(id)) sourceNotes.set(id, { id, repository, path: relative, notes: [] });
      sourceNotes.get(id).notes.push(note.relative);
    }
  }
  const repositories = Object.fromEntries(Object.entries(current.repositories).map(([key, repo]) => [key, { ...repo, commit: configured[key].commit }]));
  const files = [...sourceNotes.values()].sort((a, b) => a.id.localeCompare(b.id, 'en')).map(source => {
    const config = configured[source.repository];
    const object = `${config.commit}:${source.path}`;
    const type = git(config.directory, ['cat-file', '-t', object]).trim();
    if (type !== 'blob') throw new Error(`${source.id}: 일반 파일 근거가 아닙니다 (${type}).`);
    const bytes = git(config.directory, ['cat-file', 'blob', object], true);
    const blob = git(config.directory, ['rev-parse', '--verify', object]).trim();
    return { ...source, blob, sha256: sha256(bytes), notes: source.notes.sort() };
  });
  const next = { ...current, repositories, files };
  // Construct every update before writing: a missing source or damaged marker must not partially record evidence.
  const edits = notes.map(note => {
    const ids = note.meta.source_ids ?? [];
    const starts = note.content.split(START).length - 1;
    const ends = note.content.split(END).length - 1;
    if (starts !== ends || starts > 1 || (starts && note.content.indexOf(END) < note.content.indexOf(START))) throw new Error(`${note.relative}: 근거 링크 블록이 손상되었습니다.`);
    if (!ids.length && !starts) return { ...note, nextContent: note.content };
    const eol = note.content.includes('\r\n') ? '\r\n' : '\n';
    const block = sourceBlock(ids, next).replaceAll('\n', eol);
    const nextContent = starts ? note.content.slice(0, note.content.indexOf(START)) + block + note.content.slice(note.content.indexOf(END) + END.length) : note.content + (note.content.endsWith(eol) ? eol : eol + eol) + block + eol;
    return { ...note, nextContent };
  });
  for (const note of edits) if (note.nextContent !== note.content) fs.writeFileSync(note.filename, note.nextContent, 'utf8');
  fs.writeFileSync(path.join(root, baselinePath), JSON.stringify(next, null, 2) + '\n', 'utf8');
  for (const [key, config] of Object.entries(configured)) if (config.dirty) log(`WARNING ${key}: 미커밋 변경은 포함하지 않았습니다. ${config.ref} 커밋의 blob만 기록했습니다.`);
  log(`근거 기록 완료: ${files.length}개 출처, ${notes.length}개 노트. 본문·created·verified·verifiedDate는 자동 변경하지 않았습니다.`);
  log('변경된 근거 링크와 메타데이터를 git diff로 확인하고 npm run check를 실행하세요.');
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [command, ...options] = process.argv.slice(2);
    if (options.some(option => option !== '--reviewed') || (command === 'check' && options.length)) throw new Error('지원하지 않는 옵션입니다.');
    if (command === 'check') process.exitCode = checkSources(process.cwd());
    else if (command === 'record') process.exitCode = recordSources(process.cwd(), options.includes('--reviewed'));
    else throw new Error('사용법: node scripts/sources.mjs check | record --reviewed');
  } catch (error) { console.error(`ERROR ${error.message}`); process.exitCode = 2; }
}
