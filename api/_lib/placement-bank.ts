// CEFR placement bank + deterministic adaptive grading (Phase 1).
//
// The answer key NEVER leaves the server: the client receives questions only
// ({id, level, section, q, options, passage}) and submits picked indexes.
// Grading, the adaptive walk, the confidence estimate and the skill report
// are all computed here — the AI model is never allowed to assign a level.
//
// Adaptive session is stateless: the client posts the answers it has so far,
// the server re-grades everything each call (same input -> same result).
// 63 calibrated items: 3 sections (vocabulary / grammar / reading) × 3 per
// CEFR level (Pre-A1 .. C2). PASS_MARK = 2 of 3 per level group.

export type Level = 'Pre-A1' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export const LEVELS: Level[] = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
export type Section = 'vocabulary' | 'grammar' | 'reading';

export interface BankItem {
  id: string;
  level: Level;
  section: Section;
  passage?: string;
  q: string;
  options: string[];
  answer: number; // index into options — server-side only
  explain: string;
}

export interface PublicQuestion {
  id: string;
  level: Level;
  section: Section;
  passage?: string;
  q: string;
  options: string[];
}

export interface Answered {
  id: string;
  picked: number; // -1 = "Bilmayman" (skip counts as wrong)
}

export interface GroupScore {
  level: Level;
  correct: number;
  asked: number;
  passed: boolean;
}

export interface SkillScore {
  section: Section;
  correct: number;
  asked: number;
  accuracy: number; // 0..1
  verdict: 'strength' | 'ok' | 'weak';
}

export interface PlacementResult {
  level: Level;
  bySection: Record<Section, { correct: number; asked: number }>;
  total: number;
  asked: number;
  groups: GroupScore[];
  skills: SkillScore[];
  strengths: Section[];
  weaknesses: Section[];
  confidence: 'low' | 'medium' | 'high';
  flags: string[]; // e.g. 'pattern' (answer-position guessing), 'inconsistent'
  advice: Record<Section, string>;
}

export const PASS_MARK = 2; // 2 of 3 correct in a level group
const GROUP_SIZE = 3;

// ---------------------------------------------------------------------------
// The bank — 3 questions per section per level, easy -> hard inside a level.
// Reuses the 21 items of the original client bank (ids kept stable) and adds
// 42 calibrated items so a level group can fail on real evidence, not luck.
// ---------------------------------------------------------------------------

