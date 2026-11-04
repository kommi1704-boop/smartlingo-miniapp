import { useMemo, useState } from 'react';
import { WRITING } from '../data/writing';
import { useApp } from '../store/store';
import { addMistakes, record, submitWriting } from '../store/actions';
import { navigate } from '../lib/router';
import { checkText, improvementTips, type CheckResult, type Issue } from '../lib/writingCheck';
import { aiErrorHint, aiLeftToday, aiPost, aiUsedToday, aiWritingXpAvailable, markAiWritingXp } from '../lib/aiUsage';
import { ContentList, type ListItem } from '../components/ContentList';
import { Highlightable } from '../components/Highlightable';
import { Button, Card, Empty, LevelBadge, Notice, PageHeader, Pill, ProgressBar, ProgressRing, Section } from '../components/ui';
import { prettyDateTime } from '../lib/dates';
import { toast } from '../store/ui';
import { cx, uid, wordCount } from '../lib/utils';
import type { Mistake } from '../types';

export function WritingList() {
  const s = useApp();
  const items: ListItem[] = WRITING.map((w) => {
    const n = s.writing.filter((x) => x.promptId === w.id).length;
    return {
      id: w.id,
      title: w.title,
      subtitle: `Kamida ${w.minWords} ta so‘z`,
      level: w.level,
      emoji: '✍️',
      done: n > 0,
      status: n > 0 ? { label: `${n} marta topshirilgan`, tone: 'green' } : { label: 'Yangi', tone: 'neutral' },
    };
  });
  return (
    <div>
      <PageHeader emoji="✍️" title="Yozish" subtitle="Qisqa matnlar yozing va tezkor fikr-mulohaza oling" />
      <div className="mb-3"><Notice>Tezkor tekshiruv oddiy qoidalarga asoslangan. Bundan tashqari har bir matnni <b>AI ustoz</b> ham tekshiradi: baho, xatolar va tuzatilgan variant beradi (kuniga 5 marta).</Notice></div>
      <ContentList items={items} base="/writing" />
    </div>
  );
}

const TYPE_LABEL: Record<Issue['type'], string> = { grammar: 'Grammatika', spelling: 'Imlo', punctuation: 'Tinish belgilari', style: 'Uslub' };

const AI_TYPE_LABEL: Record<AiMistake['type'], string> = { grammar: 'Grammatika', spelling: 'Imlo', word: 'So‘z', punctuation: 'Tinish belgisi' };

interface AiMistake {
  wrong: string;
  right: string;
  type: 'grammar' | 'spelling' | 'word' | 'punctuation';
  explain_uz: string;
}

/** Mirrors the sanitized server response of /api/writing-check. */
interface AiCheck {
  score: number;
  summary_uz: string;
  praise_uz: string;
  mistakes: AiMistake[];
  corrected_text: string;
  next_tip_uz: string;
}

