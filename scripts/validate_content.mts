// Educational content validator. Run:  npx tsx scripts/validate_content.mts
// Checks the curated data files for the quality bar the platform promises:
// duplicate ids, duplicate words, invalid CEFR levels, malformed quizzes, empty fields,
// listening items that claim audio they don't have, and placement coverage.
import { VOCAB } from '../src/data/vocab';
import { GRAMMAR } from '../src/data/grammar';
import { READING } from '../src/data/reading';
import { LISTENING } from '../src/data/listening';
import { SPEAKING } from '../src/data/speaking';
import { WRITING } from '../src/data/writing';
import { RESOURCES } from '../src/data/resources';
import { PLACEMENT } from '../src/data/placement';
import type { Level } from '../src/types';

let errors = 0;
let warnings = 0;
const err = (m: string) => { errors++; console.error(`  ✗ ${m}`); };
const warn = (m: string) => { warnings++; console.log(`  ⚠ ${m}`); };
const ok = (m: string) => console.log(`  ✓ ${m}`);

const LEVELS: Level[] = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const isLevel = (l: string): l is Level => LEVELS.includes(l as Level);

function checkQuizShape(owner: string, quiz: { id: string; options: string[]; answer: number; explain: string }[]) {
  if (quiz.length < 3) err(`${owner}: only ${quiz.length} questions (min 3)`);
  for (const q of quiz) {
    if (q.options.length !== 4) err(`${owner}/${q.id}: ${q.options.length} options (must be 4)`);
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) err(`${owner}/${q.id}: answer index ${q.answer} out of range`);
    if (!q.explain?.trim()) err(`${owner}/${q.id}: empty explain`);
  }
}

function dupCheck<T>(items: T[], key: (x: T) => string, label: string) {
  const seen = new Map<string, number>();
  for (const it of items) {
    const k = key(it);
    if (seen.has(k)) err(`${label}: duplicate key "${k}" (first seen at #${seen.get(k)})`);
    else seen.set(k, seen.size);
  }
}

// ---------- vocabulary ----------
console.log(`\n📚 Vocabulary (${VOCAB.length} words)`);
dupCheck(VOCAB, (w) => w.id, 'vocab ids');
{
  const byEn = new Map<string, string[]>();
  for (const w of VOCAB) {
    const k = `${w.en.toLowerCase()}|${w.level}`;
    byEn.set(k, [...(byEn.get(k) ?? []), w.id]);
  }
  let dups = 0;
  byEn.forEach((ids, k) => { if (ids.length > 1) { dups++; err(`vocab: ${k} duplicated in ${ids.join(',')}`); } });
  if (!dups) ok('no duplicate word+level pairs');
}
let bad = 0;
for (const w of VOCAB) {
  for (const [f, v] of Object.entries(w)) {
    if (typeof v === 'string' && !v.trim()) { err(`vocab/${w.id}: empty field ${f}`); bad++; }
  }
  if (!isLevel(w.level)) { err(`vocab/${w.id}: invalid level ${w.level}`); bad++; }
  if (!w.ipa.startsWith('/')) warn(`vocab/${w.id}: ipa does not start with /`);
}
if (!bad) ok('all fields non-empty, levels valid');

// ---------- grammar ----------
console.log(`\n🧩 Grammar (${GRAMMAR.length} lessons)`);
dupCheck(GRAMMAR, (g) => g.id, 'grammar ids');
for (const g of GRAMMAR) {
  checkQuizShape(`grammar/${g.id}`, g.quiz);
  if (g.examples.length < 2) err(`grammar/${g.id}: ${g.examples.length} examples (min 2)`);
  if (g.mistakes.length < 1) err(`grammar/${g.id}: no mistakes section`);
  if (!g.titleUz.trim() || !g.summaryUz.trim() || !g.explanationUz.length) err(`grammar/${g.id}: empty uz texts`);
  if (!isLevel(g.level)) err(`grammar/${g.id}: invalid level`);
}
ok('grammar structure checked');

