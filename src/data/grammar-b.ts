import type { GrammarLesson } from '../types';

export const GRAMMAR_B: GrammarLesson[] = [
  // ---------------------------------------------------------------- g08
  {
    id: 'g08',
    title: 'Future forms',
    titleUz: 'Kelasi zamon shakllari',
    level: 'A2',
    emoji: '🚀',
    summaryUz:
      'Kelajak haqida gapirish uchun will (o‘sha zahoti qaror, taxmin) va be going to (oldindan rejalar, belgilarga asoslangan taxmin) ishlatiladi.',
    explanationUz: [
      'Ingliz tilida kelajak haqida gapirishning bir necha usuli bor. Eng ko‘p ishlatiladiganlari: will va be going to. Ikkalasi ham "kelasi zamon"ni bildiradi, lekin ular bir xil emas.',
      'will + V ni gap payti qabul qilingan qaror, taxmin yoki so‘z berish uchun ishlatamiz: I\'m thirsty. I\'ll get some water. (Chanqadim. Suv olib kelaman.) Inkor shakli: will not = won\'t. Will dan keyin to qo‘yilmaydi va V ga -s qo‘shilmaydi.',
      'am/is/are + going to + V ni oldindan o‘ylab qo‘yilgan reja yoki hozirgi belgilarga qarab qilingan taxmin uchun ishlatamiz: I\'m going to visit my grandma tomorrow. Look at those clouds! It\'s going to rain.',
      'Aniq kelishib olingan, vaqti belgilangan rejalar uchun Present Continuous (am/is/are + V-ing) ham ishlatiladi: We\'re meeting Ali at 5 pm. Bu yerda odatda vaqt (tomorrow, tonight, on Friday) aytiladi.',
      'O‘zbek tilida "ertaga boraman" deymiz, ya‘ni hozirgi-kelasi zamon shakli kelajakni ham bildiradi. Inglizchada esa kelajak uchun albatta will yoki be going to kerak: I\'m going to go, I will go.',
    ],
    examples: [
      { en: "I'm going to visit my grandparents next week.", uz: 'Men kelasi hafta bobo-buvimnikiga borishni rejalashtiryapman.' },
      { en: "Look at those dark clouds! It's going to rain.", uz: 'Anavi qora bulutlarga qara! Yomg‘ir yog‘adi.' },
      { en: "It's cold in here. I'll close the window.", uz: 'Bu yerda sovuq. Derazani yopaman.' },
      { en: 'I think Uzbekistan will win the match.', uz: 'Menimcha, O‘zbekiston o‘yinda g‘alaba qozonadi.' },
      { en: "We're meeting our friends at the park at 4 pm.", uz: 'Biz do‘stlarimiz bilan soat 4 da bog‘da uchrashamiz.' },
      { en: "I won't tell anyone your secret.", uz: 'Men sirni hech kimga aytmayman.' },
    ],
    mistakes: [
      {
        wrong: 'I will to call you later.',
        right: 'I will call you later.',
        noteUz: 'Will dan keyin to qo‘yilmaydi: will + V.',
      },
      {
        wrong: 'He will goes to the market.',
        right: 'He will go to the market.',
        noteUz: 'Will dan keyin V asosiy shaklda keladi, uchinchi shaxs uchun ham -s qo‘shilmaydi.',
      },
      {
        wrong: 'I go to Samarkand next summer.',
        right: "I'm going to go to Samarkand next summer.",
        noteUz: 'O‘zbekchada "boraman" kelajakni ham bildiradi, inglizchada esa kelajak reja uchun be going to yoki will kerak.',
      },
    ],
    quiz: [
      {
        id: 'g08-q1',
        q: "I ___ visit my grandparents next week. I've already bought the tickets.",
        options: ['are going to', 'is going to', 'going to', 'am going to'],
        answer: 3,
        explain: 'Reja oldindan tuzilgan, shuning uchun be going to ishlatiladi. I bilan am going to keladi.',
      },
      {
        id: 'g08-q2',
        q: "A: There is no bread at home. B: Oh no! I ___ buy some. (B decides at this moment.)",
        options: ['am going to', 'bought', 'will', 'have bought'],
        answer: 2,
        explain: 'Qaror gap payti qabul qilinyapti, shuning uchun will (I\'ll buy) ishlatiladi.',
      },
      {
        id: 'g08-q3',
        q: 'Which sentence is correct?',
        options: ["I'll help you.", 'I will to help you.', 'I going to help you.', 'I am go to help you.'],
        answer: 0,
        explain: 'Will dan keyin to qo‘yilmaydi (will + V). Going to oldidan esa am/is/are kerak.',
      },
      {
        id: 'g08-q4',
        q: "We ___ our grandparents this Sunday. It's all arranged.",
        options: ['visits', 'are visiting', 'visiting', 'will to visit'],
        answer: 1,
        explain: 'Kelishib olingan reja uchun Present Continuous (am/is/are + V-ing) ishlatiladi.',
      },
      {
        id: 'g08-q5',
        q: '___ you going to watch the match tonight?',
        options: ['Do', 'Will', 'Are', 'Have'],
        answer: 2,
        explain: 'Be going to so‘roq gapida be fe‘li emas, are oldinga chiqadi: Are you going to ...? Will bilan going to birga kelmaydi.',
      },
    ],
  },

  // ---------------------------------------------------------------- g09
  {
    id: 'g09',
    title: 'Comparatives & Superlatives',
    titleUz: 'Qiyosiy va orttirma daraja',
    level: 'A2',
    emoji: '📊',
    summaryUz:
      'Ikki narsani solishtirishda sifatga -er yoki more, eng yuqori darajani bildirishda the -est yoki the most qo‘shiladi.',
    explanationUz: [
      'Ikki narsani solishtirganda comparative (qiyosiy daraja) ishlatamiz, ko‘pchilikdan birini ajratib ko‘rsatganda superlative (orttirma daraja) ishlatamiz.',
      'Qisqa sifatlarga (1 bo‘g‘inli) -er va the -est qo‘shiladi: tall - taller - the tallest. Agar so‘z undosh bilan tugasa, undosh ikkilanadi: big - bigger - the biggest. -y bilan tugasa, y o‘rniga i yoziladi: happy - happier - the happiest.',
      'Uzun sifatlar uchun more va the most ishlatiladi: interesting - more interesting - the most interesting. Solishtirganda than qo‘yiladi: She is taller than me. Superlative oldida doim the turadi.',
      'Ba‘zi sifatlar o‘zgacha shakllanadi, ularni yodlab oling: good - better - the best; bad - worse - the worst; far - farther - the farthest.',
      'Tenglikni as + sifat + as bilan bildiramiz: He is as tall as his father. Inkor shaklida not as ... as "unchalik emas" degan mazmunni beradi: Tashkent is not as big as Moscow.',
    ],
    examples: [
      { en: 'My brother is taller than me.', uz: 'Akam mendan balandroq.' },
      { en: 'This book is more interesting than that one.', uz: 'Bu kitob anavisidan qiziqarliroq.' },
      { en: 'Mount Everest is the highest mountain in the world.', uz: 'Everest dunyodagi eng baland tog‘dir.' },
      { en: 'Her English is better than mine.', uz: 'Uning inglizchasi meniki(dan) yaxshiroq.' },
      { en: 'That was the worst day of my life!', uz: 'Bu hayotimdagi eng yomon kun edi!' },
      { en: "My phone is as expensive as yours.", uz: 'Mening telefonim seniki kabi qimmat.' },
    ],
    mistakes: [
      {
        wrong: 'My sister is more tall than me.',
        right: 'My sister is taller than me.',
        noteUz: 'Qisqa sifatlarda more ishlatilmaydi, -er qo‘shiladi: taller.',
      },
      {
        wrong: 'This film is more good than that one.',
        right: 'This film is better than that one.',
        noteUz: 'Good ning qiyosiy darajasi better, orttirma darajasi the best. Ularni yodlab oling.',
      },
      {
        wrong: 'She is taller from me.',
        right: 'She is taller than me.',
        noteUz: 'O‘zbekchada "mendan" deymiz, inglizchada esa from emas, than ishlatiladi.',
      },
    ],
    quiz: [
      {
        id: 'g09-q1',
        q: 'My brother is ___ than me.',
        options: ['tall', 'tallest', 'more tall', 'taller'],
        answer: 3,
        explain: 'Qisqa sifat tall ga -er qo‘shiladi va than bilan solishtiriladi: taller than.',
      },
      {
        id: 'g09-q2',
        q: 'This is the ___ film I have ever seen. It\'s amazing!',
        options: ['more interesting', 'most interesting', 'interestingest', 'interesting'],
        answer: 1,
        explain: 'Interesting uzun sifat, shuning uchun the most interesting deymiz. Oldida the borligi superlative ekanini bildiradi.',
      },
      {
        id: 'g09-q3',
        q: 'Her English is bad, but my English is ___.',
        options: ['worst', 'badder', 'worse', 'more bad'],
        answer: 2,
        explain: 'Bad noto‘g‘ri sifat: bad - worse - the worst. Ikki kishi solishtirilyapti, shuning uchun worse.',
      },
      {
        id: 'g09-q4',
        q: 'Tashkent is not as big ___ Moscow.',
        options: ['as', 'than', 'like', 'from'],
        answer: 0,
        explain: 'Tenglik va "unchalik emas" ma‘nosida as ... as qolipi ishlatiladi: not as big as.',
      },
      {
        id: 'g09-q5',
        q: 'Which sentence is correct?',
        options: ['She is more happy than me.', 'She is happyer than me.', 'She is happier than me.', 'She is the happier than me.'],
        answer: 2,
        explain: 'Happy -y bilan tugaydi: y o‘rniga i yoziladi va -er qo‘shiladi, happier. Than oldida the kerak emas.',
      },
    ],
  },

  // ---------------------------------------------------------------- g10
  {
    id: 'g10',
    title: 'Present Perfect',
    titleUz: 'Hozirgi tugallangan zamon',
    level: 'B1',
    emoji: '✅',
    summaryUz:
      'Present Perfect (have/has + V3) o‘tmishda bo‘lgan, lekin hozir bilan bog‘liq voqea, tajriba yoki natijani bildiradi.',
    explanationUz: [
      'Present Perfect: have/has + V3 (past participle). I, you, we, they bilan have, he, she, it bilan has ishlatiladi. U o‘tmishdagi voqeani hozir bilan bog‘laydi: voqea qachon bo‘lgani emas, natijasi yoki tajriba muhim.',
      'V3 shakli muntazam so‘zlarda -ed bilan tugaydi (played). Noto‘g‘ri so‘zlarda alohida: go - gone, see - seen, eat - eaten, do - done. Inkor: haven\'t/hasn\'t + V3. So‘roq: Have you ...? Has she ...?',
      'Tajriba haqida ever (savolda) va never (inkor ma‘nosida) ishlatiladi: Have you ever been to Samarkand? No, I\'ve never been there.',
      'Just (hozirgina), already (allaqachon) va yet (so‘roq va inkorda, gap oxirida) bilan ham ishlatiladi: I\'ve just finished. He has already left. I haven\'t eaten yet.',
      'For va since bilan "qancha vaqtdan beri" deyiladi: for + davomiylik (for five years), since + boshlang‘ich payt (since 2019). Aniq o‘tgan vaqt (yesterday, last week, in 2019, ago) aytilsa, Past Simple ishlatiladi: I saw him yesterday.',
    ],
    examples: [
      { en: 'Have you ever been to Samarkand?', uz: 'Siz hech Samarqandda bo‘lganmisiz?' },
      { en: 'She has never eaten sushi.', uz: 'U hech qachon sushi yemagan.' },
      { en: "We've just arrived at school.", uz: 'Biz hozirgina maktabga yetib keldik.' },
      { en: 'He has already done his homework.', uz: 'U uy vazifasini allaqachon bajarib bo‘ldi.' },
      { en: 'We have lived here for five years, since 2019.', uz: 'Biz bu yerda besh yildan beri, 2019-yildan beri yashaymiz.' },
      { en: "I lost my phone yesterday, and I haven't found it yet.", uz: 'Men telefonimni kecha yo‘qotdim va uni hali topganim yo‘q.' },
    ],
    mistakes: [
      {
        wrong: 'I have seen him yesterday.',
        right: 'I saw him yesterday.',
        noteUz: 'Yesterday kabi aniq o‘tgan vaqt bilan Present Perfect ishlatilmaydi, Past Simple kerak.',
      },
      {
        wrong: 'I have ate my breakfast.',
        right: 'I have eaten my breakfast.',
        noteUz: 'Have/has dan keyin V3 (eaten) keladi, o‘tgan zamon shakli (ate) emas.',
      },
      {
        wrong: 'I live here since 2019.',
        right: 'I have lived here since 2019.',
        noteUz: 'O‘zbekchada "yashayman" deymiz, lekin since/for bilan "beri" ma‘nosi uchun inglizchada Present Perfect kerak.',
      },
    ],
    quiz: [
      {
        id: 'g10-q1',
        q: 'I have ___ my homework.',
        options: ['done', 'did', 'do', 'doing'],
        answer: 0,
        explain: 'Have dan keyin V3 keladi. Do ning V3 shakli done.',
      },
      {
        id: 'g10-q2',
        q: 'She has never ___ sushi.',
        options: ['ate', 'eat', 'eating', 'eaten'],
        answer: 3,
        explain: 'Has never dan keyin V3 kerak. Eat - ate - eaten, shuning uchun eaten.',
      },
      {
        id: 'g10-q3',
        q: 'I have lived here ___ 2019.',
        options: ['for', 'since', 'from', 'during'],
        answer: 1,
        explain: 'Since boshlang‘ich nuqtadan (2019) beri degan ma‘noni beradi. For davomiylik bilan keladi (for five years).',
      },
      {
        id: 'g10-q4',
        q: 'Which sentence is correct?',
        options: ['I have seen him yesterday.', 'I have saw him yesterday.', 'I seen him yesterday.', 'I saw him yesterday.'],
        answer: 3,
        explain: 'Yesterday aniq o‘tgan vaqt, shuning uchun Past Simple (saw) ishlatiladi.',
      },
      {
        id: 'g10-q5',
        q: "I haven't finished my project ___.",
        options: ['yet', 'already', 'ever', 'just'],
        answer: 0,
        explain: 'Yet inkor gaplarda gap oxirida "hali" degan ma‘noda keladi: haven\'t finished yet.',
      },
    ],
  },

  // ---------------------------------------------------------------- g11
  {
    id: 'g11',
    title: 'Modal verbs',
    titleUz: 'Modal fe‘llar',
    level: 'A2',
    emoji: '🔑',
    summaryUz:
      'Can, must, should, may va might kabi modal so‘zlar qobiliyat, majburiyat, maslahat va ehtimolni bildiradi va keyin V asosiy shaklda keladi.',
    explanationUz: [
      'Can, must, should, may, might modal so‘zlar deyiladi. Ularning qoidasi oddiy: modal + V. Keyin to qo‘yilmaydi, V ga -s qo‘shilmaydi va do/does kerak emas: She can swim. Can you swim? I can\'t swim.',
      'Can qobiliyat yoki ruxsatni bildiradi: I can swim. (Men suza olaman.) Can\'t esa qila olmaslik yoki mumkin emasligini bildiradi: My brother can\'t read yet.',
      'Must kuchli majburiyat: You must do your homework. (Shart.) Mustn\'t esa taqiq: You mustn\'t use your phone in the exam. (Mumkin emas.)',
      'Should va shouldn\'t maslahat beradi: You should drink more water. You shouldn\'t stay up late. Bu "qilsang yaxshi bo‘ladi" degan mazmunga yaqin.',
      'May va might ehtimolni bildiradi: It might rain. (Yomg‘ir yog‘ishi mumkin.) Might may dan ham ancha kuchsizroq ishonchni ko‘rsatadi. May I come in? esa rasmiy so‘rov.',
    ],
    examples: [
      { en: 'I can play the piano.', uz: 'Men pianino chala olaman.' },
      { en: "My little brother can't read yet.", uz: 'Kichik ukam hali o‘qiy olmaydi.' },
      { en: 'You must do your homework.', uz: 'Sen uy vazifangni bajarishing shart.' },
      { en: "You mustn't use your phone during the exam.", uz: 'Imtihon paytida telefondan foydalanish mumkin emas.' },
      { en: 'You should drink more water.', uz: 'Ko‘proq suv ichishing kerak.' },
      { en: 'Take a jacket. It might rain.', uz: 'Kurtka ol. Yomg‘ir yog‘ishi mumkin.' },
    ],
    mistakes: [
      {
        wrong: 'She cans speak English.',
        right: 'She can speak English.',
        noteUz: 'Modal so‘zlarga uchinchi shaxsda ham -s qo‘shilmaydi.',
      },
      {
        wrong: 'You must to wear a helmet.',
        right: 'You must wear a helmet.',
        noteUz: 'Modal so‘zdan keyin to ishlatilmaydi: must + V.',
      },
      {
        wrong: 'Do you can swim?',
        right: 'Can you swim?',
        noteUz: 'Modal so‘zlar so‘roq gapda o‘zi oldinga chiqadi, do/does kerak emas.',
      },
    ],
    quiz: [
      {
        id: 'g11-q1',
        q: "I ___ swim very well. I'm a champion.",
        options: ["can't", "mustn't", 'can', "shouldn't"],
        answer: 2,
        explain: 'Chempion yaxshi suza oladi, shuning uchun qobiliyatni bildiruvchi can kerak.',
      },
      {
        id: 'g11-q2',
        q: "You ___ run in the corridor. It's dangerous.",
        options: ['must', "mustn't", 'can', 'might'],
        answer: 1,
        explain: 'Xavfli bo‘lgani uchun bu taqiq: mustn\'t "mumkin emas" degani.',
      },
      {
        id: 'g11-q3',
        q: 'You look tired. You ___ go to bed early.',
        options: ["can't", "mustn't", 'might not', 'should'],
        answer: 3,
        explain: 'Bu maslahat, maslahat uchun should ishlatiladi.',
      },
      {
        id: 'g11-q4',
        q: 'Take an umbrella. It ___ rain later.',
        options: ['might', "mustn't", "can't", "shouldn't"],
        answer: 0,
        explain: 'Yomg‘ir yog‘ishi ehtimoli bor, ehtimol uchun might (yoki may) ishlatiladi.',
      },
      {
        id: 'g11-q5',
        q: 'Which sentence is correct?',
        options: ['She cans speak French.', 'She can speaks French.', 'She can to speak French.', 'She can speak French.'],
        answer: 3,
        explain: 'Can dan keyin V asosiy shaklda keladi: to ham, -s ham qo‘shilmaydi.',
      },
    ],
  },

  // ---------------------------------------------------------------- g12
  {
    id: 'g12',
    title: 'First Conditional',
    titleUz: 'Birinchi shart gap',
    level: 'B1',
    emoji: '🔀',
    summaryUz:
      'First Conditional (if + Present Simple, will + V) kelajakda haqiqatan bo‘lishi mumkin bo‘lgan holat va uning natijasini ifodalaydi.',
    explanationUz: [
      'First Conditional kelajakda bo‘lishi mumkin bo‘lgan real holat va uning natijasi haqida gapirish uchun ishlatiladi. Qolip: If + Present Simple, will + V.',
      'Masalan: If it rains tomorrow, we will stay at home. (Agar ertaga yomg‘ir yog‘sa, uyda qolamiz.) Diqqat: if qismida will ishlatilmaydi. If it will rain deb bo‘lmaydi. Hozirgi zamon shakli kelajak mazmunini beradi.',
      'Gap qismlarining o‘rnini almashtirish mumkin: We will stay at home if it rains. If bilan boshlansa, o‘rtada vergul qo‘yiladi, oxirida kelsa, vergul kerak emas.',
      'Unless "agar ... bo‘lmasa" degan mazmunni beradi, ya‘ni if ... not bilan bir xil: Unless you hurry, you\'ll be late. = If you don\'t hurry, you\'ll be late. Unless ning o‘zi inkor, shuning uchun uning ketidan yana inkor qo‘shilmaydi.',
      'Natija qismida will o‘rniga can, might yoki must ham kelishi mumkin: If you study, you might pass the exam. Bu natijaning qanchalik aniqligiga bog‘liq.',
    ],
    examples: [
      { en: 'If it rains tomorrow, we will stay at home.', uz: 'Ertaga yomg‘ir yog‘sa, uyda qolamiz.' },
      { en: 'If you study hard, you will pass the exam.', uz: 'Qattiq o‘qisang, imtihondan o‘tasan.' },
      { en: 'I will call you if I have time.', uz: 'Vaqtim bo‘lsa, senga qo‘ng‘iroq qilaman.' },
      { en: "If you don't hurry, you will miss the bus.", uz: 'Shoshilmasang, avtobusga ulgurmaysan.' },
      { en: 'Unless you wear a coat, you will catch a cold.', uz: 'Palto kiymasang, shamollaysan.' },
      { en: 'If she invites me, I will go to her party.', uz: 'U meni taklif qilsa, uning ziyofatiga boraman.' },
    ],
    mistakes: [
      {
        wrong: 'If it will rain, we will stay home.',
        right: 'If it rains, we will stay home.',
        noteUz: 'If qismida will ishlatilmaydi, u yerda Present Simple turadi.',
      },
      {
        wrong: "Unless you don't hurry, you will be late.",
        right: 'Unless you hurry, you will be late.',
        noteUz: 'Unless o‘zi "agar ... bo‘lmasa" degani, shuning uchun ikkinchi marta inkor qo‘shilmaydi.',
      },
      {
        wrong: 'If he comes, I would be happy.',
        right: 'If he comes, I will be happy.',
        noteUz: 'Real kelajak holatida natija qismida would emas, will ishlatiladi.',
      },
    ],
    quiz: [
      {
        id: 'g12-q1',
        q: 'If it rains tomorrow, we ___ at home.',
        options: ['stayed', 'would stay', 'will stay', 'staying'],
        answer: 2,
        explain: 'Real kelajak holatida natija qismida will + V ishlatiladi.',
      },
      {
        id: 'g12-q2',
        q: 'If you ___ hard, you will pass the exam.',
        options: ['study', 'will study', 'studied', 'would study'],
        answer: 0,
        explain: 'If qismida kelajak mazmunida ham Present Simple ishlatiladi, will emas.',
      },
      {
        id: 'g12-q3',
        q: "You won't pass the exam ___ you study.",
        options: ['if', 'because', 'when', 'unless'],
        answer: 3,
        explain: 'Unless "agar ... bo‘lmasa" degani: o‘qimasang, imtihondan o‘tmaysan. If bu yerda mazmunni buzadi.',
      },
      {
        id: 'g12-q4',
        q: 'Which sentence is correct?',
        options: ['If I will see him, I will tell him.', 'If I see him, I will tell him.', 'If I saw him, I will tell him.', 'If I see him, I tell will him.'],
        answer: 1,
        explain: 'To‘g‘ri qolip: If + Present Simple, will + V. If qismida will bo‘lmaydi.',
      },
      {
        id: 'g12-q5',
        q: "Which sentence means the same as: If you don't hurry, you'll be late?",
        options: ["Unless you hurry, you'll be late.", "Unless you don't hurry, you'll be late.", "Unless you hurry, you won't be late.", "If you hurry, you'll be late."],
        answer: 0,
        explain: 'Unless = if ... not. Unless you hurry degani if you don\'t hurry bilan bir xil, ikkinchi inkor kerak emas.',
      },
    ],
  },

  // ---------------------------------------------------------------- g13
  {
    id: 'g13',
    title: 'Passive Voice',
    titleUz: 'Majhul nisbat',
    level: 'B2',
    emoji: '🔄',
    summaryUz:
      'Passive (be + V3) ish-harakatni kim bajarganidan ko‘ra, ish-harakatning o‘zi yoki unga uchragan narsa muhim bo‘lganda ishlatiladi.',
    explanationUz: [
      'Aniq nisbatda (Active) ega ish-harakatni bajaradi: Ali broke the window. Majhul nisbatda (Passive) esa ish-harakatga uchragan narsa gapning boshiga chiqadi: The window was broken (by Ali).',
      'Qolip: be + V3. Present Simple Passive: am/is/are + V3: English is spoken here. Past Simple Passive: was/were + V3: The bridge was built in 1990. Birlikda was, ko‘plikda were ishlatiladi.',
      'Ish-harakatni kim bajarganini aytmoqchi bo‘lsak, by + bajaruvchi qo‘shamiz: The song was written by Ed Sheeran. Agar bajaruvchi noma‘lum yoki muhim bo‘lmasa, by ... tushirib qoldiriladi: My bike was stolen.',
      'Passive ayniqsa bajaruvchi kim ekani bilinmasa, ahamiyatsiz bo‘lsa yoki yangilik, ilmiy va rasmiy matnlarda qulay: Cars are made in Asaka. Inkor va so‘roq be orqali tuziladi: The window wasn\'t broken. Was the window broken?',
      'O‘zbek tilida ham shunga o‘xshash shakl bor: -il/-in qo‘shimchasi (qur-il-di, yoz-il-di). Inglizcha The bridge was built "ko‘prik qurildi" degani bilan bir xil.',
    ],
    examples: [
      { en: 'English is spoken all over the world.', uz: 'Ingliz tili butun dunyoda so‘zlashiladi.' },
      { en: 'Cars are made in Asaka.', uz: 'Mashinalar Asakada ishlab chiqariladi.' },
      { en: 'This school was built in 1995.', uz: 'Bu maktab 1995-yilda qurilgan.' },
      { en: 'The windows were cleaned yesterday.', uz: 'Derazalar kecha tozalandi.' },
      { en: 'My bike was stolen last night.', uz: 'Velosipedim kecha kechasi o‘g‘irlandi.' },
      { en: 'The letter was written by my grandfather.', uz: 'Xatni bobom yozgan.' },
    ],
    mistakes: [
      {
        wrong: 'The window broken by Ali.',
        right: 'The window was broken by Ali.',
        noteUz: 'Passive da be (was/were/is/are) tushib qolmasligi kerak: be + V3.',
      },
      {
        wrong: 'English speaks in many countries.',
        right: 'English is spoken in many countries.',
        noteUz: 'Ingliz tili o‘zi gapirmaydi, unda gapiriladi. Shuning uchun Passive kerak: is spoken.',
      },
      {
        wrong: 'The letter was wrote by Tom.',
        right: 'The letter was written by Tom.',
        noteUz: 'Was/were dan keyin V3 keladi: write - wrote - written.',
      },
    ],
    quiz: [
      {
        id: 'g13-q1',
        q: 'English ___ in many countries.',
        options: ['speaks', 'is speaking', 'spoke', 'is spoken'],
        answer: 3,
        explain: 'Ingliz tilida gapirishadi, ya‘ni ega ish-harakatga uchraydi. Present Simple Passive: is spoken.',
      },
      {
        id: 'g13-q2',
        q: 'This bridge ___ in 1990.',
        options: ['built', 'is built', 'was built', 'were built'],
        answer: 2,
        explain: '1990 o‘tgan vaqt va bridge birlikda, shuning uchun was built.',
      },
      {
        id: 'g13-q3',
        q: 'The windows ___ every Friday.',
        options: ['is cleaned', 'are cleaned', 'was cleaned', 'cleans'],
        answer: 1,
        explain: 'Har juma takrorlanuvchi ish (hozirgi zamon) va windows ko‘plikda, shuning uchun are cleaned.',
      },
      {
        id: 'g13-q4',
        q: 'The thieves ___ by the police yesterday.',
        options: ['were caught', 'was caught', 'are caught', 'catch'],
        answer: 0,
        explain: 'Yesterday o‘tgan vaqt, thieves ko‘plik: were caught (catch - caught - caught).',
      },
      {
        id: 'g13-q5',
        q: 'Which sentence is correct?',
        options: ['The letter was wrote by Tom.', 'The letter is wrote by Tom.', 'The letter written by Tom was.', 'The letter was written by Tom.'],
        answer: 3,
        explain: 'Passive qolipi be + V3, write ning V3 shakli written. Tartib: ega + was + V3 + by ...',
      },
    ],
  },

  // ---------------------------------------------------------------- g14
  {
    id: 'g14',
    title: 'Second Conditional',
    titleUz: 'Ikkinchi shart gap',
    level: 'B2',
    emoji: '💭',
    summaryUz:
      'Second Conditional (if + Past Simple, would + V) hozirgi yoki kelajakdagi xayoliy yoki real bo‘lmagan holatlarni ifodalaydi.',
    explanationUz: [
      'Second Conditional hozir yoki kelajakda xayoliy, real bo‘lmagan yoki juda dargumon holatlar haqida gapirish uchun ishlatiladi. Qolip: If + Past Simple, would + V.',
      'If I had a million dollars, I would travel the world. (Agar menda million dollar bo‘lsa edi, dunyo bo‘ylab sayohat qilardim.) Aslida pul yo‘q. Bu yerda Past Simple o‘tgan zamonni emas, xayoliylikni bildiradi.',
      'Be fe‘lining shakli barcha shaxslar uchun were bo‘ladi: If I were you, I would study more. (Sening o‘rningda bo‘lsam, ko‘proq o‘qirdim.) Bu maslahat berishning juda mashhur usuli. Og‘zaki nutqda was ham uchraydi, lekin were to‘g‘ri hisoblanadi.',
      'Birinchi va ikkinchi shart gapni solishtiring: If it rains, we will stay home. (real imkoniyat) va If I won the lottery, I would buy a house. (xayoliy holat). If qismida would ishlatilmaydi: If I would have deb bo‘lmaydi.',
      'O‘zbek tilidagi "...sa edi, ... bo‘lardi/-ardi" shakli ikkinchi shart gapga mos keladi. Natija qismida would o‘rniga could yoki might ham kelishi mumkin.',
    ],
    examples: [
      { en: 'If I had a million dollars, I would travel the world.', uz: 'Agar menda million dollar bo‘lsa edi, butun dunyo bo‘ylab sayohat qilardim.' },
      { en: 'If I were you, I would study more.', uz: 'Sening o‘rningda bo‘lsam, ko‘proq o‘qirdim.' },
      { en: 'What would you do if you saw a ghost?', uz: 'Agar arvohni ko‘rib qolsang, nima qilarding?' },
      { en: 'If she had a dog, she would walk it every day.', uz: 'Agar uning iti bo‘lsa edi, uni har kuni sayr qildirardi.' },
      { en: 'I would be happy if we lived near the sea.', uz: 'Dengiz yonida yashasak, xursand bo‘lardim.' },
      { en: 'If it were warmer, we would go swimming.', uz: 'Havo issiqroq bo‘lsa edi, biz suzgani borardik.' },
    ],
    mistakes: [
      {
        wrong: 'If I would have a car, I would drive to school.',
        right: 'If I had a car, I would drive to school.',
        noteUz: 'If qismida would ishlatilmaydi, u yerda Past Simple turadi.',
      },
      {
        wrong: 'If I am you, I would tell the truth.',
        right: 'If I were you, I would tell the truth.',
        noteUz: 'Xayoliy "sening o‘rningda bo‘lsam" uchun I bilan ham were ishlatiladi.',
      },
      {
        wrong: 'If he knew the answer, he will tell us.',
        right: 'If he knew the answer, he would tell us.',
        noteUz: 'If + Past Simple bo‘lsa, natija qismida will emas, would ishlatiladi.',
      },
    ],
    quiz: [
      {
        id: 'g14-q1',
        q: 'If I ___ a million dollars, I would travel the world.',
        options: ['have', 'will have', 'had', 'would have'],
        answer: 2,
        explain: 'Xayoliy holatda if qismida Past Simple (had) ishlatiladi.',
      },
      {
        id: 'g14-q2',
        q: 'If I were you, I ___ study more.',
        options: ['will', 'would', 'am', 'did'],
        answer: 1,
        explain: 'Second Conditional natija qismida would + V ishlatiladi.',
      },
      {
        id: 'g14-q3',
        q: 'What ___ you do if you saw a ghost?',
        options: ['will', 'do', 'did', 'would'],
        answer: 3,
        explain: 'If you saw (Past Simple) bo‘lsa, asosiy qismda would + V keladi: What would you do?',
      },
      {
        id: 'g14-q4',
        q: "If I ___ you, I wouldn't say that.",
        options: ['were', 'am', 'will be', 'would be'],
        answer: 0,
        explain: 'If I were you iborasida barcha shaxslar uchun were ishlatiladi.',
      },
      {
        id: 'g14-q5',
        q: 'Which sentence is correct?',
        options: ['If I would know the answer, I would tell you.', 'If I knew the answer, I would tell you.', 'If I know the answer, I would tell you.', 'If I knew the answer, I will tell you.'],
        answer: 1,
        explain: 'To‘g‘ri qolip: If + Past Simple, would + V. If qismida would, natija qismida will bo‘lmaydi.',
      },
    ],
  },
  {
    id: 'g15',
    title: 'Some, Any, No and Their Compounds',
    titleUz: 'Some, Any, No va ulardan yasalgan so‘zlar',
    level: 'A2',
    emoji: '🧩',
    summaryUz:
      'Some, any va no miqdor yoki mavjudlikni ifodalaydi. Someone, anything, nowhere kabi so‘zlar esa odamlar, narsalar va joylar haqida gapirishga yordam beradi.',
    explanationUz: [
      'Some odatda darak gaplarda ishlatiladi: I have some questions. (Menda bir nechta savol bor.) Taklif va iltimoslarda ham some ishlatish mumkin: Would you like some tea?',
      'Any ko‘pincha so‘roq va inkor gaplarda keladi: Do you have any questions? (Savollaringiz bormi?) I don’t have any money. (Menda umuman pul yo‘q.) Darak gapda any ba’zan “istalgan” ma’nosini beradi: You can choose any book.',
      'No ot oldidan kelib, inkor ma’nosini bildiradi: There is no milk. (Sut yo‘q.) No bilan tuzilgan gapga odatda yana not qo‘shilmaydi.',
      'Someone/somebody — kimdir; something — nimadir; somewhere — qayerdadir. Anyone/anybody/anything/anywhere so‘roq va inkor gaplarda ko‘p uchraydi. No one/nobody/nothing/nowhere esa “hech kim/hech narsa/hech qayer” ma’nosini beradi.',
      'Bu birikmalardan keyin sifat kelsa, sifat odatda keyin joylashadi: something interesting, someone special. Something interesting to‘g‘ri, interesting something esa odatda noto‘g‘ri.',
    ],
    examples: [
      { en: 'I need some help with my homework.', uz: 'Uy vazifam bo‘yicha biroz yordam kerak.' },
      { en: 'Did you see anyone at the door?', uz: 'Eshik oldida biror kishini ko‘rdingmi?' },
      { en: 'There is nothing in the box.', uz: 'Qutida hech narsa yo‘q.' },
      { en: 'Let’s go somewhere quiet.', uz: 'Keling, tinchroq biror joyga boramiz.' }
    ],
    mistakes: [
      {
        wrong: 'I don’t have some friends here.',
        right: 'I don’t have any friends here.',
        noteUz: 'Inkor gaplarda odatda any ishlatiladi.'
      },
      {
        wrong: 'I saw interesting something.',
        right: 'I saw something interesting.',
        noteUz: 'Something kabi olmoshlardan keyin sifat keladi.'
      }
    ],
    quiz: [
      {
        id: 'g15-q1',
        q: 'Would you like ___ coffee?',
        options: ['any', 'some', 'no', 'every'],
        answer: 1,
        explain: 'Takliflarda some ishlatilishi mumkin: Would you like some coffee?'
      },
      {
        id: 'g15-q2',
        q: 'I couldn’t find ___ in the room.',
        options: ['someone', 'something', 'anyone', 'anywhere'],
        answer: 2,
        explain: 'Odam haqida inkor gapda anyone mos keladi.'
      },
      {
        id: 'g15-q3',
        q: 'There is ___ food left, so we need to buy more.',
        options: ['no', 'someone', 'anywhere', 'everybody'],
        answer: 0,
        explain: 'No food “ovqat yo‘q” degan inkor ma’noni beradi.'
      },
      {
        id: 'g15-q4',
        q: 'Let’s find ___ interesting to watch.',
        options: ['interesting something', 'anything somewhere', 'something', 'somewhere anything'],
        answer: 2,
        explain: 'Something interesting qolipi ishlatiladi; something so‘zidan keyin sifat keladi.'
      },
      {
        id: 'g15-q5',
        q: 'You can choose ___ colour you like.',
        options: ['no', 'any', 'nothing', 'someone'],
        answer: 1,
        explain: 'Darak gapda any “istalgan” ma’nosini berishi mumkin.'
      }
    ]
  },
  {
    id: 'g16',
    title: 'Countable and Uncountable Nouns',
    titleUz: 'Sanaladigan va sanalmaydigan otlar',
    level: 'A2',
    emoji: '🍎',
    summaryUz:
      'Countable nouns dona-dona sanaladi, uncountable nouns esa odatda massa yoki umumiy tushunchani bildiradi. Much, many, a few, a little va plenty of kabi birliklar ular bilan turlicha ishlatiladi.',
    explanationUz: [
      'Sanaladigan otlarni birlik va ko‘plikda ishlatish mumkin: one apple, two apples. Sanalmaydigan otlar odatda ko‘plik shaklini olmaydi: water, information, advice, furniture.',
      'Many sanaladigan ko‘plik otlar bilan, much esa sanalmaydigan otlar bilan ishlatiladi: many books, much water. So‘roq va inkor gaplarda ayniqsa ko‘p uchraydi.',
      'A few sanaladigan otlar bilan “bir nechta” degan ma’noni bildiradi: a few friends. A little sanalmaydigan otlar bilan “biroz” ma’nosida keladi: a little time.',
      'Some nouns ingliz tilida sanalmaydigan hisoblanadi, garchi o‘zbek tilida boshqacha tasavvur qilinishi mumkin: advice, information, news. Shuning uchun an advice yoki an information deyilmaydi.',
      'A piece of advice, a piece of information va a piece of furniture kabi birikmalar sanalmaydigan otlarni birlik sifatida sanashga yordam beradi.',
    ],
    examples: [
      { en: 'How many students are in your class?', uz: 'Sinfingizda nechta o‘quvchi bor?' },
      { en: 'We don’t have much time.', uz: 'Vaqtimiz ko‘p emas.' },
      { en: 'I have a few close friends.', uz: 'Mening bir nechta yaqin do‘stim bor.' },
      { en: 'She gave me two pieces of advice.', uz: 'U menga ikkita maslahat berdi.' }
    ],
    mistakes: [
      {
        wrong: 'She gave me an advice.',
        right: 'She gave me some advice.',
        noteUz: 'Advice sanalmaydigan ot; an advice deyilmaydi.'
      },
      {
        wrong: 'How much books do you have?',
        right: 'How many books do you have?',
        noteUz: 'Books sanaladigan ko‘plik ot, shuning uchun many ishlatiladi.'
      }
    ],
    quiz: [
      {
        id: 'g16-q1',
        q: 'How ___ money do you need?',
        options: ['many', 'much', 'few', 'several'],
        answer: 1,
        explain: 'Money bu yerda sanalmaydigan ot sifatida ishlatilgan, shuning uchun much kerak.'
      },
      {
        id: 'g16-q2',
        q: 'There are ___ apples in the basket.',
        options: ['a little', 'much', 'a few', 'any of'],
        answer: 2,
        explain: 'Apples sanaladigan ko‘plik ot; a few “bir nechta” ma’nosini beradi.'
      },
      {
        id: 'g16-q3',
        q: 'Which phrase is correct?',
        options: ['an information', 'two informations', 'a piece of information', 'many information'],
        answer: 2,
        explain: 'Information sanalmaydi; uni sanash uchun a piece of information deyiladi.'
      },
      {
        id: 'g16-q4',
        q: 'We have very ___ time before the train leaves.',
        options: ['few', 'little', 'many', 'several'],
        answer: 1,
        explain: 'Time sanalmaydigan ot va little bilan ishlatiladi.'
      },
      {
        id: 'g16-q5',
        q: 'How ___ chairs do we need?',
        options: ['much', 'little', 'many', 'a little'],
        answer: 2,
        explain: 'Chairs sanaladigan ko‘plik ot, shu sababli many ishlatiladi.'
      }
    ]
  },
  {
    id: 'g17',
    title: 'Question Tags',
    titleUz: 'Tasdiqlovchi va aniqlashtiruvchi qisqa savollar',
    level: 'B1',
    emoji: '❓',
    summaryUz:
      'Question tags gap oxirida suhbatdoshdan tasdiq olish yoki fikrni aniqlashtirish uchun ishlatiladi: You are ready, aren’t you?',
    explanationUz: [
      'Darak gap ijobiy bo‘lsa, question tag odatda inkor bo‘ladi: She is here, isn’t she? Gap inkor bo‘lsa, tag odatda ijobiy bo‘ladi: She isn’t here, is she?',
      'Tagda asosiy gapdagi yordamchi fe’l ishlatiladi. Agar asosiy gapda yordamchi fe’l bo‘lmasa, do, does yoki did kerak bo‘ladi: He works here, doesn’t he?',
      'Tagdagi olmosh gapning egasiga mos kelishi kerak: Sarah is tired, isn’t she? The children arrived, didn’t they?',
      'I am bilan odatda aren’t I ishlatiladi: I’m late, aren’t I? Let’s bilan esa shall we ishlatilishi mumkin: Let’s start, shall we?',
      'Question tagning ohangi ma’noga ta’sir qiladi. Ovoz yuqoriga ko‘tarilsa, haqiqiy savolga o‘xshaydi; pastlasa, gapiruvchi tasdiq kutayotgan bo‘lishi mumkin.',
    ],
    examples: [
      { en: 'You know the answer, don’t you?', uz: 'Javobni bilasan, shundaymi?' },
      { en: 'They haven’t arrived yet, have they?', uz: 'Ular hali kelishmadi, shundaymi?' },
      { en: 'Maya can swim, can’t she?', uz: 'Maya suza oladi, shundaymi?' },
      { en: 'Let’s take a break, shall we?', uz: 'Keling, tanaffus qilamiz, maylimi?' }
    ],
    mistakes: [
      {
        wrong: 'He likes music, isn’t he?',
        right: 'He likes music, doesn’t he?',
        noteUz: 'Present Simple gapida yordamchi fe’l bo‘lmasa, tagda do/does ishlatiladi.'
      },
      {
        wrong: 'She isn’t ready, isn’t she?',
        right: 'She isn’t ready, is she?',
        noteUz: 'Inkor gapdan keyin odatda ijobiy question tag keladi.'
      }
    ],
    quiz: [
      {
        id: 'g17-q1',
        q: 'You are from Tashkent, ___?',
        options: ['are you', 'aren’t you', 'don’t you', 'isn’t it'],
        answer: 1,
        explain: 'Ijobiy gapdagi are fe’li inkor shaklida tagga qaytadi.'
      },
      {
        id: 'g17-q2',
        q: 'He didn’t call you, ___?',
        options: ['didn’t he', 'does he', 'did he', 'was he'],
        answer: 2,
        explain: 'Asosiy gap inkor va Past Simple shaklida; tag ijobiy did he bo‘ladi.'
      },
      {
        id: 'g17-q3',
        q: 'Your sister speaks English, ___?',
        options: ['isn’t she', 'doesn’t she', 'didn’t she', 'hasn’t she'],
        answer: 1,
        explain: 'Speaks Present Simple shakli bo‘lgani uchun doesn’t she ishlatiladi.'
      },
      {
        id: 'g17-q4',
        q: 'I’m next on the list, ___?',
        options: ['am I', 'aren’t I', 'don’t I', 'isn’t it'],
        answer: 1,
        explain: 'I’m bilan question tagda odatda aren’t I ishlatiladi.'
      },
      {
        id: 'g17-q5',
        q: 'Let’s go for a walk, ___?',
        options: ['will we', 'do we', 'shall we', 'aren’t we'],
        answer: 2,
        explain: 'Let’s bilan taklifni tasdiqlash uchun shall we ishlatiladi.'
      }
    ]
  },
  {
    id: 'g18',
    title: 'Relative Clauses',
    titleUz: 'Aniqlovchi ergash gaplar',
    level: 'B1',
    emoji: '🔗',
    summaryUz:
      'Relative clauses odam, narsa yoki joy haqida qo‘shimcha ma’lumot beradi. Who, which, that, whose, where va when kabi birliklar gaplarni bog‘laydi.',
    explanationUz: [
      'Who odamlarga, which narsalarga, that esa odamlar yoki narsalarga nisbatan ishlatilishi mumkin: The woman who called me is my teacher.',
      'Whose egalikni bildiradi: I met a boy whose father is a doctor. Where joyni, when esa vaqtni aniqlashga yordam beradi.',
      'Defining relative clause qaysi odam yoki narsa nazarda tutilganini aniqlaydi. Bunday gapda olmosh to‘ldiruvchi vazifasida bo‘lsa, uni ba’zan tushirib qoldirish mumkin: The book (that) I bought is useful.',
      'Non-defining relative clause qo‘shimcha ma’lumot beradi va vergullar bilan ajratiladi: My brother, who lives in Samarkand, is a doctor. Bu turdagi gapda that odatda ishlatilmaydi va olmosh tushirib qoldirilmaydi.',
      'Relative clause ichida bir xil ega yoki to‘ldiruvchini takrorlamang: The man who lives here is kind. Who lives here ichida yana he qo‘shish shart emas.',
    ],
    examples: [
      { en: 'The girl who won the prize is my cousin.', uz: 'Sovrinni yutgan qiz mening amakivachcham.' },
      { en: 'This is the laptop that I bought yesterday.', uz: 'Bu men kecha sotib olgan noutbuk.' },
      { en: 'I know a café where we can study.', uz: 'Birga dars qilishimiz mumkin bo‘lgan kafeni bilaman.' },
      { en: 'Mr Lee, whose son is in my class, is a doctor.', uz: 'O‘g‘li men bilan bir sinfda o‘qiydigan janob Li shifokor.' }
    ],
    mistakes: [
      {
        wrong: 'The woman who she works here is kind.',
        right: 'The woman who works here is kind.',
        noteUz: 'Who ega bo‘lib kelganida, uning ortidan yana she kabi ega qo‘yilmaydi.'
      },
      {
        wrong: 'My car, that is ten years old, still works.',
        right: 'My car, which is ten years old, still works.',
        noteUz: 'Vergul bilan ajratilgan non-defining relative clause ichida that ishlatilmaydi.'
      }
    ],
    quiz: [
      {
        id: 'g18-q1',
        q: 'The man ___ helped us was very friendly.',
        options: ['where', 'who', 'whose', 'when'],
        answer: 1,
        explain: 'Who odamni bildiradi va relative clause ichida ega vazifasida keladi.'
      },
      {
        id: 'g18-q2',
        q: 'This is the house ___ my grandfather was born.',
        options: ['who', 'whose', 'where', 'which'],
        answer: 2,
        explain: 'Where joy haqida ma’lumot beruvchi relative clause uchun mos.'
      },
      {
        id: 'g18-q3',
        q: 'My aunt, ___ lives in Bukhara, is visiting us.',
        options: ['that', 'who', 'whose', 'where'],
        answer: 1,
        explain: 'Vergullar bilan ajratilgan qo‘shimcha ma’lumotda who ishlatiladi.'
      },
      {
        id: 'g18-q4',
        q: 'The student ___ essay won the prize is here.',
        options: ['who', 'which', 'whose', 'where'],
        answer: 2,
        explain: 'Whose egalikni bildiradi: student’s essay.'
      },
      {
        id: 'g18-q5',
        q: 'Which sentence is correct?',
        options: [
          'The film that I watched it was excellent.',
          'The film which I watched was excellent.',
          'The film where I watched was excellent.',
          'The film, that I watched, was excellent.'
        ],
        answer: 1,
        explain: 'Which to‘ldiruvchi vazifasida kelgan; watched fe’lidan keyin it takrorlanmaydi.'
      }
    ]
  },
  {
    id: 'g19',
    title: 'Reported Speech',
    titleUz: 'O‘zlashtirma gap',
    level: 'B1',
    emoji: '🗣️',
    summaryUz:
      'Reported speech boshqa odam aytgan gapni aynan ko‘chirmasdan yetkazish uchun ishlatiladi. Zamon, olmosh va vaqt ifodalari vaziyatga qarab o‘zgarishi mumkin.',
    explanationUz: [
      'To‘g‘ridan-to‘g‘ri gap: “I am tired.” O‘zlashtirma gap: She said (that) she was tired. Agar reporting verb o‘tgan zamonda bo‘lsa, zamon ko‘pincha bir pog‘ona orqaga siljiydi.',
      'Ko‘p uchraydigan o‘zgarishlar: am/is → was, are → were, will → would, can → could, present perfect → past perfect. Biroq har doim zamonni o‘zgartirish shart emas; hali ham to‘g‘ri bo‘lgan faktlar o‘zgarishsiz qolishi mumkin.',
      'Olmoshlar va vaqt ifodalari vaziyatga moslashtiriladi: “I will come tomorrow” → He said he would come the next day. Tomorrow yoki here kabi so‘zlar kontekstga qarab o‘zgaradi.',
      'Reported questions ichida odatdagi savol tartibi ishlatilmaydi: “Where do you live?” → She asked me where I lived. Ha/yo‘q savollarida if yoki whether ishlatilishi mumkin.',
      'Buyruq va iltimoslar ko‘pincha tell/ask + object + to-infinitive bilan beriladi: “Please sit down.” → He asked me to sit down. Inkor buyruqda not to ishlatiladi.',
    ],
    examples: [
      { en: 'Ali said that he was busy.', uz: 'Ali band ekanini aytdi.' },
      { en: 'She asked me where I worked.', uz: 'U mendan qayerda ishlashimni so‘radi.' },
      { en: 'They told us to wait outside.', uz: 'Ular bizga tashqarida kutishni aytishdi.' },
      { en: 'He said he would call me the next day.', uz: 'U ertasi kuni menga qo‘ng‘iroq qilishini aytdi.' }
    ],
    mistakes: [
      {
        wrong: 'She asked me where did I live.',
        right: 'She asked me where I lived.',
        noteUz: 'O‘zlashtirma savolda yordamchi fe’l bilan savol tartibi ishlatilmaydi.'
      },
      {
        wrong: 'He told that he was tired.',
        right: 'He said that he was tired.',
        noteUz: 'Tell odatda to‘ldiruvchi talab qiladi: told me/us. To‘ldiruvchisiz said ishlatish mumkin.'
      }
    ],
    quiz: [
      {
        id: 'g19-q1',
        q: 'Direct speech: “I am hungry.” She said that she ___ hungry.',
        options: ['is', 'was', 'has been', 'will be'],
        answer: 1,
        explain: 'O‘tgan zamondagi said bilan am odatda was shakliga o‘zgaradi.'
      },
      {
        id: 'g19-q2',
        q: '“Where do you live?” He asked me where I ___.',
        options: ['do live', 'did I live', 'lived', 'am living'],
        answer: 2,
        explain: 'Reported question ichida oddiy gap tartibi ishlatiladi: where I lived.'
      },
      {
        id: 'g19-q3',
        q: '“I will help you,” she said. She said she ___ help me.',
        options: ['will', 'would', 'can', 'has'],
        answer: 1,
        explain: 'Reported speechda will ko‘pincha would shakliga o‘zgaradi.'
      },
      {
        id: 'g19-q4',
        q: '“Please close the door.” He asked me ___ the door.',
        options: ['closing', 'close', 'to close', 'closed'],
        answer: 2,
        explain: 'Iltimosni yetkazishda ask + object + to-infinitive ishlatiladi.'
      },
      {
        id: 'g19-q5',
        q: '“Don’t touch it.” She told him ___ touch it.',
        options: ['to not', 'not to', 'don’t', 'not'],
        answer: 1,
        explain: 'Inkor buyruq o‘zlashtirma gapda told + object + not to + verb shaklida keladi.'
      }
    ]
  },
  {
    id: 'g20',
    title: 'Gerunds and Infinitives: Meaning Changes',
    titleUz: 'Gerund va infinitive: ma’no o‘zgarishi',
    level: 'B2',
    emoji: '🔄',
    summaryUz:
      'Ayrim fe’llardan keyin -ing yoki to + verb kelishi mumkin, lekin shakl o‘zgarsa, gapning ma’nosi ham o‘zgaradi. Stop, remember, forget va try muhim misollardir.',
    explanationUz: [
      'Stop doing something — bir ishni bajarishni to‘xtatish: He stopped smoking. Stop to do something esa boshqa ishni bajarish uchun to‘xtash: He stopped to answer the phone.',
      'Remember doing something — o‘tmishda sodir bo‘lgan ishni eslash: I remember meeting her. Remember to do something — kelajakda bajarilishi kerak bo‘lgan vazifani unutmaslik: Remember to call her.',
      'Forget doing something — bir ish sodir bo‘lganini eslay olmaslik. Forget to do something — bajarilishi kerak bo‘lgan ishni unutish.',
      'Try doing something — muammoni hal qilish uchun bir usulni sinab ko‘rish. Try to do something — biror ishni bajarishga harakat qilish, ko‘pincha qiyinchilik mavjud bo‘ladi.',
      'Bu fe’llarning ma’nolari kontekstga bog‘liq. Har bir fe’l uchun bitta qolipni yodlashdan ko‘ra, -ing va to-infinitive shakllari orasidagi farqni misollar bilan o‘rganish foydali.',
    ],
    examples: [
      { en: 'He stopped drinking coffee.', uz: 'U qahva ichishni to‘xtatdi.' },
      { en: 'We stopped to take some photos.', uz: 'Biz suratga olish uchun to‘xtadik.' },
      { en: 'I remember locking the door.', uz: 'Eshikni qulflaganim esimda.' },
      { en: 'Remember to lock the door.', uz: 'Eshikni qulflashni unutma.' }
    ],
    mistakes: [
      {
        wrong: 'I stopped to smoke because it was unhealthy.',
        right: 'I stopped smoking because it was unhealthy.',
        noteUz: 'Chekishni butunlay tashlash ma’nosida stop + -ing ishlatiladi.'
      },
      {
        wrong: 'Remember calling the dentist tomorrow.',
        right: 'Remember to call the dentist tomorrow.',
        noteUz: 'Kelajakda bajarilishi kerak bo‘lgan vazifani eslatishda remember + to-infinitive ishlatiladi.'
      }
    ],
    quiz: [
      {
        id: 'g20-q1',
        q: 'He stopped ___ a message because his phone rang.',
        options: ['writing', 'to write', 'wrote', 'write'],
        answer: 1,
        explain: 'U boshqa ishni bajarish uchun to‘xtadi; stop to write shu ma’noni beradi.'
      },
      {
        id: 'g20-q2',
        q: 'I remember ___ her at a conference last year.',
        options: ['to meet', 'meet', 'meeting', 'met'],
        answer: 2,
        explain: 'O‘tmishdagi uchrashuvni eslash uchun remember + -ing ishlatiladi.'
      },
      {
        id: 'g20-q3',
        q: 'Please remember ___ your assignment before Friday.',
        options: ['submitting', 'submit', 'to submit', 'submitted'],
        answer: 2,
        explain: 'Bajarilishi kerak bo‘lgan vazifa haqida remember + to-infinitive ishlatiladi.'
      },
      {
        id: 'g20-q4',
        q: 'The computer wasn’t working, so I tried ___ it.',
        options: ['restarting', 'to restarting', 'restarted', 'restart'],
        answer: 0,
        explain: 'Muammoni hal qilish uchun usulni sinash ma’nosida try + -ing ishlatilishi mumkin.'
      },
      {
        id: 'g20-q5',
        q: 'She tried ___ the heavy box, but it was too difficult.',
        options: ['lifting', 'to lift', 'lifted', 'lifts'],
        answer: 1,
        explain: 'Qiyin ishni bajarishga urinish ma’nosida try + to-infinitive ishlatiladi.'
      }
    ]
  },
  {
    id: 'g21',
    title: 'Participle Adjectives: -ed and -ing',
    titleUz: '-ed va -ing bilan yasalgan sifatlar',
    level: 'B2',
    emoji: '🎭',
    summaryUz:
      '-ed shaklidagi sifatlar ko‘pincha insonning his-tuyg‘usini, -ing shaklidagilar esa shu hisni keltirib chiqaradigan narsa yoki vaziyatni ifodalaydi.',
    explanationUz: [
      'Bored — zerikkan, boring — zerikarli. I am bored gapida odamning holati, The film is boring gapida esa filmning xususiyati tasvirlanadi.',
      'Interested — qiziqqan, interesting — qiziqarli. Odam biror narsaga qiziqadi; narsa esa qiziqish uyg‘otadi.',
      'Bu farq tired/tiring, excited/exciting, confused/confusing va disappointed/disappointing kabi ko‘plab sifatlarda ham mavjud.',
      'Har doim -ed shakli faqat odamlarga, -ing shakli faqat narsalarga tegishli deb o‘ylamang. Insonning o‘zi ham boshqalarda his uyg‘otadigan xususiyatga ega bo‘lishi mumkin: He is an inspiring teacher.',
      'Gapda sifat nimani tasvirlayotganini aniqlang: hisni boshdan kechirayotgan odammi yoki shu hisni keltirib chiqarayotgan narsa, voqea yoki shaxsmi?',
    ],
    examples: [
      { en: 'I was exhausted after the long journey.', uz: 'Uzoq safardan keyin juda charchagan edim.' },
      { en: 'The journey was exhausting.', uz: 'Safar juda charchatadigan bo‘ldi.' },
      { en: 'We were excited about the competition.', uz: 'Musobaqadan hayajonlangan edik.' },
      { en: 'It was an exciting competition.', uz: 'Bu hayajonli musobaqa edi.' }
    ],
    mistakes: [
      {
        wrong: 'The lesson was very interested.',
        right: 'The lesson was very interesting.',
        noteUz: 'Dars qiziqish uyg‘otadi, shuning uchun interesting ishlatiladi.'
      },
      {
        wrong: 'I am boring because there is nothing to do.',
        right: 'I am bored because there is nothing to do.',
        noteUz: 'O‘z holatingizni aytishda bored, zerikarli ekaningizni emas, zerikayotganingizni bildiring.'
      }
    ],
    quiz: [
      {
        id: 'g21-q1',
        q: 'The documentary was so ___ that I watched it twice.',
        options: ['interested', 'interesting', 'interest', 'interests'],
        answer: 1,
        explain: 'Hujjatli film qiziqish uyg‘otgan, shu sababli interesting kerak.'
      },
      {
        id: 'g21-q2',
        q: 'I felt ___ after waiting for three hours.',
        options: ['boring', 'bored', 'bore', 'boredom'],
        answer: 1,
        explain: 'Bored insonning zerikkan holatini bildiradi.'
      },
      {
        id: 'g21-q3',
        q: 'The instructions were confusing, so we felt ___.',
        options: ['confusing', 'confused', 'confuse', 'confuses'],
        answer: 1,
        explain: 'Ko‘rsatmalar chalkash bo‘lgani uchun odamlar confused, ya’ni chalkashib qolgan.'
      },
      {
        id: 'g21-q4',
        q: 'Which sentence is correct?',
        options: [
          'The news was shocked.',
          'We were shocking by the news.',
          'We were shocked by the news.',
          'The news was shock.'
        ],
        answer: 2,
        explain: 'Shocked yangilikdan ta’sirlangan odamlarning holatini bildiradi.'
      },
      {
        id: 'g21-q5',
        q: 'Our coach is very ___ and motivates the whole team.',
        options: ['inspired', 'inspiring', 'inspiration', 'inspire'],
        answer: 1,
        explain: 'Inspiring boshqalarga ilhom beradigan shaxsni tasvirlaydi.'
      }
    ]
  },
  {
    id: 'g22',
    title: 'Wish and If Only',
    titleUz: 'Wish va If Only orqali istak bildirish',
    level: 'B2',
    emoji: '🌠',
    summaryUz:
      'Wish va if only hozirgi holatdan norozilik, o‘tgan voqeaga afsus yoki kelajakdagi o‘zgarishga istak bildirish uchun ishlatiladi.',
    explanationUz: [
      'Hozirgi vaziyat boshqacha bo‘lishini xohlasak, wish + Past Simple ishlatamiz: I wish I had more time. Bu gap hozir vaqtim yetarli emasligini bildiradi.',
      'O‘tgan voqeaga afsus bildirishda wish + Past Perfect ishlatiladi: I wish I had studied harder. Bu odam avvalroq ko‘proq o‘qimaganidan afsusda ekanini anglatadi.',
      'Boshqa odamning xatti-harakati yoki vaziyat o‘zgarishini xohlaganda wish + would ishlatish mumkin: I wish he would listen. Bu ko‘pincha norozilik yoki o‘zgarish istagini bildiradi.',
      'If only xuddi shunday grammatik qoliplarda keladi, lekin hissiy jihatdan kuchliroq bo‘lishi mumkin: If only I had listened! (Qaniydi quloq solganimda edi!)',
      'Wish + would odatda o‘zimiz nazorat qila olmaydigan vaziyat yoki boshqa odamning xatti-harakatiga nisbatan ishlatiladi. O‘zimizga tegishli holatlarda boshqa tuzilmalar tabiiyroq bo‘lishi mumkin.',
    ],
    examples: [
      { en: 'I wish I knew the answer.', uz: 'Qaniydi javobni bilsam edi.' },
      { en: 'She wishes she lived closer to work.', uz: 'U ish joyiga yaqinroq yashashni xohlaydi.' },
      { en: 'I wish I had taken your advice.', uz: 'Qaniydi maslahatingga quloq solganimda edi.' },
      { en: 'If only they would stop making so much noise!', uz: 'Qaniydi ular shuncha shovqin qilishni bas qilishsa!' }
    ],
    mistakes: [
      {
        wrong: 'I wish I know how to drive.',
        right: 'I wish I knew how to drive.',
        noteUz: 'Hozirgi haqiqatdan farqli istak uchun wish + Past Simple ishlatiladi.'
      },
      {
        wrong: 'I wish I studied harder last year.',
        right: 'I wish I had studied harder last year.',
        noteUz: 'O‘tgan voqeaga afsus bildirish uchun wish + Past Perfect kerak.'
      }
    ],
    quiz: [
      {
        id: 'g22-q1',
        q: 'I wish I ___ more free time.',
        options: ['have', 'had', 'will have', 'am having'],
        answer: 1,
        explain: 'Hozirgi vaziyatdan farqli istak uchun wish + Past Simple ishlatiladi.'
      },
      {
        id: 'g22-q2',
        q: 'She wishes she ___ the exam more seriously last month.',
        options: ['takes', 'would take', 'had taken', 'has taken'],
        answer: 2,
        explain: 'O‘tgan voqeaga afsus wish + Past Perfect bilan ifodalanadi.'
      },
      {
        id: 'g22-q3',
        q: 'I wish my neighbours ___ making noise at night.',
        options: ['would stop', 'stopped to', 'have stopped to', 'will stop'],
        answer: 0,
        explain: 'Boshqa odamlarning xatti-harakati o‘zgarishini istaganda wish + would ishlatilishi mumkin.'
      },
      {
        id: 'g22-q4',
        q: 'Which sentence expresses regret about the past?',
        options: [
          'I wish I know him.',
          'I wish I had called her.',
          'I wish I will call her.',
          'I wish I am calling her.'
        ],
        answer: 1,
        explain: 'Wish + Past Perfect o‘tgan voqea uchun afsusni bildiradi.'
      },
      {
        id: 'g22-q5',
        q: 'If only I ___ the truth earlier!',
        options: ['know', 'knew tomorrow', 'had known', 'will know'],
        answer: 2,
        explain: 'If only + Past Perfect o‘tgan voqeaga kuchli afsusni ifodalaydi.'
      }
    ]
  },
  {
    id: 'g23',
    title: 'Causative Have and Get',
    titleUz: 'Have va Get orqali ishni boshqalarga bajartirish',
    level: 'B2',
    emoji: '🛠️',
    summaryUz:
      'Have/get something done biror ishni o‘zimiz bajarmasdan, boshqa odamga bajartirish yoki xizmatdan foydalanishni ifodalaydi.',
    explanationUz: [
      'Have + object + past participle shakli biror xizmatni tashkil qilish yoki ishni boshqa odamga bajartirishni bildiradi: I had my hair cut. Sochimni kestirdim.',
      'Get + object + past participle ham shunga o‘xshash ma’noga ega va ko‘pincha og‘zaki nutqda ishlatiladi: We got the car repaired. Mashinani tuzattirdik.',
      'Bu tuzilma ishni kim bajarganini emas, ishning bajarilganini ta’kidlaydi. Agar bajaruvchini aytish muhim bo‘lsa, by bilan qo‘shimcha ma’lumot berish mumkin.',
      'Have + person + base verb boshqa tuzilma bo‘lib, kimdandir ishni bajarishni tashkil qilishni bildiradi: I had the technician check the system. Bu yerda technician dan keyin check, to check emas, keladi.',
      'Get + person + to-infinitive esa kimnidir biror ish qilishga ko‘ndirish yoki erishishni anglatadi: I got him to help me. Bu qolipni get something done bilan aralashtirmang.',
    ],
    examples: [
      { en: 'I had my phone repaired yesterday.', uz: 'Kecha telefonimni tuzattirdim.' },
      { en: 'They are getting their house painted.', uz: 'Ular uylarini bo‘yattirishyapti.' },
      { en: 'We had the electrician install a new light.', uz: 'Biz elektrikka yangi chiroq o‘rnatdirdik.' },
      { en: 'She got her brother to carry the bags.', uz: 'U akasini sumkalarni ko‘tarishga ko‘ndirdi.' }
    ],
    mistakes: [
      {
        wrong: 'I had my car repair yesterday.',
        right: 'I had my car repaired yesterday.',
        noteUz: 'Xizmat orqali bajarilgan ish uchun have + object + past participle ishlatiladi.'
      },
      {
        wrong: 'I got him help me.',
        right: 'I got him to help me.',
        noteUz: 'Get + person dan keyin to-infinitive keladi.'
      }
    ],
    quiz: [
      {
        id: 'g23-q1',
        q: 'I need to have my laptop ___.',
        options: ['repair', 'repaired', 'repairing', 'to repair'],
        answer: 1,
        explain: 'Have something done qolipida object dan keyin past participle ishlatiladi.'
      },
      {
        id: 'g23-q2',
        q: 'We had the plumber ___ the tap.',
        options: ['fix', 'fixed', 'to fix', 'fixing'],
        answer: 0,
        explain: 'Have + person + base verb tuzilmasida fe’lning oddiy shakli ishlatiladi.'
      },
      {
        id: 'g23-q3',
        q: 'She got her passport ___.',
        options: ['renew', 'renewing', 'renewed', 'to renew'],
        answer: 2,
        explain: 'Get something done qolipida renewed past participle hisoblanadi.'
      },
      {
        id: 'g23-q4',
        q: 'I finally got my friend ___ me with the project.',
        options: ['help', 'helped', 'to help', 'helping'],
        answer: 2,
        explain: 'Get + person + to-infinitive kimnidir ish qilishga ko‘ndirishni bildiradi.'
      },
      {
        id: 'g23-q5',
        q: 'Which sentence means that a professional painted the house for us?',
        options: [
          'We painted the house ourselves.',
          'We had the house painted.',
          'We had painted the house ourselves.',
          'We had the house paint.'
        ],
        answer: 1,
        explain: 'Had the house painted ishni boshqa odamga bajartirishni bildiradi.'
      }
    ]
  },
  {
    id: 'g24',
    title: 'Participle Clauses',
    titleUz: 'Sifatdoshli qisqartirilgan ergash gaplar',
    level: 'C1',
    emoji: '✍️',
    summaryUz:
      'Participle clauses gaplarni ixchamlashtiradi va sabab, vaqt yoki natija kabi munosabatlarni ifodalaydi. Ular ko‘pincha akademik va yozma ingliz tilida uchraydi.',
    explanationUz: [
      'Present participle (-ing) faol yoki davom etayotgan harakatni ifodalashi mumkin: Walking home, I saw an old friend. Bu “Uyga ketayotib, eski do‘stimni ko‘rdim” degan ma’noni beradi.',
      'Past participle (V3) ko‘pincha passiv ma’no yoki holatni bildiradi: Built in the nineteenth century, the building is now a museum. Bino XIX asrda qurilgan.',
      'Having + past participle oldin tugagan harakatni ta’kidlaydi: Having finished the report, she went home. Avval hisobotni tugatdi, keyin uyga ketdi.',
      'Participle clause odatda asosiy gapning egasiga mantiqan bog‘lanishi kerak. Aks holda dangling modifier deb ataladigan noaniq yoki kulgili ma’no paydo bo‘lishi mumkin.',
      'Bunday qisqartirishlarda bog‘lanish aniq bo‘lishi kerak. Agar vaqt yoki sabab munosabati tushunarsiz bo‘lsa, to‘liq ergash gap ishlatish yaxshiroq.',
    ],
    examples: [
      { en: 'Walking through the park, I found a wallet.', uz: 'Bog‘ bo‘ylab ketayotib, hamyon topdim.' },
      { en: 'Having completed the course, she applied for a job.', uz: 'Kursni tugatgach, u ishga ariza topshirdi.' },
      { en: 'Designed by a local architect, the building won an award.', uz: 'Mahalliy me’mor tomonidan loyihalashtirilgan bino mukofot oldi.' },
      { en: 'Not knowing the answer, he remained silent.', uz: 'Javobni bilmagani uchun u jim qoldi.' }
    ],
    mistakes: [
      {
        wrong: 'Walking to school, the rain started.',
        right: 'Walking to school, I got caught in the rain.',
        noteUz: 'Dastlabki gapda go‘yoki yomg‘ir maktabga ketayotgandek ma’no chiqadi. Participle clause egasi asosiy gapdagi ega bilan mos bo‘lishi kerak.'
      },
      {
        wrong: 'Having finish the work, she left.',
        right: 'Having finished the work, she left.',
        noteUz: 'Having dan keyin tugallangan harakatni ifodalash uchun past participle (V3) ishlatiladi.'
      }
    ],
    quiz: [
      {
        id: 'g24-q1',
        q: '___ the instructions carefully, he began the task.',
        options: ['Read', 'Having read', 'Having reading', 'Reads'],
        answer: 1,
        explain: 'Having read oldin tugallangan harakatni bildiradi.'
      },
      {
        id: 'g24-q2',
        q: '___ in 1920, the theatre is still popular today.',
        options: ['Building', 'Built', 'Having build', 'Build'],
        answer: 1,
        explain: 'Theatre qurilgan, ya’ni passiv ma’no uchun Built ishlatiladi.'
      },
      {
        id: 'g24-q3',
        q: 'Which sentence has a dangling modifier?',
        options: [
          'Feeling tired, I went to bed.',
          'Having eaten dinner, we watched a film.',
          'Driving to work, the traffic became heavy.',
          'Built of stone, the bridge lasted for centuries.'
        ],
        answer: 2,
        explain: 'Bu gapda go‘yoki tirbandlik mashina haydayotgandek ko‘rinadi; haydovchi ega sifatida berilishi kerak.'
      },
      {
        id: 'g24-q4',
        q: '___ the report, Maya emailed it to her manager.',
        options: ['Finishing', 'Having finished', 'Having finish', 'Finished having'],
        answer: 1,
        explain: 'Hisobotni yuborishdan oldin tugatganini ko‘rsatish uchun Having finished ishlatiladi.'
      },
      {
        id: 'g24-q5',
        q: '___ the question, the student asked for clarification.',
        options: ['Not understanding', 'Not understood', 'Not understand', 'Not to understanding'],
        answer: 0,
        explain: 'Not understanding sababni ifodalaydi: talaba savolni tushunmagani uchun izoh so‘radi.'
      }
    ]
  },
  {
    id: 'g25',
    title: 'Inversion for Emphasis',
    titleUz: 'Ta’kid uchun inversiya',
    level: 'C1',
    emoji: '⚡',
    summaryUz:
      'Inversion — yordamchi fe’lning egadan oldin kelishi. Never, rarely, only after va not only kabi ifodalar gap boshida kelganda, rasmiy yoki ta’sirchan uslub yaratish uchun inversiya ishlatilishi mumkin.',
    explanationUz: [
      'Oddiy tartibda ega yordamchi fe’ldan oldin keladi. Inversiyada esa yordamchi fe’l egadan oldin keladi: I had never seen such a view → Never had I seen such a view.',
      'Never, rarely, seldom, hardly va little kabi cheklovchi yoki inkor ma’noli ifodalar gap boshiga chiqarilganda ko‘pincha inversiya talab qilinadi: Rarely do we see such dedication.',
      'Only after, only when, not until kabi ifodalar gap boshida kelganda asosiy gapda inversiya bo‘lishi mumkin: Only after the meeting did I understand the problem.',
      'Not only bilan boshlangan gapda birinchi qismda inversiya ishlatiladi: Not only did she apologise, but she also offered to help. Ikkinchi qismning tartibi odatiy bo‘lishi mumkin.',
      'Agar gapda yordamchi fe’l bo‘lmasa, Present Simple yoki Past Simple uchun do/does/did kerak bo‘ladi. Inversiya asosan rasmiy, adabiy yoki ta’kidli nutqda ishlatiladi.',
    ],
    examples: [
      { en: 'Never have I heard such an unusual story.', uz: 'Men hech qachon bunday noodatiy hikoya eshitmaganman.' },
      { en: 'Rarely does he arrive late.', uz: 'U kamdan-kam kechikib keladi.' },
      { en: 'Only after the call did she realise her mistake.', uz: 'Faqat qo‘ng‘iroqdan keyingina u xatosini tushundi.' },
      { en: 'Not only did they finish early, but they also helped us.', uz: 'Ular nafaqat ishni erta tugatishdi, balki bizga ham yordam berishdi.' }
    ],
    mistakes: [
      {
        wrong: 'Never I have seen such a thing.',
        right: 'Never have I seen such a thing.',
        noteUz: 'Never gap boshida kelganda yordamchi fe’l egadan oldin joylashadi.'
      },
      {
        wrong: 'Only after the lesson I understood the rule.',
        right: 'Only after the lesson did I understand the rule.',
        noteUz: 'Only after bilan boshlangan ifodadan keyingi asosiy gapda inversiya ishlatiladi.'
      }
    ],
    quiz: [
      {
        id: 'g25-q1',
        q: 'Never ___ such a beautiful place.',
        options: ['I have seen', 'have I seen', 'I saw have', 'did I have seen'],
        answer: 1,
        explain: 'Never gap boshida kelgani uchun have egadan oldin keladi.'
      },
      {
        id: 'g25-q2',
        q: 'Rarely ___ so hard for an exam.',
        options: ['she studies', 'does she study', 'she does studies', 'studies she does'],
        answer: 1,
        explain: 'Present Simple inversiyasida does + subject + base verb ishlatiladi.'
      },
      {
        id: 'g25-q3',
        q: 'Only after the train left ___ my ticket was missing.',
        options: ['I realised', 'did I realise', 'I did realised', 'realised I'],
        answer: 1,
        explain: 'Only after gap boshida kelganda asosiy gapda did + subject + base verb ishlatiladi.'
      },
      {
        id: 'g25-q4',
        q: 'Not only ___ the competition, but she also broke the record.',
        options: ['she won', 'did she win', 'she did won', 'won she did'],
        answer: 1,
        explain: 'Not only bilan boshlangan birinchi qismda inversiya talab qilinadi.'
      },
      {
        id: 'g25-q5',
        q: 'Which sentence is correct?',
        options: [
          'Seldom we see such results.',
          'Seldom do we see such results.',
          'Seldom we do see such results?',
          'Seldom see we do such results.'
        ],
        answer: 1,
        explain: 'Seldom gap boshida kelganda do + subject + base verb tartibi ishlatiladi.'
      }
    ]
  },
  {
    id: 'g26',
    title: 'Cleft Sentences',
    titleUz: 'Ta’kidlovchi gap tuzilmalari',
    level: 'C1',
    emoji: '🎯',
    summaryUz:
      'Cleft sentences gapning ma’lum bir qismini ta’kidlashga yordam beradi. It-cleft va what-cleft tuzilmalari yozma hamda og‘zaki nutqda diqqatni kerakli ma’lumotga qaratadi.',
    explanationUz: [
      'It-cleft tuzilmasi: It + be + ta’kidlanayotgan qism + relative clause. Masalan, It was Ali who called me. Bu yerda Ali ta’kidlanmoqda.',
      'Ta’kid odamga, vaqtga, joyga yoki sababga qaratilishi mumkin: It was yesterday that we met. It was in London that they first met.',
      'What-cleft tuzilmasi ko‘pincha What + clause + be + ta’kidlangan ma’lumot shaklida keladi: What I need is a little more time. Bu “Menga kerak bo‘lgan narsa — biroz ko‘proq vaqt” degani.',
      'Oddiy gap va cleft sentence bir xil asosiy ma’lumotni yetkazishi mumkin, lekin diqqat markazi boshqacha bo‘ladi: Sarah broke the vase → It was Sarah who broke the vase.',
      'Cleft gap tuzayotganda fe’l zamoni va ma’no mosligini saqlang. It was ... who ... ko‘pincha o‘tgan voqeani ta’kidlaydi; What ... is ... esa gapning kerakli qismini oldinga chiqaradi.',
    ],
    examples: [
      { en: 'It was my brother who found the keys.', uz: 'Kalitlarni aynan akam topdi.' },
      { en: 'It was last Friday that we met.', uz: 'Biz aynan o‘tgan juma kuni uchrashdik.' },
      { en: 'What I enjoy most is learning languages.', uz: 'Menga eng ko‘p yoqadigan narsa — tillarni o‘rganish.' },
      { en: 'What she needs is a quiet place to study.', uz: 'Unga kerak bo‘lgan narsa — dars qilish uchun tinch joy.' }
    ],
    mistakes: [
      {
        wrong: 'It was Ali which called me.',
        right: 'It was Ali who called me.',
        noteUz: 'Odamni ta’kidlashda odatda who ishlatiladi.'
      },
      {
        wrong: 'What I need are more time.',
        right: 'What I need is more time.',
        noteUz: 'What-cleft gapida What I need butun bir birlik sifatida ko‘riladi; bu misolda is ishlatiladi.'
      }
    ],
    quiz: [
      {
        id: 'g26-q1',
        q: '___ was my teacher who encouraged me to apply.',
        options: ['There', 'It', 'What', 'That'],
        answer: 1,
        explain: 'It-cleft tuzilmasi It was ... who ... shaklida ishlatiladi.'
      },
      {
        id: 'g26-q2',
        q: 'It was yesterday ___ we received the results.',
        options: ['who', 'where', 'that', 'what'],
        answer: 2,
        explain: 'Vaqtni ta’kidlovchi it-cleft gapida that ishlatiladi.'
      },
      {
        id: 'g26-q3',
        q: '___ I need is a little more practice.',
        options: ['Which', 'What', 'Who', 'Where'],
        answer: 1,
        explain: 'What I need “menga kerak bo‘lgan narsa” ma’nosini beradi.'
      },
      {
        id: 'g26-q4',
        q: 'It was Nadia ___ organised the event.',
        options: ['which', 'where', 'who', 'what'],
        answer: 2,
        explain: 'Nadia odam bo‘lgani uchun who ishlatiladi.'
      },
      {
        id: 'g26-q5',
        q: 'Which sentence places emphasis on the person who solved the problem?',
        options: [
          'The problem was solved yesterday.',
          'It was Omar who solved the problem.',
          'What solved the problem was Omar.',
          'Omar the problem solved.'
        ],
        answer: 1,
        explain: 'It was Omar who ... tuzilmasi aynan Omarni ta’kidlaydi.'
      }
    ]
  }
];
