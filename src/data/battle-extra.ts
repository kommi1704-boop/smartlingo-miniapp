// Battle-only questions for higher levels. The main pool (grammar lessons +
// placement) is dominated by A1–B1 items, so B2/C1 duels felt too easy.
// These "think first" items are trickier grammar, word nuance and short
// inference questions with kid-friendly topics. Merged into the duel pool
// in src/lib/battle.ts. Not shown in any lesson — duel exclusive content.
import type { Level, Quiz } from "../types";

export interface BattleExtraQuiz extends Quiz {
  level: Level;
}

export const BATTLE_EXTRA: BattleExtraQuiz[] = [
  // ---------------------------------------------------------------- B2
  {
    id: "bx1",
    level: "B2",
    q: "___ left earlier, I would have caught the bus.",
    options: ["If I have", "Had I", "Unless I", "Did I"],
    answer: 1,
    explain:
      "Uchinchi shart gapida «if» tushib, «had» gap boshiga chiqadi (inversion): Had I left earlier = If I had left earlier — «agar ertaroq ketganimda».",
  },
  {
    id: "bx2",
    level: "B2",
    q: "I wish my little brother ___ making so much noise!",
    options: ["stopped", "stops", "would stop", "will stop"],
    answer: 2,
    explain:
      "wish + would — boshqa odamning bezovta qiluvchi odatidan shikoyat: «qilovermas edi» deyapmiz. Bir o‘zining odati uchun wish + past simple ishlatiladi.",
  },
  {
    id: "bx3",
    level: "B2",
    q: "You won't pass the exam ___ you practise every day.",
    options: ["unless", "if", "in case", "when"],
    answer: 0,
    explain:
      "unless = «...masa». «Har kuni mashq qilmasang, imtihondan o‘tmaysan» ma‘nosida unless ishlatiladi. If bilan yozsak, ma‘no teskari bo‘lib qoladi.",
  },
  {
    id: "bx4",
    level: "B2",
    q: "The heavy rain didn't ___ our picnic.",
    options: ["effect", "effective", "affection", "affect"],
    answer: 3,
    explain:
      "affect — fe‘l (ta’sir qilmoq), effect — ot (ta’sir, natija). didn't dan keyin fe‘l kerak: didn't affect. Effective — sifat, affection — muhabbat.",
  },
  {
    id: "bx5",
    level: "B2",
    q: "The football match was ___ because of the storm.",
    options: ["called up", "called off", "called on", "called out"],
    answer: 1,
    explain:
      "call off = bekor qilmoq. called up — chaqirmoq (telefonda/armiyaga), called on — murojaat qilmoq, called out — baland ovozda baqirmoq.",
  },
  {
    id: "bx6",
    level: "B2",
    q: "The project must ___ before Friday.",
    options: ["be finished", "finish", "being finished", "have finished"],
    answer: 0,
    explain:
      "must + be + V3 — majburiylikni bildiruvchi passiv: «loyiha juma kuniga qadar tugatilishi shart». Ishni o‘zi emas, natija muhim.",
  },
  {
    id: "bx7",
    level: "B2",
    q: "She said she ___ send the photos the next day.",
    options: ["will", "can", "would", "shall"],
    answer: 2,
    explain:
      "O‘tgan fe‘ldan keyin kelgan gapda will → would, can → could bo‘lib o‘zgaradi: said she would send — «ertaga yuborishini aytdi».",
  },
  {
    id: "bx8",
    level: "B2",
    q: "___ being tired, she kept training for the race.",
    options: ["Despite", "Although", "However", "Because of"],
    answer: 0,
    explain:
      "Despite + ot yoki -ing shakl: despite being tired — «charchaganiga qaramay». Although dan keyin to‘liq gap (ega + fe‘l) kelishi kerak.",
  },
  {
    id: "bx9",
    level: "B2",
    q: "He avoided ___ the same mistake again.",
    options: ["to make", "make", "made", "making"],
    answer: 3,
    explain:
      "avoid, enjoy, finish, mind kabi fe‘llardan keyin doim -ing shakl keladi: avoided making — «xatoni qaytarishdan qochdi».",
  },
  {
    id: "bx10",
    level: "B2",
    q: "Dilsod has been putting half of his pocket money into a jar every week since March. He never buys comics or sweets any more, and yesterday he asked the shop owner to keep the newest telescope for him until the end of the month.\n\nWhy has Dilsod changed his habits?",
    options: [
      "He is saving up for the telescope",
      "He has stopped liking comics",
      "The shop owner pays him money",
      "He lost his jar at the shop",
    ],
    answer: 0,
    explain:
      "Matndan xulosa chiqaramiz: u pul yig‘moqda va do‘konchidan teleskopni saqlab qo‘yishni so‘radi — maqsadi teleskop sotib olish.",
  },

  // ---------------------------------------------------------------- C1
  {
    id: "bx11",
    level: "C1",
    q: "It was in Samarkand ___ I first saw the Registan.",
    options: ["where", "that", "which", "when"],
    answer: 1,
    explain:
      "It-cleft tuzilishi: It was X that... — e’tiborni aynan joyga qaratadi. Joy ravishi bo‘lsa ham, bu tuzilishda that ishlatiladi, where emas.",
  },
  {
    id: "bx12",
    level: "C1",
    q: "If she had studied medicine, she ___ a doctor now.",
    options: ["would be", "would have been", "will be", "is"],
    answer: 0,
    explain:
      "Aralash shart gapi (mixed conditional): sabab o‘tmishda (o‘qimagan), natija hozirda (hozir shifokor emas). Shuning uchun would + be.",
  },
  {
    id: "bx13",
    level: "C1",
    q: "Not only ___ the race, but he also broke the record.",
    options: ["he won", "he did win", "did he win", "won he"],
    answer: 2,
    explain:
      "Not only gap boshiga chiqsa, teskari tartib (inversion) kerak: yordamchi fe‘l gap egasidan oldin keladi — Not only did he win...",
  },
  {
    id: "bx14",
    level: "C1",
    q: "I really don't ___ spending so much time on video games.",
    options: ["approve of", "agree", "admit", "accept"],
    answer: 0,
    explain:
      "approve of + -ing — «ma’qullamoq». agree to do shaklida, admit doing «tan olmoq», accept esa otdan oldin keladi. Bu yerda «ma’qul ko‘rmayman» ma‘nosi kerak.",
  },
  {
    id: "bx15",
    level: "C1",
    q: "___ he tried, he couldn't solve the last puzzle.",
    options: ["Although hard", "However hard", "Even hard", "Despite hard"],
    answer: 1,
    explain:
      "However + sifat + ega + fe‘l = «qanchalik ...esa ham»: However hard he tried — «qancha qattiq urinsa ham». Bu berszon (concession) tuzilishi.",
  },
  {
    id: "bx16",
    level: "C1",
    q: "___ from the mountain, the lake looked tiny.",
    options: ["Seen", "Seeing", "To see", "Having see"],
    answer: 0,
    explain:
      "Ko‘l ko‘rildi — ya’ni passiv ma‘no: Seen from the mountain. Seeing bo‘lsa, ko‘lning o‘zi ko‘rayotganday ma‘no chiqadi (noto‘g‘ri).",
  },
  {
    id: "bx17",
    level: "C1",
    q: "«I'm on the fence about the new timetable.» This means the speaker…",
    options: [
      "is standing outside",
      "dislikes it strongly",
      "has not decided yet",
      "made the timetable",
    ],
    answer: 2,
    explain:
      "to be on the fence — ikkilanmoq, qaror qabul qila olmasmoq. Tasviriy ibora: devor ustida o‘tirgan odam ikki tomonga ham tushmaydi.",
  },
  {
    id: "bx18",
    level: "C1",
    q: "By next August, they ___ the new school in our district.",
    options: ["will open", "will have opened", "are opening", "have opened"],
    answer: 1,
    explain:
      "Future Perfect: «avgustga kelib ochib bo‘lgan bo‘ladilar». Belgisi — By + kelgusi vaqt, shakli — will have + V3.",
  },
  {
    id: "bx19",
    level: "C1",
    q: "Her ___ to solve hard problems quickly impressed the judges.",
    options: ["able", "enable", "ably", "ability"],
    answer: 3,
    explain:
      "So‘z yasalishi: able (sifat) → ability (ot, qobiliyat) → enable (fe‘l) → ably (ravish). her dan keyin ot kerak: her ability to solve.",
  },
  {
    id: "bx20",
    level: "C1",
    q: "Every morning before school, Malika shoots one hundred free throws in the school yard. Her trainers are worn out, and her coach says she sometimes practises when the hall is still dark and empty.\n\nWhat does the text suggest about Malika?",
    options: [
      "She is determined to improve",
      "Her coach forces her to train",
      "She dislikes morning training",
      "She only needs new shoes",
    ],
    answer: 0,
    explain:
      "Xulosa: hech kim majburlamaydi — u o‘zi tong otguncha mashq qiladi. Bu qat’iyatni (determined to improve) bildiradi.",
  },

  // ---------------------------------------------------------------- C2
  {
    id: "bx21",
    level: "C2",
    q: "«Don't let the cat out of the bag about the surprise party!» The speaker asks you not to…",
    options: ["feed the animals", "reveal the secret", "lose the bag", "arrive late"],
    answer: 1,
    explain:
      "to let the cat out of the bag — sirni ochib qo‘ymoq, fosh qilmoq. Idiomani so‘zma-so‘z tarjima qilish mumkin emas.",
  },
  {
    id: "bx22",
    level: "C2",
    q: "We regret ___ you that your application was not successful.",
    options: ["to inform", "informing", "inform", "informed"],
    answer: 0,
    explain:
      "Rasmiy xabarda regret + to infinitive: «afsuski, sizga xabar beramiz». regret + -ing o‘tgan ish uchun shaxsiy afsus bildiradi.",
  },
  {
    id: "bx23",
    level: "C2",
    q: "The plan is ambitious; ___, it is completely realistic.",
    options: ["moreover", "hence", "nevertheless", "likewise"],
    answer: 2,
    explain:
      "nevertheless — «shunga qaramay» qarama-qarshi ma‘no beradi. moreover qo‘shimcha fikr, hence natija, likewise o‘xshashlik bildiradi.",
  },
  {
    id: "bx24",
    level: "C2",
    q: "You may join the advanced class ___ you pass the placement test.",
    options: ["provided", "unless", "in case", "until"],
    answer: 0,
    explain:
      "provided (that) = «...sharti bilan». unless «...masa», in case «...bo‘lib qo‘ysa», until «...gunigacha» ma‘nolarini bildiradi.",
  },
  {
    id: "bx25",
    level: "C2",
    q: "«Once in a blue moon» means…",
    options: ["every month", "at midnight", "very quickly", "very rarely"],
    answer: 3,
    explain:
      "once in a blue moon — juda kamdan-kam hollarda. «Ko‘k oy» (oyning noyob ko‘rinishi) tasviridan kelgan idioma.",
  },
  {
    id: "bx26",
    level: "C2",
    q: "The coach insisted that every player ___ on time.",
    options: ["is", "be", "was", "were"],
    answer: 1,
    explain:
      "insist, demand, suggest + that + subjunctive: fe‘l har qanday shaxsda «be» shaklida qoladi — mandative subjunctive qoidasi.",
  },
  {
    id: "bx27",
    level: "C2",
    q: "Calling the tallest mountain on Earth «a big hill» is an example of…",
    options: ["understatement", "hyperbole", "a simile", "alliteration"],
    answer: 0,
    explain:
      "understatement — ataylab kichraytirib gapirish. Hyperbole aksincha — oshirib tashlash. Simile — o‘xshatish, alliteration — undosh tovushlarning takrori.",
  },
  {
    id: "bx28",
    level: "C2",
    q: "The critics ___ the young writer as «the voice of a new generation».",
    options: ["shouted", "spoke", "hailed", "told"],
    answer: 2,
    explain:
      "to hail somebody/something as — «...deb e’lon qilmoq, olqishlamoq». Rasmiy uslubdagi ibora, tanqidchilar nutqida ko‘p uchraydi.",
  },
];
