import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { validate } from '../scripts/check.mjs';
import { checkSources, recordSources } from '../scripts/sources.mjs';
import { readJson, sha256 } from '../scripts/lib.mjs';

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sebu-brain-test-'));
  t.after(() => {
    const resolved = fs.realpathSync(root);
    const temp = fs.realpathSync(os.tmpdir());
    assert.equal(path.dirname(resolved), temp, 'cleanup must stay in the direct temporary directory');
    assert.ok(path.basename(resolved).startsWith('sebu-brain-test-'));
    fs.rmSync(resolved, { recursive: true, force: true });
  });
  const repo = path.join(root, 'source');
  fs.mkdirSync(repo);
  fs.mkdirSync(path.join(root, 'metadata'));
  fs.mkdirSync(path.join(root, 'SEBU'));
  const git = (...args) => execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true }).trim();
  git('init');
  git('config', 'user.name', 'SEBU fixture');
  git('config', 'user.email', 'fixture@example.invalid');
  git('config', 'core.autocrlf', 'false');
  fs.writeFileSync(path.join(repo, 'tracked.txt'), 'original\n');
  fs.writeFileSync(path.join(repo, 'unmapped.txt'), 'unmapped\n');
  git('add', '.');
  git('commit', '-m', 'initial');
  const commit = git('rev-parse', 'HEAD');
  const note = path.join(root, 'SEBU', '테스트.md');
  const content = '---\nproject: SEBU\ntype: "reference"\nstatus: "확인됨"\ncreated: 2026-09-26\nverified: 2026-09-26\nsource_ids:\n  - "B:tracked.txt"\n---\n\n# 테스트\n\n검토한 본문.\n';
  fs.writeFileSync(note, content);
  fs.writeFileSync(path.join(root, 'SEBU', 'SEBU 저장소와 기준 버전.md'), content.replace('source_ids:\n  - "B:tracked.txt"\n', '').replace('# 테스트', '# SEBU 저장소와 기준 버전'));
  fs.writeFileSync(path.join(root, 'sources.local.json'), JSON.stringify({ repositories: { B: { path: './source', ref: 'HEAD' } } }));
  fs.writeFileSync(path.join(root, 'metadata', 'source-baseline.json'), JSON.stringify({ schemaVersion: 1, verifiedDate: '2026-09-26', repositories: { B: { repository: 'greedy-team/SEBU-backend', branch: 'develop', commit } }, files: [] }));
  fs.writeFileSync(path.join(root, 'README.md'), '[홈](<SEBU/테스트.md>)\n');
  return { root, repo, git, note, content, commit };
}

test('record requires review and preserves prose/dates while recording committed bytes', t => {
  const f = fixture(t);
  assert.throws(() => recordSources(f.root, false, () => {}), /검토/);
  // Dirty working tree content must never leak into the recorded evidence.
  fs.writeFileSync(path.join(f.repo, 'tracked.txt'), 'uncommitted\r\n');
  recordSources(f.root, true, () => {});
  const baseline = readJson(path.join(f.root, 'metadata/source-baseline.json'));
  assert.equal(baseline.files[0].sha256, sha256(Buffer.from('original\n')));
  assert.equal(baseline.verifiedDate, '2026-09-26');
  assert.ok(fs.readFileSync(f.note, 'utf8').startsWith(f.content));
  assert.deepEqual(validate(f.root).errors, []);
  assert.equal(checkSources(f.root, () => {}), 1, 'dirty tree requires review');
});

test('detects complete ref diff: added, deleted, renamed and mapped notes', t => {
  const f = fixture(t);
  recordSources(f.root, true, () => {});
  assert.equal(checkSources(f.root, () => {}), 0);
  f.git('mv', 'tracked.txt', 'renamed.txt');
  f.git('rm', 'unmapped.txt');
  fs.writeFileSync(path.join(f.repo, 'new-file.txt'), 'brand-new content\n');
  f.git('add', '.');
  f.git('commit', '-m', 'rename delete add');
  const messages = [];
  assert.equal(checkSources(f.root, line => messages.push(line)), 1);
  const output = messages.join('\n');
  assert.match(output, /R100 tracked.txt -> renamed.txt/);
  assert.match(output, /D unmapped.txt/);
  assert.match(output, /A new-file.txt/);
  assert.match(output, /SEBU\/테스트.md/);
  assert.match(output, /미등록 출처/);
  const before = fs.readFileSync(f.note, 'utf8');
  assert.throws(() => recordSources(f.root, true, () => {}), /Git 실행 실패/);
  assert.equal(fs.readFileSync(f.note, 'utf8'), before, 'failed record must not change notes');
  fs.writeFileSync(f.note, before.replace('  - "B:tracked.txt"', '  - "B:renamed.txt"'));
  recordSources(f.root, true, () => {});
  assert.equal(checkSources(f.root, () => {}), 0);
  assert.deepEqual(validate(f.root).errors, []);
});

test('catches broken wikilinks, Canvas references/edges, private paths and stale evidence', t => {
  const f = fixture(t);
  recordSources(f.root, true, () => {});
  fs.appendFileSync(f.note, '\n[[없는 노트]]\nfile:///private/path\n');
  fs.writeFileSync(path.join(f.root, 'SEBU', '지도.canvas'), JSON.stringify({ nodes: [{ id: 'one', type: 'file', file: '테스트.md' }], edges: [{ id: 'edge', fromNode: 'one', toNode: 'missing' }] }));
  const filename = path.join(f.root, 'metadata/source-baseline.json');
  const baseline = readJson(filename);
  baseline.repositories.B.commit = 'a'.repeat(40);
  fs.writeFileSync(filename, JSON.stringify(baseline));
  fs.appendFileSync(path.join(f.root, 'README.md'), '[없음](SEBU/missing.md)');
  const output = validate(f.root).errors.join('\n');
  assert.match(output, /깨진 위키링크/);
  assert.match(output, /개인 절대 경로/);
  assert.match(output, /깨진 Canvas file/);
  assert.match(output, /존재하지 않는 node/);
  assert.match(output, /근거 링크 블록이 기준 커밋/);
  assert.match(output, /깨진 상대 링크/);
});

test('catches duplicate titles, invalid frontmatter and reverse evidence mismatch', t => {
  const f = fixture(t);
  recordSources(f.root, true, () => {});
  fs.mkdirSync(path.join(f.root, 'SEBU', 'nested'));
  fs.copyFileSync(f.note, path.join(f.root, 'SEBU', 'nested', '테스트.md'));
  fs.writeFileSync(path.join(f.root, 'SEBU', '잘못된.md'), '# 잘못된\n');
  const output = validate(f.root).errors.join('\n');
  assert.match(output, /중복 제목/);
  assert.match(output, /frontmatter/);
  assert.match(output, /역방향 노트 연결/);
});

test('CLI reports error exit code 2 for missing configuration', t => {
  const f = fixture(t);
  fs.rmSync(path.join(f.root, 'sources.local.json'));
  const script = path.resolve('scripts/sources.mjs');
  assert.throws(() => execFileSync(process.execPath, [script, 'check'], { cwd: f.root, stdio: 'pipe', windowsHide: true }), error => error.status === 2 && error.stderr.toString().includes('sources.local.json'));
});