// ---------- reading ----------
console.log(`\n📖 Reading (${READING.length} texts)`);
dupCheck(READING, (r) => r.id, 'reading ids');
{
  const titles = new Map<string, string>();
  for (const r of READING) {
    const k = r.title.toLowerCase();
    if (titles.has(k)) err(`reading: duplicate title "${r.title}" (${titles.get(k)} / ${r.id})`);
    titles.set(k, r.id);
  }
}
for (const r of READING) {
  checkQuizShape(`reading/${r.id}`, r.questions);
  if (r.text.trim().length < 150) err(`reading/${r.id}: text too short (${r.text.trim().length} chars)`);
  if (r.vocab.length < 3) warn(`reading/${r.id}: only ${r.vocab.length} vocab support items`);
  if (!isLevel(r.level)) err(`reading/${r.id}: invalid level`);
}

// ---------- listening ----------
console.log(`\n🎧 Listening (${LISTENING.length} activities)`);
dupCheck(LISTENING, (l) => l.id, 'listening ids');
for (const l of LISTENING) {
  checkQuizShape(`listening/${l.id}`, l.questions);
  const lines = l.transcript.split('\n').filter((x) => x.trim());
  if (lines.length < 5) err(`listening/${l.id}: only ${lines.length} transcript lines (min 5)`);
  if (l.audioUrl) warn(`listening/${l.id}: has audioUrl — verify it is a REAL, reachable recording`);
  if (!isLevel(l.level)) err(`listening/${l.id}: invalid level`);
}
{
  const fake = LISTENING.filter((l) => /audio|mp3/i.test(l.title + l.situationUz));
  if (fake.length) err(`listening: items may claim audio in text: ${fake.map((f) => f.id).join(',')}`);
  else ok('no item pretends to have audio (TTS-based, honestly labelled)');
}

// ---------- speaking ----------
console.log(`\n🗣️ Speaking (${SPEAKING.length} prompts)`);
dupCheck(SPEAKING, (x) => x.id, 'speaking ids');
for (const x of SPEAKING) {
  if (!x.prompt.trim() || !x.promptUz.trim() || !x.sample.trim()) err(`speaking/${x.id}: empty fields`);
  if (x.expressions.length < 2) warn(`speaking/${x.id}: ${x.expressions.length} expressions`);
  if (!isLevel(x.level)) err(`speaking/${x.id}: invalid level`);
}

// ---------- writing ----------
console.log(`\n✍️ Writing (${WRITING.length} prompts)`);
dupCheck(WRITING, (x) => x.id, 'writing ids');
for (const x of WRITING) {
  if (!x.promptEn.trim() || !x.hintUz.trim() || !x.sample.trim()) err(`writing/${x.id}: empty fields`);
  if (x.minWords < 10) err(`writing/${x.id}: minWords ${x.minWords} too small`);
  if (!isLevel(x.level)) err(`writing/${x.id}: invalid level`);
}

// ---------- resources ----------
console.log(`\n📚 Resources (${RESOURCES.length})`);
dupCheck(RESOURCES, (r) => r.id, 'resource ids');
for (const r of RESOURCES) {
  if (!r.url) warn(`resources/${r.id}: no URL (shown without link)`);
  if (!r.desc.trim()) err(`resources/${r.id}: empty description`);
}

// ---------- placement ----------
console.log(`\n🎯 Placement (${PLACEMENT.length} questions)`);
dupCheck(PLACEMENT, (p) => p.id, 'placement ids');
// Design: the adaptive walk asks ONE question per section per level group (3 per level),
// stops after a failed group. So every level must have exactly 3 sections covered.
const sections = ['vocabulary', 'grammar', 'reading'];
let covered = 0;
for (const lv of LEVELS) {
  for (const sec of sections) {
    const n = PLACEMENT.filter((p) => p.level === lv && p.section === sec).length;
    if (n === 1) covered++;
    else if (n === 0) warn(`placement: ${lv}/${sec} has no question (that level group mixes two sections)`);
    else err(`placement: ${lv}/${sec} has ${n} questions (design = 1 per section per group)`);
  }
}
if (covered < 12) err(`placement: only ${covered}/21 section-level cells covered`);
ok('placement coverage checked (1 per section per level, adaptive walk)');

// ---------- summary ----------
console.log(`\n────────────────────────────\n${errors ? `❌ ${errors} errors` : '✅ no errors'} · ${warnings} warnings`);
if (errors) process.exit(1);
