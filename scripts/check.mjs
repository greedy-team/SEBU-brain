import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { START, END, baselinePath, baselineErrors, frontmatter, isDate, posix, readJson, safeRelative, sourceBlock, walk } from './lib.mjs';

const prose = text => text.replace(/^```[^\n]*\n[\s\S]*?^```[^\n]*$/gm, '').replace(/`[^`\n]*`/g, '');
const stripExtension = filename => filename.replace(/\.(?:md|canvas)$/, '');
const privatePath = /(?:\b[A-Za-z]:[\\/]|[Ff][Ii][Ll][Ee]:\/\/|\/Users\/[^/\s]+|\/home\/[^/\s]+|\\\\[^\s\\]+\\)/;

export function validate(root) {
  const errors = [];
  const all = walk(path.join(root, 'SEBU'));
  const paths = new Set(all.map(filename => posix(path.relative(root, filename))));
  const notes = new Map();
  const titles = new Map();
  const targets = new Map();
  const contentFiles = all.filter(filename => /\.(md|canvas)$/.test(filename));
  for (const filename of contentFiles) {
    const relative = posix(path.relative(root, filename));
    const stem = path.basename(filename, path.extname(filename));
    const key = stem.normalize('NFC').toLocaleLowerCase('en-US');
    if (titles.has(key)) errors.push(`중복 제목: ${relative} / ${titles.get(key)}`);
    titles.set(key, relative);
    for (const alias of [relative, stripExtension(relative), path.basename(relative), stem]) {
      const existing = targets.get(alias);
      if (existing && existing !== relative) errors.push(`모호한 링크 이름: ${alias}`);
      targets.set(alias, relative);
    }
    const content = fs.readFileSync(filename, 'utf8');
    if (privatePath.test(content)) errors.push(`${relative}: 개인 절대 경로 또는 file:// 링크가 남아 있습니다.`);
    if (!filename.endsWith('.md')) continue;
    try {
      const meta = frontmatter(content, relative);
      if (meta.project !== 'SEBU') errors.push(`${relative}: project는 SEBU여야 합니다.`);
      for (const required of ['type', 'status']) if (typeof meta[required] !== 'string' || !meta[required]) errors.push(`${relative}: ${required} 문자열이 필요합니다.`);
      for (const field of ['created', 'verified']) if (!isDate(meta[field])) errors.push(`${relative}: ${field} 날짜가 올바르지 않습니다.`);
      if (!new RegExp(`^# ${stem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'm').test(content)) errors.push(`${relative}: 파일 이름과 일치하는 H1 제목이 필요합니다.`);
      if (new Set(meta.source_ids ?? []).size !== (meta.source_ids ?? []).length) errors.push(`${relative}: source_ids에 중복이 있습니다.`);
      notes.set(relative, { meta, content });
    } catch (error) { errors.push(error.message); }
  }
  if (!notes.size) errors.push('SEBU/ 아래에 지식 노트가 없습니다.');

  function links(content, label) {
    for (const match of prose(content).matchAll(/(?<!!)!?\[\[([^\]\n]+)\]\]/g)) {
      const value = match[1].split('|')[0].split('#')[0].trim();
      if (!value) continue; // A heading link in the current note.
      if (!targets.has(value)) errors.push(`${label}: 깨진 위키링크 [[${value}]]`);
    }
  }
  function markdownLinks(content, label) {
    for (const match of prose(content).matchAll(/!?\[[^\]\n]*\]\((?:<([^>]+)>|([^\s)]+))(?:\s+"[^"]*")?\)/g)) {
      const raw = match[1] ?? match[2];
      if (/^[a-z][a-z\d+.-]*:/i.test(raw) || raw.startsWith('#')) continue;
      let target;
      try { target = decodeURIComponent(raw.split('#')[0].split('?')[0]); }
      catch { errors.push(`${label}: 잘못된 링크 인코딩 ${raw}`); continue; }
      const resolved = path.resolve(root, path.dirname(label), target);
      const within = path.relative(root, resolved);
      if (within.startsWith('..') || path.isAbsolute(within) || !fs.existsSync(resolved)) errors.push(`${label}: 깨진 상대 링크 ${raw}`);
    }
  }
  for (const [label, { content }] of notes) { links(content, label); markdownLinks(content, label); }
  for (const label of fs.readdirSync(root).filter(filename => filename.endsWith('.md'))) {
    const content = fs.readFileSync(path.join(root, label), 'utf8');
    markdownLinks(content, label);
    links(content, label);
    if (privatePath.test(content)) errors.push(`${label}: 개인 절대 경로 또는 file:// 링크가 남아 있습니다.`);
  }
  for (const filename of all.filter(file => file.endsWith('.canvas'))) {
    const label = posix(path.relative(root, filename));
    try {
      const canvas = readJson(filename);
      if (!Array.isArray(canvas.nodes) || !Array.isArray(canvas.edges)) throw new Error('nodes와 edges 배열이 필요합니다.');
      const nodes = new Set();
      for (const node of canvas.nodes) {
        if (typeof node.id !== 'string' || !node.id || nodes.has(node.id)) errors.push(`${label}: 없거나 중복된 Canvas node ID ${node.id}`);
        nodes.add(node.id);
        if (node.type === 'file' && (!safeRelative(node.file) || !node.file.startsWith('SEBU/') || !paths.has(node.file))) errors.push(`${label}: 깨진 Canvas file 경로 ${node.file}`);
        if (node.type === 'text') links(node.text ?? '', label);
      }
      const edges = new Set();
      for (const edge of canvas.edges) {
        if (typeof edge.id !== 'string' || !edge.id || edges.has(edge.id)) errors.push(`${label}: 없거나 중복된 Canvas edge ID ${edge.id}`);
        edges.add(edge.id);
        if (!nodes.has(edge.fromNode) || !nodes.has(edge.toNode)) errors.push(`${label}: 존재하지 않는 node를 연결한 Canvas edge ${edge.id}`);
      }
    } catch (error) { errors.push(`${label}: Canvas 오류: ${error.message}`); }
  }

  try {
    const baseline = readJson(path.join(root, baselinePath));
    const schemaErrors = baselineErrors(baseline);
    errors.push(...schemaErrors);
    if (!schemaErrors.length) {
      const sources = new Map(baseline.files.map(source => [source.id, source]));
      for (const [label, { meta, content }] of notes) {
        const ids = meta.source_ids ?? [];
        for (const id of ids) {
          const source = sources.get(id);
          if (!source) errors.push(`${label}: 기준 파일에 없는 출처 ${id}`);
          else if (!source.notes.includes(label)) errors.push(`${label}: 출처 ${id}의 역방향 노트 연결이 없습니다.`);
        }
        const starts = content.split(START).length - 1;
        const ends = content.split(END).length - 1;
        if (starts !== ends || starts > 1 || (ids.length && starts !== 1) || (starts && content.indexOf(END) < content.indexOf(START))) errors.push(`${label}: 근거 링크 블록이 없거나 중복/손상되었습니다.`);
        else if (starts === 1 && ids.every(id => sources.has(id))) {
          const block = content.slice(content.indexOf(START), content.indexOf(END) + END.length).replaceAll('\r\n', '\n');
          if (block !== sourceBlock(ids, baseline)) errors.push(`${label}: 근거 링크 블록이 기준 커밋 또는 source_ids와 다릅니다.`);
        }
      }
      for (const source of baseline.files) {
        for (const label of source.notes) {
          if (!notes.has(label)) errors.push(`${source.id}: 존재하지 않는 연결 노트 ${label}`);
          else if (!(notes.get(label).meta.source_ids ?? []).includes(source.id)) errors.push(`${source.id}: 노트 ${label}에 source_ids 연결이 없습니다.`);
        }
      }
    }
  } catch (error) { errors.push(`source-baseline: ${error.message}`); }
  return { errors, notes: notes.size, canvases: all.filter(file => file.endsWith('.canvas')).length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = validate(process.cwd());
    for (const error of result.errors) console.error(`ERROR ${error}`);
    if (result.errors.length) {
      console.error(`검증 실패: ${result.errors.length}개 오류`);
      process.exitCode = 1;
    } else console.log(`검증 완료: 노트 ${result.notes}개, Canvas ${result.canvases}개, 근거/링크/경로 정상`);
  } catch (error) { console.error(`ERROR ${error.message}`); process.exitCode = 2; }
}
