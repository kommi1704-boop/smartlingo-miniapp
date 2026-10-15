import { useEffect, useRef, useState, type ReactNode } from 'react';
import { A } from '../lib/router';
import { getState, useApp } from '../store/store';
import { appendMessage, deleteConversation, newConversation, recordTutorMessage } from '../store/actions';
import { askLiveTutor, tutorIsLive } from '../lib/api';
import { demoReply, SUGGESTIONS } from '../lib/tutorDemo';
import { Button, Modal, Pill } from '../components/ui';
import { Icon } from '../components/Icon';
import { prettyDateTime } from '../lib/dates';
import { toast } from '../store/ui';
import { cx } from '../lib/utils';

const PREFILL_KEY = 'smartlingo:tutor-prefill';

export function Tutor() {
  const s = useApp();
  const p = s.profile!;
  const [activeId, setActiveId] = useState<string | null>(() => s.conversations[0]?.id ?? null);
  const [input, setInput] = useState(() => {
    try {
      const v = window.sessionStorage.getItem(PREFILL_KEY);
      if (v) window.sessionStorage.removeItem(PREFILL_KEY);
      return v ?? '';
    } catch {
      return '';
    }
  });
  const [live, setLive] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  const conv = s.conversations.find((c) => c.id === activeId);
  const messages = conv?.messages ?? [];

  useEffect(() => {
    let alive = true;
    tutorIsLive().then((v) => alive && setLive(v));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: 'end' });
  }, [messages.length, busy]);

  async function send(textRaw: string) {
    const text = textRaw.trim();
    if (!text || busy) return;
    let id = activeId;
    if (!id || !getState().conversations.some((c) => c.id === id)) {
      id = newConversation();
      setActiveId(id);
    }
    setInput('');
    appendMessage(id, { role: 'user', text });
    recordTutorMessage();

    const current = getState().conversations.find((c) => c.id === id)!;
    if (live) {
      setBusy(true);
      try {
        const history = current.messages.slice(-10).map((m) => ({ role: m.role, text: m.text }));
        const reply = await askLiveTutor({ messages: history, level: p.estimatedLevel, name: p.name, age: p.age });
        appendMessage(id, { role: 'assistant', text: reply });
      } catch {
        toast('Jonli AI hozir javob bermadi — demo javob ko‘rsatildi', 'warn');
        const d = demoReply(text, { level: p.estimatedLevel, name: p.name });
        appendMessage(id, { role: 'assistant', text: d.text, link: d.link, demo: true });
      } finally {
        setBusy(false);
      }
      return;
    }

    setBusy(true);
    const d = demoReply(text, { level: p.estimatedLevel, name: p.name, scriptId: current.scriptId, scriptStep: current.scriptStep });
    setTimeout(() => {
      appendMessage(id!, { role: 'assistant', text: d.text, link: d.link, demo: true }, { scriptId: d.scriptId, scriptStep: d.scriptStep });
      setBusy(false);
    }, 450);
  }

  function newChat() {
    setActiveId(newConversation());
    setHistoryOpen(false);
  }

  return (
    <div className="flex h-full min-h-[28rem] flex-col">
      <header className="mb-3 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl shadow">🤖</div>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-extrabold leading-tight">Lingo</h1>
          <div className="flex items-center gap-1.5">
            {live === null ? <Pill>Tekshirilmoqda…</Pill> : live ? <Pill tone="green">Jonli AI</Pill> : <Pill tone="amber">Demo rejim</Pill>}
            <span className="truncate text-xs text-muted">Darajangiz: {p.estimatedLevel}</span>
          </div>
        </div>
        <Button variant="secondary" size="sm" icon="refresh" onClick={() => setHistoryOpen(true)} aria-label="Suhbatlar tarixi">Tarix</Button>
        <Button size="sm" icon="plus" onClick={newChat} aria-label="Yangi suhbat">Yangi</Button>
      </header>

      {live === false && (
        <p className="mb-2 rounded-2xl border border-amber-300/60 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-100">
          <b>Demo rejim:</b> Lingo hozir jonli sun’iy intellekt emas — tayyor javoblar, so‘z/grammatika bazasi va oddiy qoidalar bilan ishlaydi.
        </p>
      )}

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto rounded-3xl border border-line bg-surface p-3.5" role="log" aria-live="polite" aria-label="Suhbat">
        <Bubble role="assistant" demo={live === false}>
          Salom, {p.name}! 👋 Men Lingoman. Grammatika, so‘z ma’nolari yoki inglizcha suhbat mashqi bo‘yicha yordam beraman. Pastdagi savollardan birini tanlang yoki o‘zingiz yozing.
        </Bubble>
        {messages.map((m) => (
          <Bubble key={m.id} role={m.role} demo={m.demo} link={m.link}>{m.text}</Bubble>
        ))}
        {busy && (
          <div className="flex gap-1.5 px-2 py-1" aria-label="Lingo yozmoqda">
            {[0, 1, 2].map((i) => <span key={i} className="bounce-soft h-2 w-2 rounded-full bg-indigo-400" style={{ animationDelay: `${i * 0.15}s` }} />)}
          </div>
        )}
        <div ref={bottom} />
      </div>

      {messages.length < 3 && (
        <div className="no-scrollbar mt-2.5 flex gap-2 overflow-x-auto pb-1" aria-label="Tavsiya etilgan savollar">
          {SUGGESTIONS.map((q) => (
            <button key={q} type="button" onClick={() => send(q)} className="shrink-0 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 dark:border-indigo-400/30 dark:bg-indigo-500/15 dark:text-indigo-200">
              {q}
            </button>
          ))}
        </div>
      )}

      <form
        className="mt-2.5 flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <label htmlFor="chat-input" className="sr-only">Xabar yozing</label>
        <textarea
          id="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          rows={1}
          maxLength={800}
          placeholder="Savol yoki inglizcha gap yozing…"
          className="max-h-32 min-h-[2.75rem] flex-1 resize-none rounded-2xl border-2 border-line bg-surface px-3.5 py-2.5 text-base outline-none focus:border-indigo-500"
        />
        <Button type="submit" size="lg" disabled={!input.trim() || busy} aria-label="Yuborish" className="!px-4">
          <Icon name="send" />
        </Button>
      </form>

      <Modal open={historyOpen} onClose={() => setHistoryOpen(false)} title="Suhbatlar tarixi">
        {s.conversations.length === 0 ? (
          <p className="text-sm text-muted">Hali suhbat yo‘q.</p>
        ) : (
          <ul className="space-y-2">
            {s.conversations.map((c) => (
              <li key={c.id} className={cx('flex items-center gap-2 rounded-2xl border p-3', c.id === activeId ? 'border-indigo-500' : 'border-line')}>
                <button type="button" className="min-w-0 flex-1 text-left" onClick={() => { setActiveId(c.id); setHistoryOpen(false); }}>
                  <span className="block truncate font-semibold">{c.title}</span>
                  <span className="block text-xs text-muted">{prettyDateTime(new Date(c.updatedAt).toISOString())} · {c.messages.length} ta xabar</span>
                </button>
                <button
                  type="button"
                  aria-label="Suhbatni o‘chirish"
                  className="rounded-xl p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                  onClick={() => {
                    deleteConversation(c.id);
                    if (c.id === activeId) setActiveId(null);
                  }}
                >
                  <Icon name="trash" className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <Button className="mt-4" full icon="plus" onClick={newChat}>Yangi suhbat</Button>
      </Modal>
    </div>
  );
}

function Bubble({ role, children, demo, link }: { role: 'user' | 'assistant'; children: ReactNode; demo?: boolean; link?: { label: string; route: string } }) {
  const mine = role === 'user';
  return (
    <div className={cx('flex', mine ? 'justify-end' : 'justify-start')}>
      <div className={cx('max-w-[88%] rounded-3xl px-4 py-2.5 text-[15px] leading-relaxed', mine ? 'rounded-br-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white' : 'rounded-bl-lg bg-surface2')}>
        <p className="whitespace-pre-line">{children}</p>
        {link && (
          <A to={link.route} className="mt-2 inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white">
            {link.label} <Icon name="right" className="h-3.5 w-3.5" />
          </A>
        )}
        {!mine && demo && <span className="mt-1.5 block text-[10px] font-semibold uppercase tracking-wide text-muted">Demo javob</span>}
      </div>
    </div>
  );
}