const B: BankItem[] = [
  // ---------- Pre-A1 ----------
  { id: 'p-Pre-A1-vocabulary', level: 'Pre-A1', section: 'vocabulary', q: 'Which word is an animal?', options: ['book', 'dog', 'chair', 'apple'], answer: 1, explain: '“Dog” — it degani, qolgan so‘zlar kitob, stul va olma.' },
  { id: 'p-Pre-A1-vocabulary-2', level: 'Pre-A1', section: 'vocabulary', q: 'Which one is a colour?', options: ['dog', 'red', 'run', 'milk'], answer: 1, explain: '“Red” — qizil rang; qolganlari hayvon, harakat va ichimlik.' },
  { id: 'p-Pre-A1-vocabulary-3', level: 'Pre-A1', section: 'vocabulary', q: 'What do you drink?', options: ['water', 'chair', 'shoe', 'door'], answer: 0, explain: 'Suv ichimlik; stul, poyafzal va eshik ichimlik emas.' },
  { id: 'p-Pre-A1-grammar', level: 'Pre-A1', section: 'grammar', q: 'I ___ a student.', options: ['am', 'is', 'are', 'be'], answer: 0, explain: '“I” bilan doimo “am” ishlatiladi: I am a student.' },
  { id: 'p-Pre-A1-grammar-2', level: 'Pre-A1', section: 'grammar', q: '___ is my friend.', options: ['She', 'Him', 'Her', 'Hers'], answer: 0, explain: 'Gap boshida egani bildiruvchi “She” kerak; Him/Her to‘ldiruvchi shakllari.' },
  { id: 'p-Pre-A1-grammar-3', level: 'Pre-A1', section: 'grammar', q: 'We ___ happy.', options: ['is', 'am', 'are', 'be'], answer: 2, explain: '“We” bilan “are” ishlatiladi: We are happy.' },
  { id: 'p-Pre-A1-reading', level: 'Pre-A1', section: 'reading', passage: 'My name is Ali. I am eight. I have a cat.', q: 'How old is Ali?', options: ['Six', 'Seven', 'Eight', 'Nine'], answer: 2, explain: 'Matnda “I am eight” deyilgan, demak Ali sakkiz yoshda.' },
  { id: 'p-Pre-A1-reading-2', level: 'Pre-A1', section: 'reading', passage: 'The dog is black. It can run fast.', q: 'What colour is the dog?', options: ['Black', 'White', 'Red', 'Green'], answer: 0, explain: 'Matnda “The dog is black” deyilgan.' },
  { id: 'p-Pre-A1-reading-3', level: 'Pre-A1', section: 'reading', passage: 'I have two apples. I eat one apple.', q: 'How many apples are left?', options: ['One', 'Two', 'Three', 'None'], answer: 0, explain: 'Ikki olma bor edi, bittasi yeyildi — bittasi qoldi.' },

  // ---------- A1 ----------
  { id: 'p-A1-vocabulary', level: 'A1', section: 'vocabulary', q: 'My mother’s sister is my ___.', options: ['uncle', 'cousin', 'aunt', 'grandfather'], answer: 2, explain: 'Onaning singlisi — “aunt” (xola); “uncle” esa amaki yoki tog‘a.' },
  { id: 'p-A1-vocabulary-2', level: 'A1', section: 'vocabulary', q: 'The opposite of “cold” is ___.', options: ['cool', 'hot', 'wet', 'soft'], answer: 1, explain: '“Cold” (sovuq) so‘zining qarshisi — “hot” (issiq).' },
  { id: 'p-A1-vocabulary-3', level: 'A1', section: 'vocabulary', q: 'Where do you sleep?', options: ['In a bed', 'In a car', 'On a plate', 'In a box'], answer: 0, explain: 'Uxlash — krovatda (“in a bed”).' },
  { id: 'p-A1-grammar', level: 'A1', section: 'grammar', q: 'She ___ to school every day.', options: ['go', 'goes', 'going', 'is go'], answer: 1, explain: 'He/she/it bilan hozirgi oddiy zamonda so‘z oxiriga -s/-es qo‘shiladi: goes.' },
  { id: 'p-A1-grammar-2', level: 'A1', section: 'grammar', q: 'There ___ two apples on the table.', options: ['is', 'are', 'am', 'be'], answer: 1, explain: 'Ko‘plik (“two apples”) bilan “are” ishlatiladi.' },
  { id: 'p-A1-grammar-3', level: 'A1', section: 'grammar', q: 'I play football ___ Sundays.', options: ['in', 'on', 'at', 'of'], answer: 1, explain: 'Hafta kunlari bilan “on” ishlatiladi: on Sundays.' },
  { id: 'p-A1-reading', level: 'A1', section: 'reading', passage: 'Anna gets up at seven o’clock. She has breakfast at half past seven and goes to school by bus.', q: 'How does Anna go to school?', options: ['On foot', 'By bike', 'By car', 'By bus'], answer: 3, explain: 'Matnda “goes to school by bus” deyilgan, demak Anna maktabga avtobusda boradi.' },
  { id: 'p-A1-reading-2', level: 'A1', section: 'reading', passage: 'Tim likes football. He plays with his friends after school. His sister reads books.', q: 'What does Tim’s sister do?', options: ['Plays football', 'Reads books', 'Watches TV', 'Sleeps'], answer: 1, explain: 'Matnda “His sister reads books” deyilgan.' },
  { id: 'p-A1-reading-3', level: 'A1', section: 'reading', passage: 'The shop opens at nine and closes at five. It is closed on Sunday.', q: 'When does the shop open?', options: ['At five', 'At nine', 'On Sunday', 'At seven'], answer: 1, explain: '“The shop opens at nine” — do‘kon soat to‘qqizda ochiladi.' },

  // ---------- A2 ----------
  { id: 'p-A2-vocabulary', level: 'A2', section: 'vocabulary', q: 'A person who cooks food in a restaurant is a ___.', options: ['chef', 'driver', 'nurse', 'pilot'], answer: 0, explain: 'Restoranda ovqat pishiradigan odam — “chef” (oshpaz).' },
  { id: 'p-A2-vocabulary-2', level: 'A2', section: 'vocabulary', q: 'My father’s brother is my ___.', options: ['nephew', 'uncle', 'cousin', 'niece'], answer: 1, explain: 'Otaning akasi-ukasi — “uncle” (amaki/tog‘a).' },
  { id: 'p-A2-vocabulary-3', level: 'A2', section: 'vocabulary', q: 'You buy medicine at the ___.', options: ['bakery', 'pharmacy', 'library', 'airport'], answer: 1, explain: 'Dori dorixona (“pharmacy”) da sotiladi.' },
  { id: 'p-A2-grammar', level: 'A2', section: 'grammar', q: 'This bag is ___ than that one.', options: ['more heavy', 'heavy', 'heaviest', 'heavier'], answer: 3, explain: 'Ikki narsani solishtirishda qisqa sifatga -er qo‘shiladi (y harfi i ga o‘zgaradi): heavier than.' },
  { id: 'p-A2-grammar-2', level: 'A2', section: 'grammar', q: 'I ___ TV when the phone rang.', options: ['watched', 'was watching', 'am watching', 'watch'], answer: 1, explain: 'Uzluksiz harakat paytida boshqa harakat yuz berdi — Past Continuous: was watching.' },
  { id: 'p-A2-grammar-3', level: 'A2', section: 'grammar', q: 'You ___ smoke here. It’s not allowed.', options: ['mustn’t', 'don’t have to', 'couldn’t', 'wouldn’t'], answer: 0, explain: 'Taqiqlash uchun “mustn’t” ishlatiladi: bu yerda chekish mumkin emas.' },
  { id: 'p-A2-reading', level: 'A2', section: 'reading', passage: 'Last Saturday, Tom went to the cinema with his friends. The film was long, but it was very funny. After the film, they ate pizza.', q: 'What did Tom think of the film?', options: ['It was boring', 'It was funny', 'It was short', 'It was scary'], answer: 1, explain: 'Matnda “it was very funny” deyilgan, demak film kulgili bo‘lgan.' },
  { id: 'p-A2-reading-2', level: 'A2', section: 'reading', passage: 'Dear Sara, I arrived in Bukhara yesterday. The old city is beautiful, and tomorrow I am going to visit the museum and the bazaar. Wish you were here! Malik', q: 'When did Malik arrive in Bukhara?', options: ['Yesterday', 'Today', 'Tomorrow', 'Last week'], answer: 0, explain: 'Xatda “I arrived in Bukhara yesterday” deyilgan.' },
  { id: 'p-A2-reading-3', level: 'A2', section: 'reading', passage: 'We are going to the mountains on Friday. Please take warm clothes because it will be cold at night. Bring a torch too — there are no street lights.', q: 'What should you take?', options: ['A swimsuit', 'Warm clothes', 'A sun hat', 'An umbrella'], answer: 1, explain: 'Xatda “take warm clothes” deyilgan, chunki tunda sovuq bo‘ladi.' },

  // ---------- B1 ----------
  { id: 'p-B1-vocabulary', level: 'B1', section: 'vocabulary', q: 'I was ___ when I heard I had won the competition. I couldn’t believe it!', options: ['exhausted', 'furious', 'thrilled', 'jealous'], answer: 2, explain: '“Thrilled” — juda xursand va hayajonlangan; g‘alaba haqidagi xabarga aynan mos keladi.' },
  { id: 'p-B1-vocabulary-2', level: 'B1', section: 'vocabulary', q: 'The film was so ___ that I fell asleep.', options: ['thrilling', 'tedious', 'gripping', 'moving'], answer: 1, explain: '“Tedious” — zerikarli; uyqu bosishi aynan zerikarilikka mos.' },
  { id: 'p-B1-vocabulary-3', level: 'B1', section: 'vocabulary', q: 'He ___ his exam — he got the highest mark in the class.', options: ['failed', 'missed', 'aced', 'dreaded'], answer: 2, explain: '“Aced” — imtihondan a’lo bergan; eng yuqori baho bunga mos.' },
  { id: 'p-B1-grammar', level: 'B1', section: 'grammar', q: 'I ___ my homework yet, so I can’t go out.', options: ['don’t finish', 'haven’t finished', 'didn’t finished', 'hadn’t finish'], answer: 1, explain: '“Yet” bilan hozirgi tugallangan zamon (present perfect) ishlatiladi: haven’t finished.' },
  { id: 'p-B1-grammar-2', level: 'B1', section: 'grammar', q: 'If I ___ more time, I would learn the guitar.', options: ['have', 'had', 'will have', 'having'], answer: 1, explain: 'II shartli gap (unreal condition): If I had…, I would learn…' },
  { id: 'p-B1-grammar-3', level: 'B1', section: 'grammar', q: 'She suggested ___ a taxi because of the rain.', options: ['to take', 'taking', 'take', 'that taking'], answer: 1, explain: '“Suggest” dan keyin gerund keladi: suggested taking.' },
  { id: 'p-B1-reading', level: 'B1', section: 'reading', passage: 'Maria has lived in London for three years. At first she found it difficult to understand people, but now she feels at home and has made many friends.', q: 'How does Maria feel about London now?', options: ['She feels comfortable there', 'She wants to leave', 'She still finds English hard', 'She has no friends'], answer: 0, explain: '“Now she feels at home” — Mariya endi Londonda o‘zini qulay his qiladi.' },
  { id: 'p-B1-reading-2', level: 'B1', section: 'reading', passage: 'NOTICE: The swimming pool will be closed for cleaning until Monday. Members may use the gym as usual. We apologise for any inconvenience.', q: 'What can members still do?', options: ['Swim in the pool', 'Use the gym', 'Visit on Monday', 'Book a holiday'], answer: 1, explain: 'E’londa “Members may use the gym as usual” deyilgan — bassayn yopiq, sportzal ochiq.' },
  { id: 'p-B1-reading-3', level: 'B1', section: 'reading', passage: 'When Nina moved to Tashkent, she hardly knew anyone. She joined a local English club, and within a few months she had a circle of friends and even a part-time job at a language school.', q: 'What changed Nina’s situation?', options: ['Moving to a smaller city', 'Joining a club and taking a job', 'Leaving the language school', 'Her family moving away'], answer: 1, explain: 'Klubga qo‘shilishi do‘stlar va ish topishiga olib kelgan.' },

  // ---------- B2 ----------
  { id: 'p-B2-vocabulary', level: 'B2', section: 'vocabulary', q: 'Despite the ___ weather, the match went ahead as planned.', options: ['adjacent', 'adverse', 'obsolete', 'reluctant'], answer: 1, explain: '“Adverse” — noqulay, yomon (adverse weather); boshqa so‘zlar bu gapga mazmunan mos kelmaydi.' },
  { id: 'p-B2-vocabulary-2', level: 'B2', section: 'vocabulary', q: 'The committee reached a ___ decision — nobody objected.', options: ['contentious', 'unanimous', 'reluctant', 'tentative'], answer: 1, explain: '“Unanimous” — bir ovozdan; hech kim qarshi chiqmagani bunga mos.' },
  { id: 'p-B2-vocabulary-3', level: 'B2', section: 'vocabulary', q: 'She ___ the opportunity to study abroad; it was too good to refuse.', options: ['seized', 'declined', 'abandoned', 'overlooked'], answer: 0, explain: '“Seize the opportunity” — imkoniyatni qo‘ldan chiqarmasdan ushlash.' },
  { id: 'p-B2-grammar', level: 'B2', section: 'grammar', q: 'The new library ___ next month by the mayor.', options: ['will open', 'is opening', 'opens', 'will be opened'], answer: 3, explain: '“By the mayor” ishni bajaruvchini bildiradi, shuning uchun passiv kerak: will be opened.' },
  { id: 'p-B2-grammar-2', level: 'B2', section: 'grammar', q: 'Hardly ___ the station when the train left.', options: ['we had reached', 'had we reached', 'we reached', 'did we reach'], answer: 1, explain: '“Hardly … when” qurilmasida inversiya va Past Perfect kerak: had we reached.' },
  { id: 'p-B2-grammar-3', level: 'B2', section: 'grammar', q: 'It’s high time the government ___ something about traffic.', options: ['does', 'did', 'will do', 'has done'], answer: 1, explain: '“It’s high time + o‘tgan zamon” — qandaydir ish allaqachon bajarilishi kerak edi: did.' },
  { id: 'p-B2-reading', level: 'B2', section: 'reading', passage: 'Although remote working has many benefits, such as saving commuting time, some employees say they feel isolated from their colleagues. As a result, a number of companies now ask staff to come to the office two days a week.', q: 'Why do some companies ask staff to come to the office?', options: ['To save money on commuting', 'Because remote working is illegal', 'Because some employees feel isolated', 'To reduce the number of staff'], answer: 2, explain: 'Ayrim xodimlar o‘zini yakkalangan his qilgani sababli kompaniyalar ularni ofisga chaqirmoqda.' },
  { id: 'p-B2-reading-2', level: 'B2', section: 'reading', passage: 'E-books are convenient and cheap, yet many readers say they remember less when reading on a screen. Some researchers argue that the physical act of turning pages helps the mind build a map of the text. Whatever the cause, print sales have quietly risen for several years.', q: 'What does the passage suggest?', options: ['Screens improve memory', 'Print may have small advantages', 'E-books are too expensive', 'Researchers reject e-books'], answer: 1, explain: 'Matn chop etilgan kitoblarning kichik afzalliklari bo‘lishi mumkinligini bildirmoqda.' },
  { id: 'p-B2-reading-3', level: 'B2', section: 'reading', passage: 'The city’s new tram line was expected to ease congestion. Instead, traffic got worse during construction, and some businesses along the route reported falling sales. Officials respond that such projects always hurt before they help.', q: 'What do officials admit?', options: ['The project has failed', 'Short-term harm is normal', 'Trams cause pollution', 'All businesses moved away'], answer: 1, explain: 'Rasmiylar “avval zarar, keyin foyda” degan odatiy holatni tan olmoqda.' },

  // ---------- C1 ----------
  { id: 'p-C1-vocabulary', level: 'C1', section: 'vocabulary', q: 'Her ___ remarks about the project left the whole team feeling demoralised.', options: ['scarce', 'sturdy', 'scathing', 'subtle'], answer: 2, explain: '“Scathing” — o‘ta qattiq tanqidiy; aynan shunday gaplar jamoaning ruhini tushiradi.' },
  { id: 'p-C1-vocabulary-2', level: 'C1', section: 'vocabulary', q: 'The manager’s tone was ___ — polite on the surface, but unmistakably critical.', options: ['candid', 'veiled', 'blunt', 'forthright'], answer: 1, explain: '“Veiled” — yashirin, parda ortidagi; tashqi sirtida muomalada, aslida tanqidiy.' },
  { id: 'p-C1-vocabulary-3', level: 'C1', section: 'vocabulary', q: 'His apology was ___ at best; he clearly felt no regret.', options: ['heartfelt', 'perfunctory', 'profuse', 'abject'], answer: 1, explain: '“Perfunctory” — rasmiy, voqelikka aylanmagan; pushaymon bo‘lmagani bunga mos.' },
  { id: 'p-C1-grammar', level: 'C1', section: 'grammar', q: 'Not until she opened the letter ___ the truth.', options: ['she realised', 'she did realise', 'realised she', 'did she realise'], answer: 3, explain: '“Not until...” gap boshida kelganda inversiya ishlatiladi: did she realise.' },
  { id: 'p-C1-grammar-2', level: 'C1', section: 'grammar', q: 'So convincing ___ that nobody questioned the figures.', options: ['his argument was', 'was his argument', 'his argument', 'did his argument'], answer: 1, explain: '“So + sifat” gap boshiga chiqsa inversiya kerak: was his argument.' },
  { id: 'p-C1-grammar-3', level: 'C1', section: 'grammar', q: '___ for your timely warning, we would have lost everything.', options: ['Had it not been', 'Were it not', 'If it was not', 'Would it not be'], answer: 0, explain: 'O‘tgan zamon uchun uchinchi tur shart: Had it not been for…, we would have lost…' },
  { id: 'p-C1-reading', level: 'C1', section: 'reading', passage: 'The minister insisted that the new tax was “a necessary sacrifice”, yet she declined to say how much revenue it would raise. Critics were quick to point out that, whenever figures are withheld, it is usually because they make unpalatable reading.', q: 'What are the critics implying?', options: ['The figures may be unfavourable to the government', 'The minister does not know the figures', 'The tax will raise a large amount of money', 'The tax is not necessary at all'], answer: 0, explain: 'Tanqidchilar raqamlar yashirilsa, odatda ular yoqimsiz bo‘ladi, deb ishora qilmoqda.' },
  { id: 'p-C1-reading-2', level: 'C1', section: 'reading', passage: 'The biography avoids neither the composer’s cruelty nor his genius, refusing the comfortable verdict that one excuses the other. That restraint is precisely what makes it trustworthy.', q: 'Why is the biography trustworthy?', options: ['It defends the composer', 'It presents both sides without judgement', 'It ignores his cruelty', 'It praises only his genius'], answer: 1, explain: 'Muallif ikki tomonni ham ochib, hakamlik qilishdan boydodi — shu sababli ishonchli.' },
  { id: 'p-C1-reading-3', level: 'C1', section: 'reading', passage: 'Critics of the scheme note that its pilot phase covered only the calmest districts. If the results hold in the crowded centre, the case will be made; until then, celebration is premature.', q: 'What does the writer believe?', options: ['The scheme has already succeeded', 'The scheme needs harder testing', 'The scheme should be cancelled', 'The scheme works only in quiet areas'], answer: 1, explain: 'Pilot sinov faqat oson rayonlarni qamrab olgani — yana sinov talab qilinmoqda.' },

  // ---------- C2 ----------
  { id: 'p-C2-vocabulary', level: 'C2', section: 'vocabulary', q: 'The politician’s speech was full of ___ — fine-sounding phrases that meant very little.', options: ['platitudes', 'pinnacles', 'prototypes', 'pittances'], answer: 0, explain: '“Platitudes” — mazmunsiz, eskirgan va quruq gaplar; boshqa so‘zlar (cho‘qqi, namuna, arzimas pul) mos emas.' },
  { id: 'p-C2-vocabulary-2', level: 'C2', section: 'vocabulary', q: 'The treaty was rendered ___ by the two sides’ fundamentally divergent readings of its central clause.', options: ['venerable', 'nugatory', 'salient', 'tenable'], answer: 1, explain: '“Nugatory” — kuchini yo‘qotgan, amalsiz; ikki tomon talqini shartnomani amalsiz qilgandi.' },
  { id: 'p-C2-vocabulary-3', level: 'C2', section: 'vocabulary', q: 'She spoke with such ___ that even her detractors fell silent.', options: ['garrulity', 'magnanimity', 'eloquence', 'loquacity'], answer: 2, explain: '“Eloquence” — nihoyatda o’ta ta’sirli va shirali so‘zlash; qarshilarni jim qilgan aynan shu.' },
  { id: 'p-C2-grammar', level: 'C2', section: 'grammar', q: 'I’d rather you ___ anything to him about it.', options: ['won’t say', 'wouldn’t say', 'don’t say', 'didn’t say'], answer: 3, explain: '“I’d rather you + o‘tgan zamon shakli” hozirgi yoki kelasi vaqtdagi istakni bildiradi: didn’t say.' },
  { id: 'p-C2-grammar-2', level: 'C2', section: 'grammar', q: 'Scarcely a word ___ during the entire hearing, so tight-lipped were the witnesses.', options: ['was uttered', 'had uttered', 'uttered was', 'has been uttered'], answer: 0, explain: '“Scarcely a word” boshiga chiqqanda passiv inversiya shakli: was uttered.' },
  { id: 'p-C2-grammar-3', level: 'C2', section: 'grammar', q: 'That he was dismissed was less surprising than ___ — the board had known for months.', options: ['the manner of it', 'it was the manner', 'the manner it was', 'was it the manner'], answer: 0, explain: 'Parallel qiyoslash uchun “the manner of it” (uning qanday usulda bo‘lgani) kerak.' },
  { id: 'p-C2-reading', level: 'C2', section: 'reading', passage: 'Whilst the novel was lauded by critics for its unflinching candour, readers have been less forgiving: many found the narrator so insufferably self-absorbed that, by the midpoint, they had lost all appetite to follow his fortunes. One reviewer quipped that the author had mistaken honesty for a licence to be tedious.', q: 'What is the reviewer’s implied criticism?', options: ['The novel is dishonest', 'The critics were too forgiving', 'The author uses honesty as an excuse for dull writing', 'The narrator is too modest'], answer: 2, explain: 'Sharhlovchi muallif samimiylikni zerikarli yozish uchun bahona qilgan, deb piching qilmoqda.' },
  { id: 'p-C2-reading-2', level: 'C2', section: 'reading', passage: 'That the author writes beautifully is beyond dispute; whether beauty redeems a narrative that eschews plot is another matter entirely. Readers who prize language above story will find much to admire.', q: 'What does the passage imply about the novel?', options: ['It has a gripping plot', 'It prioritises style over story', 'It should be abandoned', 'It is written badly'], answer: 1, explain: 'Matn syujetdan ko‘ra uslubga urg‘u berilganini bildirmoqda.' },
  { id: 'p-C2-reading-3', level: 'C2', section: 'reading', passage: 'Few policies fail as quietly as procurement reform: when it works, nothing visibly improves, and when it stalls, the waste is diffuse, spread across thousands of small transactions rather than concentrated in one scandal.', q: 'Why does procurement reform fail quietly?', options: ['Its failures are scattered and hard to attribute', 'It is never funded', 'It has no measurable benefits', 'Scandals hide its successes'], answer: 0, explain: 'Ishsizlik tarqoq va minglab kichik bitimlarga bo‘lingan — shu sababli sezilmaydi.' },
];

