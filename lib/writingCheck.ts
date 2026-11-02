// Simple RULE-BASED checker for English text written by learners.
// It is NOT an AI model and does not understand meaning: it only catches common, predictable mistakes.

export interface Issue {
  type: 'grammar' | 'spelling' | 'punctuation' | 'style';
  found: string;
  suggestion: string; // '' for hints without an automatic fix
  noteUz: string;
}

export interface CheckResult {
  issues: Issue[];
  corrected: string;
  words: number;
  sentences: number;
}

const MISSPELL: Record<string, string> = {
  recieve: 'receive', definately: 'definitely', definitly: 'definitely', freind: 'friend', frend: 'friend',
  becuse: 'because', becouse: 'because', beacuse: 'because', teh: 'the', wich: 'which', thier: 'their',
  beleive: 'believe', tomorow: 'tomorrow', tommorow: 'tomorrow', tommorrow: 'tomorrow', diffrent: 'different',
  intresting: 'interesting', interesing: 'interesting', wensday: 'Wednesday', wendsday: 'Wednesday',
  goverment: 'government', enviroment: 'environment', seperate: 'separate', occured: 'occurred', untill: 'until',
  alot: 'a lot', realy: 'really', verry: 'very', writting: 'writing', speach: 'speech', peple: 'people',
  peopel: 'people', scool: 'school', shcool: 'school', skool: 'school', beutiful: 'beautiful', beatiful: 'beautiful',
  importent: 'important', langauge: 'language', languege: 'language', libary: 'library', wonderfull: 'wonderful',
  sucess: 'success', adress: 'address', necesary: 'necessary', neccessary: 'necessary', tecnology: 'technology',
  technolgy: 'technology', comunicate: 'communicate', comunication: 'communication', favourit: 'favourite',
  excersise: 'exercise', exersise: 'exercise', mathmatics: 'mathematics', hollidays: 'holidays', holliday: 'holiday',
  vacaton: 'vacation', schedual: 'schedule', questoin: 'question', anwser: 'answer', ansewr: 'answer',
  grammer: 'grammar', gramar: 'grammar', vocabulery: 'vocabulary', vocabolary: 'vocabulary', eveyone: 'everyone',
  everyting: 'everything', somthing: 'something', becomming: 'becoming', begining: 'beginning', finaly: 'finally',
  usualy: 'usually', actualy: 'actually', probaly: 'probably', prefered: 'preferred', calender: 'calendar',
  freinds: 'friends', familly: 'family', sistr: 'sister', brothr: 'brother', mothr: 'mother', fathr: 'father',
};

const PROPER = /\b(english|uzbek|uzbekistan|tashkent|samarkand|bukhara|monday|tuesday|wednesday|thursday|friday|saturday|sunday|january|february|april|june|july|august|september|october|november|december|russian|turkish|german|french|spanish|chinese|korean)\b/g;

const AUX = new Set([
  'will', 'can', 'could', 'should', 'would', 'must', 'may', 'might', 'shall', 'does', 'did', 'do', "don't", "doesn't",
  "didn't", 'to', 'let', 'help', 'makes', 'make', 'made', 'if', 'whether', 'how', 'what', 'why', 'when', 'where', 'who',
]);

const PAST_MARKER = /\b(yesterday|ago|last (night|week|month|year|summer|weekend|monday|tuesday|wednesday|thursday|friday|saturday|sunday)|when i was|in 19\d\d|in 20[01]\d)\b/i;

const PAST_TO_BASE: Record<string, string> = {
  went: 'go', saw: 'see', ate: 'eat', had: 'have', came: 'come', made: 'make', took: 'take', got: 'get', gave: 'give',
  bought: 'buy', wrote: 'write', spoke: 'speak', knew: 'know', thought: 'think', said: 'say', told: 'tell', found: 'find',
  left: 'leave', met: 'meet', ran: 'run', sat: 'sit', stood: 'stand', slept: 'sleep', swam: 'swim', drank: 'drink',
  was: 'be', were: 'be', did: 'do',
};

