import type { PlacementQuestion } from "../types";

// Placement test: 3 questions per level (vocabulary, grammar, reading), ordered easy -> hard.
export const PLACEMENT: PlacementQuestion[] = [
  // ---------- Pre-A1 ----------
  {
    id: "p-Pre-A1-vocabulary",
    level: "Pre-A1",
    section: "vocabulary",
    q: "Which word is an animal?",
    options: ["book", "dog", "chair", "apple"],
    answer: 1,
    explain: "“Dog” — it degani, qolgan so‘zlar kitob, stul va olma.",
  },
  {
    id: "p-Pre-A1-grammar",
    level: "Pre-A1",
    section: "grammar",
    q: "I ___ a student.",
    options: ["am", "is", "are", "be"],
    answer: 0,
    explain: "“I” bilan doimo “am” ishlatiladi: I am a student.",
  },
  {
    id: "p-Pre-A1-reading",
    level: "Pre-A1",
    section: "reading",
    passage: "My name is Ali. I am eight. I have a cat.",
    q: "How old is Ali?",
    options: ["Six", "Seven", "Eight", "Nine"],
    answer: 2,
    explain: "Matnda “I am eight” deyilgan, demak Ali sakkiz yoshda.",
  },

  // ---------- A1 ----------
  {
    id: "p-A1-vocabulary",
    level: "A1",
    section: "vocabulary",
    q: "My mother's sister is my ___.",
    options: ["uncle", "cousin", "aunt", "grandfather"],
    answer: 2,
    explain: "Onaning singlisi — “aunt” (xola); “uncle” esa amaki yoki tog‘a.",
  },
  {
    id: "p-A1-grammar",
    level: "A1",
    section: "grammar",
    q: "She ___ to school every day.",
    options: ["go", "goes", "going", "is go"],
    answer: 1,
    explain: "He/she/it bilan hozirgi oddiy zamonda so‘z oxiriga -s/-es qo‘shiladi: goes.",
  },
  {
    id: "p-A1-reading",
    level: "A1",
    section: "reading",
    passage:
      "Anna gets up at seven o'clock. She has breakfast at half past seven and goes to school by bus.",
    q: "How does Anna go to school?",
    options: ["On foot", "By bike", "By car", "By bus"],
    answer: 3,
    explain: "Matnda “goes to school by bus” deyilgan, demak Anna maktabga avtobusda boradi.",
  },

  // ---------- A2 ----------
  {
    id: "p-A2-vocabulary",
    level: "A2",
    section: "vocabulary",
    q: "A person who cooks food in a restaurant is a ___.",
    options: ["chef", "driver", "nurse", "pilot"],
    answer: 0,
    explain: "Restoranda ovqat pishiradigan odam — “chef” (oshpaz).",
  },
  {
    id: "p-A2-grammar",
    level: "A2",
    section: "grammar",
    q: "This bag is ___ than that one.",
    options: ["more heavy", "heavy", "heaviest", "heavier"],
    answer: 3,
    explain: "Ikki narsani solishtirishda qisqa sifatga -er qo‘shiladi (y harfi i ga o‘zgaradi): heavier than.",
  },
  {
    id: "p-A2-reading",
    level: "A2",
    section: "reading",
    passage:
      "Last Saturday, Tom went to the cinema with his friends. The film was long, but it was very funny. After the film, they ate pizza.",
    q: "What did Tom think of the film?",
    options: ["It was boring", "It was funny", "It was short", "It was scary"],
    answer: 1,
    explain: "Matnda “it was very funny” deyilgan, demak film kulgili bo‘lgan.",
  },

  // ---------- B1 ----------
  {
    id: "p-B1-vocabulary",
    level: "B1",
    section: "vocabulary",
    q: "I was ___ when I heard I had won the competition. I couldn't believe it!",
    options: ["exhausted", "furious", "thrilled", "jealous"],
    answer: 2,
    explain: "“Thrilled” — juda xursand va hayajonlangan; g‘alaba haqidagi xabarga aynan mos keladi.",
  },
  {
    id: "p-B1-grammar",
    level: "B1",
    section: "grammar",
    q: "I ___ my homework yet, so I can't go out.",
    options: ["don't finish", "haven't finished", "didn't finished", "hadn't finish"],
    answer: 1,
    explain: "“Yet” bilan hozirgi tugallangan zamon (present perfect) ishlatiladi: haven't finished.",
  },
  {
    id: "p-B1-reading",
    level: "B1",
    section: "reading",
    passage:
      "Maria has lived in London for three years. At first she found it difficult to understand people, but now she feels at home and has made many friends.",
    q: "How does Maria feel about London now?",
    options: [
      "She feels comfortable there",
      "She wants to leave",
      "She still finds English hard",
      "She has no friends",
    ],
    answer: 0,
    explain: "“Now she feels at home” — Mariya endi Londonda o‘zini qulay his qiladi.",
  },

  // ---------- B2 ----------
  {
    id: "p-B2-vocabulary",
    level: "B2",
    section: "vocabulary",
    q: "Despite the ___ weather, the match went ahead as planned.",
    options: ["adjacent", "adverse", "obsolete", "reluctant"],
    answer: 1,
    explain: "“Adverse” — noqulay, yomon (adverse weather); boshqa so‘zlar bu gapga mazmunan mos kelmaydi.",
  },
  {
    id: "p-B2-grammar",
    level: "B2",
    section: "grammar",
    q: "The new library ___ next month by the mayor.",
    options: ["will open", "is opening", "opens", "will be opened"],
    answer: 3,
    explain: "“By the mayor” ishni bajaruvchini bildiradi, shuning uchun passiv kerak: will be opened.",
  },
  {
    id: "p-B2-reading",
    level: "B2",
    section: "reading",
    passage:
      "Although remote working has many benefits, such as saving commuting time, some employees say they feel isolated from their colleagues. As a result, a number of companies now ask staff to come to the office two days a week.",
    q: "Why do some companies ask staff to come to the office?",
    options: [
      "To save money on commuting",
      "Because remote working is illegal",
      "Because some employees feel isolated",
      "To reduce the number of staff",
    ],
    answer: 2,
    explain: "Ayrim xodimlar o‘zini yakkalangan his qilgani sababli kompaniyalar ularni ofisga chaqirmoqda.",
  },

  // ---------- C1 ----------
  {
    id: "p-C1-vocabulary",
    level: "C1",
    section: "vocabulary",
    q: "Her ___ remarks about the project left the whole team feeling demoralised.",
    options: ["scarce", "sturdy", "scathing", "subtle"],
    answer: 2,
    explain: "“Scathing” — o‘ta qattiq tanqidiy; aynan shunday gaplar jamoaning ruhini tushiradi.",
  },
  {
    id: "p-C1-grammar",
    level: "C1",
    section: "grammar",
    q: "Not until she opened the letter ___ the truth.",
    options: ["she realised", "she did realise", "realised she", "did she realise"],
    answer: 3,
    explain: "“Not until...” gap boshida kelganda inversiya ishlatiladi: did she realise.",
  },
  {
    id: "p-C1-reading",
    level: "C1",
    section: "reading",
    passage:
      "The minister insisted that the new tax was “a necessary sacrifice”, yet she declined to say how much revenue it would raise. Critics were quick to point out that, whenever figures are withheld, it is usually because they make unpalatable reading.",
    q: "What are the critics implying?",
    options: [
      "The figures may be unfavourable to the government",
      "The minister does not know the figures",
      "The tax will raise a large amount of money",
      "The tax is not necessary at all",
    ],
    answer: 0,
    explain: "Tanqidchilar raqamlar yashirilsa, odatda ular yoqimsiz bo‘ladi, deb ishora qilmoqda.",
  },

  // ---------- C2 ----------
  {
    id: "p-C2-vocabulary",
    level: "C2",
    section: "vocabulary",
    q: "The politician's speech was full of ___ — fine-sounding phrases that meant very little.",
    options: ["platitudes", "pinnacles", "prototypes", "pittances"],
    answer: 0,
    explain: "“Platitudes” — mazmunsiz, eskirgan va quruq gaplar; boshqa so‘zlar (cho‘qqi, namuna, arzimas pul) mos emas.",
  },
  {
    id: "p-C2-grammar",
    level: "C2",
    section: "grammar",
    q: "I'd rather you ___ anything to him about it.",
    options: ["won't say", "wouldn't say", "don't say", "didn't say"],
    answer: 3,
    explain: "“I'd rather you + o‘tgan zamon shakli” hozirgi yoki kelasi vaqtdagi istakni bildiradi: didn't say.",
  },
  {
    id: "p-C2-reading",
    level: "C2",
    section: "reading",
    passage:
      "Whilst the novel was lauded by critics for its unflinching candour, readers have been less forgiving: many found the narrator so insufferably self-absorbed that, by the midpoint, they had lost all appetite to follow his fortunes. One reviewer quipped that the author had mistaken honesty for a licence to be tedious.",
    q: "What is the reviewer's implied criticism?",
    options: [
      "The novel is dishonest",
      "The critics were too forgiving",
      "The author uses honesty as an excuse for dull writing",
      "The narrator is too modest",
    ],
    answer: 2,
    explain: "Sharhlovchi muallif samimiylikni zerikarli yozish uchun bahona qilgan, deb piching qilmoqda.",
  },
];