export const BANK: BankItem[] = B;
export const bankItem = (id: string): BankItem | undefined => B.find((q) => q.id === id);

/** Public copy of a question — the answer and explanation are stripped. */
export function publicOf(q: BankItem): PublicQuestion {
  return { id: q.id, level: q.level, section: q.section, passage: q.passage, q: q.q, options: q.options };
}

// ---------------------------------------------------------------------------
// Adaptive flow (stateless) + deterministic scoring
// ---------------------------------------------------------------------------

export const ADVICE: Record<Section, string> = {
  vocabulary: 'So‘z boyligi: “So‘zlar” bo‘limida Test va Juftlash mashqlarini kuniga 10 so‘z bajaring.',
  grammar: 'Grammatika: “Grammatika” darslarini tartib bilan tugatib, xatolar daftarini takrorlang.',
  reading: 'O‘qish: “O‘qish” matnlarini ovozli o‘qib, savollarga avval matndan topib javob bering.',
};

/** Adaptive order starts ONE group below the self-declared level (calibration). */
export function startLevelFor(selfLevel: Level): Level {
  const i = Math.max(0, LEVELS.indexOf(selfLevel) - 1);
  return LEVELS[i];
}

export function groupQuestions(level: Level): PublicQuestion[] {
  const items = BANK.filter((q) => q.level === level).sort((a, b) => a.section.localeCompare(b.section) || a.id.localeCompare(b.id));
  // one question per section keeps the group at 3 items (PASS_MARK = 2 of 3);
  // the remaining items of the bank stay available for the next calibration run
  const picked: BankItem[] = [];
  for (const sec of ['grammar', 'reading', 'vocabulary'] as Section[]) {
    const first = items.find((q) => q.section === sec);
    if (first) picked.push(first);
  }
  return picked.map(publicOf);
}

