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
  // ------------------------------------------------ Pre-A1 / A1 / C1 / C2 (added: thin levels)
  {
    id: "bx29",
    level: "Pre-A1",
    q: "I ___ a student.",
    options: ["am", "is", "are", "be"],
    answer: 0,
    explain:
      "I (men) bilan am ishlatiladi: I am a student — «men o‘quvchiman».",
  },
  {
    id: "bx30",
    level: "Pre-A1",
    q: "She ___ my sister.",
    options: ["am", "is", "are", "be"],
    answer: 1,
    explain:
      "She, he, it bilan is ishlatiladi: She is my sister — «U mening singlim (opam)».",
  },
  {
    id: "bx31",
    level: "Pre-A1",
    q: "What colour is the sky on a sunny day?",
    options: ["red", "blue", "black", "pink"],
    answer: 1,
    explain:
      "Ochiq, quyoshli kunda osmon blue — «ko‘k» rangda bo‘ladi.",
  },
  {
    id: "bx32",
    level: "Pre-A1",
    q: "How many legs does a cat have?",
    options: ["two", "three", "four", "five"],
    answer: 2,
    explain:
      "Mushukning to‘rtta oyog‘i bor: four — «to‘rt».",
  },
  {
    id: "bx33",
    level: "Pre-A1",
    q: "___ is your name? — My name is Ali.",
    options: ["Where", "What", "Who are", "How many"],
    answer: 1,
    explain:
      "Ism so‘ralganda What is your name? deyiladi — «Ismingiz nima?».",
  },
  {
    id: "bx34",
    level: "Pre-A1",
    q: "This is ___ apple.",
    options: ["a", "an", "some", "many"],
    answer: 1,
    explain:
      "Unli tovush bilan boshlanadigan so‘z oldidan an keladi: an apple. Undosh oldidan a: a book.",
  },
  {
    id: "bx35",
    level: "Pre-A1",
    q: "Which word is an animal?",
    options: ["table", "dog", "book", "chair"],
    answer: 1,
    explain:
      "dog — «it» (hayvon). Table — stol, book — kitob, chair — stul: bular buyumlar.",
  },
  {
    id: "bx36",
    level: "Pre-A1",
    q: "Good morning! — ___",
    options: ["Good night!", "Good morning!", "Goodbye!", "Sorry!"],
    answer: 1,
    explain:
      "Salomga shu salom bilan javob beramiz: Good morning! — «Xayrli tong!».",
  },
  {
    id: "bx37",
    level: "Pre-A1",
    q: "I have two ___.",
    options: ["hand", "hands", "a hand", "handes"],
    answer: 1,
    explain:
      "«Ikkita» deganda ko‘plik shakli kerak: two hands. Ko‘plik odatda -s bilan yasaladi.",
  },
  {
    id: "bx38",
    level: "Pre-A1",
    q: "Which one is a fruit?",
    options: ["banana", "bread", "milk", "rice"],
    answer: 0,
    explain:
      "banana — «banan», meva. Bread — non, milk — sut, rice — guruch: bular boshqa oziq-ovqatlar.",
  },
  {
    id: "bx39",
    level: "A1",
    q: "He ___ football every Sunday.",
    options: ["play", "plays", "playing", "is play"],
    answer: 1,
    explain:
      "Present Simple da he/she/it dan keyin fe‘lga -s qo‘shiladi: He plays.",
  },
  {
    id: "bx40",
    level: "A1",
    q: "There ___ three books on the desk.",
    options: ["is", "are", "am", "be"],
    answer: 1,
    explain:
      "Three books — ko‘plik, shuning uchun There are. Birlikda: There is a book.",
  },
  {
    id: "bx41",
    level: "A1",
    q: "I ___ breakfast at seven o'clock.",
    options: ["has", "have", "having", "haves"],
    answer: 1,
    explain:
      "I bilan have ishlatiladi: I have breakfast. Has faqat he/she/it bilan.",
  },
  {
    id: "bx42",
    level: "A1",
    q: "My brother is ___ than me.",
    options: ["tall", "taller", "tallest", "more tall"],
    answer: 1,
    explain:
      "Qisqa sifatlarda taqqoslash -er bilan: taller than — «mendan balandroq».",
  },
  {
    id: "bx43",
    level: "A1",
    q: "When you are thirsty, you ___.",
    options: ["eat bread", "drink water", "read a book", "play football"],
    answer: 1,
    explain:
      "Thirsty — «chanqagan». Chanqaganda suv ichamiz: drink water.",
  },
  {
    id: "bx44",
    level: "A1",
    q: "I ___ like milk.",
    options: ["don't", "doesn't", "isn't", "aren't"],
    answer: 0,
    explain:
      "I bilan inkor shakli don't: I don't like milk — «Men sutni yoqtirmayman».",
  },
  {
    id: "bx45",
    level: "A1",
    q: "Yesterday I ___ to the park.",
    options: ["go", "goes", "went", "going"],
    answer: 2,
    explain:
      "Yesterday — o‘tgan zamon. Go fe‘lining o‘tgan zamon shakli went (noto‘g‘ri fe‘l).",
  },
  {
    id: "bx46",
    level: "A1",
    q: "Which sentence is correct?",
    options: ["She have a cat.", "She has a cat.", "She haves a cat.", "She having a cat."],
    answer: 1,
    explain:
      "She bilan have emas, has ishlatiladi: She has a cat — «Uning mushugi bor».",
  },
  {
    id: "bx47",
    level: "C1",
    q: "By the time we arrived, the film ___.",
    options: ["already started", "had already started", "has already started", "was already starting"],
    answer: 1,
    explain:
      "Ikki o‘tgan voqeadan oldingisi Past Perfect (had + V3) bilan ifodalanadi: film biz kelishimizdan oldin boshlangan.",
  },
  {
    id: "bx48",
    level: "C1",
    q: "She asked me ___ I had finished my homework.",
    options: ["that", "whether", "what", "which"],
    answer: 1,
    explain:
      "Ha/yo‘q savolini ko‘chirma gapda berishda whether (yoki if) ishlatiladi.",
  },
  {
    id: "bx49",
    level: "C1",
    q: "The more you practise, ___ you become.",
    options: ["the better", "better", "the best", "best"],
    answer: 0,
    explain:
      "The + qiyosiy daraja ... the + qiyosiy daraja tuzilishi: qancha ko‘p mashq qilsangiz, shuncha yaxshi bo‘lasiz.",
  },
  {
    id: "bx50",
    level: "C1",
    q: "He is said ___ the best player in the country.",
    options: ["being", "to be", "be", "to being"],
    answer: 1,
    explain:
      "is said to be — passiv tuzilma: «u mamlakatdagi eng yaxshi o‘yinchi deb aytiladi».",
  },
  {
    id: "bx51",
    level: "C1",
    q: "I wish I ___ more time to prepare.",
    options: ["have", "had", "would have", "will have"],
    answer: 1,
    explain:
      "Hozirgi afsus uchun wish + Past Simple: I wish I had... — «qani endi vaqtim ko‘proq bo‘lsa».",
  },
  {
    id: "bx52",
    level: "C1",
    q: "Scarcely ___ sat down when the phone rang.",
    options: ["I had", "had I", "I have", "did I"],
    answer: 1,
    explain:
      "Scarcely/Hardly gap boshida kelsa, Past Perfect da inversiya bo‘ladi: Scarcely had I sat down...",
  },
  {
    id: "bx53",
    level: "C2",
    q: "His speech was so ___ that nobody could disagree.",
    options: ["compelling", "compulsory", "compact", "compatible"],
    answer: 0,
    explain:
      "compelling — ishontiruvchi, ta‘sirchan. Compulsory — majburiy, compact — ixcham, compatible — mos keladigan.",
  },
  {
    id: "bx54",
    level: "C2",
    q: "The new law will come into ___ next month.",
    options: ["effect", "affect", "effective", "affection"],
    answer: 0,
    explain:
      "come into effect — «kuchga kirmoq». Effect — ot (ta‘sir, kuch); affect — fe‘l (ta‘sir qilmoq).",
  },
  {
    id: "bx55",
    level: "C2",
    q: "She has a ___ for languages — she learns them effortlessly.",
    options: ["knack", "knock", "knot", "nick"],
    answer: 0,
    explain:
      "a knack for — «biror ishga qobiliyat, mahorat». Knock — taqillatmoq, knot — tugun.",
  },
  {
    id: "bx56",
    level: "C2",
    q: "Choose the word closest in meaning to “ubiquitous”.",
    options: ["rare", "everywhere", "ancient", "dangerous"],
    answer: 1,
    explain:
      "ubiquitous — «hamma joyda uchraydigan, har yerda mavjud» (everywhere). Rare — kamyob.",
  },
  {
    id: "bx57",
    level: "C2",
    q: "The two reports are ___ — they say completely opposite things.",
    options: ["contradictory", "complementary", "consecutive", "comparable"],
    answer: 0,
    explain:
      "contradictory — bir-biriga zid. Complementary — bir-birini to‘ldiruvchi.",
  },
  {
    id: "bx58",
    level: "C2",
    q: "Hardly anyone ___ the meeting, so it was cancelled.",
    options: ["attended", "attend", "was attended", "had attend"],
    answer: 0,
    explain:
      "Hardly anyone — «deyarli hech kim»; o‘tgan zamon fe‘li: attended. Bekor qilinishi sababi — odamlar kam kelgani.",
  },
];
