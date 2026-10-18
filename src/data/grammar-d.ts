import type { GrammarLesson } from '../types';

export const GRAMMAR_D: GrammarLesson[] = [
  // ---------------------------------------------------------------- g25
  {
    id: "g25",
    title: "Past Perfect",
    titleUz: "O‘tgan tugallangan zamon",
    level: "B1",
    emoji: "⏪",
    summaryUz:
      "Past Perfect o‘tmishdagi bir voqea boshqa o‘tmishdagi voqeadan oldin tugaganini ko‘rsatish uchun ishlatiladi.",
    explanationUz: [
      "Ba‘zan o‘tmishda ikkita voqea haqida gapiramiz va qaysi biri birinchi bo‘lganini aniq ko‘rsatishimiz kerak. Oldin bo‘lgan voqea uchun Past Perfect, keyin bo‘lgan voqea uchun Past Simple ishlatiladi: When I arrived, the film had already started. Avval film boshlandi, keyin men keldim.",
      "Shakli: had + V3 (fe‘lning uchinchi shakli). U barcha shaxslarda bir xil: I had finished, she had finished, they had finished. Qisqa shakli: I'd finished, she'd finished. To‘g‘ri fe‘llarda V3 oxiriga -ed qo‘shiladi (finished), noto‘g‘ri fe‘llarda esa alohida shakl bor (go → gone, see → seen, eat → eaten).",
      "Inkor gap: had not (hadn't) + V3: She hadn't eaten breakfast. Savol gap: Had + gap egasi + V3? Had you finished? Qisqa javob: Yes, I had. / No, I hadn't. Bu yerda ham Yes, I did deb bo‘lmaydi.",
      "Past Perfect ko‘pincha after (…dan keyin), before (…dan oldin), when, by the time (…ga kelib), already (allaqachon), just (hozirgina), never (hech qachon) so‘zlari bilan keladi: After she had done her homework, she watched TV. I had never seen snow before I visited Canada.",
      "O‘zbek tilida «u kelganida, men allaqachon ketgan edim» deymiz va «-gan edim» shakli Past Perfect ga juda yaqin. Lekin faqat bitta voqea haqida gapirsak, Past Perfect kerak emas, oddiy Past Simple yetadi: I went to school. Past Perfect doim ikki o‘tmish voqea orasidagi tartibni ko‘rsatadi.",
    ],
    examples: [
      { en: "When I got to school, the lesson had already begun.", uz: "Maktabga yetib kelganimda, dars allaqachon boshlangan edi." },
      { en: "She was happy because she had passed the exam.", uz: "U imtihondan o‘tgani uchun xursand edi." },
      { en: "We had eaten before they arrived.", uz: "Ular kelishidan oldin biz ovqatlanib bo‘lgan edik." },
      { en: "I couldn't find my bag. Someone had taken it.", uz: "Sumkamni topa olmadim. Kimdir uni olib ketgan edi." },
      { en: "He had never ridden a horse before that day.", uz: "U o‘sha kungacha hech qachon otga minmagan edi." },
      { en: "Had you finished your homework before dinner?", uz: "Kechki ovqatdan oldin uy vazifangni tugatgan eding mi?" },
    ],
    mistakes: [
      {
        wrong: "When I arrived, the film already started.",
        right: "When I arrived, the film had already started.",
        noteUz: "Film men kelishimdan oldin boshlangan, shuning uchun oldingi voqea Past Perfect da bo‘lishi kerak: had already started.",
      },
      {
        wrong: "I had went to bed before he called.",
        right: "I had gone to bed before he called.",
        noteUz: "Had dan keyin fe‘lning uchinchi shakli (V3) keladi. Go fe‘lining V3 shakli gone, went emas.",
      },
      {
        wrong: "After I have finished, I went home.",
        right: "After I had finished, I went home.",
        noteUz: "O‘tmish voqealar haqida gapirganda have emas, had ishlatiladi: After I had finished, I went home.",
      },
    ],
    quiz: [
      {
        id: "g25-q1",
        q: "By the time we got to the cinema, the film ___ already started.",
        options: ["has", "had", "was", "did"],
        answer: 1,
        explain: "Film biz kelishimizdan oldin boshlangan. Oldingi o‘tmish voqea uchun had + V3 kerak: had already started.",
      },
      {
        id: "g25-q2",
        q: "She couldn't open the door because she ___ her key at home.",
        options: ["has left", "leaves", "was leaving", "had left"],
        answer: 3,
        explain: "Kalitni uyda qoldirish eshikni ochmoqchi bo‘lishdan oldin sodir bo‘lgan, shuning uchun had left ishlatiladi.",
      },
      {
        id: "g25-q3",
        q: "I ___ never seen snow before I visited Canada.",
        options: ["had", "have", "was", "did"],
        answer: 0,
        explain: "Canadaga borishdan oldingi tajriba haqida gap ketyapti, shuning uchun Past Perfect: had never seen.",
      },
      {
        id: "g25-q4",
        q: "Which sentence is correct?",
        options: [
          "After he has finished his homework, he played games.",
          "After he finish his homework, he played games.",
          "After he had finished his homework, he played games.",
          "After he had finish his homework, he played games.",
        ],
        answer: 2,
        explain: "Oldin bo‘lgan voqea had + V3 bilan beriladi: had finished. Had dan keyin fe‘l -ed shaklida bo‘lishi shart.",
      },
      {
        id: "g25-q5",
        q: "Had you eaten before you went to the party? — No, I ___.",
        options: ["didn't", "hadn't", "haven't", "wasn't"],
        answer: 1,
        explain: "Had bilan berilgan savolga qisqa javobda ham had ishlatiladi: No, I hadn't.",
      },
    ],
  },

  // ---------------------------------------------------------------- g26
  {
    id: "g26",
    title: "Relative clauses (who, which, that, where)",
    titleUz: "Aniqlovchi ergash gaplar",
    level: "B1",
    emoji: "🔗",
    summaryUz:
      "Who, which, that va where so‘zlari odam, narsa yoki joy haqida qo‘shimcha ma‘lumot berib, ikki gapni bitta qilib bog‘laydi.",
    explanationUz: [
      "Relative clause (aniqlovchi ergash gap) kim yoki nima haqida gapirayotganimizni aniqlashtiradi. Ikkita gapni birlashtiramiz: I have a friend. She lives in London. → I have a friend who lives in London. O‘zbekchada buni «Londonda yashaydigan do‘stim bor» deb aytamiz, inglizchada esa ergash gap otdan keyin keladi.",
      "Odamlar uchun who ishlatiladi: The girl who sits next to me is kind. Narsa va hayvonlar uchun which ishlatiladi: The book which I bought is interesting. That so‘zi ikkala holatda ham ishlay oladi: the man that helped me, the book that I bought. Odam haqida who yoki that, narsa haqida which yoki that deyish mumkin.",
      "Joy uchun where ishlatiladi: This is the school where I study. Egalikni ko‘rsatish uchun whose ishlatiladi: That is the boy whose bike was stolen. Whose har doim otdan oldin turadi: whose bike, whose mother.",
      "Muhim qoida: who, which, that o‘zidan oldingi otning o‘rniga turadi, shuning uchun keyin yana he, she, it yoki they ni qo‘shmaymiz. To‘g‘ri: The man who lives next door is a pilot. Noto‘g‘ri: The man who he lives next door is a pilot. Where ham o‘rniga in/at kabi predlogni talab qilmaydi: the house where I live.",
      "Agar who yoki which ergash gapdagi fe‘lning egasi bo‘lmasa, ya‘ni keyin boshqa gap egasi kelsa, uni tushirib qoldirish mumkin: The book (that) I read was great. Lekin egasi bo‘lsa tushirib bo‘lmaydi: The girl who sits next to me. Gapning o‘rtasida ergash gapni vergul bilan ajratish shart emas, ammo qo‘shimcha ma‘lumot bo‘lsa, vergul qo‘yiladi: My brother, who is ten, loves football.",
    ],
    examples: [
      { en: "The teacher who teaches us English is very funny.", uz: "Bizga inglizcha o‘rgatadigan o‘qituvchi juda hazilkash." },
      { en: "This is the phone which my uncle gave me.", uz: "Bu amakim menga bergan telefon." },
      { en: "I like films that make me laugh.", uz: "Meni kuldiradigan filmlarni yoqtiraman." },
      { en: "That is the park where we play football.", uz: "Bu biz futbol o‘ynaydigan bog‘." },
      { en: "She has a friend whose father is a doctor.", uz: "Uning otasi shifokor bo‘lgan bir do‘sti bor." },
      { en: "The girl who won the prize is my cousin.", uz: "Sovrinni yutgan qiz mening amakivachcham." },
    ],
    mistakes: [
      {
        wrong: "The man who he lives next door is my teacher.",
        right: "The man who lives next door is my teacher.",
        noteUz: "Who allaqachon «u» o‘rnida turibdi. Uning ortidan yana he qo‘shilmaydi.",
      },
      {
        wrong: "The book what I read was great.",
        right: "The book which I read was great.",
        noteUz: "What bilan aniqlovchi ergash gap boshlanmaydi. Narsa uchun which yoki that ishlatiladi.",
      },
      {
        wrong: "The girl which sits next to me is kind.",
        right: "The girl who sits next to me is kind.",
        noteUz: "Odam haqida gapirganda which emas, who (yoki that) ishlatiladi.",
      },
    ],
    quiz: [
      {
        id: "g26-q1",
        q: "The girl ___ sits next to me is very kind.",
        options: ["which", "where", "whose", "who"],
        answer: 3,
        explain: "Odam haqida gapiryapmiz va ergash gapning egasi shu qiz, shuning uchun who kerak.",
      },
      {
        id: "g26-q2",
        q: "This is the school ___ I learned to read.",
        options: ["who", "which", "where", "whose"],
        answer: 2,
        explain: "School joy, ergash gap esa «u yerda o‘qishni o‘rgandim» ma‘nosini beradi. Joy uchun where ishlatiladi.",
      },
      {
        id: "g26-q3",
        q: "The book ___ I bought yesterday is very interesting.",
        options: ["who", "where", "what", "which"],
        answer: 3,
        explain: "Book narsa, shuning uchun which ishlatiladi. Who odamga, where joyga tegishli, what esa bunday gaplarda ishlatilmaydi.",
      },
      {
        id: "g26-q4",
        q: "Which sentence is correct?",
        options: [
          "The man who lives next door is a pilot.",
          "The man which lives next door is a pilot.",
          "The man where lives next door is a pilot.",
          "The man who he lives next door is a pilot.",
        ],
        answer: 0,
        explain: "Odam uchun who ishlatiladi va keyin he qo‘shilmaydi. Which narsaga, where joyga tegishli.",
      },
      {
        id: "g26-q5",
        q: "That is the boy ___ bike was stolen.",
        options: ["who", "whose", "which", "where"],
        answer: 1,
        explain: "Bola va uning velosipedi, ya‘ni egalik ko‘rsatilyapti. Egalik uchun whose ishlatiladi.",
      },
    ],
  },

  // ---------------------------------------------------------------- g27
  {
    id: "g27",
    title: "Present Perfect Continuous",
    titleUz: "Hozirgi tugallanmagan davomli zamon",
    level: "B1",
    emoji: "⏳",
    summaryUz:
      "Present Perfect Continuous o‘tmishda boshlanib hozirgacha davom etayotgan yoki hozirgina tugagan ishning davomiyligini ko‘rsatadi.",
    explanationUz: [
      "Bu zamon biror ish qancha vaqtdan beri davom etayotganini ta‘kidlaydi. Shakli: have/has + been + V-ing. I have been waiting for an hour. She has been studying since morning. He/she/it bilan has, qolganlarida have ishlatiladi.",
      "Ikkita asosiy ishlatilishi bor. Birinchisi: ish o‘tmishda boshlangan va hozir ham davom etyapti. We have been living here since 2020. Ikkinchisi: ish hozirgina tugagan, lekin natijasi ko‘rinib turibdi. Your hands are dirty. — Yes, I have been working in the garden.",
      "For va since so‘zlari bilan ishlatiladi. For ish qancha davom etganini bildiradi (for two hours, for three years). Since esa ish qachondan boshlanganini bildiradi (since Monday, since 2019, since 9 a.m.). Savol: How long have you been learning English?",
      "Inkor gap: haven't/hasn't been + V-ing. Savol gap: Have/Has + gap egasi + been + V-ing? Qisqa javob: Yes, I have. / No, she hasn't. O‘zbek tilida «ikki soatdan beri kutyapman» deymiz va bu aynan shu zamonga to‘g‘ri keladi, inglizchada «kutyapman» uchun I am waiting emas, I have been waiting kerak.",
      "Muhim cheklov: know, like, love, want, have (egalik), be kabi holatni bildiruvchi fe‘llar davomli shaklda ishlatilmaydi. Ular uchun oddiy Present Perfect ishlatiladi: I have known Aziz for five years. (I have been knowing deb bo‘lmaydi.)",
    ],
    examples: [
      { en: "I have been waiting for you for twenty minutes.", uz: "Men seni yigirma daqiqadan beri kutyapman." },
      { en: "She has been learning English since she was seven.", uz: "U yetti yoshidan beri ingliz tilini o‘rganyapti." },
      { en: "It has been raining all day.", uz: "Kun bo‘yi yomg‘ir yog‘yapti." },
      { en: "They have been playing football since lunch.", uz: "Ular tushlikdan beri futbol o‘ynashyapti." },
      { en: "Why are you so tired? Have you been running?", uz: "Nega bunchalik charchadingiz? Yugurgan edingizmi?" },
      { en: "How long has your brother been studying music?", uz: "Akangiz qancha vaqtdan beri musiqa o‘rganyapti?" },
    ],
    mistakes: [
      {
        wrong: "I am learning English since 2022.",
        right: "I have been learning English since 2022.",
        noteUz: "Since bilan hozirgacha davom etayotgan ish haqida gapirsak, Present Continuous emas, have been + V-ing ishlatiladi.",
      },
      {
        wrong: "I have been knowing him for years.",
        right: "I have known him for years.",
        noteUz: "Know holatni bildiruvchi fe‘l, u davomli shaklda ishlatilmaydi. Oddiy Present Perfect kerak: have known.",
      },
      {
        wrong: "I have been waiting since two hours.",
        right: "I have been waiting for two hours.",
        noteUz: "Vaqt miqdori (two hours) bilan for, boshlanish nuqtasi (since 5 p.m.) bilan since ishlatiladi.",
      },
    ],
    quiz: [
      {
        id: "g27-q1",
        q: "She ___ tennis since ten in the morning.",
        options: ["have been playing", "has been playing", "is playing", "has been play"],
        answer: 1,
        explain: "She bilan has ishlatiladi, since ish boshlangan vaqtni bildiradi: has been playing.",
      },
      {
        id: "g27-q2",
        q: "My hands are dirty. I ___ in the garden.",
        options: ["have been working", "has been working", "have been worked", "am work"],
        answer: 0,
        explain: "Hozirgina tugagan ish natijasi ko‘rinib turibdi. I bilan have been + V-ing ishlatiladi.",
      },
      {
        id: "g27-q3",
        q: "I ___ Aziz for five years.",
        options: ["have been knowing", "know", "am knowing", "have known"],
        answer: 3,
        explain: "Know holatni bildiruvchi fe‘l, davomli shaklda ishlatilmaydi. For five years bilan have known ishlatiladi.",
      },
      {
        id: "g27-q4",
        q: "Which question is correct?",
        options: [
          "How long it has been raining?",
          "How long has it been raining?",
          "How long has it raining?",
          "How long is it been raining?",
        ],
        answer: 1,
        explain: "Savol gapda has gap egasidan oldin turadi: How long + has + it + been raining?",
      },
      {
        id: "g27-q5",
        q: "They ___ been playing video games since lunch.",
        options: ["has", "did", "have", "are"],
        answer: 2,
        explain: "They bilan have ishlatiladi. Qolgan variantlar been bilan birga kelmaydi: have been playing.",
      },
    ],
  },

  // ---------------------------------------------------------------- g28
  {
    id: "g28",
    title: "Question tags",
    titleUz: "Qo‘shimcha savollar (isn't it?)",
    level: "B1",
    emoji: "❓",
    summaryUz:
      "Question tag gap oxiriga qo‘shiladigan qisqa savol bo‘lib, fikrni tasdiqlatish yoki gapning to‘g‘riligini tekshirish uchun ishlatiladi.",
    explanationUz: [
      "Question tag — gap oxiridagi qisqa savol: You are a student, aren't you? O‘zbekchada buni «to‘g‘rimi?», «shunday emasmi?» deb ifodalaymiz. Inglizchada esa har bir gapga mos alohida shakl tanlanadi, «isn't it?» ni hamma gapga qo‘shib bo‘lmaydi.",
      "Asosiy qoida: darak gap bo‘lsa, tag inkor bo‘ladi; inkor gap bo‘lsa, tag darak bo‘ladi. She is happy, isn't she? She isn't happy, is she? Tag har doim vergul bilan ajratiladi va ikkita so‘zdan iborat: yordamchi fe‘l + olmosh.",
      "Tagdagi yordamchi fe‘l gapdagi yordamchi fe‘lga mos tushadi. Be bo‘lsa be: He is late, isn't he? Present Simple bo‘lsa do/does: You like pizza, don't you? She likes pizza, doesn't she? Past Simple bo‘lsa did: They went home, didn't they? Can, will, have kabi fe‘llar o‘zi takrorlanadi: They can swim, can't they? You have finished, haven't you?",
      "Tagda olmosh ishlatiladi, ot emas: Tom is tall, isn't he? My sisters are here, aren't they? Maxsus holat: I am late, aren't I? (amn't I? deb aytilmaydi). Let's bilan: Let's go, shall we?",
      "Ohangga e‘tibor bering. Agar ovoz tag oxirida pastga tushsa, biz javobni deyarli bilamiz va faqat tasdiqlatamiz: It's a nice day, isn't it? Agar ovoz yuqoriga ko‘tarilsa, haqiqatan so‘rayapmiz: You don't know him, do you? Javob odatda Yes yoki No bilan beriladi.",
    ],
    examples: [
      { en: "It's a beautiful day, isn't it?", uz: "Bugun go‘zal kun, shunday emasmi?" },
      { en: "You don't like spiders, do you?", uz: "Sen o‘rgimchaklarni yoqtirmaysan, to‘g‘rimi?" },
      { en: "She can play the piano, can't she?", uz: "U pianino chala oladi, to‘g‘rimi?" },
      { en: "They went to the zoo yesterday, didn't they?", uz: "Ular kecha hayvonot bog‘iga borishdi, to‘g‘rimi?" },
      { en: "You haven't done your homework, have you?", uz: "Sen uy vazifangni bajarmading, to‘g‘rimi?" },
      { en: "I'm right, aren't I?", uz: "Men haqman, shunday emasmi?" },
    ],
    mistakes: [
      {
        wrong: "She likes music, isn't it?",
        right: "She likes music, doesn't she?",
        noteUz: "Isn't it? faqat it bilan keladigan be gaplariga mos. Like — Present Simple fe‘li, shuning uchun doesn't she? ishlatiladi.",
      },
      {
        wrong: "You can swim, can you?",
        right: "You can swim, can't you?",
        noteUz: "Darak gapdan keyin tag inkor bo‘ladi: can → can't. Ikkalasi ham darak bo‘lib qolsa, noto‘g‘ri.",
      },
      {
        wrong: "I am right, amn't I?",
        right: "I am right, aren't I?",
        noteUz: "I am dan keyin amn't I emas, aren't I ishlatiladi. Bu maxsus qoida.",
      },
    ],
    quiz: [
      {
        id: "g28-q1",
        q: "You like pizza, ___?",
        options: ["aren't you", "don't you", "do you", "didn't you"],
        answer: 1,
        explain: "Gap darak va Present Simple da, shuning uchun inkor tag va do kerak: don't you?",
      },
      {
        id: "g28-q2",
        q: "She isn't at home, ___?",
        options: ["isn't she", "does she", "is she", "doesn't she"],
        answer: 2,
        explain: "Inkor gapdan keyin tag darak bo‘ladi, fe‘l esa is bo‘lib qoladi: is she?",
      },
      {
        id: "g28-q3",
        q: "They can swim, ___?",
        options: ["don't they", "can't they", "can they", "aren't they"],
        answer: 1,
        explain: "Can gapda bor ekan, tag ham can bilan tuziladi. Darak gap bo‘lgani uchun inkor: can't they?",
      },
      {
        id: "g28-q4",
        q: "Tom went to school yesterday, ___?",
        options: ["didn't he", "doesn't he", "wasn't he", "hasn't he"],
        answer: 0,
        explain: "Went — Past Simple, shuning uchun tagda did ishlatiladi: didn't he?",
      },
      {
        id: "g28-q5",
        q: "I am late, ___?",
        options: ["amn't I", "isn't I", "don't I", "aren't I"],
        answer: 3,
        explain: "I am gapidan keyin tag aren't I? shaklida bo‘ladi. Amn't I deb aytilmaydi.",
      },
    ],
  },

  // ---------------------------------------------------------------- g29
  {
    id: "g29",
    title: "Linking words (because, so, although, however)",
    titleUz: "Bog‘lovchi so‘zlar",
    level: "B1",
    emoji: "🧩",
    summaryUz:
      "Because, so, although va however gaplar orasidagi sabab, natija va qarama-qarshilikni ko‘rsatib, nutqni silliq va mantiqli qiladi.",
    explanationUz: [
      "Bog‘lovchi so‘zlar gaplarni bir-biriga ulaydi va ular orasidagi bog‘liqlikni ko‘rsatadi. Ularsiz gaplar qisqa va uzuq-uzuq eshitiladi. To‘g‘ri tanlash uchun avval gaplar orasidagi munosabat qanday ekanini aniqlash kerak: sabab, natija yoki qarama-qarshilik.",
      "Because sababni bildiradi va «chunki» degani: I stayed at home because it was raining. So natijani bildiradi va «shuning uchun» degani: It was raining, so I stayed at home. Farqi: because dan keyin sabab keladi, so dan keyin natija keladi. Because of dan keyin gap emas, ot keladi: because of the rain.",
      "Although (garchi, …sa ham) qarama-qarshilikni bildiradi: Although he was tired, he kept working. O‘zbekchada «garchi charchagan bo‘lsa-da, ishlashda davom etdi» deymiz va qo‘shimcha «lekin» ishlatmaymiz. Inglizchada ham xuddi shunday: although bilan but ni birga ishlatib bo‘lmaydi. Noto‘g‘ri: Although he was tired, but he kept working.",
      "However (biroq) ham qarama-qarshilikni bildiradi, lekin u yangi gapni boshlaydi. U odatda gap boshida turadi va undan keyin vergul qo‘yiladi: I like football. However, I don't play it. Nuqtali vergul bilan ham ishlatiladi: I like football; however, I don't play it. Vergulning o‘zi bilan ikki gapni ulab bo‘lmaydi.",
      "Qisqa qilib eslab qoling: because = chunki (sabab), so = shuning uchun (natija), although = garchi (gap ichida qarama-qarshilik), however = biroq (yangi gapda qarama-qarshilik). Bir gapda because bilan so ni birga ishlatmang: Because I was tired, I went to bed (so kerak emas).",
    ],
    examples: [
      { en: "I was hungry, so I made a sandwich.", uz: "Men ochqagan edim, shuning uchun sendvich tayyorladim." },
      { en: "She was late because the bus broke down.", uz: "U kechikdi, chunki avtobus buzilib qoldi." },
      { en: "Although it was cold, we played outside.", uz: "Havo sovuq bo‘lsa-da, biz tashqarida o‘ynadik." },
      { en: "The test was difficult. However, I passed it.", uz: "Test qiyin edi. Biroq, men uni topshirdim." },
      { en: "He didn't go out because of the storm.", uz: "U bo‘ron sabab tashqariga chiqmadi." },
      { en: "I like tea, but my sister prefers coffee.", uz: "Men choyni yoqtiraman, ammo singlim qahvani afzal ko‘radi." },
    ],
    mistakes: [
      {
        wrong: "Because I was tired, so I went to bed.",
        right: "Because I was tired, I went to bed.",
        noteUz: "Because va so bir gapda birga ishlatilmaydi. Bittasi yetadi: Because I was tired, I went to bed. / I was tired, so I went to bed.",
      },
      {
        wrong: "Although he was tired, but he kept working.",
        right: "Although he was tired, he kept working.",
        noteUz: "Although bilan but ni qo‘shib bo‘lmaydi. Ikkalasi ham qarama-qarshilikni bildiradi, bittasi yetarli.",
      },
      {
        wrong: "I like football, however I don't play it.",
        right: "I like football. However, I don't play it.",
        noteUz: "However yangi gapni boshlaydi, oldidan nuqta (yoki nuqtali vergul), keyin esa vergul qo‘yiladi.",
      },
    ],
    quiz: [
      {
        id: "g29-q1",
        q: "It was raining, ___ we took umbrellas.",
        options: ["because", "so", "although", "however"],
        answer: 1,
        explain: "Yomg‘ir yog‘ayotgani sabab, soyabon olish esa uning natijasi. Natija oldidan so ishlatiladi.",
      },
      {
        id: "g29-q2",
        q: "We stayed at home ___ it was raining.",
        options: ["so", "however", "because", "therefore"],
        answer: 2,
        explain: "Uyda qolish natija, yomg‘ir esa sabab. Sababdan oldin because ishlatiladi.",
      },
      {
        id: "g29-q3",
        q: "___ he studied hard, he failed the exam.",
        options: ["Although", "So", "Because", "However"],
        answer: 0,
        explain: "Qattiq o‘qish va yiqilish bir-biriga zid. Bir gap ichida zidlik uchun Although ishlatiladi.",
      },
      {
        id: "g29-q4",
        q: "I love ice cream. ___, I don't eat it every day.",
        options: ["Although", "Because", "So", "However"],
        answer: 3,
        explain: "Ikkinchi gap birinchisiga zid va yangi gap bo‘lib boshlanyapti. Shunda However, ishlatiladi.",
      },
      {
        id: "g29-q5",
        q: "Which sentence is correct?",
        options: [
          "I was late so the bus broke down.",
          "I was late because the bus broke down.",
          "I was late because of the bus broke down.",
          "I was late because the bus broken down.",
        ],
        answer: 1,
        explain: "Because dan keyin to‘liq gap keladi (the bus broke down). Because of dan keyin faqat ot ishlatiladi, so esa natijani bildiradi.",
      },
    ],
  },

  // ---------------------------------------------------------------- g30
  {
    id: "g30",
    title: "Phrasal verbs",
    titleUz: "Frazali fe‘llar",
    level: "B1",
    emoji: "🔧",
    summaryUz:
      "Phrasal verb fe‘l va predlog (yoki ravish) birikmasidan iborat bo‘lib, ko‘pincha so‘zma-so‘z tarjimadan butunlay boshqa ma‘no beradi.",
    explanationUz: [
      "Phrasal verb — fe‘l + kichik so‘z (up, off, out, in, on, after va h.k.) birikmasi. Muhimi shundaki, birikma yangi ma‘no hosil qiladi: look = qaramoq, look after = qarab turmoq, g‘amxo‘rlik qilmoq; give = bermoq, give up = taslim bo‘lmoq, tashlamoq. Ularni alohida so‘z kabi yodlash kerak.",
      "Eng ko‘p ishlatiladiganlari: get up (turmoq), turn on (yoqmoq), turn off (o‘chirmoq), put on (kiymoq), take off (yechmoq; uchmoq), look for (izlamoq), look up (lug‘atdan qidirmoq), look after (qarab turmoq), find out (bilib olmoq), come back (qaytmoq), give up (taslim bo‘lmoq), wake up (uyg‘onmoq).",
      "Ba‘zi phrasal verblar o‘timli (ob‘ektli) va ajraladigan bo‘ladi. Ot bo‘lsa, ikki joyga qo‘yish mumkin: turn off the light / turn the light off. Lekin olmosh (it, them, him, me) bo‘lsa, faqat o‘rtaga qo‘yiladi: turn it off. Turn off it deb aytilmaydi.",
      "Ba‘zilari ajralmaydi va ob‘ekt doim oxirida keladi: look after my brother, look for my keys, get on the bus. Look forward to kabi uch qismli birikmalarda to dan keyin fe‘l emas, ot yoki -ing shakli keladi: I'm looking forward to seeing you. (Bu yerda to — predlog.)",
      "Phrasal verblarni o‘rganishning eng yaxshi yo‘li — ularni jumla ichida yodlash va mavzular bo‘yicha guruhlash. Bir fe‘lning bir nechta ma‘nosi bo‘lishi mumkin: take off — kiyimni yechmoq va samolyot uchishi. Yangi birikmani ko‘rsangiz, lug‘atdan ma‘nosini tekshiring va o‘zingiz bitta gap tuzing.",
    ],
    examples: [
      { en: "I usually get up at seven.", uz: "Men odatda soat yettida turaman." },
      { en: "Please turn off the TV and go to bed.", uz: "Iltimos, televizorni o‘chirib, uxlagani yot." },
      { en: "Can you look after my cat this weekend?", uz: "Shu dam olish kunlari mushugimga qarab tura olasanmi?" },
      { en: "I don't know this word. I will look it up.", uz: "Bu so‘zni bilmayman. Uni lug‘atdan qidiraman." },
      { en: "Don't give up. You are almost there!", uz: "Taslim bo‘lma. Sen deyarli yetib keldin!" },
      { en: "We are looking forward to the summer holidays.", uz: "Biz yozgi ta‘tilni intiqlik bilan kutyapmiz." },
    ],
    mistakes: [
      {
        wrong: "Please turn off it.",
        right: "Please turn it off.",
        noteUz: "Olmosh (it, them, him) ajraladigan phrasal verbning o‘rtasiga qo‘yiladi: turn it off, put them on.",
      },
      {
        wrong: "I look forward to see you.",
        right: "I look forward to seeing you.",
        noteUz: "Look forward to dagi to — predlog, shuning uchun undan keyin fe‘lning -ing shakli keladi.",
      },
      {
        wrong: "Can you look for my cat while I am away?",
        right: "Can you look after my cat while I am away?",
        noteUz: "Look for — izlamoq, look after — qarab turmoq. Birikmadagi kichik so‘z ma‘noni butunlay o‘zgartiradi.",
      },
    ],
    quiz: [
      {
        id: "g30-q1",
        q: "Please ___ your shoes before you enter the house.",
        options: ["take out", "take away", "take off", "take in"],
        answer: 2,
        explain: "Take off kiyim yoki poyabzalni yechishni bildiradi. Qolgan birikmalar bunday ma‘noga ega emas.",
      },
      {
        id: "g30-q2",
        q: "Can you ___ my little brother while I am out?",
        options: ["look after", "look up", "look forward", "look out"],
        answer: 0,
        explain: "Look after — qarab turmoq, g‘amxo‘rlik qilmoq. Look up lug‘atdan qidirishni, look out esa ehtiyot bo‘lishni bildiradi.",
      },
      {
        id: "g30-q3",
        q: "I usually ___ at seven o‘clock on school days.",
        options: ["get on", "get off", "get over", "get up"],
        answer: 3,
        explain: "Get up — o‘rnidan turmoq. Get on/off transportga chiqish va tushishni bildiradi.",
      },
      {
        id: "g30-q4",
        q: "Which sentence is correct?",
        options: ["She turned off it.", "She turned it off.", "She turned off the it.", "She off turned it."],
        answer: 1,
        explain: "Olmosh (it) ajraladigan phrasal verbning o‘rtasiga qo‘yiladi: turned it off.",
      },
      {
        id: "g30-q5",
        q: "We are really looking forward ___ the holidays.",
        options: ["for", "at", "on", "to"],
        answer: 3,
        explain: "Look forward to — intiqlik bilan kutmoq. Bu birikmada doim to ishlatiladi.",
      },
    ],
  },

  // ---------------------------------------------------------------- g31
  {
    id: "g31",
    title: "Reported speech",
    titleUz: "Ko‘chirma va o‘zlashtirma gap",
    level: "B2",
    emoji: "💬",
    summaryUz:
      "Reported speech birovning aytgan gapini so‘zma-so‘z emas, o‘z so‘zlarimiz bilan, vaqt va olmoshlarni moslab yetkazish usulidir.",
    explanationUz: [
      "Ko‘chirma gapda birovning so‘zlarini aynan keltiramiz: Anna said, «I like your bag.» O‘zlashtirma gapda esa uni o‘z so‘zlarimiz bilan aytib beramiz: Anna said that she liked my bag. O‘zbekchada ham «Anna: «Men sening sumkangni yoqtiraman», — dedi» o‘rniga «Anna mening sumkamni yoqtirishini aytdi» deymiz.",
      "O‘zlashtirma gapda uchta narsa o‘zgaradi. Birinchi, olmoshlar mantiqqa qarab o‘zgaradi (I → she, your → my). Ikkinchi, agar reporting fe‘l o‘tgan zamonda bo‘lsa, vaqt odatda bir pog‘ona orqaga suriladi (backshift): am/is → was, do/does → did, will → would, can → could, Past Simple → Past Perfect, Present Perfect → Past Perfect. Uchinchi, vaqt ravishlari o‘zgaradi: today → that day, tomorrow → the next day, yesterday → the day before, now → then.",
      "Say va tell farqiga e‘tibor bering. Tell dan keyin doim kimga aytilgani keladi: He told me that he was tired. Say da esa to bilan: He said that he was tired. / He said to me that he was tired. Noto‘g‘ri: He said me. That so‘zini tushirib qoldirish mumkin: He said he was tired.",
      "Reported savollarda to‘g‘ri gap tartibi ishlatiladi, ya‘ni do/does/did va savol so‘z tartibi yo‘qoladi. Wh- savollar: «Where do you live?» → She asked me where I lived. Ha/yo‘q savollari if yoki whether bilan beriladi: «Do you like pizza?» → He asked me if I liked pizza. Savol belgisi qo‘yilmaydi.",
      "Buyruqlar va iltimoslar uchun to + V ishlatiladi: «Sit down!» → The teacher told us to sit down. «Please help me.» → She asked me to help her. Inkorda not to: He told me not to touch it. Yodda tuting: agar gapning mazmuni hali ham to‘g‘ri bo‘lsa (masalan, haqiqat), backshift majburiy emas, lekin o‘rganish uchun uni qo‘llash eng xavfsiz yo‘l.",
    ],
    examples: [
      { en: "She said that she was very tired.", uz: "U juda charchaganini aytdi." },
      { en: "Tom told me that he had lost his phone.", uz: "Tom telefonini yo‘qotganini menga aytdi." },
      { en: "My mother asked me where I had been.", uz: "Onam mendan qayerda bo‘lganimni so‘radi." },
      { en: "He asked if I liked football.", uz: "U mendan futbolni yoqtirish-yoqtirmasligimni so‘radi." },
      { en: "The teacher told us to open our books.", uz: "O‘qituvchi bizga kitoblarimizni ochishni aytdi." },
      { en: "They said they would come the next day.", uz: "Ular ertasi kuni kelishlarini aytishdi." },
    ],
    mistakes: [
      {
        wrong: "She said me that she was tired.",
        right: "She told me that she was tired.",
        noteUz: "Say dan keyin to‘g‘ridan-to‘g‘ri kimga aytilgani kelmaydi. Kimga aytilganini bildirish uchun tell ishlatiladi.",
      },
      {
        wrong: "He asked me where do I live.",
        right: "He asked me where I lived.",
        noteUz: "Reported savolda to‘g‘ri gap tartibi bo‘ladi: do yo‘qoladi, fe‘l esa orqaga suriladi (live → lived).",
      },
      {
        wrong: "She asked me do I like tea.",
        right: "She asked me if I liked tea.",
        noteUz: "Ha/yo‘q savolini reported speech da if yoki whether bilan beramiz va tartib to‘g‘ri bo‘ladi.",
      },
    ],
    quiz: [
      {
        id: "g31-q1",
        q: "Anna said to me, “I like your bag.” → Anna said that she liked ___ bag.",
        options: ["your", "my", "her", "our"],
        answer: 1,
        explain: "Anna «sening sumkang» degan, ya‘ni menga. Gapni men aytib berayotganim uchun olmosh my ga o‘zgaradi.",
      },
      {
        id: "g31-q2",
        q: "“Where do you live?” → She asked me where I ___.",
        options: ["lived", "do I live", "did I live", "do live"],
        answer: 0,
        explain: "Reported savolda do ishlatilmaydi, tartib to‘g‘ri bo‘ladi va fe‘l orqaga suriladi: where I lived.",
      },
      {
        id: "g31-q3",
        q: "“Do you like pizza?” → He asked me ___ pizza.",
        options: ["did I like", "that I liked", "if I liked", "if did I like"],
        answer: 2,
        explain: "Ha/yo‘q savolini reported speech da if bilan beramiz va to‘g‘ri gap tartibi ishlatiladi: if I liked.",
      },
      {
        id: "g31-q4",
        q: "“I will call you tomorrow,” she said. → She said that she ___ call me the next day.",
        options: ["did", "has", "was", "would"],
        answer: 3,
        explain: "Will reported speech da would ga o‘zgaradi. Tomorrow esa the next day bo‘ladi.",
      },
      {
        id: "g31-q5",
        q: "Which sentence is correct?",
        options: [
          "He said me that he was tired.",
          "He told me that he was tired.",
          "He told that he was tired.",
          "He said to that he was tired.",
        ],
        answer: 1,
        explain: "Tell dan keyin kimga aytilgani keladi: told me. Say bilan to‘g‘ridan-to‘g‘ri me ishlatib bo‘lmaydi.",
      },
    ],
  },

  // ---------------------------------------------------------------- g32
  {
    id: "g32",
    title: "Third Conditional",
    titleUz: "Uchinchi shart gap",
    level: "B2",
    emoji: "🦋",
    summaryUz:
      "Third Conditional o‘tmishda bo‘lmagan narsa haqida «agar shunday bo‘lganida, natija boshqacha bo‘lardi» deb afsuslanish uchun ishlatiladi.",
    explanationUz: [
      "Third Conditional o‘tmishdagi xayoliy vaziyatni tasvirlaydi. Bu narsa aslida sodir bo‘lmagan va endi uni o‘zgartirib bo‘lmaydi. If I had studied harder, I would have passed the exam. Haqiqat: men yaxshi o‘qimadim va imtihondan o‘ta olmadim.",
      "Qolip: If + Past Perfect (had + V3), would have + V3. If qismida had + V3, asosiy qismida would have + V3 keladi. If I had known, I would have helped you. Qisqa shakllari: I'd known, I'd have helped. Gap tartibini almashtirish mumkin: I would have helped you if I had known. Bunda vergul kerak emas.",
      "Inkor shakllari ham mumkin: If it hadn't rained, we would have gone to the park. (Yomg‘ir yog‘di, shuning uchun bormadik.) If she had called, I would have answered. Savol: What would you have done if you had found the money?",
      "Eng ko‘p uchraydigan xato: if dan keyin would have ishlatish. If qismida would hech qachon ishlatilmaydi: If I had known (to‘g‘ri), If I would have known (noto‘g‘ri). Yana bir xato: ikkala qismda ham had ishlatish yoki asosiy qismda would ni V3 siz qoldirish.",
      "Taqqoslash: Second Conditional hozirgi yoki kelajakdagi xayoliy vaziyat uchun (If I had a car, I would drive), Third Conditional esa o‘tmish uchun. O‘zbekchada «Agar o‘qiganimda, o‘tgan bo‘lardim» desak, ikkala holatda ham «-ganimda» ishlatiladi, lekin inglizchada o‘tmish uchun had + V3 ni tanlash shart.",
    ],
    examples: [
      { en: "If I had woken up earlier, I wouldn't have missed the bus.", uz: "Agar erta uyg‘onganimda, avtobusni o‘tkazib yubormagan bo‘lardim." },
      { en: "If she had studied, she would have passed the test.", uz: "Agar u tayyorlanganida, testdan o‘tgan bo‘lardi." },
      { en: "We would have won if we had played better.", uz: "Agar yaxshiroq o‘ynaganimizda, g‘alaba qozongan bo‘lardik." },
      { en: "If they hadn't been late, they would have seen the beginning.", uz: "Agar ular kechikmaganida, boshlanishini ko‘rgan bo‘lishardi." },
      { en: "If I had known about the party, I would have come.", uz: "Agar ziyofatdan xabarim bo‘lganida, kelgan bo‘lardim." },
      { en: "What would you have done if you had lost your phone?", uz: "Agar telefoningni yo‘qotganingda, nima qilgan bo‘lardin?" },
    ],
    mistakes: [
      {
        wrong: "If I would have studied, I would have passed.",
        right: "If I had studied, I would have passed.",
        noteUz: "If qismida would ishlatilmaydi. U yerda Past Perfect (had + V3) turadi.",
      },
      {
        wrong: "If I had known, I would help you.",
        right: "If I had known, I would have helped you.",
        noteUz: "O‘tmishdagi natija uchun asosiy qismda ham would have + V3 kerak, would + V emas.",
      },
      {
        wrong: "If she had called, I would had answered.",
        right: "If she had called, I would have answered.",
        noteUz: "Would dan keyin had emas, have keladi: would have + V3.",
      },
    ],
    quiz: [
      {
        id: "g32-q1",
        q: "If I ___ harder, I would have passed the exam.",
        options: ["studied", "had studied", "would study", "have studied"],
        answer: 1,
        explain: "Third Conditional da if qismida Past Perfect (had studied) ishlatiladi.",
      },
      {
        id: "g32-q2",
        q: "She would have come to the party if she ___ about it.",
        options: ["knew", "would know", "has known", "had known"],
        answer: 3,
        explain: "Would have come bilan birga if qismida had + V3 keladi: had known.",
      },
      {
        id: "g32-q3",
        q: "If it hadn't rained, we ___ to the park.",
        options: ["would go", "will have gone", "would have gone", "had gone"],
        answer: 2,
        explain: "Asosiy qismda would have + V3 ishlatiladi: would have gone.",
      },
      {
        id: "g32-q4",
        q: "What would you have done if you ___ the money?",
        options: ["had found", "found", "have found", "would find"],
        answer: 0,
        explain: "O‘tmishdagi xayoliy vaziyat uchun if qismida had + V3 kerak: had found.",
      },
      {
        id: "g32-q5",
        q: "Which sentence is correct?",
        options: [
          "If I would have known, I would have helped.",
          "If I had known, I would have helped.",
          "If I knew, I would have helped.",
          "If I had known, I would help.",
        ],
        answer: 1,
        explain: "To‘g‘ri qolip: If + had + V3, would have + V3. If qismida would ishlatilmaydi.",
      },
    ],
  },

  // ---------------------------------------------------------------- g33
  {
    id: "g33",
    title: "Wish and If only",
    titleUz: "Wish va If only",
    level: "B2",
    emoji: "🌠",
    summaryUz:
      "Wish va If only hozirgi yoki o‘tmishdagi vaziyatdan norozilik, afsuslanish yoki orzuni ifodalash uchun ishlatiladi.",
    explanationUz: [
      "Wish va If only «koshki edi», «qani endi» degan ma‘noni beradi. Ikkalasining ma‘nosi bir xil, faqat If only kuchliroq his-tuyg‘uni ko‘rsatadi: I wish I had a dog. = If only I had a dog! O‘zbekchada «Qani endi itim bo‘lsa edi» deymiz va bu inglizchadagi I wish I had a dog ga to‘g‘ri keladi.",
      "Hozirgi vaziyat haqida: wish + Past Simple. Aslida shunday emas, lekin shunday bo‘lishini istaymiz. I wish I had a bigger room. (Mening xonam kichik.) I wish I knew the answer. Be fe‘li bilan barcha shaxslarda were ishlatiladi: I wish I were taller. If only she were here!",
      "O‘tmishdagi afsus haqida: wish + Past Perfect (had + V3). Bu o‘tmishda bo‘lgan narsani o‘zgartirib bo‘lmasligini bildiradi. I wish I had studied harder. (Men qattiq o‘qimadim.) If only I hadn't said that! (Men buni aytib qo‘ydim.)",
      "Hozirgi odatdan yoki biror kishining ishidan zerikkanda wish + would ishlatiladi: I wish it would stop raining. I wish you would listen to me. Bu faqat o‘zgartirsa bo‘ladigan ishlar uchun ishlatiladi. Wish + would o‘zimiz haqimizda (I wish I would) ishlatilmaydi va tabiiy holatlarga bevosita tegishli emas.",
      "Qisqa xulosa: wish/if only + Past Simple = hozirgi vaziyatni o‘zgartirish istagi; wish/if only + Past Perfect = o‘tmish afsusi; wish/if only + would = boshqa kishining odatidan norozilik. Diqqat: wish dan keyin hech qachon present (I wish I have) ishlatilmaydi. Hozirgi zamon uchun Past Simple, o‘tmish uchun Past Perfect.",
    ],
    examples: [
      { en: "I wish I had a pet rabbit.", uz: "Qani endi uy quyonim bo‘lsa edi." },
      { en: "I wish I were taller.", uz: "Qani endi bo‘yim balandroq bo‘lsa edi." },
      { en: "If only I knew the answer!", uz: "Qani endi javobni bilsam edi!" },
      { en: "I wish I had studied more for the test.", uz: "Koshki test uchun ko‘proq tayyorlanganimda edi." },
      { en: "If only I hadn't forgotten my homework!", uz: "Koshki uy vazifamni unutmaganimda edi!" },
      { en: "I wish it would stop raining.", uz: "Koshki yomg‘ir to‘xtasa edi." },
    ],
    mistakes: [
      {
        wrong: "I wish I am taller.",
        right: "I wish I were taller.",
        noteUz: "Wish dan keyin hozirgi vaziyat uchun Present emas, Past Simple ishlatiladi, be fe‘lida esa were.",
      },
      {
        wrong: "I wish I would have a dog.",
        right: "I wish I had a dog.",
        noteUz: "O‘z orzuyimiz haqida wish + would ishlatilmaydi. Hozirgi orzu uchun wish + Past Simple (had) kerak.",
      },
      {
        wrong: "If only I knew about it yesterday.",
        right: "If only I had known about it yesterday.",
        noteUz: "Yesterday o‘tmishga tegishli, shuning uchun afsus Past Perfect bilan beriladi: had known.",
      },
    ],
    quiz: [
      {
        id: "g33-q1",
        q: "I wish I ___ a bigger room. Mine is too small.",
        options: ["had", "have", "would have", "has"],
        answer: 0,
        explain: "Hozirgi vaziyatdan norozilik wish + Past Simple bilan beriladi: I wish I had.",
      },
      {
        id: "g33-q2",
        q: "I wish it ___ raining. I want to play outside.",
        options: ["stops", "would stop", "will stop", "is stopping"],
        answer: 1,
        explain: "Hozirgi noqulay holatdan norozilik wish + would + V bilan beriladi: I wish it would stop raining.",
      },
      {
        id: "g33-q3",
        q: "I wish I ___ to the party yesterday. I missed a lot of fun.",
        options: ["went", "would go", "had gone", "have gone"],
        answer: 2,
        explain: "Kecha sodir bo‘lgan voqeaga afsus Past Perfect bilan beriladi: I wish I had gone.",
      },
      {
        id: "g33-q4",
        q: "If only I ___ the answer! I really don't know it.",
        options: ["know", "had known", "would know", "knew"],
        answer: 3,
        explain: "Hozirgi vaziyat haqida If only + Past Simple ishlatiladi: If only I knew.",
      },
      {
        id: "g33-q5",
        q: "Which sentence is correct?",
        options: [
          "I wish I am taller.",
          "I wish I were taller.",
          "I wish I will be taller.",
          "I wish I would taller.",
        ],
        answer: 1,
        explain: "Wish dan keyin be fe‘li were shaklida keladi: I wish I were taller.",
      },
    ],
  },

  // ---------------------------------------------------------------- g34
  {
    id: "g34",
    title: "Future Continuous and Future Perfect",
    titleUz: "Kelasi davomli va kelasi tugallangan zamon",
    level: "B2",
    emoji: "🔮",
    summaryUz:
      "Future Continuous kelajakdagi ma‘lum paytda davom etayotgan ishni, Future Perfect esa kelajakdagi ma‘lum paytga kelib tugagan ishni ko‘rsatadi.",
    explanationUz: [
      "Future Continuous kelajakdagi aniq bir payt davomida jarayon ketayotgan bo‘lishini bildiradi. Shakli: will + be + V-ing. This time tomorrow, I will be sitting on the beach. At 8 p.m. we will be having dinner. O‘zbekchada «ertaga shu payt men dengiz bo‘yida o‘tirgan bo‘laman» deymiz.",
      "Future Continuous inkor va savol shakllari: I won't be sleeping. Will you be working at noon? Uning yana bir ishlatilishi — muloyim savol berish: Will you be using the computer this evening? (Bu «Kompyuterni ishlatmoqchimisiz?» degan mayin so‘rovdir.) Kimgadir «shu paytda band bo‘laman» deb aytganda ham ishlatiladi: Don't call me at nine. I will be studying.",
      "Future Perfect kelajakdagi ma‘lum paytga kelib biror ish tugagan bo‘lishini bildiradi. Shakli: will + have + V3. By Friday, I will have finished the project. By the time you wake up, I will have left. O‘zbekchada «jumagacha loyihani tugatgan bo‘laman» degan ma‘noga to‘g‘ri keladi.",
      "Future Perfect ko‘pincha by (…gacha, …ga kelib), by the time, by then, before kabi so‘zlar bilan ishlatiladi: By next June, we will have lived here for ten years. Inkor: She won't have finished by noon. Savol: Will you have finished the report by Friday? Diqqat: by the time dan keyingi vaqt gapida will ishlatilmaydi, Present Simple ishlatiladi (By the time you wake up…).",
      "Ularni solishtiring. Future Continuous — jarayon (kelajakdagi paytda nima qilyapman). Future Perfect — natija (kelajakdagi paytga kelib nima tugagan bo‘ladi). At 6 p.m. I will be cooking. (Jarayon davom etyapti.) By 6 p.m. I will have cooked dinner. (Ovqat allaqachon tayyor.) Ikkalasida ham will dan keyin fe‘l o‘zgarmaydi: be, have.",
    ],
    examples: [
      { en: "This time tomorrow, I will be flying to Tashkent.", uz: "Ertaga shu payt men Toshkentga uchib ketayotgan bo‘laman." },
      { en: "Don't call me at nine. I will be sleeping.", uz: "Soat to‘qqizda menga qo‘ng‘iroq qilma. Men uxlayotgan bo‘laman." },
      { en: "Will you be using the computer tonight?", uz: "Bugun kechqurun kompyuterdan foydalanasizmi?" },
      { en: "By Friday, I will have finished my project.", uz: "Jumagacha men loyihamni tugatgan bo‘laman." },
      { en: "By the time you wake up, I will have left for school.", uz: "Sen uyg‘onguningcha, men maktabga ketgan bo‘laman." },
      { en: "By next June, we will have lived here for ten years.", uz: "Kelasi iyunga kelib, biz bu yerda o‘n yil yashagan bo‘lamiz." },
    ],
    mistakes: [
      {
        wrong: "Tomorrow at eight, I will sleeping.",
        right: "Tomorrow at eight, I will be sleeping.",
        noteUz: "Future Continuous da will dan keyin be, undan keyin V-ing keladi: will be sleeping.",
      },
      {
        wrong: "She will have finish by noon.",
        right: "She will have finished by noon.",
        noteUz: "Future Perfect da will have dan keyin fe‘lning uchinchi shakli (V3) keladi: finished.",
      },
      {
        wrong: "By the time you will arrive, I will have left.",
        right: "By the time you arrive, I will have left.",
        noteUz: "By the time dan keyin kelajak uchun ham Present Simple ishlatiladi, will emas.",
      },
    ],
    quiz: [
      {
        id: "g34-q1",
        q: "This time tomorrow, I ___ on the beach.",
        options: ["will lying", "will be lying", "will been lying", "will be lie"],
        answer: 1,
        explain: "Kelajakdagi paytda davom etayotgan jarayon uchun will be + V-ing ishlatiladi: will be lying.",
      },
      {
        id: "g34-q2",
        q: "By the time you wake up, I ___ already left.",
        options: ["have", "will had", "will have", "will be"],
        answer: 2,
        explain: "Kelajakdagi paytgacha tugagan ish uchun will have + V3 ishlatiladi: will have left.",
      },
      {
        id: "g34-q3",
        q: "Which sentence is correct?",
        options: [
          "By next June, we have lived here for ten years.",
          "By next June, we will have living here for ten years.",
          "By next June, we will has lived here for ten years.",
          "By next June, we will have lived here for ten years.",
        ],
        answer: 3,
        explain: "By next June kelajak vaqtiga ishora qiladi, shuning uchun Future Perfect: will have lived. Will dan keyin has emas, have keladi.",
      },
      {
        id: "g34-q4",
        q: "___ you have finished the report by Friday?",
        options: ["Will", "Are", "Did", "Do"],
        answer: 0,
        explain: "Future Perfect savol gapda will gap egasidan oldin turadi: Will you have finished...?",
      },
      {
        id: "g34-q5",
        q: "I ___ my homework by six, so I can play with you then.",
        options: ["will have finish", "will have finished", "will finished", "will has finished"],
        answer: 1,
        explain: "By six — kelajakdagi paytgacha tugagan ish. Shakl: will have + V3 (finished).",
      },
    ],
  },
];