/** Validates a client answer list: known ids only, no duplicates, picked in range. */
export function sanitizeAnswers(raw: unknown): Answered[] {
  const out: Answered[] = [];
  const seen = new Set<string>();
  if (!Array.isArray(raw)) return out;
  for (const a of raw.slice(0, 40)) {
    const item = a && typeof a === 'object' ? (a as Record<string, unknown>) : null;
    const id = typeof item?.id === 'string' ? item.id : '';
    const picked = Number(item?.picked);
    if (!id || seen.has(id)) continue;
    const q = bankItem(id);
    if (!q) continue;
    const valid = Number.isInteger(picked) && picked >= -1 && picked < q.options.length;
    out.push({ id, picked: valid ? picked : -1 });
    seen.add(id);
  }
  return out;
}

function groupsFrom(answers: Answered[]): GroupScore[] {
  const out: GroupScore[] = [];
  for (const lv of LEVELS) {
    const items = answers.filter((a) => bankItem(a.id)?.level === lv);
    if (!items.length) continue;
    const correct = items.filter((a) => bankItem(a.id)!.answer === a.picked).length;
    out.push({ level: lv, correct, asked: items.length, passed: correct >= PASS_MARK });
  }
  return out;
}

/**
 * True when the walk should stop: a completed group scored below the pass
 * mark (the learner climbed as high as their evidence allows).
 */