export function WritingPage({ id }: { id: string }) {
  const s = useApp();
  const prompt = WRITING.find((w) => w.id === id);
  const [text, setText] = useState('');
  const [result, setResult] = useState<CheckResult | null>(null);
  const [saved, setSaved] = useState<number | null>(null);
  const [showSample, setShowSample] = useState(false);
  const [ai, setAi] = useState<AiCheck | null>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiAdded, setAiAdded] = useState(false);

  const words = useMemo(() => wordCount(text), [text]);
  if (!prompt) return <Empty emoji="🤔" title="Topshiriq topilmadi" action={<Button onClick={() => navigate('/writing')}>Ro‘yxat</Button>} />;

  const past = s.writing.filter((w) => w.promptId === prompt.id).slice(-3).reverse();
  const tips = result ? improvementTips(text, prompt.minWords, prompt.keywords, result.sentences) : null;

  function check() {
    setResult(checkText(text));
    setSaved(null);
  }

  function submit() {
    const r = result ?? checkText(text);
    setResult(r);
    const xp = submitWriting(prompt!.id, text, r.words, r.issues.length, prompt!.minWords);
    setSaved(xp);
    toast(`+${xp} XP`, 'success');
  }

  function askLingo() {
    try {
      window.sessionStorage.setItem('smartlingo:tutor-prefill', `Tuzat: ${text.trim().slice(0, 600)}`);
    } catch {
      /* ignore */
    }
    navigate('/tutor');
  }

  const aiLeft = aiLeftToday('writing-check');
  const aiReady = text.trim().length >= 30 && !aiBusy && aiLeft > 0;

  /** AI teacher check; on any failure falls back to the offline rule-based checker. */
  async function runAi() {
    if (aiBusy || text.trim().length < 30) return;
    setAiBusy(true);
    try {
      const j = await aiPost<{ result: AiCheck }>('writing-check', '/api/writing-check', {
        text: text.trim(),
        level: s.profile?.estimatedLevel ?? 'A1',
        prompt: prompt!.promptEn,
      });
      setAi(j.result);
      setAiAdded(false);
      // same XP as the old flow, but only for the FIRST AI check of this prompt per day (no farming)
      if (saved === null && aiWritingXpAvailable(prompt!.id)) {
        markAiWritingXp(prompt!.id);
        const xp = words >= prompt!.minWords ? 20 : 10;
        record({ xp });
        toast(`+${xp} XP`, 'success');
      }
    } catch (e) {
      toast(aiErrorHint(e), 'warn');
      // graceful fallback: the offline rule-based result still shows
      setResult(checkText(text));
      setSaved(null);
    } finally {
      setAiBusy(false);
    }
  }

  function addToNotebook() {
    if (!ai || !ai.mistakes.length || aiAdded) return;
    const items: Mistake[] = ai.mistakes.map((m) => ({
      id: uid('m'),
      source: 'writing' as const,
      sourceTitle: prompt!.title,
      question: m.wrong,
      options: [m.wrong, m.right],
      yourAnswer: 0,
      correctAnswer: 1,
      explain: m.explain_uz || AI_TYPE_LABEL[m.type],
      date: new Date().toISOString(),
      corrected: false,
    }));
    const n = addMistakes(items);
    setAiAdded(true);
    toast(n > 0 ? `${n} ta xato daftarga qo‘shildi ✍️` : 'Bu xatolar allaqachon daftarda bor', 'success');
  }

  return (
    <div>
      <PageHeader back="/writing" emoji="✍️" title={prompt.title} subtitle={`Kamida ${prompt.minWords} ta so‘z`} right={<LevelBadge level={prompt.level} />} />
      <Card>
        <p className="text-xs font-bold uppercase tracking-wide text-muted">Topshiriq</p>
        <p className="mt-1 text-lg font-bold leading-snug">{prompt.promptEn}</p>
        <p className="mt-2 text-sm text-muted">💡 {prompt.hintUz}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {prompt.keywords.map((k) => <Pill key={k} tone="indigo">{k}</Pill>)}
        </div>
      </Card>

      <div className="mt-4">
        <label htmlFor="essay" className="mb-1.5 block text-sm font-semibold">Javobingiz (inglizcha)</label>
        <textarea
          id="essay"
          value={text}
          onChange={(e) => { setText(e.target.value); setSaved(null); }}
          rows={9}
          spellCheck={false}
          placeholder="Shu yerga yozing…"
          className="w-full resize-y rounded-2xl border-2 border-line bg-surface p-3.5 text-base leading-relaxed outline-none focus:border-indigo-500"
        />
        <div className="mt-1.5 flex items-center gap-3">
          <ProgressBar value={(words / prompt.minWords) * 100} className="flex-1" label="So‘zlar soni" color={words >= prompt.minWords ? 'bg-emerald-500' : undefined} />
          <span className={cx('text-sm font-bold tabular-nums', words >= prompt.minWords ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted')}>{words}/{prompt.minWords}</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button variant="secondary" icon="search" disabled={words < 3} onClick={check}>Tekshirish</Button>
        <Button icon="check" disabled={words < 10 || saved !== null} onClick={submit}>Topshirish</Button>
      </div>
      <div className="mt-2">
        <Button variant="secondary" icon="sparkles" full disabled={!aiReady} onClick={runAi}>
          {aiBusy ? 'AI tekshirayapti…' : aiLeft > 0 ? '✨ AI tekshirsin' : `Bugungi AI limit tugadi (${aiUsedToday('writing-check')}/5)`}
        </Button>
        <p className="mt-1.5 text-center text-xs text-muted">
          Matningiz faqat tekshirish uchun yuboriladi va saqlanmaydi · Bugun: {Math.min(aiUsedToday('writing-check'), 5)}/5 AI tekshiruv
        </p>
      </div>
      {words < 10 && <p className="mt-2 text-center text-xs text-muted">Topshirish uchun kamida 10 ta so‘z yozing.</p>}

      {saved !== null && (
        <Card className="pop-in mt-4 text-center">
          <div className="text-4xl">🎉</div>
          <p className="mt-1 font-bold">Topshirildi! +{saved} XP</p>
          <p className="text-sm text-muted">Quyida fikr-mulohaza va namunaviy javobni ko‘ring.</p>
        </Card>
      )}

      {ai && (
        <Section title="🤖 AI ustoz tekshiruvi">
          <Card className="slide-up">
            <div className="flex items-center gap-4">
              <ProgressRing value={ai.score} size={96} stroke={10}>
                <div>
                  <div className="text-xl font-extrabold">{ai.score}</div>
                  <div className="text-[10px] text-muted">100 dan</div>
                </div>
              </ProgressRing>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-snug">{ai.summary_uz}</p>
                {ai.praise_uz && <p className="mt-1.5 rounded-xl bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200">👏 {ai.praise_uz}</p>}
              </div>
            </div>

            {ai.mistakes.length === 0 ? (
              <p className="mt-3 rounded-2xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200">AI jiddiy xato topmadi — zo‘r! 🎉</p>
            ) : (
              <>
                <p className="mt-4 text-sm font-bold">AI topgan xatolar ({ai.mistakes.length})</p>
                <ul className="mt-2 space-y-2">
                  {ai.mistakes.map((m, i) => (
                    <li key={i} className="rounded-2xl border border-line p-3 text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <Pill tone={m.type === 'spelling' ? 'amber' : m.type === 'grammar' ? 'rose' : 'indigo'}>{AI_TYPE_LABEL[m.type]}</Pill>
                        <span className="font-semibold text-rose-600 dark:text-rose-300">{m.wrong}</span>
                        <span aria-hidden>→</span>
                        <span className="font-semibold text-emerald-700 dark:text-emerald-300">{m.right}</span>
                      </div>
                      {m.explain_uz && <p className="mt-1 text-muted">{m.explain_uz}</p>}
                    </li>
                  ))}
                </ul>
                <Button className="mt-3" size="sm" variant="secondary" icon="plus" disabled={aiAdded} onClick={addToNotebook}>
                  {aiAdded ? 'Daftarga qo‘shilgan ✓' : 'Xatolarni daftarga qo‘shish'}
                </Button>
              </>
            )}

            <p className="mt-4 text-sm font-bold">Tuzatilgan matn (AI)</p>
            <p className="mt-1 whitespace-pre-line rounded-2xl bg-surface2 p-3 text-sm leading-relaxed">{ai.corrected_text}</p>
            {ai.next_tip_uz && (
              <p className="mt-3 rounded-2xl bg-indigo-50 px-3 py-2.5 text-sm font-semibold text-indigo-900 dark:bg-indigo-500/10 dark:text-indigo-200">💡 Keyingi safar: {ai.next_tip_uz}</p>
            )}
            <p className="mt-2 text-[11px] text-muted">AI ham xato qilishi mumkin — savollaringiz bo‘lsa Lingo’dan so‘rang.</p>
          </Card>
        </Section>
      )}

      {result && tips && (
        <Section title="📋 Fikr-mulohaza">
          <Card>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                [result.words, 'so‘z'],
                [result.sentences, 'gap'],
                [result.issues.length, 'topilgan xato'],
              ].map(([n, l]) => (
                <div key={String(l)} className="rounded-2xl bg-surface2 py-2.5">
                  <div className="text-xl font-extrabold">{n}</div>
                  <div className="text-[11px] text-muted">{l}</div>
                </div>
              ))}
            </div>

            {result.issues.length === 0 ? (
              <p className="mt-3 rounded-2xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200">Oddiy qoidalar bo‘yicha xato topilmadi 👏 (bu tekshiruv hamma xatoni topa olmaydi).</p>
            ) : (
              <>
                <p className="mt-4 text-sm font-bold">Topilgan masalalar</p>
                <ul className="mt-2 space-y-2">
                  {result.issues.slice(0, 12).map((i, n) => (
                    <li key={n} className="rounded-2xl border border-line p-3 text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <Pill tone={i.type === 'spelling' ? 'amber' : i.type === 'grammar' ? 'rose' : 'neutral'}>{TYPE_LABEL[i.type]}</Pill>
                        <span className="font-semibold text-rose-600 dark:text-rose-300">{i.found}</span>
                        {i.suggestion && <><span aria-hidden>→</span><span className="font-semibold text-emerald-700 dark:text-emerald-300">{i.suggestion}</span></>}
                      </div>
                      <p className="mt-1 text-muted">{i.noteUz}</p>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-sm font-bold">Tuzatilgan variant (avtomatik)</p>
                <p className="mt-1 whitespace-pre-line rounded-2xl bg-surface2 p-3 text-sm leading-relaxed">{result.corrected}</p>
              </>
            )}

            <p className="mt-4 text-sm font-bold">Yaxshilash uchun takliflar</p>
            <ul className="mt-1.5 space-y-1 text-sm text-muted">
              {tips.tips.map((t) => <li key={t}>• {t}</li>)}
            </ul>
            <p className="mt-3 text-xs text-muted">Ishlatilgan bog‘lovchilar: {tips.connectorsUsed.length ? tips.connectorsUsed.join(', ') : '—'} · Tavsiya etilgan so‘zlardan: {tips.keywordsUsed.length}/{prompt.keywords.length}</p>
            <Button className="mt-3" size="sm" variant="secondary" icon="chat" onClick={askLingo}>Lingo’dan fikr so‘rash</Button>
          </Card>
        </Section>
      )}

      <Section title="📝 Namunaviy javob">
        {showSample ? (
          <Card className="slide-up"><Highlightable storeKey={`writing:${prompt.id}`} paragraphs={prompt.sample.split(/\n+/)} className="space-y-2 leading-relaxed" showHint={false} /></Card>
        ) : (
          <Button variant="secondary" icon="eye" full onClick={() => setShowSample(true)}>Namunani ko‘rsatish</Button>
        )}
      </Section>

      {past.length > 0 && (
        <Section title="🕑 Oldingi urinishlar">
          <ul className="space-y-2">
            {past.map((w) => (
              <li key={w.id} className="rounded-2xl border border-line bg-surface p-3 text-sm">
                <div className="flex justify-between text-xs text-muted"><span>{prettyDateTime(w.date)}</span><span>{w.words} so‘z · {w.issues} ta xato topilgan</span></div>
                <p className="mt-1 line-clamp-2">{w.text}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}
