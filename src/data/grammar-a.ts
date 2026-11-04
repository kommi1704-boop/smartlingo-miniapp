import type { GrammarLesson } from "../types";

export const GRAMMAR_A: GrammarLesson[] = [
  // ---------------------------------------------------------------- g01
  {
    id: "g01",
    title: "Verb to be",
    titleUz: "Be fe‘li: am, is, are",
    level: "Pre-A1",
    emoji: "🙋",
    summaryUz:
      "Am, is, are fe‘llari kim yoki nima ekanimizni, qayerdaligimizni va qanday ekanimizni aytishga yordam beradi.",
    explanationUz: [
      "Ingliz tilida gapda doim fe‘l bo‘lishi kerak. «Men o‘quvchiman» deyish uchun o‘zbekchada faqat «-man» qo‘shimchasi yetadi, inglizchada esa alohida so‘z kerak: I am a student.",
      "Bu fe‘lning uchta shakli bor: I + am, he/she/it + is, you/we/they + are. Gapda ko‘pincha qisqa shakl ishlatiladi: I'm, he's, she's, it's, you're, we're, they're.",
      "Inkor gap: am/is/are + not. Masalan: I am not tired. He is not (isn't) a doctor. They are not (aren't) at home.",
      "Savol gapda fe‘l gap egasidan oldinga chiqadi: You are ready. → Are you ready? Is she a teacher? Bu o‘zbekchadagi «-mi» savol yuklamasi o‘rnini bosadi.",
      "Qisqa javob berganda to‘liq fe‘lni ishlatamiz: Are you a student? — Yes, I am. / No, I'm not. Is he at home? — Yes, he is. / No, he isn't. «Yes, I'm» deb aytib bo‘lmaydi.",
    ],
    examples: [
      { en: "I am ten years old.", uz: "Men o‘n yoshdaman." },
      { en: "She is my best friend.", uz: "U mening eng yaxshi do‘stim." },
      { en: "We are from Uzbekistan.", uz: "Biz O‘zbekistonlikmiz." },
      { en: "It is not cold today.", uz: "Bugun sovuq emas." },
      { en: "Are you hungry?", uz: "Sen ochmisan?" },
      { en: "Is Tom at school? No, he isn't.", uz: "Tom maktabdami? Yo‘q, u maktabda emas." },
    ],
    mistakes: [
      {
        wrong: "She are my friend.",
        right: "She is my friend.",
        noteUz: "She, he, it bilan har doim is ishlatiladi. Are faqat you, we, they bilan keladi.",
      },
      {
        wrong: "Where you are from?",
        right: "Where are you from?",
        noteUz: "Savol gapda am/is/are gap egasidan oldin turadi: Where + are + you?",
      },
      {
        wrong: "Are you tired? Yes, I'm.",
        right: "Are you tired? Yes, I am.",
        noteUz: "Qisqa «ha» javobida fe‘l qisqartirilmaydi: Yes, I am. Qisqartma faqat inkorda mumkin: No, I'm not.",
      },
    ],
    quiz: [
      {
        id: "g01-q1",
        q: "I ___ a student.",
        options: ["is", "am", "are", "be"],
        answer: 1,
        explain: "I olmoshi bilan faqat am ishlatiladi: I am a student.",
      },
      {
        id: "g01-q2",
        q: "She ___ my sister.",
        options: ["is", "am", "are", "be"],
        answer: 0,
        explain: "She (u, qiz yoki ayol) bilan is ishlatiladi: She is my sister.",
      },
      {
        id: "g01-q3",
        q: "My parents ___ at work now.",
        options: ["is", "am", "be", "are"],
        answer: 3,
        explain: "My parents ko‘plik, ya‘ni they o‘rniga turadi, shuning uchun are kerak.",
      },
      {
        id: "g01-q4",
        q: "___ you ready for the test?",
        options: ["Is", "Do", "Are", "Am"],
        answer: 2,
        explain: "Savol gapda fe‘l oldinga chiqadi, you bilan esa are ishlatiladi: Are you ready?",
      },
      {
        id: "g01-q5",
        q: "Is he a doctor? — No, he ___.",
        options: ["not is", "isn't", "aren't", "don't"],
        answer: 1,
        explain: "Is bilan so‘ralgan savolga He isn't (is not) deb inkor javob beriladi.",
      },
    ],
  },

  // ---------------------------------------------------------------- g02
  {
    id: "g02",
    title: "Present Simple",
    titleUz: "Hozirgi oddiy zamon",
    level: "A1",
    emoji: "🔁",
    summaryUz:
      "Present Simple odatlar, doimiy ishlar va umumiy haqiqatlar haqida gapirish uchun ishlatiladi.",
    explanationUz: [
      "Har kuni yoki muntazam takrorlanadigan ishlar va o‘zgarmas haqiqatlar uchun Present Simple ishlatamiz: I play football on Sundays. The sun rises in the east.",
      "Darak gap: I/you/we/they + V. He/she/it + V + s. O‘zbek tilida «o‘qiydi» so‘zi hamma shaxsda bir xil, inglizchada esa he/she/it bilan fe‘lga -s qo‘shiladi: I read, but she reads.",
      "Qo‘shish qoidasi: odatda -s (plays). Agar fe‘l -s, -sh, -ch, -x, -o bilan tugasa, -es qo‘shiladi (watches, goes). Undoshdan keyingi -y esa -ies bo‘ladi (study → studies).",
      "Inkor gap: I/you/we/they + don't + V. He/she/it + doesn't + V. Savol gap: Do + I/you/we/they + V? Does + he/she/it + V? Does yoki doesn't kelganda asosiy fe‘lga -s qo‘shilmaydi: He doesn't like tea. Does she like tea? Qisqa javob: Yes, she does. / No, she doesn't.",
      "Takrorlanish ravishlari: always (doim), usually (odatda), often (tez-tez), sometimes (ba‘zan), never (hech qachon). Ular asosiy fe‘ldan oldin, lekin am/is/are dan keyin turadi: She often reads. He is always late.",
    ],
    examples: [
      { en: "I get up at seven every day.", uz: "Men har kuni soat yettida turaman." },
      { en: "My brother plays football after school.", uz: "Akam maktabdan keyin futbol o‘ynaydi." },
      { en: "Water boils at 100 degrees.", uz: "Suv 100 darajada qaynaydi." },
      { en: "She doesn't like spicy food.", uz: "U achchiq ovqatni yoqtirmaydi." },
      { en: "Do you walk to school?", uz: "Sen maktabga piyoda borasanmi?" },
      { en: "He usually does his homework in the evening.", uz: "U odatda uy vazifasini kechqurun bajaradi." },
    ],
    mistakes: [
      {
        wrong: "She go to school.",
        right: "She goes to school.",
        noteUz: "He, she, it bilan fe‘lga -s yoki -es qo‘shiladi. Go fe‘li -es oladi: goes.",
      },
      {
        wrong: "He doesn't likes cats.",
        right: "He doesn't like cats.",
        noteUz: "Doesn't allaqachon -s ni o‘zi ko‘tarib turibdi, shuning uchun asosiy fe‘l o‘zgarmaydi.",
      },
      {
        wrong: "Do she play tennis?",
        right: "Does she play tennis?",
        noteUz: "He, she, it bilan savol gapda does ishlatiladi, do emas.",
      },
    ],
    quiz: [
      {
        id: "g02-q1",
        q: "My sister ___ English every day.",
        options: ["study", "studies", "studys", "is study"],
        answer: 1,
        explain: "Sister = she, shuning uchun fe‘lga -s kerak. Undoshdan keyingi -y -ies ga aylanadi: studies.",
      },
      {
        id: "g02-q2",
        q: "They ___ TV in the morning.",
        options: ["don't watch", "doesn't watch", "don't watches", "not watch"],
        answer: 0,
        explain: "They bilan don't ishlatiladi va undan keyin fe‘l o‘zgarmaydi: don't watch.",
      },
      {
        id: "g02-q3",
        q: "___ your father work in a bank?",
        options: ["Do", "Is", "Are", "Does"],
        answer: 3,
        explain: "Your father = he. He/she/it bilan savol gap Does bilan boshlanadi.",
      },
      {
        id: "g02-q4",
        q: "She ___ late for school.",
        options: ["never is", "does never", "is never", "never are"],
        answer: 2,
        explain: "Takrorlanish ravishlari am/is/are dan keyin keladi: She is never late.",
      },
      {
        id: "g02-q5",
        q: "Does Anna live near the school? — No, she ___.",
        options: ["don't", "doesn't", "isn't", "hasn't"],
        answer: 1,
        explain: "Does bilan berilgan savolga She doesn't deb javob beramiz.",
      },
    ],
  },

  // ---------------------------------------------------------------- g03
  {
    id: "g03",
    title: "Present Continuous",
    titleUz: "Hozirgi davomli zamon",
    level: "A1",
    emoji: "⏳",
    summaryUz:
      "Present Continuous aynan hozir yoki shu kunlarda davom etayotgan ishlarni ifodalaydi.",
    explanationUz: [
      "Hozir, gapirayotgan paytda bo‘lib turgan ish uchun Present Continuous ishlatamiz: She is reading now. Shuningdek, shu kunlarda davom etayotgan ish uchun ham: I'm learning English this year. O‘zbekchada bu «o‘qiyapti», «o‘rganayapman» shakliga mos keladi.",
      "Formula: I + am + V-ing; he/she/it + is + V-ing; you/we/they + are + V-ing. Inkor: He isn't playing. Savol: Is he playing? Qisqa javob: Yes, he is. / No, he isn't.",
      "Fe‘lga -ing qo‘shish: odatda oddiy qo‘shiladi (play → playing). -e tushib qoladi (make → making). Qisqa fe‘lda oxirgi undosh ikkilanadi (run → running, sit → sitting, swim → swimming). -ie bilan tugasa -ying bo‘ladi (lie → lying).",
      "Bu zamon bilan ko‘pincha now, right now, at the moment, today, Look!, Listen! so‘zlari keladi.",
      "Ba‘zi fe‘llar holatni bildiradi va odatda -ing shaklida ishlatilmaydi: know, like, love, want, need, understand. «Men bilaman» — I know, I am knowing emas.",
    ],
    examples: [
      { en: "I am doing my homework now.", uz: "Men hozir uy vazifamni bajarayapman." },
      { en: "Look! It is raining.", uz: "Qara! Yomg‘ir yog‘ayapti." },
      { en: "They are playing in the yard.", uz: "Ular hovlida o‘ynayapti." },
      { en: "She isn't sleeping. She is watching TV.", uz: "U uxlamayapti. U televizor ko‘ryapti." },
      { en: "What are you eating?", uz: "Sen nima yeyapsan?" },
      { en: "We are learning English this month.", uz: "Biz shu oyda ingliz tilini o‘rganayapmiz." },
    ],
    mistakes: [
      {
        wrong: "She is play football now.",
        right: "She is playing football now.",
        noteUz: "Is/am/are dan keyin fe‘l -ing shaklida bo‘lishi shart.",
      },
      {
        wrong: "I am knowing the answer.",
        right: "I know the answer.",
        noteUz: "Know kabi holat fe‘llari odatda Present Continuous da ishlatilmaydi.",
      },
      {
        wrong: "He is runing in the park.",
        right: "He is running in the park.",
        noteUz: "Run kabi qisqa fe‘llarda -ing dan oldin oxirgi undosh ikkilanadi: running.",
      },
    ],
    quiz: [
      {
        id: "g03-q1",
        q: "Listen! Someone ___ the piano.",
        options: ["plays", "play", "is playing", "playing"],
        answer: 2,
        explain: "Listen! hozir bo‘layotgan ishni bildiradi, shuning uchun is + V-ing kerak.",
      },
      {
        id: "g03-q2",
        q: "We ___ football at the moment.",
        options: ["are playing", "play", "is playing", "playing"],
        answer: 0,
        explain: "At the moment hozirgi paytni bildiradi. We bilan are + V-ing ishlatiladi.",
      },
      {
        id: "g03-q3",
        q: "Which is the correct -ing form of swim?",
        options: ["swiming", "swimming", "swimmeing", "swimimg"],
        answer: 1,
        explain: "Swim qisqa fe‘l, shuning uchun -ing dan oldin m ikkilanadi: swimming.",
      },
      {
        id: "g03-q4",
        q: "I ___ the answer.",
        options: ["am knowing", "are knowing", "knowing", "know"],
        answer: 3,
        explain: "Know holat fe‘li, shuning uchun -ing shaklida ishlatilmaydi: I know.",
      },
      {
        id: "g03-q5",
        q: "___ your mother cooking dinner now?",
        options: ["Do", "Does", "Is", "Are"],
        answer: 2,
        explain: "Your mother = she. Present Continuous savolida Is + she + V-ing? tuziladi.",
      },
    ],
  },

  // ---------------------------------------------------------------- g04
  {
    id: "g04",
    title: "Articles",
    titleUz: "Artikllar: a, an, the",
    level: "A1",
    emoji: "📎",
    summaryUz:
      "Artikllar (a, an, the) otdan oldin turadi va narsa noaniqmi yoki aniqmi ekanini ko‘rsatadi.",
    explanationUz: [
      "O‘zbek tilida artikl yo‘q, inglizchada esa sanaladigan birlik otlardan oldin a, an yoki the kerak. «Men kitob o‘qiyman» inglizchada I read a book bo‘ladi.",
      "A/an bitta, noaniq narsa uchun ishlatiladi, odatda birinchi marta aytilganda: I have a cat. A undosh tovushdan oldin keladi (a book), an esa unli tovushdan oldin (an apple). Harfga emas, tovushga qarang: an hour, a university.",
      "The aniq narsa uchun ishlatiladi, ya‘ni gapirayotgan ikkala odam qaysi narsa haqida ketayotganini biladi, yoki narsa dunyoda yagona: I have a cat. The cat is white. The sun, the moon.",
      "Ba‘zan artikl umuman kerak emas: ko‘plik otlar bilan umumiy gapirganda (I like dogs), sanalmaydigan otlar bilan (I like music), tillar va ko‘pchilik mamlakat nomlari bilan (English, Uzbekistan), ovqat nomlari bilan (have lunch) va go to school, go home iboralarida.",
      "Eslab qoling: a/an faqat birlikdagi ot bilan ishlatiladi. A books deb bo‘lmaydi, ko‘plikda esa a/an tushib qoladi.",
    ],
    examples: [
      { en: "I have a dog.", uz: "Mening itim bor." },
      { en: "She eats an apple every day.", uz: "U har kuni bitta olma yeydi." },
      { en: "The dog in the garden is very big.", uz: "Bog‘dagi it juda katta." },
      { en: "The sun is hot today.", uz: "Bugun quyosh issiq." },
      { en: "I like music.", uz: "Men musiqani yaxshi ko‘raman." },
      { en: "We have breakfast at eight.", uz: "Biz soat sakkizda nonushta qilamiz." },
    ],
    mistakes: [
      {
        wrong: "I have a apple.",
        right: "I have an apple.",
        noteUz: "Apple unli tovush bilan boshlanadi, shuning uchun a emas, an ishlatiladi.",
      },
      {
        wrong: "My brother is doctor.",
        right: "My brother is a doctor.",
        noteUz: "Kasb nomidan oldin a/an qo‘yiladi. O‘zbekchada bunday artikl yo‘q, shuning uchun uni unutish oson.",
      },
      {
        wrong: "I go to the school every day.",
        right: "I go to school every day.",
        noteUz: "O‘qish uchun maktabga borishni aytganda go to school ishlatiladi, artiklsiz.",
      },
    ],
    quiz: [
      {
        id: "g04-q1",
        q: "I have ___ orange.",
        options: ["a", "an", "the", "no article"],
        answer: 1,
        explain: "Orange unli tovush bilan boshlanadi, shuning uchun an kerak.",
      },
      {
        id: "g04-q2",
        q: "She is ___ engineer.",
        options: ["a", "the", "an", "no article"],
        answer: 2,
        explain: "Kasbdan oldin a/an qo‘yiladi. Engineer unli tovush bilan boshlanadi, shuning uchun an.",
      },
      {
        id: "g04-q3",
        q: "___ sun rises in the east.",
        options: ["The", "A", "An", "No article"],
        answer: 0,
        explain: "Quyosh yagona, shuning uchun the ishlatiladi.",
      },
      {
        id: "g04-q4",
        q: "She plays ___ football after school.",
        options: ["a", "an", "the", "no article"],
        answer: 3,
        explain: "O‘yin nomlari (football, tennis) bilan artikl ishlatilmaydi.",
      },
      {
        id: "g04-q5",
        q: "I saw a boy and a girl. ___ boy was tall.",
        options: ["A", "The", "An", "No article"],
        answer: 1,
        explain: "Bola oldin tilga olingan, shuning uchun endi aniq narsa sifatida the ishlatiladi.",
      },
    ],
  },

  // ---------------------------------------------------------------- g05
  {
    id: "g05",
    title: "Pronouns",
    titleUz: "Olmoshlar",
    level: "A1",
    emoji: "👤",
    summaryUz:
      "Olmoshlar ot o‘rnida keladi: ega olmoshlari, to‘ldiruvchi olmoshlar va egalik olmoshlari gapni qisqa va tushunarli qiladi.",
    explanationUz: [
      "Olmoshlar bir xil so‘zni qayta-qayta aytmaslik uchun kerak. Inglizchada to‘rt guruh bor, keling, ularni birma-bir ko‘rib chiqamiz.",
      "Ega olmoshlari fe‘ldan oldin keladi: I, you, he, she, it, we, they. Masalan: She plays tennis. To‘ldiruvchi olmoshlar fe‘ldan yoki predlogdan keyin keladi: me, you, him, her, it, us, them. Masalan: Call me. Play with them.",
      "Egalik sifatlari otdan oldin keladi: my, your, his, her, its, our, their. Masalan: my book, their house. Ular o‘zbekchadagi «mening, sening, uning» so‘zlariga mos keladi.",
      "Egalik olmoshlari ot o‘rnida keladi, shuning uchun ularning keyidan ot yozilmaydi: mine, yours, his, hers, ours, theirs. Masalan: This bag is mine. Bu yerda my emas, mine bo‘ladi.",
      "O‘zbek tilida «u» so‘zi hammaga mos, inglizchada esa uch xil: he (erkak), she (ayol), it (narsa yoki hayvon). Shuningdek, inglizcha gapda ega doim bo‘lishi kerak: It is cold.",
    ],
    examples: [
      { en: "She is my teacher.", uz: "U mening o‘qituvchim." },
      { en: "I like him, and he likes me.", uz: "Men uni yoqtiraman, u ham meni yoqtiradi." },
      { en: "Our house is near the park.", uz: "Bizning uyimiz parkka yaqin." },
      { en: "This bag is mine, not yours.", uz: "Bu sumka meniki, seniki emas." },
      { en: "Can you help us, please?", uz: "Iltimos, bizga yordam bera olasizmi?" },
      { en: "The children love their grandmother.", uz: "Bolalar buvisini yaxshi ko‘radi." },
    ],
    mistakes: [
      {
        wrong: "This is me book.",
        right: "This is my book.",
        noteUz: "Ot oldidan egalik sifati kerak: my. Me to‘ldiruvchi olmosh bo‘lib, fe‘ldan keyin keladi.",
      },
      {
        wrong: "Give it to he.",
        right: "Give it to him.",
        noteUz: "Predlogdan keyin to‘ldiruvchi olmosh keladi: him, her, them.",
      },
      {
        wrong: "This pencil is my.",
        right: "This pencil is mine.",
        noteUz: "Ot aytilmasa, my emas, egalik olmoshi kerak: mine.",
      },
    ],
    quiz: [
      {
        id: "g05-q1",
        q: "Ali is my friend. ___ lives in Tashkent.",
        options: ["He", "Him", "His", "Her"],
        answer: 0,
        explain: "Gapning egasi bo‘lgan erkak uchun ega olmoshi he ishlatiladi.",
      },
      {
        id: "g05-q2",
        q: "Please help ___. I don't understand.",
        options: ["I", "my", "mine", "me"],
        answer: 3,
        explain: "Fe‘ldan keyin to‘ldiruvchi olmosh keladi: help me.",
      },
      {
        id: "g05-q3",
        q: "Where is ___ bag, Aziz?",
        options: ["you", "your", "yours", "yourself"],
        answer: 1,
        explain: "Bag otidan oldin egalik sifati kerak: your bag.",
      },
      {
        id: "g05-q4",
        q: "This house isn't ours. It is ___.",
        options: ["their", "them", "theirs", "they"],
        answer: 2,
        explain: "Gap oxirida ot yo‘q, shuning uchun egalik olmoshi kerak: theirs.",
      },
      {
        id: "g05-q5",
        q: "The dog is hungry. Give ___ some food.",
        options: ["its", "he", "hers", "it"],
        answer: 3,
        explain: "Give dan keyin to‘ldiruvchi olmosh keladi. Hayvon uchun it ishlatiladi.",
      },
    ],
  },

  // ---------------------------------------------------------------- g06
  {
    id: "g06",
    title: "Prepositions",
    titleUz: "Predloglar: o‘rin va vaqt",
    level: "A2",
    emoji: "📍",
    summaryUz:
      "In, on, at va boshqa predloglar narsa qayerda yoki qachon bo‘lishini ko‘rsatadi.",
    explanationUz: [
      "O‘zbek tilida «-da, -ga, -dan» kabi qo‘shimchalar otga yopishadi. Inglizchada esa ular otdan oldin alohida so‘z bo‘lib keladi: xonada = in the room.",
      "O‘rin uchun: in — biror narsaning ichida, shahar yoki mamlakatda (in a box, in Tashkent). On — sirtida (on the table, on the wall). At — aniq nuqtada yoki joyda (at school, at home, at the bus stop).",
      "Vaqt uchun: in — oy, yil, fasl va kun qismi bilan (in May, in 2025, in summer, in the morning). On — kun va sana bilan (on Monday, on 5 May). At — aniq soat bilan (at 7:30, at noon, at night).",
      "Yo‘nalish va joylashuv: to (-ga: go to school), from (-dan: from Samarkand), between (orasida), next to (yonida), in front of (oldida), behind (orqasida), under (ostida), near (yaqinida).",
      "Predlog tanlashda o‘zbekchaga tayanib bo‘lmaydi, chunki «-da» inglizchada in, on yoki at bo‘lishi mumkin. Shuning uchun iboralarni butunligicha yodlang: at home, on Monday, in the morning.",
    ],
    examples: [
      { en: "The book is on the table.", uz: "Kitob stol ustida." },
      { en: "I live in Samarkand.", uz: "Men Samarqandda yashayman." },
      { en: "We have a lesson at 9:00.", uz: "Bizda soat 9:00 da dars bor." },
      { en: "My birthday is on 12 May.", uz: "Mening tug‘ilgan kunim 12-mayda." },
      { en: "The bank is between the school and the park.", uz: "Bank maktab bilan park orasida." },
      { en: "She walks from home to school.", uz: "U uyidan maktabga piyoda boradi." },
    ],
    mistakes: [
      {
        wrong: "I was born on 2012.",
        right: "I was born in 2012.",
        noteUz: "Yil, oy va fasl bilan in ishlatiladi. On faqat kun va sana bilan keladi.",
      },
      {
        wrong: "I wait for you in the bus stop.",
        right: "I wait for you at the bus stop.",
        noteUz: "Bekat kabi aniq nuqta uchun at ishlatiladi.",
      },
      {
        wrong: "We have a test in Friday.",
        right: "We have a test on Friday.",
        noteUz: "Hafta kunlari oldidan on ishlatiladi: on Monday, on Friday.",
      },
    ],
    quiz: [
      {
        id: "g06-q1",
        q: "The fish is ___ the water.",
        options: ["on", "at", "to", "in"],
        answer: 3,
        explain: "Baliq suv ichida, ya‘ni biror narsaning ichida bo‘lsa, in ishlatiladi.",
      },
      {
        id: "g06-q2",
        q: "My birthday is ___ June.",
        options: ["on", "in", "at", "to"],
        answer: 1,
        explain: "Oy nomlari bilan in ishlatiladi: in June.",
      },
      {
        id: "g06-q3",
        q: "The lesson starts ___ 9:00.",
        options: ["at", "on", "in", "from"],
        answer: 0,
        explain: "Aniq soat bilan at ishlatiladi: at 9:00.",
      },
      {
        id: "g06-q4",
        q: "We go to school ___ Monday to Friday.",
        options: ["in", "at", "on", "from"],
        answer: 3,
        explain: "«Dan ... gacha» ma‘nosi from ... to bilan beriladi: from Monday to Friday.",
      },
      {
        id: "g06-q5",
        q: "My house is ___ the school and the shop.",
        options: ["on", "next", "between", "at"],
        answer: 2,
        explain: "Ikki narsaning orasida degan ma‘no between bilan ifodalanadi.",
      },
    ],
  },

  // ---------------------------------------------------------------- g07
  {
    id: "g07",
    title: "Past Simple",
    titleUz: "O‘tgan oddiy zamon",
    level: "A2",
    emoji: "⏮️",
    summaryUz:
      "Past Simple o‘tmishda sodir bo‘lgan va tugagan ishlar haqida gapirish uchun ishlatiladi.",
    explanationUz: [
      "Past Simple o‘tmishda bo‘lgan va tugagan ish uchun ishlatiladi. Odatda yesterday, last week, two days ago, in 2020 kabi so‘zlar bilan keladi: I played football yesterday.",
      "To‘g‘ri fe‘llarga -ed qo‘shiladi: play → played, work → worked. Fe‘l -e bilan tugasa, faqat -d qo‘shiladi (like → liked). Undoshdan keyingi -y -ied bo‘ladi (study → studied). Qisqa fe‘lda undosh ikkilanadi (stop → stopped). Hamma shaxslar uchun shakl bir xil: I played, he played.",
      "Noto‘g‘ri fe‘llar o‘zgacha shakl oladi va ularni yodlash kerak: go → went, have → had, see → saw, eat → ate, buy → bought, make → made, take → took, come → came, write → wrote.",
      "Inkor: did not (didn't) + V. Savol: Did + subject + V? Did yoki didn't bor bo‘lsa, asosiy fe‘l o‘z asl shaklida qoladi: I didn't go. Did you see him? Qisqa javob: Yes, I did. / No, I didn't.",
      "Be fe‘lining o‘tgan zamoni: I/he/she/it + was, you/we/they + were. Inkor: wasn't, weren't. Savol: Was he at home? Were you tired? Bu yerda did ishlatilmaydi.",
    ],
    examples: [
      { en: "I visited my grandmother last Sunday.", uz: "Men o‘tgan yakshanba buvimnikiga bordim." },
      { en: "We went to the park yesterday.", uz: "Biz kecha parkka bordik." },
      { en: "She didn't do her homework.", uz: "U uy vazifasini bajarmadi." },
      { en: "Did you see that film?", uz: "Sen u filmni ko‘rdingmi?" },
      { en: "He bought a new phone two days ago.", uz: "U ikki kun oldin yangi telefon sotib oldi." },
      { en: "Where were you last night?", uz: "Kecha kechqurun qayerda eding?" },
    ],
    mistakes: [
      {
        wrong: "I goed to the park.",
        right: "I went to the park.",
        noteUz: "Go noto‘g‘ri fe‘l, uning o‘tgan zamoni went. Bunday fe‘llarga -ed qo‘shilmaydi.",
      },
      {
        wrong: "Did you went to school?",
        right: "Did you go to school?",
        noteUz: "Did dan keyin fe‘l asl shaklida turadi: go. O‘tgan zamon belgisi allaqachon did da.",
      },
      {
        wrong: "She didn't liked the film.",
        right: "She didn't like the film.",
        noteUz: "Didn't dan keyin -ed qo‘shilmaydi, asosiy fe‘l o‘zgarmaydi.",
      },
    ],
    quiz: [
      {
        id: "g07-q1",
        q: "Yesterday I ___ my friends.",
        options: ["meet", "met", "meeted", "meets"],
        answer: 1,
        explain: "Meet noto‘g‘ri fe‘l, uning o‘tgan zamoni met.",
      },
      {
        id: "g07-q2",
        q: "She ___ to the market last week.",
        options: ["go", "goes", "goed", "went"],
        answer: 3,
        explain: "Last week o‘tgan zamonni bildiradi. Go fe‘lining o‘tgan shakli went.",
      },
      {
        id: "g07-q3",
        q: "They ___ football yesterday.",
        options: ["didn't play", "didn't played", "don't played", "not played"],
        answer: 0,
        explain: "O‘tgan zamon inkori didn't + asosiy fe‘l bilan tuziladi: didn't play.",
      },
      {
        id: "g07-q4",
        q: "___ you see the match last night?",
        options: ["Do", "Were", "Did", "Was"],
        answer: 2,
        explain: "See oddiy fe‘l, o‘tgan zamon savoli Did bilan boshlanadi: Did you see ...?",
      },
      {
        id: "g07-q5",
        q: "We ___ at home yesterday because it was rainy.",
        options: ["was", "are", "is", "were"],
        answer: 3,
        explain: "Be fe‘lining o‘tgan zamoni we bilan were bo‘ladi.",
      },
    ],
  },
];