export function walkComplete(groups: GroupScore[]): boolean {
  const done = groups.filter((g) => g.asked >= GROUP_SIZE);
  return done.length > 0 && !done[done.length - 1].passed;
}

/**
 * The core deterministic evaluation. Level = highest group passed without
 * skipping a lower one; if no group passes, one level below the first asked
 * group (the self-declared level is only a prior). Flags:
 *  - 'pattern': one option index dominates the answers (guessing signal)
 *  - 'inconsistent': a passed group sits more than one level above a failed one
 * Flags lower the confidence by one step — the report stays honest.
 */
export function evaluate(answers: Answered[], selfLevel: Level): PlacementResult {
  const groups = groupsFrom(answers);
  const asked = answers.length;
  const total = answers.filter((a) => bankItem(a.id)!.answer === a.picked).length;

  let highest: Level | null = null;
  let stillPassing = true;
  for (const g of groups) {
    if (g.asked >= GROUP_SIZE) {
      if (stillPassing && g.passed) highest = g.level;
      else stillPassing = false;
    }
  }
  let level: Level;
  const firstAsked = groups[0]?.level ?? startLevelFor(selfLevel);
  if (highest) level = highest;
  else level = LEVELS[Math.max(0, LEVELS.indexOf(firstAsked) - 1)];

  const flags: string[] = [];
  if (asked >= 6) {
    const counts = new Map<number, number>();
    for (const a of answers) if (a.picked >= 0) counts.set(a.picked, (counts.get(a.picked) ?? 0) + 1);
    for (const [, n] of counts) if (n / Math.max(1, asked) >= 0.85) flags.push('pattern');
  }
  const passedLevels = groups.filter((g) => g.passed && g.asked >= GROUP_SIZE).map((g) => LEVELS.indexOf(g.level));
  const failedLevels = groups.filter((g) => !g.passed && g.asked >= GROUP_SIZE).map((g) => LEVELS.indexOf(g.level));
  if (passedLevels.length && failedLevels.length && Math.max(...passedLevels) - Math.min(...failedLevels) >= 2) flags.push('inconsistent');

  const skills: SkillScore[] = (['vocabulary', 'grammar', 'reading'] as Section[]).map((section) => {
    const items = answers.filter((a) => bankItem(a.id)?.section === section);
    const correct = items.filter((a) => bankItem(a.id)!.answer === a.picked).length;
    const acc = items.length ? correct / items.length : 0;
    return {
      section,
      correct,
      asked: items.length,
      accuracy: Math.round(acc * 100) / 100,
      verdict: items.length >= 3 && acc >= 0.75 ? 'strength' : items.length >= 3 && acc <= 0.34 ? 'weak' : 'ok',
    };
  });

  let confidence: PlacementResult['confidence'] = groups.length >= 3 ? 'high' : groups.length === 2 ? 'medium' : 'low';
  if (flags.length && confidence !== 'low') confidence = confidence === 'high' ? 'medium' : 'low';

  const bySection = {
    vocabulary: { correct: 0, asked: 0 },
    grammar: { correct: 0, asked: 0 },
    reading: { correct: 0, asked: 0 },
  };
  for (const s of skills) bySection[s.section] = { correct: s.correct, asked: s.asked };

  return {
    level,
    bySection,
    total,
    asked,
    groups,
    skills,
    strengths: skills.filter((s) => s.verdict === 'strength').map((s) => s.section),
    weaknesses: skills.filter((s) => s.verdict === 'weak').map((s) => s.section),
    confidence,
    flags,
    advice: ADVICE,
  };
}