const A_EXC = /^(uni|use|usu|usi|eu|one|once|ut|uk|ur)/i;
const AN_EXC = /^(hour|honest|honor|honour|heir)/i;

function conjugate(verb: string): string {
  const v = verb.toLowerCase();
  if (v === 'have') return 'has';
  if (v === 'do') return 'does';
  if (v === 'go') return 'goes';
  if (/(s|sh|ch|x|z|o)$/.test(v)) return `${v}es`;
  if (/[^aeiou]y$/.test(v)) return `${v.slice(0, -1)}ies`;
  return `${v}s`;
}

const THIRD_VERBS =
  'go|do|play|like|want|live|work|study|eat|watch|speak|need|love|make|take|come|get|see|know|think|say|have|help|use|run|walk|enjoy|learn|teach|write|sing|drink|sleep|start|finish|visit|wake|travel|talk|call|try|ask|give|tell|feel|look|seem|listen|cook|clean|swim|dance|draw|buy|bring|find|keep|leave|meet|pay|sit|stand|stay|wear|win';

function sentenceAround(str: string, offset: number): string {
  let a = offset;
  while (a > 0 && !/[.!?\n]/.test(str[a - 1])) a--;
  let b = offset;
  while (b < str.length && !/[.!?\n]/.test(str[b])) b++;
  return str.slice(a, b);
}

