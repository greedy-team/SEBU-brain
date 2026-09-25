import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

export const START = '<!-- sources:start -->';
export const END = '<!-- sources:end -->';
export const baselinePath = 'metadata/source-baseline.json';
export const posix = value => value.split(path.sep).join('/');
export const readJson = filename => JSON.parse(fs.readFileSync(filename, 'utf8').replace(/^\uFEFF/, ''));
export const sha256 = data => createHash('sha256').update(data).digest('hex');
export const isHash = value => typeof value === 'string' && /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(value);
export const isDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().startsWith(value);
export const safeRelative = value => typeof value === 'string' && value.length > 0 && !value.includes('\\') && !value.includes('\0') && !value.includes(':') && !value.startsWith('/') && value.split('/').every(part => part && part !== '.' && part !== '..');

export function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const filename = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`심볼릭 링크는 지원하지 않습니다: ${filename}`);
    return entry.isDirectory() ? walk(filename) : [filename];
  }).sort();
}

// Vault frontmatter intentionally uses a small, dependency-free YAML subset.
// source_ids items are JSON-quoted strings, so colons and Korean paths are safe.
export function frontmatter(content, label) {
  const match = content.replace(/^\uFEFF/, '').match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error(`${label}: YAML frontmatter가 없거나 닫히지 않았습니다.`);
  const result = {};
  let current;
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const key = line.match(/^([a-zA-Z_][\w-]*):\s*(.*?)\s*$/);
    if (key) {
      current = key[1];
      if (Object.hasOwn(result, current)) throw new Error(`${label}: 중복 속성 ${current}`);
      const raw = key[2];
      if (!raw || raw === '[]') result[current] = [];
      else if (raw.startsWith('"') || raw.startsWith('[')) {
        try { result[current] = JSON.parse(raw); }
        catch { throw new Error(`${label}: 잘못된 JSON 인용 속성 ${current}`); }
      } else result[current] = raw;
      continue;
    }
    const item = line.match(/^\s+-\s+(.+?)\s*$/);
    if (item && current && Array.isArray(result[current])) {
      if (current === 'source_ids' && !item[1].startsWith('"')) throw new Error(`${label}: source_ids는 JSON 인용 문자열이어야 합니다.`);
      try { result[current].push(item[1].startsWith('"') ? JSON.parse(item[1]) : item[1]); }
      catch { throw new Error(`${label}: 잘못된 목록 항목 ${current}`); }
      continue;
    }
    throw new Error(`${label}: 지원하지 않는 frontmatter 문법: ${line}`);
  }
  if (result.source_ids !== undefined && (!Array.isArray(result.source_ids) || result.source_ids.some(id => typeof id !== 'string'))) {
    throw new Error(`${label}: source_ids는 문자열 목록이어야 합니다.`);
  }
  return result;
}

export function readNotes(root) {
  return walk(path.join(root, 'SEBU')).filter(file => file.endsWith('.md')).map(filename => {
    const relative = posix(path.relative(root, filename));
    const content = fs.readFileSync(filename, 'utf8');
    return { filename, relative, content, meta: frontmatter(content, relative) };
  });
}

export function sourceUrl(source, baseline) {
  const repo = baseline.repositories[source.repository];
  return `https://github.com/${repo.repository}/blob/${repo.commit}/${source.path.split('/').map(encodeURIComponent).join('/')}`;
}

export function sourceBlock(ids, baseline) {
  const byId = new Map(baseline.files.map(source => [source.id, source]));
  return [START, '## 근거 파일', '', ...ids.map(id => {
    const source = byId.get(id);
    if (!source) throw new Error(`출처 기준에 등록되지 않은 ID: ${id}`);
    const name = ({ B: '백엔드', F: '프론트' })[source.repository] ?? source.repository;
    return `- [${name} · ${source.path.replaceAll('[', '\\[').replaceAll(']', '\\]')}](${sourceUrl(source, baseline)})`;
  }), '', '기준 커밋은 [[SEBU 저장소와 기준 버전]]에서 확인한다.', END].join('\n');
}