/**
 * The stateless adaptive step: given the answers so far and the self-declared
 * level, returns either the next group's public questions or the final result.
 * The client never sees which answers were correct while the walk continues.
 */
export function adaptiveStep(selfLevel: Level, answers: Answered[]): { done: false; questions: PublicQuestion[]; group: Level; answeredCount: number } | { done: true; result: PlacementResult; answeredCount: number } {
  const groups = groupsFrom(answers);
  const start = startLevelFor(selfLevel);
  // find the next level to ask: from the start level upward, skipping levels already fully asked
  for (let i = LEVELS.indexOf(start); i < LEVELS.length; i++) {
    const lv = LEVELS[i];
    const g = groups.find((x) => x.level === lv);
    if (!g) return { done: false, questions: groupQuestions(lv), group: lv, answeredCount: answers.length };
    if (g.asked >= GROUP_SIZE && !g.passed) {
      return { done: true, result: evaluate(answers, selfLevel), answeredCount: answers.length };
    }
    // partially asked group -> ask for the rest of it (same level again)
    if (g.asked > 0 && g.asked < GROUP_SIZE) {
      const group = groupQuestions(lv).map((q) => q.id);
      const remaining = groupQuestions(lv).filter((q) => !answers.some((a) => a.id === q.id) && group.includes(q.id));
      return { done: false, questions: remaining, group: lv, answeredCount: answers.length };
    }
    // passed (or identical id set) -> continue upward
  }
  return { done: true, result: evaluate(answers, selfLevel), answeredCount: answers.length };
}