function prevWord(str: string, offset: number): string {
  const m = str.slice(0, offset).match(/([A-Za-z’']+)\s*$/);
  return m ? m[1].toLowerCase().replace('’', "'") : '';
}

type Maker = (g: string[], full: string, offset: number) => { replacement: string | null; suggestion: string } | null;
interface Rule {
  type: Issue['type'];
  re: RegExp;
  make: Maker;
  note: string;
}

const keepCase = (orig: string, repl: string) => (orig[0] && orig[0] === orig[0].toUpperCase() && orig[0] !== orig[0].toLowerCase() ? repl[0].toUpperCase() + repl.slice(1) : repl);

const RULES: Rule[] = [
  {
    type: 'grammar',
    re: new RegExp(`\\b(he|she|it)\\s+(${THIRD_VERBS})\\b`, 'gi'),
    note: 'he / she / it dan keyin Present Simple da fe’lga -s / -es qo‘shiladi.',
    make: (g, full, off) => {
      if (AUX.has(prevWord(full, off))) return null;
      if (PAST_MARKER.test(sentenceAround(full, off))) return null;
      const out = `${g[0]} ${conjugate(g[1])}`;
      return { replacement: out, suggestion: out };
    },
  },
  {
    type: 'grammar',
    re: /\b(he|she|it)\s+(don't|dont|do not)\b/gi,
    note: 'he / she / it bilan inkor shakli doesn’t bo‘ladi.',
    make: (g) => ({ replacement: `${g[0]} doesn't`, suggestion: `${g[0]} doesn't` }),
  },
  {
    type: 'grammar',
    re: /\b(I|you|we|they)\s+(doesn't|doesnt|does not)\b/gi,
    note: 'I / you / we / they bilan inkor shakli don’t bo‘ladi.',
    make: (g) => ({ replacement: `${g[0]} don't`, suggestion: `${g[0]} don't` }),
  },
  {
    type: 'grammar',
    re: /\b(I|you|we|they)\s+has\b/gi,
    note: 'I / you / we / they bilan have ishlatiladi (has faqat he / she / it bilan).',
    make: (g) => ({ replacement: `${g[0]} have`, suggestion: `${g[0]} have` }),
  },
  {
    type: 'grammar',
    re: /\bI\s+(is|are)\b/g,
    note: '“I” bilan faqat am ishlatiladi: I am.',
    make: () => ({ replacement: 'I am', suggestion: 'I am' }),
  },
  {
    type: 'grammar',
    re: /\b(you|we|they)\s+(is|am)\b/gi,
    note: 'you / we / they bilan are ishlatiladi.',
    make: (g) => ({ replacement: `${g[0]} are`, suggestion: `${g[0]} are` }),
  },
  {
    type: 'grammar',
    re: /\b(he|she|it)\s+(are|am)\b/gi,
    note: 'he / she / it bilan is ishlatiladi.',
    make: (g) => ({ replacement: `${g[0]} is`, suggestion: `${g[0]} is` }),
  },
  {
    type: 'grammar',
    re: /\bpeople\s+is\b/gi,
    note: '“people” ko‘plik: people are.',
    make: (g) => ({ replacement: keepCase(g[0], 'people are'), suggestion: 'people are' }),
  },
  {
    type: 'grammar',
    re: /\bI\s+am\s+agree\b/gi,
    note: '“agree” — fe’l, shuning uchun am kerak emas: I agree.',
    make: () => ({ replacement: 'I agree', suggestion: 'I agree' }),
  },
  {
    type: 'grammar',
    re: /\bmore\s+(better|worse|bigger|easier|faster|smaller|taller|older|younger|cheaper|happier|harder|stronger)\b/gi,
    note: 'Qiyosiy darajada ikki marta ishlatilmaydi: “more better” emas, “better”.',
    make: (g) => ({ replacement: g[0], suggestion: g[0] }),
  },
  {
    type: 'grammar',
    re: /\bmost\s+(best|worst|biggest|easiest|fastest|oldest|youngest)\b/gi,
    note: 'Orttirma darajada ikki marta ishlatilmaydi: “most best” emas, “best”.',
    make: (g) => ({ replacement: g[0], suggestion: g[0] }),
  },
  {
    type: 'grammar',
    re: /\bI\s+very\s+(like|love|enjoy)\b/gi,
    note: '“very” fe’l oldidan kelmaydi: I really like / I like … very much.',
    make: (g) => ({ replacement: `I really ${g[0]}`, suggestion: `I really ${g[0]}` }),
  },
  {
    type: 'grammar',
    re: /\b(did|didn't|didnt|don't|dont|doesn't|doesnt|can|can't|cannot|will|won't|should|must)\s+(went|saw|ate|had|came|made|took|got|gave|was|were|bought|wrote|spoke|knew|thought|said|told|found|left|met|ran|sat|stood|slept|swam|drank)\b/gi,
    note: 'did / didn’t / can / will dan keyin fe’lning asosiy (birinchi) shakli keladi.',
    make: (g) => ({ replacement: `${g[0]} ${PAST_TO_BASE[g[1].toLowerCase()] ?? g[1]}`, suggestion: `${g[0]} ${PAST_TO_BASE[g[1].toLowerCase()] ?? g[1]}` }),
  },
  {
    type: 'grammar',
    re: /\b(a)\s+([aeiouAEIOU][A-Za-z]*)\b/g,
    note: 'Unli tovushdan boshlanadigan so‘z oldidan an ishlatiladi.',
    make: (g) => (A_EXC.test(g[1]) ? null : { replacement: `an ${g[1]}`, suggestion: `an ${g[1]}` }),
  },
  {
    type: 'grammar',
    re: /\b(an)\s+([bcdfghjklmnpqrstvwxyz][a-z]+)\b/g,
    note: 'Undosh tovushdan boshlanadigan so‘z oldidan a ishlatiladi.',
    make: (g) => (AN_EXC.test(g[1]) ? null : { replacement: `a ${g[1]}`, suggestion: `a ${g[1]}` }),
  },
  {
    type: 'grammar',
    re: /\bin\s+(?:the\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi,
    note: 'Hafta kunlari bilan on ishlatiladi: on Monday.',
    make: (g) => ({ replacement: `on ${g[0]}`, suggestion: `on ${g[0]}` }),
  },
  {
    type: 'grammar',
    re: /\bI\s+have\s+(\d{1,2})\s+years?(?:\s+old)?\b/gi,
    note: 'Ingliz tilida yosh “to be” bilan aytiladi: I am 12 years old.',
    make: (g) => ({ replacement: `I am ${g[0]} years old`, suggestion: `I am ${g[0]} years old` }),
  },
  {
    type: 'grammar',
    re: /\bmuch\s+(people|friends|books|students|children|things|apples|words|games|cars)\b/gi,
    note: 'Sanaladigan otlar bilan many ishlatiladi.',
    make: (g) => ({ replacement: `many ${g[0]}`, suggestion: `many ${g[0]}` }),
  },
  {
    type: 'grammar',
    re: /\b(informations|advices|furnitures|homeworks|knowledges|childs|peoples)\b/gi,
    note: 'Bu so‘zning bunday ko‘pligi yo‘q (information, advice, furniture, homework — sanalmaydi; child → children; people allaqachon ko‘plik).',
    make: (g) => {
      const map: Record<string, string> = { informations: 'information', advices: 'advice', furnitures: 'furniture', homeworks: 'homework', knowledges: 'knowledge', childs: 'children', peoples: 'people' };
      const fix = map[g[0].toLowerCase()];
      return { replacement: keepCase(g[0], fix), suggestion: fix };
    },
  },
  {
    type: 'grammar',
    re: /\b(yesterday|last (?:night|week|month|year|summer|weekend))\b([^.!?\n]*?)\b(I|we|they|he|she)\s+(go|eat|see|have|play|watch|visit|buy|make|take|come|get|meet)\b/gi,
    note: 'O‘tgan vaqtni bildiruvchi so‘z bor — ehtimol Past Simple kerak (went, ate, saw …).',
    make: () => ({ replacement: null, suggestion: '' }),
  },
  {
    type: 'grammar',
    re: /\b(I|we|they|he|she|it)\s+(go|eat|see|have|play|watch|visit|buy|make|take|come|get|meet)\b([^.!?\n]*?)\b(yesterday|ago|last (?:night|week|month|year|summer|weekend))\b/gi,
    note: 'O‘tgan vaqtni bildiruvchi so‘z bor (yesterday, ago, last …) — ehtimol Past Simple kerak: went, ate, saw, had …',
    make: () => ({ replacement: null, suggestion: '' }),
  },
];

function applyRule(text: string, rule: Rule, issues: Issue[]): string {
  return text.replace(rule.re, (...args: unknown[]) => {
    const match = args[0] as string;
    const offset = args[args.length - 2] as number;
    const full = args[args.length - 1] as string;
    const groups = args.slice(1, args.length - 2) as string[];
    const r = rule.make(groups.length ? groups : [match], full, offset);
    if (!r) return match;
    issues.push({ type: rule.type, found: match, suggestion: r.suggestion, noteUz: rule.note });
    return r.replacement ?? match;
  });
}

export function checkText(input: string): CheckResult {
  const issues: Issue[] = [];
  let out = input;

  // collapse double spaces
  out = out.replace(/[ \t]{2,}/g, (m) => {
    issues.push({ type: 'style', found: '(ikki bo‘sh joy)', suggestion: '(bitta bo‘sh joy)', noteUz: 'So‘zlar orasida bitta bo‘sh joy bo‘lsin.' });
    return ' ';
  });

  // repeated words
  out = out.replace(/\b([A-Za-z]+)\s+\1\b/gi, (m, w: string) => {
    if (/^(had|that)$/i.test(w)) return m;
    issues.push({ type: 'style', found: m, suggestion: w, noteUz: 'Bir xil so‘z ketma-ket takrorlangan.' });
    return w;
  });

  // misspellings
  out = out.replace(/\b[A-Za-z]+\b/g, (w) => {
    const fix = MISSPELL[w.toLowerCase()];
    if (!fix) return w;
    const rep = keepCase(w, fix);
    issues.push({ type: 'spelling', found: w, suggestion: rep, noteUz: 'Imlo xatosi bo‘lishi mumkin.' });
    return rep;
  });

  // proper nouns / days / months written in lower case
  out = out.replace(PROPER, (w) => {
    const rep = w[0].toUpperCase() + w.slice(1);
    issues.push({ type: 'spelling', found: w, suggestion: rep, noteUz: 'Davlat, til, hafta kuni va oy nomlari bosh harf bilan yoziladi.' });
    return rep;
  });

  // grammar rules
  for (const rule of RULES) out = applyRule(out, rule, issues);

  // lone "i"
  out = out.replace(/(^|[^A-Za-z.'’])i(?=[\s,.!?;:]|$)/g, (m, pre: string) => {
    issues.push({ type: 'grammar', found: 'i', suggestion: 'I', noteUz: '“I” (men) har doim bosh harfda yoziladi.' });
    return `${pre}I`;
  });

  // paragraph-level: capital at sentence start & end punctuation
  out = out
    .split('\n')
    .map((par) => {
      if (!par.trim()) return par;
      let p = par.replace(/(^\s*|[.!?]\s+)([a-z])/g, (m, pre: string, ch: string) => {
        issues.push({ type: 'punctuation', found: ch, suggestion: ch.toUpperCase(), noteUz: 'Gap bosh harf bilan boshlanadi.' });
        return `${pre}${ch.toUpperCase()}`;
      });
      if (!/[.!?…"”')]\s*$/.test(p)) {
        issues.push({ type: 'punctuation', found: '(gap oxiri)', suggestion: '.', noteUz: 'Gap oxirida nuqta (yoki ? !) qo‘yiladi.' });
        p = `${p.trimEnd()}.`;
      }
      return p;
    })
    .join('\n');

  const wordsArr = out.match(/[A-Za-z’']+(?:-[A-Za-z]+)*/g) ?? [];
  const sentences = (out.match(/[^.!?]+[.!?]+/g) ?? []).length || (out.trim() ? 1 : 0);
  return { issues, corrected: out, words: wordsArr.length, sentences };
}

const CONNECTORS = ['and', 'but', 'because', 'so', 'also', 'however', 'then', 'although', 'while', 'when', 'after', 'before', 'first', 'finally', 'for example', 'in my opinion', 'on the other hand', 'moreover', 'therefore'];

export interface Suggestions {
  uniqueRatio: number;
  avgSentenceLen: number;
  connectorsUsed: string[];
  keywordsUsed: string[];
  tips: string[];
}

export function improvementTips(text: string, minWords: number, keywords: string[], sentences: number): Suggestions {
  const words = (text.toLowerCase().match(/[a-z’']+/g) ?? []).filter(Boolean);
  const uniq = new Set(words);
  const uniqueRatio = words.length ? uniq.size / words.length : 0;
  const avg = sentences ? words.length / sentences : 0;
  const lower = ` ${text.toLowerCase()} `;
  const connectorsUsed = CONNECTORS.filter((c) => lower.includes(` ${c} `) || lower.includes(` ${c},`));
  const keywordsUsed = keywords.filter((k) => lower.includes(k.toLowerCase()));
  const tips: string[] = [];
  if (words.length < minWords) tips.push(`Matn hali qisqa: kamida ${minWords} ta so‘z yozing (hozir ${words.length} ta).`);
  if (connectorsUsed.length < 2) tips.push('Gaplarni bog‘lovchilar bilan ulang: and, but, because, however, also.');
  if (avg > 0 && avg < 7) tips.push('Gaplar juda qisqa. Ba’zilarini “because” yoki “but” bilan kengaytirib ko‘ring.');
  if (avg > 24) tips.push('Gaplar juda uzun. Ularni ikkiga bo‘lish o‘qishni osonlashtiradi.');
  if (words.length >= 40 && uniqueRatio < 0.5) tips.push('Bir xil so‘zlar ko‘p takrorlanmoqda. Sinonimlardan foydalaning (good → great, nice, wonderful).');
  if (keywords.length && keywordsUsed.length < 2) tips.push(`Tavsiya etilgan so‘zlardan kamida 2 tasini ishlatib ko‘ring: ${keywords.slice(0, 4).join(', ')}.`);
  if (!tips.length) tips.push('Yaxshi! Endi namunaviy javob bilan solishtirib, yangi iboralarni oling.');
  return { uniqueRatio, avgSentenceLen: avg, connectorsUsed, keywordsUsed, tips };
}