export function baselineErrors(baseline) {
  const errors = [];
  if (baseline?.schemaVersion !== 1) errors.push('source-baseline: schemaVersion은 1이어야 합니다.');
  if (!isDate(baseline?.verifiedDate)) errors.push('source-baseline: verifiedDate가 올바른 날짜가 아닙니다.');
  if (!baseline?.repositories || typeof baseline.repositories !== 'object' || Array.isArray(baseline.repositories)) return [...errors, 'source-baseline: repositories가 없습니다.'];
  for (const [key, repo] of Object.entries(baseline.repositories)) {
    if (!/^[A-Z][A-Z0-9_]*$/.test(key) || !/^[\w.-]+\/[\w.-]+$/.test(repo.repository ?? '') || !repo.branch || !isHash(repo.commit)) errors.push(`source-baseline: 잘못된 저장소 정보 ${key}`);
  }
  if (!Array.isArray(baseline.files)) return [...errors, 'source-baseline: files가 배열이 아닙니다.'];
  const ids = new Set();
  for (const file of baseline.files) {
    if (!file || typeof file !== 'object') { errors.push('source-baseline: 잘못된 files 항목'); continue; }
    if (!Object.hasOwn(baseline.repositories, file.repository) || !safeRelative(file.path) || file.id !== `${file.repository}:${file.path}`) errors.push(`source-baseline: 잘못된 출처 ID/경로 ${file.id}`);
    if (ids.has(file.id)) errors.push(`source-baseline: 중복 출처 ${file.id}`);
    ids.add(file.id);
    if (!isHash(file.blob) || !/^[a-f0-9]{64}$/.test(file.sha256 ?? '')) errors.push(`source-baseline: 잘못된 blob/SHA-256 ${file.id}`);
    if (!Array.isArray(file.notes) || file.notes.length === 0 || file.notes.some(note => !safeRelative(note) || !note.startsWith('SEBU/') || !note.endsWith('.md')) || new Set(file.notes).size !== file.notes.length) errors.push(`source-baseline: 잘못된 연결 노트 ${file.id}`);
  }
  return errors;
}

export function git(directory, args, buffer = false) {
  try {
    return execFileSync('git', ['-C', directory, ...args], { encoding: buffer ? null : 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
  } catch (error) {
    const detail = error.stderr?.toString().trim() || error.message;
    throw new Error(`Git 실행 실패 (${args[0]}): ${detail}`);
  }
}

export function configuredRepositories(root, baseline) {
  const filename = path.join(root, 'sources.local.json');
  if (!fs.existsSync(filename)) throw new Error('sources.local.json이 없습니다. sources.example.json을 복사하고 각 저장소 path/ref를 설정하세요.');
  const config = readJson(filename);
  return Object.fromEntries(Object.keys(baseline.repositories).map(key => {
    const item = config.repositories?.[key];
    if (!item || typeof item.path !== 'string' || !item.path || typeof item.ref !== 'string' || !item.ref || item.ref.startsWith('-')) throw new Error(`sources.local.json: ${key}의 path/ref가 필요합니다.`);
    const directory = path.resolve(root, item.path);
    const commit = git(directory, ['rev-parse', '--verify', `${item.ref}^{commit}`]).trim();
    const dirty = git(directory, ['status', '--porcelain=v1', '-z']);
    return [key, { ...item, directory, commit, dirty }];
  }));
}

export function diffChanges(directory, before, after) {
  const fields = git(directory, ['diff', '--name-status', '-z', '--find-renames', before, after, '--']).split('\0');
  const changes = [];
  for (let index = 0; fields[index];) {
    const status = fields[index++];
    if (status.startsWith('R') || status.startsWith('C')) changes.push({ status, oldPath: fields[index++], path: fields[index++] });
    else changes.push({ status, path: fields[index++] });
  }
  return changes;
}
