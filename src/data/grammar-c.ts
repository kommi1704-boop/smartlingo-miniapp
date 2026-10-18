import type { GrammarLesson } from '../types';

export const GRAMMAR_C: GrammarLesson[] = [
  // ---------------------------------------------------------------- g15
  {
    id: "g15",
    title: "There is / There are",
    titleUz: "Mavjudlik: there is, there are",
    level: "Pre-A1",
    emoji: "📍",
    summaryUz:
      "There is va there are biror joyda nimadir «bor» ekanini aytish uchun ishlatiladi.",
    explanationUz: [
      "O‘zbek tilida «Xonada stol bor» yoki «Parkda ko‘p daraxt bor» deymiz. Inglizchada «bor» ma‘nosini there is yoki there are beradi. Gapda fe‘l albatta bo‘lishi kerak, shuning uchun «bor» so‘zini tushirib qoldirib bo‘lmaydi: There is a table in the room.",
      "Birlikda there is (qisqa shakli there's) ishlatiladi: There is a cat on the sofa. There is some water in the bottle. Ko‘plikda there are ishlatiladi: There are two cats on the sofa. There are many trees in the park. Qaysi fe‘l kerakligini fe‘ldan keyingi birinchi otga qarab topamiz.",
      "Inkor gap: there isn't (there is not) va there aren't (there are not). Ko‘plik va sanalmaydigan otlar bilan odatda any qo‘shiladi: There isn't a bank here. There aren't any chairs. There isn't any milk.",
      "Savol gapda fe‘l there dan oldinga chiqadi: Is there a bank near here? Are there any shops? Qisqa javoblar: Yes, there is. / No, there isn't. Yes, there are. / No, there aren't.",
      "There is bilan have ni adashtirmang. There is joyda nima borligini aytadi: There is a bike in the garden (bog‘da velosiped bor). Have esa egalikni bildiradi: I have a bike (menda velosiped bor). Odatda gap there is dan boshlanib, oxirida joy keladi: on the table, in the bag, near the school.",
    ],
    examples: [
      { en: "There is a book on the desk.", uz: "Stol ustida kitob bor." },
      { en: "There are three apples in the bag.", uz: "Sumkada uchta olma bor." },
      { en: "There isn't any milk in the fridge.", uz: "Muzlatgichda sut yo‘q." },
      { en: "There aren't any students in the classroom.", uz: "Sinfda birorta o‘quvchi yo‘q." },
      { en: "Is there a park near your house?", uz: "Uyingiz yaqinida park bormi?" },
      { en: "Are there any birds in the tree? Yes, there are.", uz: "Daraxtda qushlar bormi? Ha, bor." },
    ],
    mistakes: [
      {
        wrong: "There are a cat in the garden.",
        right: "There is a cat in the garden.",
        noteUz: "A cat birlikda, shuning uchun there is kerak. There are faqat ko‘plik otlar bilan ishlatiladi.",
      },
      {
        wrong: "In my room has a big bed.",
        right: "There is a big bed in my room.",
        noteUz: "O‘zbekchada «xonamda katta karavot bor» deymiz, ammo inglizchada «bor» uchun have emas, there is ishlatiladi.",
      },
      {
        wrong: "There are not any books? / Are any books there?",
        right: "Are there any books?",
        noteUz: "Savolda there is/are tartibi o‘zgaradi: Are there + ot? So‘z tartibini o‘zbekchadagidek qoldirmang.",
      },
    ],
    quiz: [
      {
        id: "g15-q1",
        q: "There ___ a cat on the sofa.",
        options: ["is", "are", "have", "be"],
        answer: 0,
        explain: "A cat birlikda, shuning uchun there is kerak: There is a cat on the sofa.",
      },
      {
        id: "g15-q2",
        q: "There ___ three books on the desk.",
        options: ["is", "has", "are", "be"],
        answer: 2,
        explain: "Three books ko‘plik, shuning uchun there are ishlatiladi.",
      },
      {
        id: "g15-q3",
        q: "___ any milk in the fridge?",
        options: ["Are there", "There is", "Have there", "Is there"],
        answer: 3,
        explain: "Milk sanalmaydigan ot, birlik fe‘l bilan ishlatiladi. Savolda fe‘l oldinga chiqadi: Is there any milk?",
      },
      {
        id: "g15-q4",
        q: "Choose the correct sentence.",
        options: [
          "There isn't two chairs here.",
          "There aren't two chairs here.",
          "There not are two chairs here.",
          "Not there are two chairs here.",
        ],
        answer: 1,
        explain: "Two chairs ko‘plik, inkorda there aren't ishlatiladi. Inkor so‘zi fe‘ldan keyin turadi.",
      },
      {
        id: "g15-q5",
        q: "Choose the correct question.",
        options: [
          "Are there a library in your town?",
          "Do there is a library in your town?",
          "Is there a library in your town?",
          "There are a library in your town?",
        ],
        answer: 2,
        explain: "A library birlikda, shuning uchun savol Is there ...? bilan boshlanadi. Do bilan savol tuzilmaydi.",
      },
    ],
  },

  // ---------------------------------------------------------------- g16
  {
    id: "g16",
    title: "Plural nouns",
    titleUz: "Ko‘plik shakli",
    level: "A1",
    emoji: "🍎",
    summaryUz:
      "Inglizchada otning ko‘pligi odatda -s bilan yasaladi, lekin -es, -ies va tartibsiz shakllar ham bor.",
    explanationUz: [
      "O‘zbek tilida ko‘plik «-lar» qo‘shimchasi bilan yasaladi: kitob → kitoblar. Inglizchada odatda otning oxiriga -s qo‘shiladi: book → books, cat → cats. Muhim farq: o‘zbekchada «ikkita kitob» deymiz (ot birlikda qoladi), inglizchada esa sondan keyin ot ko‘plikda bo‘ladi: two books.",
      "Qoidalar: -s, -ss, -sh, -ch, -x bilan tugasa, -es qo‘shiladi (bus → buses, box → boxes, watch → watches, dish → dishes). Undoshdan keyingi -y ni olib tashlab -ies qo‘yamiz (city → cities, baby → babies), unlidan keyingi -y esa faqat -s oladi (boy → boys, day → days). Ba‘zi -o bilan tugaydigan so‘zlar -es oladi (tomato → tomatoes), ammo photo → photos, piano → pianos.",
      "-f yoki -fe bilan tugaydigan ayrim so‘zlarda f harfi v ga almashadi: leaf → leaves, knife → knives, wife → wives.",
      "Tartibsiz ko‘plik shakllarini yodlash kerak: man → men, woman → women, child → children, foot → feet, tooth → teeth, mouse → mice, person → people. Sheep va fish ko‘plikda ham o‘zgarmaydi: one sheep, two sheep. Children va people allaqachon ko‘plik, shuning uchun childrens yoki peoples demaymiz.",
      "Ko‘plikda a/an ishlatilmaydi va this/that ham o‘zgaradi: this → these, that → those. Fe‘l ham ko‘plik shaklida keladi: These apples are red. Jeans, trousers, glasses, scissors kabi juft narsalar doim ko‘plikda: My jeans are new.",
    ],
    examples: [
      { en: "I have two brothers and three sisters.", uz: "Mening ikkita akam va uchta opam bor." },
      { en: "There are many boxes in the room.", uz: "Xonada ko‘p qutilar bor." },
      { en: "The children are in the garden.", uz: "Bolalar bog‘da." },
      { en: "My feet are cold.", uz: "Oyoqlarim sovuq." },
      { en: "These babies are very small.", uz: "Bu chaqaloqlar juda kichkina." },
      { en: "Those women are teachers.", uz: "Anavi ayollar o‘qituvchilar." },
    ],
    mistakes: [
      {
        wrong: "I have two book.",
        right: "I have two books.",
        noteUz: "O‘zbekchada «ikkita kitob» deymiz, ammo inglizchada sondan keyin ot albatta ko‘plikda bo‘ladi.",
      },
      {
        wrong: "Three childs are in the park.",
        right: "Three children are in the park.",
        noteUz: "Child tartibsiz ot: ko‘pligi children. Child ga -s qo‘shib bo‘lmaydi.",
      },
      {
        wrong: "My jeans is new.",
        right: "My jeans are new.",
        noteUz: "Jeans doim ko‘plik hisoblanadi, shuning uchun fe‘l ham are bo‘ladi.",
      },
    ],
    quiz: [
      {
        id: "g16-q1",
        q: "I have two ___.",
        options: ["box", "boxes", "boxs", "boxies"],
        answer: 1,
        explain: "-x bilan tugagan otlar -es oladi: box → boxes.",
      },
      {
        id: "g16-q2",
        q: "There are three ___ in the park.",
        options: ["childs", "childrens", "child", "children"],
        answer: 3,
        explain: "Child ning ko‘pligi tartibsiz: children. Children ga yana -s qo‘shilmaydi.",
      },
      {
        id: "g16-q3",
        q: "Choose the correct plural of city.",
        options: ["cities", "citys", "cityes", "citis"],
        answer: 0,
        explain: "Undoshdan keyingi -y -ies ga almashadi: city → cities.",
      },
      {
        id: "g16-q4",
        q: "My ___ hurt after the long walk.",
        options: ["foots", "foot", "feet", "feets"],
        answer: 2,
        explain: "Foot ning ko‘pligi feet. Fe‘l hurt ko‘plik subyekt bilan keladi.",
      },
      {
        id: "g16-q5",
        q: "Which sentence is correct?",
        options: [
          "Two man are in the car.",
          "Two men are in the car.",
          "Two mans are in the car.",
          "Two men is in the car.",
        ],
        answer: 1,
        explain: "Man ning ko‘pligi men, ko‘plik bilan are ishlatiladi: Two men are in the car.",
      },
    ],
  },

  // ---------------------------------------------------------------- g17
  {
    id: "g17",
    title: "Countable and uncountable nouns (some / any)",
    titleUz: "Sanaladigan va sanalmaydigan otlar",
    level: "A1",
    emoji: "🥛",
    summaryUz:
      "Ba‘zi otlarni sanash mumkin (apple), ba‘zilarini mumkin emas (milk), va ular some hamda any bilan har xil ishlatiladi.",
    explanationUz: [
      "Sanaladigan otlarni bittadan sanash mumkin: one apple, two apples, three books. Ular a/an bilan ham, ko‘plik shaklida ham ishlatiladi. Sanalmaydigan otlarni esa sanab bo‘lmaydi: water, milk, rice, bread, money, homework, music, advice. Ularda a/an ham, ko‘plik -s ham bo‘lmaydi, fe‘l birlikda keladi: Money is important.",
      "O‘zbek tilida artikl yo‘q, shuning uchun «bir non» yoki «ozgina suv» deyish tabiiy tuyuladi. Inglizchada esa sanalmaydigan otlarga a/an qo‘shmaymiz: ~~a water~~. Aniq miqdor kerak bo‘lsa, o‘lchov so‘zi ishlatamiz: a glass of water, a piece of bread, a bottle of milk, a bowl of rice.",
      "Some darak gaplarda ishlatiladi va sanaladigan ko‘plik hamda sanalmaydigan otlar bilan keladi: I have some apples. There is some milk. Any inkor gap va savollarda ishlatiladi: I don't have any apples. Is there any milk?",
      "Taklif va iltimoslarda savol bo‘lsa ham some ishlatiladi, chunki biz «ha» javobini kutamiz: Would you like some tea? Can I have some water?",
      "Ehtiyot bo‘ling: homework, information, advice, news, money inglizchada sanalmaydi, garchi o‘zbekchada ular ko‘plikka o‘xshab tuyulishi mumkin. Shuning uchun homeworks, informations, advices demaymiz: I have some homework. She gave me some advice.",
    ],
    examples: [
      { en: "I have some apples in my bag.", uz: "Sumkamda bir nechta olma bor." },
      { en: "There isn't any milk in the fridge.", uz: "Muzlatgichda sut yo‘q." },
      { en: "Do you have any brothers or sisters?", uz: "Sizning aka-ukalaringiz yoki opa-singillaringiz bormi?" },
      { en: "Would you like some tea?", uz: "Choy ichasizmi?" },
      { en: "Money is not everything.", uz: "Pul hamma narsa emas." },
      { en: "She gave me some good advice.", uz: "U menga yaxshi maslahat berdi." },
    ],
    mistakes: [
      {
        wrong: "I have a homework.",
        right: "I have some homework.",
        noteUz: "Homework sanalmaydigan ot, shuning uchun a ishlatilmaydi. Some yoki hech narsa qo‘ymaymiz.",
      },
      {
        wrong: "Can you give me an advice?",
        right: "Can you give me some advice?",
        noteUz: "Advice ham sanalmaydigan ot: a/an va -s bo‘lmaydi. Bitta maslahat uchun a piece of advice deymiz.",
      },
      {
        wrong: "I don't have some money.",
        right: "I don't have any money.",
        noteUz: "Inkor gapda some emas, any ishlatiladi.",
      },
    ],
    quiz: [
      {
        id: "g17-q1",
        q: "We need ___ rice for dinner.",
        options: ["a", "an", "some", "many"],
        answer: 2,
        explain: "Rice sanalmaydigan ot, shuning uchun darak gapda some ishlatiladi. A/an va many mos kelmaydi.",
      },
      {
        id: "g17-q2",
        q: "There aren't ___ apples in the bag.",
        options: ["a", "some", "much", "any"],
        answer: 3,
        explain: "Inkor gapda ko‘plik otdan oldin any ishlatiladi: There aren't any apples.",
      },
      {
        id: "g17-q3",
        q: "Do you have ___ homework today?",
        options: ["a", "any", "an", "many"],
        answer: 1,
        explain: "Homework sanalmaydigan ot, savolda any ishlatiladi. A/an va many sanalmaydigan ot bilan kelmaydi.",
      },
      {
        id: "g17-q4",
        q: "Choose the correct sentence.",
        options: [
          "There is some money in my bag.",
          "She gave me an advice.",
          "We need some informations.",
          "I don't have any moneys.",
        ],
        answer: 0,
        explain: "Money, advice va information sanalmaydigan otlar: an, -s qo‘shilmaydi. Faqat birinchi gap to‘g‘ri.",
      },
      {
        id: "g17-q5",
        q: "Is there ___ sugar in your tea?",
        options: ["a", "an", "any", "many"],
        answer: 2,
        explain: "Sugar sanalmaydigan ot, oddiy savolda any ishlatiladi: Is there any sugar...?",
      },
    ],
  },

  // ---------------------------------------------------------------- g18
  {
    id: "g18",
    title: "Possessive adjectives and 's",
    titleUz: "Egalik shakllari",
    level: "A1",
    emoji: "👜",
    summaryUz:
      "My, your, his, her, its, our, their va 's narsa kimga tegishli ekanini ko‘rsatadi.",
    explanationUz: [
      "O‘zbek tilida egalik qo‘shimcha bilan beriladi: kitobim, kitobing, kitobi. Inglizchada esa ot oldidan alohida so‘z keladi: my book, your book, his book. Egalik sifatlari: my (mening), your (sening, sizning), his (uning, o‘g‘il bolaniki), her (uning, qiz bolaniki), its (uning, narsa yoki hayvonniki), our (bizning), their (ularning).",
      "O‘zbekchada «uning» so‘zi erkak va ayolga bir xil, inglizchada esa egasining jinsiga qarab tanlanadi: Tom has a sister. His sister is ten. Anna has a brother. Her brother is twelve. Egalik sifati ot oldida turadi va a/the bilan birga ishlatilmaydi: my room (the my room emas).",
      "Egasi ism yoki ot bo‘lsa, 's qo‘shamiz: Tom's bag, my friend's phone. Bu «Tomning sumkasi» degani. Ko‘plik -s bilan tugagan otlarda faqat apostrof qo‘yiladi: my parents' car, the girls' room. Tartibsiz ko‘plikda esa yana 's: the children's toys.",
      "Its va it's ni adashtirmang. Its egalik bildiradi (The cat is washing its paws). It's esa it is ning qisqartmasi (It's cold today). Egalik 's va is ning qisqartmasi 's ham bir xil yoziladi: Tom's happy = Tom is happy, Tom's bike = Tomning velosipedi.",
      "Egalik sifatidan keyin ot kelishi shart. Agar ot tushib qolsa, boshqa shakl (mine, yours, hers) ishlatiladi: This is my bag. This bag is mine. Boshlovchi o‘quvchilar uchun asosiysi: oldin egalik sifati, keyin ot.",
    ],
    examples: [
      { en: "This is my bag.", uz: "Bu mening sumkam." },
      { en: "Her name is Aisha.", uz: "Uning ismi Oisha." },
      { en: "They love their school.", uz: "Ular maktabini yaxshi ko‘radi." },
      { en: "Tom's mother is a nurse.", uz: "Tomning onasi hamshira." },
      { en: "The girls' room is on the left.", uz: "Qizlarning xonasi chap tomonda." },
      { en: "The cat is washing its paws.", uz: "Mushuk panjalarini yuvyapti." },
    ],
    mistakes: [
      {
        wrong: "I like the my room.",
        right: "I like my room.",
        noteUz: "Egalik sifati bilan the ishlatilmaydi. Faqat bittasini tanlaymiz: my room yoki the room.",
      },
      {
        wrong: "This is the book of Tom.",
        right: "This is Tom's book.",
        noteUz: "Odamlarning narsalari uchun odatda 's ishlatiladi. The book of Tom o‘zbekcha «Tomning kitobi» tuzilmasidan olingan va g‘ayritabiiy eshitiladi.",
      },
      {
        wrong: "The cat likes it's food.",
        right: "The cat likes its food.",
        noteUz: "Egalik uchun its (apostrofsiz) yoziladi. It's faqat it is yoki it has ning qisqartmasi.",
      },
    ],
    quiz: [
      {
        id: "g18-q1",
        q: "This is Anna. ___ brother is a doctor.",
        options: ["She", "Hers", "She's", "Her"],
        answer: 3,
        explain: "Ot (brother) oldidan egalik sifati kerak. Anna qiz bo‘lgani uchun her ishlatiladi.",
      },
      {
        id: "g18-q2",
        q: "We love ___ new teacher.",
        options: ["our", "ours", "us", "we"],
        answer: 0,
        explain: "Teacher ot oldidan we ning egalik sifati our keladi: our new teacher.",
      },
      {
        id: "g18-q3",
        q: "That is ___ bike.",
        options: ["Tom", "Toms", "Tom's", "Toms'"],
        answer: 2,
        explain: "Bitta shaxsning egaligini ko‘rsatish uchun ismga 's qo‘shiladi: Tom's bike.",
      },
      {
        id: "g18-q4",
        q: "These are my ___ books.",
        options: ["parent's", "parents'", "parents", "parent"],
        answer: 1,
        explain: "Ko‘plik -s bilan tugagan otda faqat apostrof qo‘yiladi: my parents' books.",
      },
      {
        id: "g18-q5",
        q: "The bird is in the cage. ___ wings are blue.",
        options: ["It's", "Their", "Hers", "Its"],
        answer: 3,
        explain: "Qush (narsa yoki hayvon) uchun egalik sifati its (apostrofsiz): Its wings are blue.",
      },
    ],
  },

  // ---------------------------------------------------------------- g19
  {
    id: "g19",
    title: "Adverbs of frequency",
    titleUz: "Takrorlanish ravishlari",
    level: "A1",
    emoji: "📆",
    summaryUz:
      "Always, usually, often, sometimes, never kabi so‘zlar ish qanchalik tez-tez bo‘lishini ko‘rsatadi.",
    explanationUz: [
      "Takrorlanish ravishlari biror ish qanchalik tez-tez takrorlanishini bildiradi. Ularni foizlar bilan tasavvur qilish oson: always (doim, 100%), usually (odatda), often (tez-tez), sometimes (ba‘zan), hardly ever yoki rarely (juda kam), never (hech qachon, 0%).",
      "O‘zbek tilida «men doim maktabga piyoda boraman» deymiz, ravish fe‘ldan oldin keladi va tartib erkin. Inglizchada qoida qat‘iy: ravish asosiy fe‘ldan oldin turadi (I always walk to school), lekin am/is/are dan keyin turadi (He is never late). Fe‘ldan keyin qo‘yish xato: I walk always.",
      "Sometimes gapning boshida yoki oxirida ham kelishi mumkin: Sometimes I walk to school. I walk to school sometimes. Ammo always va never gap boshida deyarli ishlatilmaydi.",
      "Never o‘zi inkor ma‘nosiga ega, shuning uchun don't/doesn't bilan birga ishlatilmaydi. To‘g‘ri: She never eats meat. Noto‘g‘ri: She doesn't never eat meat. Savol gapda ravish gap egasidan keyin turadi: Do you often play chess?",
      "Qancha tez-tez ekanini so‘rash uchun How often ...? iborasi ishlatiladi. Javobda every day, once a week, twice a month, three times a year kabi iboralar gapning oxirida turadi: How often do you visit your grandparents? — Twice a month.",
    ],
    examples: [
      { en: "I always brush my teeth before bed.", uz: "Men har doim yotishdan oldin tishimni yuvaman." },
      { en: "My dad is usually at home in the evening.", uz: "Dadam kechqurun odatda uyda bo‘ladi." },
      { en: "We often play chess after school.", uz: "Biz maktabdan keyin tez-tez shaxmat o‘ynaymiz." },
      { en: "Sometimes I walk to school.", uz: "Ba‘zan maktabga piyoda boraman." },
      { en: "She hardly ever eats fast food.", uz: "U tez tayyor ovqatni juda kam yeydi." },
      { en: "How often do you visit your grandparents? Twice a month.", uz: "Bobo-buvingizning oldiga qanchalik tez-tez borasiz? Oyiga ikki marta." },
    ],
    mistakes: [
      {
        wrong: "I go always to school by bus.",
        right: "I always go to school by bus.",
        noteUz: "Ravish asosiy fe‘ldan oldin turadi, undan keyin emas.",
      },
      {
        wrong: "He never is late.",
        right: "He is never late.",
        noteUz: "Be fe‘li (am/is/are) bo‘lsa, ravish undan keyin keladi: is never, are always.",
      },
      {
        wrong: "I don't never eat fish.",
        right: "I never eat fish.",
        noteUz: "Never o‘zi inkor ma‘nosini beradi. Inglizchada ikki marta inkor qilinmaydi.",
      },
    ],
    quiz: [
      {
        id: "g19-q1",
        q: "I ___ get up at six on school days.",
        options: ["always am", "always", "do always", "is always"],
        answer: 1,
        explain: "Ravish asosiy fe‘l (get) dan oldin turadi va bu yerda yordamchi fe‘l kerak emas: I always get up.",
      },
      {
        id: "g19-q2",
        q: "She ___ late for school.",
        options: ["never is", "are never", "is never", "does never"],
        answer: 2,
        explain: "She bilan is ishlatiladi va ravish be fe‘lidan keyin keladi: She is never late.",
      },
      {
        id: "g19-q3",
        q: "Choose the correct sentence.",
        options: [
          "He often watches TV.",
          "He watches often TV.",
          "He watches TV often at.",
          "He TV often watches.",
        ],
        answer: 0,
        explain: "Often asosiy fe‘l watches dan oldin turadi: He often watches TV.",
      },
      {
        id: "g19-q4",
        q: "___ do you visit your grandparents? — Every Sunday.",
        options: ["How much", "How long", "How many", "How often"],
        answer: 3,
        explain: "«Qanchalik tez-tez» deb so‘rash uchun How often ishlatiladi.",
      },
      {
        id: "g19-q5",
        q: "We ___ go to the cinema; maybe once a year.",
        options: ["often", "always", "hardly ever", "every day"],
        answer: 2,
        explain: "Yiliga bir marta juda kam, shuning uchun hardly ever mos keladi. Often va always bu ma‘noga mos kelmaydi.",
      },
    ],
  },

  // ---------------------------------------------------------------- g20
  {
    id: "g20",
    title: "Question words",
    titleUz: "So‘roq so‘zlar",
    level: "A1",
    emoji: "❓",
    summaryUz:
      "What, who, where, when, why, how kabi so‘roq so‘zlar gap boshiga qo‘yilib, aniq ma‘lumot so‘rashga yordam beradi.",
    explanationUz: [
      "Asosiy so‘roq so‘zlar: what (nima), who (kim), where (qayerda, qayerga), when (qachon), why (nega), how (qanday), which (qaysi), whose (kimning). Qo‘shma shakllar: how old (necha yoshda), how many (nechta, sanaladigan otlar bilan), how much (qancha, sanalmaydigan otlar yoki narx), how often (qanchalik tez-tez), how long (qancha vaqt).",
      "O‘zbek tilida so‘roq so‘z odatda gap ichida, fe‘l oldida turadi: «Sen qayerda yashaysan?» Inglizchada so‘roq so‘z har doim gapning boshida keladi: Where do you live? Shuning uchun inglizcha so‘z tartibini yodlash kerak.",
      "Tartib: so‘roq so‘z + yordamchi fe‘l (do/does/is/are/was/can) + gap egasi + asosiy fe‘l. Masalan: What do you want? Where does she work? Why are you sad? Yordamchi fe‘lni tushirib bo‘lmaydi: Where you live? xato.",
      "Agar so‘roq so‘z o‘zi gap egasi bo‘lsa (Who? What? ish bajaruvchini so‘rasa), do/does kerak emas: Who lives here? What happened? Bu yerda fe‘l 3-shaxs birlik shaklida bo‘ladi.",
      "How many bilan sanaladigan ko‘plik ot, how much bilan sanalmaydigan ot ishlatiladi: How many books do you have? How much water do you drink? Which tanlov bo‘lganda ishlatiladi: Which bag is yours, the red one or the blue one? Whose egalikni so‘raydi: Whose bag is this? — It's Ali's.",
    ],
    examples: [
      { en: "What is your name?", uz: "Ismingiz nima?" },
      { en: "Where does she live?", uz: "U qayerda yashaydi?" },
      { en: "When is your birthday?", uz: "Tug‘ilgan kuningiz qachon?" },
      { en: "Why are you sad?", uz: "Nega xafasan?" },
      { en: "How old are you?", uz: "Necha yoshdasiz?" },
      { en: "Which bag is yours?", uz: "Qaysi sumka seniki?" },
    ],
    mistakes: [
      {
        wrong: "Where you live?",
        right: "Where do you live?",
        noteUz: "So‘roq so‘zdan keyin yordamchi fe‘l (do/does) kerak: Where + do + you + live?",
      },
      {
        wrong: "What your name is?",
        right: "What is your name?",
        noteUz: "Be fe‘li savolda gap egasidan oldin turadi: What + is + your name?",
      },
      {
        wrong: "How much friends do you have?",
        right: "How many friends do you have?",
        noteUz: "Friends sanaladigan ko‘plik ot, shuning uchun how many ishlatiladi.",
      },
    ],
    quiz: [
      {
        id: "g20-q1",
        q: "___ is your favourite colour? — Blue.",
        options: ["What", "Who", "Where", "When"],
        answer: 0,
        explain: "Narsa haqida «nima» deb so‘raganda what ishlatiladi.",
      },
      {
        id: "g20-q2",
        q: "___ do you live? — In Samarkand.",
        options: ["Who", "When", "Why", "Where"],
        answer: 3,
        explain: "Javob joy (Samarkandda), shuning uchun where kerak.",
      },
      {
        id: "g20-q3",
        q: "___ is that boy? — He's my cousin.",
        options: ["What", "Who", "Where", "How"],
        answer: 1,
        explain: "Odam haqida «kim» deb so‘raganda who ishlatiladi.",
      },
      {
        id: "g20-q4",
        q: "___ do you go to bed so late? — Because I read books.",
        options: ["When", "How", "Why", "Who"],
        answer: 2,
        explain: "Because bilan sabab javob beriladi, sabab so‘raladigan so‘z why.",
      },
      {
        id: "g20-q5",
        q: "___ books do you have? — Ten.",
        options: ["How many", "How much", "How long", "How often"],
        answer: 0,
        explain: "Books sanaladigan ko‘plik ot, son so‘raladi: how many.",
      },
    ],
  },

  // ---------------------------------------------------------------- g21
  {
    id: "g21",
    title: "Past Continuous",
    titleUz: "O‘tgan davomli zamon",
    level: "A2",
    emoji: "⏳",
    summaryUz:
      "Past Continuous o‘tmishdagi aniq paytda davom etayotgan ish haqida gapirish uchun ishlatiladi.",
    explanationUz: [
      "Past Continuous o‘tmishda biror paytda ish jarayoni davom etayotganini ko‘rsatadi. O‘zbekchada bu «-yotgan edi» shakliga yaqin: «Kecha soat sakkizda televizor ko‘rayotgan edim». Inglizchada: At eight yesterday, I was watching TV.",
      "Yasalishi: was/were + fe‘l + -ing. I/he/she/it bilan was, you/we/they bilan were ishlatiladi: I was reading. They were playing. -ing qo‘shishda: make → making (e tushadi), run → running (undosh ikkilanadi), lie → lying.",
      "Inkor gap: wasn't/weren't + V-ing: She wasn't sleeping. Savol gap: Was/Were + gap egasi + V-ing? Was he sleeping? What were you doing? Qisqa javob: Yes, he was. / No, he wasn't.",
      "Ko‘pincha Past Continuous Past Simple bilan birga ishlatiladi. Uzoq davom etgan ish (fon) Past Continuous bilan, qisqa voqea Past Simple bilan beriladi: I was walking home when it started to rain. Ikkita bir vaqtda davom etgan ish while bilan bog‘lanadi: While Dad was cooking, we were setting the table.",
      "Eslab qoling: know, like, love, want kabi holatni bildiruvchi fe‘llar odatda Continuous shaklda ishlatilmaydi. Shuningdek, tugagan qisqa voqea uchun Past Simple ishlating: I was walking when I saw a dog (saw, was seeing emas).",
    ],
    examples: [
      { en: "At 8 p.m. yesterday, I was watching a film.", uz: "Kecha kechqurun soat sakkizda men film ko‘rayotgan edim." },
      { en: "They were playing football in the yard.", uz: "Ular hovlida futbol o‘ynayotgan edi." },
      { en: "What were you doing at six?", uz: "Soat oltida nima qilayotgan eding?" },
      { en: "She wasn't sleeping; she was reading.", uz: "U uxlayotgan emas edi, kitob o‘qiyotgan edi." },
      { en: "I was walking home when it started to rain.", uz: "Uyga ketayotganimda yomg‘ir yog‘a boshladi." },
      { en: "While Dad was cooking, we were setting the table.", uz: "Dadam ovqat pishirayotganida biz dasturxon yozayotgan edik." },
    ],
    mistakes: [
      {
        wrong: "I was watch TV.",
        right: "I was watching TV.",
        noteUz: "Was/were dan keyin fe‘lga -ing qo‘shiladi. Oddiy fe‘l shakli ishlatilmaydi.",
      },
      {
        wrong: "They was playing in the garden.",
        right: "They were playing in the garden.",
        noteUz: "They, we, you bilan was emas, were ishlatiladi.",
      },
      {
        wrong: "I was walking when I was seeing a dog.",
        right: "I was walking when I saw a dog.",
        noteUz: "Qisqa, to‘satdan bo‘lgan voqea Past Simple bilan beriladi (saw), davom etgan fon esa Past Continuous bilan.",
      },
    ],
    quiz: [
      {
        id: "g21-q1",
        q: "At 8 p.m. yesterday, I ___ my homework.",
        options: ["was do", "was doing", "were doing", "am doing"],
        answer: 1,
        explain: "I bilan was, keyin fe‘l + -ing ishlatiladi: was doing.",
      },
      {
        id: "g21-q2",
        q: "They ___ football when it started to rain.",
        options: ["was playing", "playing", "were playing", "are playing"],
        answer: 2,
        explain: "They bilan were, keyin V-ing: were playing. Gap o‘tgan zamonda, shuning uchun are mos emas.",
      },
      {
        id: "g21-q3",
        q: "What ___ you doing at five yesterday?",
        options: ["was", "is", "did", "were"],
        answer: 3,
        explain: "Past Continuous savolida you bilan were ishlatiladi: What were you doing?",
      },
      {
        id: "g21-q4",
        q: "She ___ TV at that moment; she was reading.",
        options: ["wasn't watching", "weren't watching", "didn't watching", "not watching"],
        answer: 0,
        explain: "She bilan wasn't + V-ing: wasn't watching. Didn't bilan -ing shakli ishlatilmaydi.",
      },
      {
        id: "g21-q5",
        q: "Choose the correct sentence.",
        options: [
          "I were cooking when my friend called.",
          "I cooking when my friend called.",
          "I was cooking when my friend called.",
          "I was cook when my friend called.",
        ],
        answer: 2,
        explain: "I bilan was, keyin V-ing: I was cooking. Boshqa variantlarda yordamchi fe‘l yoki -ing yo‘q.",
      },
    ],
  },

  // ---------------------------------------------------------------- g22
  {
    id: "g22",
    title: "Used to",
    titleUz: "“Used to” — avval qilardim",
    level: "A2",
    emoji: "🕰️",
    summaryUz:
      "Used to o‘tmishda odat bo‘lgan yoki mavjud bo‘lgan, ammo hozir yo‘q ishlar haqida gapirishda ishlatiladi.",
    explanationUz: [
      "Used to o‘tmishdagi odat yoki holatni ko‘rsatadi, lekin hozir u endi yo‘q. O‘zbekchada «avval ... qilardim», «... bo‘lar edi» ma‘nosiga yaqin: I used to play with toy cars (bolaligimda mashinachalar bilan o‘ynardim, hozir o‘ynamayman).",
      "Tuzilishi: used to + fe‘lning oddiy shakli. Hamma shaxslarda bir xil: I/he/she/we/they used to live in Bukhara. Used to dan keyin -s yoki -ing qo‘shilmaydi: she used to walk (walks yoki walking emas).",
      "Inkor va savolda did yordamchi fe‘li ishlatiladi va used to dan d tushib qoladi: I didn't use to like fish. Did you use to read comics? Did dan keyin fe‘l har doim oddiy shaklda, shuning uchun use to deymiz.",
      "Used to holatlar uchun ham ishlatiladi: There used to be a small shop here (avval bu yerda kichik do‘kon bor edi). Ammo aniq marta yoki muddat aytilsa, Past Simple ishlatiladi: I went there three times (I used to go there three times emas).",
      "Used to ni be used to + V-ing («ko‘nikkan») bilan adashtirmang: I am used to getting up early (men erta turishga ko‘nikkanman). Ularning ma‘nosi ham, tuzilishi ham boshqa.",
    ],
    examples: [
      { en: "I used to play with toy cars.", uz: "Men avval o‘yinchoq mashinalar bilan o‘ynardim." },
      { en: "We used to live in Bukhara.", uz: "Biz avval Buxoroda yashardik." },
      { en: "She didn't use to like fish.", uz: "U avval baliqni yoqtirmasdi." },
      { en: "Did you use to read comics?", uz: "Sen avval komikslar o‘qirmiding?" },
      { en: "There used to be a small shop here.", uz: "Avval bu yerda kichik do‘kon bor edi." },
      { en: "My grandpa used to tell us stories every night.", uz: "Bobom avval har kecha bizga ertak aytib berardi." },
    ],
    mistakes: [
      {
        wrong: "I use to go to the park every day.",
        right: "I used to go to the park every day.",
        noteUz: "Darak gapda used to deb d bilan yoziladi, chunki bu o‘tgan zamon shakli.",
      },
      {
        wrong: "Did you used to play chess?",
        right: "Did you use to play chess?",
        noteUz: "Did bilan o‘tgan zamon belgisi did da turadi, shuning uchun use to (d siz) bo‘ladi.",
      },
      {
        wrong: "I used to going to school by bus.",
        right: "I used to go to school by bus.",
        noteUz: "Used to dan keyin fe‘lning oddiy shakli keladi, -ing emas.",
      },
    ],
    quiz: [
      {
        id: "g22-q1",
        q: "When I was little, I ___ play with toy cars.",
        options: ["used to", "use to", "was used to", "using to"],
        answer: 0,
        explain: "Darak gapda used to + oddiy fe‘l: I used to play. Was used to boshqa ma‘no beradi.",
      },
      {
        id: "g22-q2",
        q: "She ___ have long hair, but now it is short.",
        options: ["use to", "is used to", "used to", "didn't use to"],
        answer: 2,
        explain: "Avval uzun soch bor edi, hozir yo‘q, shuning uchun darak gapda used to ishlatiladi.",
      },
      {
        id: "g22-q3",
        q: "Did you ___ live in Tashkent?",
        options: ["used to", "use to", "used", "using to"],
        answer: 1,
        explain: "Did bilan savolda use to (d siz) ishlatiladi.",
      },
      {
        id: "g22-q4",
        q: "He ___ like vegetables, but now he eats them every day.",
        options: ["didn't used to", "not use to", "don't use to", "didn't use to"],
        answer: 3,
        explain: "Inkor: didn't + use to. Didn't dan keyin used emas, use keladi.",
      },
      {
        id: "g22-q5",
        q: "Choose the correct sentence.",
        options: [
          "I used to walking to school when I was ten.",
          "I use to walk to school when I was ten.",
          "I used to walk to school when I was ten.",
          "I was used to walk to school when I was ten.",
        ],
        answer: 2,
        explain: "To‘g‘ri tuzilma: used to + oddiy fe‘l. Used to dan keyin -ing qo‘yilmaydi va use to darakda ishlatilmaydi.",
      },
    ],
  },

  // ---------------------------------------------------------------- g23
  {
    id: "g23",
    title: "Quantifiers (much, many, a lot of, few, little)",
    titleUz: "Miqdor so‘zlari",
    level: "A2",
    emoji: "📊",
    summaryUz:
      "Much, many, a lot of, few va little narsalar qancha ekanini bildiradi, tanlash esa otning sanaladigan yoki sanalmaydiganligiga bog‘liq.",
    explanationUz: [
      "Miqdor so‘zlarini tanlash uchun avval otga qarang: sanaladigan (book, friend) yoki sanalmaydigan (water, time, money). O‘zbekchada «ko‘p» so‘zi ikkala holatda ham ishlatiladi: ko‘p kitob, ko‘p suv. Inglizchada esa har xil so‘z kerak.",
      "Many sanaladigan ko‘plik otlar bilan ishlatiladi: many books, many friends. Much sanalmaydigan otlar bilan ishlatiladi: much water, much time. Ikkalasi asosan inkor gap va savollarda keladi: I don't have many books. Do you have much time? How many friends? How much money?",
      "A lot of (yoki lots of) ikkala turdagi ot bilan ham ishlatiladi, ayniqsa darak gapda: She has a lot of friends. We have a lot of homework. Darak gapda much ishlatilmaydi: I have much homework deyish g‘ayritabiiy, a lot of homework deymiz.",
      "Few va a few sanaladigan ko‘plik otlar bilan, little va a little sanalmaydigan otlar bilan ishlatiladi: few friends, a little milk. A bor-yo‘qligi ma‘noni o‘zgartiradi. A few / a little «ozgina bor, yetarli» (ijobiy): We have a few apples, so let's make a pie. Few / little «deyarli yo‘q» (salbiy): I have very little time, so I can't go out.",
      "Too much va too many «keragidan ortiq» degani: too much sugar, too many cars. Eslab qolish uchun: many + sanaladigan, much + sanalmaydigan, a lot of + ikkalasi.",
    ],
    examples: [
      { en: "How many books do you have?", uz: "Sizda nechta kitob bor?" },
      { en: "I don't have much time.", uz: "Mening vaqtim ko‘p emas." },
      { en: "She has a lot of friends.", uz: "Uning do‘stlari ko‘p." },
      { en: "There is a little milk in the glass.", uz: "Stakanda ozgina sut bor." },
      { en: "Few students came to the party.", uz: "Ziyofatga juda kam o‘quvchi keldi." },
      { en: "We have a few apples, so let's make a pie.", uz: "Bizda bir nechta olma bor, keling pirog pishiramiz." },
    ],
    mistakes: [
      {
        wrong: "I have much homework.",
        right: "I have a lot of homework.",
        noteUz: "Darak gapda much odatda ishlatilmaydi. A lot of ikkala turdagi ot bilan to‘g‘ri keladi.",
      },
      {
        wrong: "How much brothers do you have?",
        right: "How many brothers do you have?",
        noteUz: "Brothers sanaladigan ko‘plik ot, shuning uchun how many ishlatiladi.",
      },
      {
        wrong: "I have few time.",
        right: "I have little time.",
        noteUz: "Time sanalmaydigan ot. Few faqat sanaladigan ko‘plik otlar bilan ishlatiladi, sanalmaydiganlar bilan little.",
      },
    ],
    quiz: [
      {
        id: "g23-q1",
        q: "How ___ water do you drink every day?",
        options: ["many", "much", "few", "a few"],
        answer: 1,
        explain: "Water sanalmaydigan ot, shuning uchun how much ishlatiladi.",
      },
      {
        id: "g23-q2",
        q: "There are ___ people in the room, so it is very crowded.",
        options: ["much", "little", "a little", "a lot of"],
        answer: 3,
        explain: "People sanaladigan ko‘plik ot. Much, little va a little sanalmaydigan otlar bilan ishlatiladi. A lot of mos keladi.",
      },
      {
        id: "g23-q3",
        q: "I am busy. I have very ___ time.",
        options: ["few", "many", "little", "a few"],
        answer: 2,
        explain: "Time sanalmaydigan ot, very little «juda oz» degani. Few va a few sanaladigan otlar bilan ishlatiladi.",
      },
      {
        id: "g23-q4",
        q: "Would you like some tea? — Yes, just ___ sugar, please.",
        options: ["a little", "a few", "many", "few"],
        answer: 0,
        explain: "Sugar sanalmaydigan ot, ozgina miqdor uchun a little ishlatiladi.",
      },
      {
        id: "g23-q5",
        q: "Choose the correct sentence.",
        options: [
          "We don't have much chairs.",
          "We don't have many chairs.",
          "We don't have a little chairs.",
          "We don't have a lot chairs.",
        ],
        answer: 1,
        explain: "Chairs sanaladigan ko‘plik ot, inkorda many ishlatiladi. A lot dan keyin of kerak.",
      },
    ],
  },

  // ---------------------------------------------------------------- g24
  {
    id: "g24",
    title: "Gerunds and infinitives",
    titleUz: "Gerund va infinitiv",
    level: "B1",
    emoji: "🔀",
    summaryUz:
      "Ba‘zi fe‘llardan keyin V-ing (gerund), boshqalaridan keyin to + fe‘l (infinitiv) ishlatiladi.",
    explanationUz: [
      "Gerund fe‘lga -ing qo‘shib yasaladi va ot vazifasini bajaradi (swimming, reading). O‘zbek tilidagi «-ish» masdariga o‘xshaydi: suzish, o‘qish. Infinitiv esa to + fe‘lning oddiy shakli (to swim, to read). O‘zbekchada «xohlayman suzishni» deyish mumkin, inglizchada esa har bir fe‘l o‘z shaklini talab qiladi.",
      "Gerund bilan ishlatiladigan fe‘llar: enjoy, finish, stop, mind, avoid, keep, practise, suggest. Masalan: I enjoy reading. She finished doing her homework. Shuningdek, har qanday predlogdan keyin gerund keladi: He is good at drawing. I'm interested in learning English. I look forward to seeing you.",
      "Infinitiv bilan ishlatiladigan fe‘llar: want, need, decide, hope, plan, learn, agree, promise, would like. Masalan: She wants to be a doctor. We decided to visit our grandparents. I'd like to go home.",
      "Like, love, hate, start, begin fe‘llaridan keyin ikkalasi ham mumkin, ma‘no deyarli o‘zgarmaydi: I like swimming = I like to swim. Gerund gap egasi vazifasida ham keladi: Swimming is good for your health. Maqsadni bildirish uchun infinitiv ishlatiladi: I went to the market to buy fruit.",
      "Eslab qoling: can, must, should, will kabi modal fe‘llardan keyin to ishlatilmaydi va gerund ham kelmaydi, faqat oddiy fe‘l: I can swim (can to swim emas). Yangi fe‘lni yodlaganingizda undan keyin qaysi shakl kelishini ham birga yodlang.",
    ],
    examples: [
      { en: "I enjoy reading adventure books.", uz: "Men sarguzasht kitoblarini o‘qishni yoqtiraman." },
      { en: "She wants to learn English.", uz: "U ingliz tilini o‘rganishni xohlaydi." },
      { en: "He is good at drawing.", uz: "U rasm chizishda yaxshi." },
      { en: "Swimming is good for your health.", uz: "Suzish sog‘liq uchun foydali." },
      { en: "We decided to visit our grandparents.", uz: "Biz bobo-buvimizni ko‘rgani borishga qaror qildik." },
      { en: "I went to the market to buy fruit.", uz: "Men mevalar sotib olish uchun bozorga bordim." },
    ],
    mistakes: [
      {
        wrong: "I enjoy to swim.",
        right: "I enjoy swimming.",
        noteUz: "Enjoy dan keyin gerund (V-ing) keladi, infinitiv emas.",
      },
      {
        wrong: "She wants going home.",
        right: "She wants to go home.",
        noteUz: "Want dan keyin to + fe‘l keladi, V-ing emas.",
      },
      {
        wrong: "He is interested in to learn music.",
        right: "He is interested in learning music.",
        noteUz: "Predlog (in) dan keyin har doim gerund ishlatiladi, to + fe‘l emas.",
      },
    ],
    quiz: [
      {
        id: "g24-q1",
        q: "I enjoy ___ football with my friends.",
        options: ["to play", "play", "playing", "to playing"],
        answer: 2,
        explain: "Enjoy dan keyin gerund keladi: enjoy playing.",
      },
      {
        id: "g24-q2",
        q: "She wants ___ a doctor.",
        options: ["being", "be", "been", "to be"],
        answer: 3,
        explain: "Want dan keyin infinitiv keladi: wants to be.",
      },
      {
        id: "g24-q3",
        q: "He is good at ___ pictures.",
        options: ["to draw", "drawing", "draw", "draws"],
        answer: 1,
        explain: "Predlog (at) dan keyin gerund keladi: good at drawing.",
      },
      {
        id: "g24-q4",
        q: "We decided ___ a new game.",
        options: ["to play", "playing", "play", "played"],
        answer: 0,
        explain: "Decide dan keyin infinitiv keladi: decided to play.",
      },
      {
        id: "g24-q5",
        q: "Choose the correct sentence.",
        options: [
          "I want go home.",
          "I want going home.",
          "I'd like to go home.",
          "I'd like going home.",
        ],
        answer: 2,
        explain: "Would like dan keyin infinitiv keladi: I'd like to go home. Want dan keyin ham to kerak.",
      },
    ],
  },
];
