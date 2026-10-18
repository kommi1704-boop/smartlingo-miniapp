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
];
