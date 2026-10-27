import type { ReadingPassage } from '../types';

export const READING_MORE: ReadingPassage[] = [
  {
    id: "r11",
    title: "Ali's First Smartphone",
    level: "A2",
    text: `Last month, Ali had his twelfth birthday. His parents gave him a smartphone, and he was very happy. But before he could use it, his father said, "We need some rules." Ali was a little surprised, but he listened.

The first rule is about time. Ali can use the phone for one hour after he finishes his homework. The second rule is about meals and sleep. The phone stays in the kitchen during dinner, and at night he puts it on the shelf in the hall, not in his bed. The third rule is about safety. Ali must never tell strangers his address, and he must ask his parents before he downloads a new app.

At first, Ali thought the rules were strict. Now he thinks they are fair. He sleeps better, and he talks more with his family at dinner. He also uses the phone to learn English with a free app. "A phone is a useful tool," he says, "but I am the boss, not the phone."`,
    vocab: [
      { en: "smartphone", uz: "smartfon" },
      { en: "rule", uz: "qoida" },
      { en: "shelf", uz: "javon, tokcha" },
      { en: "stranger", uz: "notanish odam" },
      { en: "address", uz: "manzil" },
      { en: "download", uz: "yuklab olmoq" },
      { en: "strict", uz: "qattiqqo‘l" },
      { en: "fair", uz: "adolatli" },
    ],
    questions: [
      {
        id: "r11-q1",
        q: "When can Ali use his phone for one hour?",
        options: ["Before school", "After he finishes his homework", "During dinner", "Before he goes to bed"],
        answer: 1,
        explain: "Matnda “Ali can use the phone for one hour after he finishes his homework” deyilgan: u uy vazifasini tugatgandan keyin bir soat foydalanadi.",
      },
      {
        id: "r11-q2",
        q: "Where does Ali keep his phone at night?",
        options: ["In his bed", "In the kitchen", "On the shelf in the hall", "In his school bag"],
        answer: 2,
        explain: "“At night he puts it on the shelf in the hall, not in his bed” – kechasi telefon koridordagi javonda turadi. Oshxonada esa u kechki ovqat paytida turadi.",
      },
      {
        id: "r11-q3",
        q: "In the text, the word “strict” means ...",
        options: [
          "very serious about following rules",
          "very expensive",
          "quite funny",
          "easy to forget",
        ],
        answer: 0,
        explain: "Ali avval qoidalarni “strict” deb o‘ylagan, keyin esa “fair” (adolatli) deb hisoblagan. Demak, “strict” – qoidalarga qattiq amal qildiradigan degani.",
      },
      {
        id: "r11-q4",
        q: "What is the text mainly about?",
        options: [
          "How Ali learns English",
          "Why phones are bad for children",
          "A birthday party at Ali's house",
          "Ali's rules for a new phone and how he feels about them",
        ],
        answer: 3,
        explain: "Matn Alining yangi telefon uchun uchta qoidasi va keyinchalik uning ularni adolatli deb bilishi haqida: “Now he thinks they are fair.”",
      },
    ],
  },
  {
    id: "r12",
    title: "Sports Day at Our School",
    level: "A2",
    text: `Every year in May, our school has a sports day. This year it was sunny and warm, so everyone was excited. In the morning, the younger students ran short races on the field. Then the older students played football. My class, 6B, played against 6A. At first, 6A scored a goal and we were nervous. But our captain, Jasur, passed the ball to me, and I scored twice in the second half. We won 2-1!

After lunch, there was a swimming race at the school pool. I am not a good swimmer, so I only watched. My friend Malika came second, and she got a silver medal.

At the end of the day, the teacher gave a small prize to every class. She said that sport is not only about winning. It is also about working together and having fun. I was tired but very happy when I went home.`,
    vocab: [
      { en: "race", uz: "poyga" },
      { en: "field", uz: "maydon" },
      { en: "captain", uz: "sardor, kapitan" },
      { en: "score", uz: "gol urmoq, hisob" },
      { en: "swimmer", uz: "suzuvchi" },
      { en: "medal", uz: "medal" },
      { en: "prize", uz: "sovrin" },
      { en: "nervous", uz: "xavotirli" },
    ],
    questions: [
      {
        id: "r12-q1",
        q: "Which class did the writer's team play against?",
        options: ["6A", "6C", "7B", "5A"],
        answer: 0,
        explain: "“My class, 6B, played against 6A” – yozuvchining sinfi 6A bilan o‘ynagan.",
      },
      {
        id: "r12-q2",
        q: "Why did the writer only watch the swimming race?",
        options: [
          "The pool was closed.",
          "The writer is not a good swimmer.",
          "The writer was too tired.",
          "The teacher said no.",
        ],
        answer: 1,
        explain: "Matnda “I am not a good swimmer, so I only watched” deyilgan: yozuvchi yaxshi suza olmagani uchun faqat tomosha qilgan.",
      },
      {
        id: "r12-q3",
        q: "What did Malika get in the swimming race?",
        options: ["A gold medal", "A football", "A silver medal", "A certificate"],
        answer: 2,
        explain: "“My friend Malika came second, and she got a silver medal” – Malika ikkinchi o‘rinni egallab, kumush medal olgan.",
      },
      {
        id: "r12-q4",
        q: "What does the teacher think about sport?",
        options: [
          "Winning is the only important thing.",
          "It is only for older students.",
          "It is only for fun, not for learning.",
          "Winning is not the only important thing.",
        ],
        answer: 3,
        explain: "O‘qituvchi “sport is not only about winning” degan: sport faqat g‘alaba haqida emas, jamoa bo‘lib ishlash va quvnoqlik ham muhim.",
      },
    ],
  },
  {
    id: "r13",
    title: "Saving for a Bicycle",
    level: "B1",
    text: `Sardor, who is fourteen, wanted a mountain bike that cost about 200 dollars. His parents gave him pocket money every week, but he usually spent it on snacks and mobile games within two days. When he asked his father to buy the bike, his father smiled and said, "I'll help you, but first you must show me that you can save."

Sardor made a simple plan. He decided to put half of his pocket money into a small box every week. He also earned extra money by washing the neighbours' cars on Saturdays and by selling old books online. He wrote every amount in a notebook so that he could see his progress.

It was not easy. Sometimes his friends invited him to the cinema, and he had to say no. He learned that saving means giving up something small today to get something bigger later. Economists call this idea "opportunity cost": when you choose one thing, you lose the chance to buy something else with the same money.

After five months, Sardor had saved more than half of the price. His father kept his promise and paid the rest. Sardor was proud, not only of the bike, but also of himself. He says the habit of saving is now more valuable to him than any single purchase.`,
    vocab: [
      { en: "pocket money", uz: "cho‘ntak puli" },
      { en: "save", uz: "jamg‘armoq, tejamoq" },
      { en: "earn", uz: "topmoq, ishlab topmoq" },
      { en: "progress", uz: "olg‘a siljish, yutuq" },
      { en: "give up", uz: "voz kechmoq" },
      { en: "opportunity cost", uz: "imkoniyat narxi (boshqa tanlovdan voz kechish)" },
      { en: "habit", uz: "odat" },
      { en: "purchase", uz: "xarid" },
    ],
    questions: [
      {
        id: "r13-q1",
        q: "How did Sardor earn extra money?",
        options: [
          "By cleaning his school",
          "By teaching English",
          "By washing cars and selling old books",
          "By working in a shop",
        ],
        answer: 2,
        explain: "Matnda “He also earned extra money by washing the neighbours' cars ... and by selling old books online” deyilgan.",
      },
      {
        id: "r13-q2",
        q: "Which sentence best explains “opportunity cost”?",
        options: [
          "When you choose one thing, you lose the chance to buy something else.",
          "The price of a very expensive bicycle.",
          "The money that parents give every week.",
          "The cost of selling old things online.",
        ],
        answer: 0,
        explain: "Matnda ta’rif berilgan: “when you choose one thing, you lose the chance to buy something else with the same money”.",
      },
      {
        id: "r13-q3",
        q: "Why did Sardor's father say, “first you must show me that you can save”?",
        options: [
          "He did not have enough money.",
          "He wanted Sardor to stop playing games.",
          "He thought the bike was too dangerous.",
          "He wanted to see if Sardor could be responsible with money.",
        ],
        answer: 3,
        explain: "Sardor ilgari pulini ikki kunda sarflab yuborgan edi. Otasi uning pulni tejay olishini ko‘rmoqchi bo‘lgan, ya‘ni mas‘uliyatni sinagan.",
      },
      {
        id: "r13-q4",
        q: "What is the main message of the text?",
        options: [
          "Pocket money should be spent quickly.",
          "Saving needs a plan and patience, and it teaches useful lessons.",
          "Parents should always buy expensive gifts.",
          "Mountain bikes are better than other bikes.",
        ],
        answer: 1,
        explain: "Sardor reja tuzdi, sabr qildi va “giving up something small today to get something bigger later” ni o‘rgandi. Asosiy fikr shu.",
      },
    ],
  },
  {
    id: "r14",
    title: "A Young Dutar Player",
    level: "B1",
    text: `Madina is thirteen, and she plays the dutar, a traditional Central Asian instrument with two strings. She started when she was seven, after she heard her grandmother's old recordings of folk songs. "The sound was so warm that I wanted to make it myself," she remembers.

At first, practising was difficult. Her fingers hurt, and she often played the wrong notes. Her teacher, Mr Karimov, told her to practise for fifteen minutes every day instead of playing for hours at the weekend. Slowly, her music improved.

Last year, Madina joined a youth orchestra that mixes traditional and modern instruments. In the beginning, she was worried that the dutar would sound too quiet next to the guitars and the drums. However, the conductor asked her to play a short solo at the start of a new song, and the audience loved it. After the concert, several teenagers asked her where they could learn the instrument.

Madina now dreams of becoming a music teacher. "Traditional music is not old-fashioned," she says. "It is a bridge between generations, and young people can make it sound fresh."`,
    vocab: [
      { en: "traditional", uz: "an‘anaviy" },
      { en: "instrument", uz: "cholg‘u asbobi" },
      { en: "string", uz: "tor" },
      { en: "recording", uz: "yozuv (audio)" },
      { en: "orchestra", uz: "orkestr" },
      { en: "conductor", uz: "dirijyor" },
      { en: "solo", uz: "yakkaxon ijro" },
      { en: "audience", uz: "tomoshabinlar" },
    ],
    questions: [
      {
        id: "r14-q1",
        q: "What advice did Mr Karimov give Madina?",
        options: [
          "Play only at the weekend",
          "Practise a little every day",
          "Change to the guitar",
          "Stop when her fingers hurt",
        ],
        answer: 1,
        explain: "“Told her to practise for fifteen minutes every day instead of playing for hours at the weekend” – har kuni qisqa vaqt mashq qilish tavsiya etilgan.",
      },
      {
        id: "r14-q2",
        q: "Why did Madina want to learn the dutar?",
        options: [
          "Her school told her to.",
          "She saw it at a concert.",
          "Her teacher chose it for her.",
          "She heard her grandmother's old recordings.",
        ],
        answer: 3,
        explain: "Matnda aytilishicha, u “heard her grandmother's old recordings of folk songs” va tovush unga juda yoqqan.",
      },
      {
        id: "r14-q3",
        q: "In the text, a “solo” is ...",
        options: [
          "a part played by one musician alone",
          "a song for the whole orchestra",
          "a kind of drum",
          "a lesson with a teacher",
        ],
        answer: 0,
        explain: "Dirijyor Madinadan “a short solo at the start of a new song” ijro etishni so‘ragan, ya‘ni orkestr to‘xtab, u yolg‘iz chalgan.",
      },
      {
        id: "r14-q4",
        q: "What does Madina believe about traditional music?",
        options: [
          "It is only for old people.",
          "It is too quiet for modern songs.",
          "It can connect generations and still sound fresh.",
          "It is easier than modern music.",
        ],
        answer: 2,
        explain: "Madina: “It is a bridge between generations, and young people can make it sound fresh.” – an‘anaviy musiqa avlodlarni bog‘laydi va yangicha jaranglashi mumkin.",
      },
    ],
  },
  {
    id: "r15",
    title: "River Clean-up Day",
    level: "B1",
    text: `On the first Saturday of April, more than fifty students and teachers gathered beside the small river near our town. They wore gloves and carried large bags. The goal was simple: to clean the riverbank, which had become dirty over the winter.

Within two hours, the volunteers had collected plastic bottles, old shoes, food wrappers and even a broken bicycle. A biology teacher, Mrs Rahimova, explained why this matters. "Plastic does not disappear," she said. "It breaks into tiny pieces, and fish and birds can mistake those pieces for food." She also reminded the students that a river is a home for many living things, such as frogs, insects and fish.

The group separated the rubbish carefully. Paper, glass and plastic went into different bags so that they could be recycled instead of thrown away. Some students also planted young trees along the bank. Their roots will hold the soil and stop it from washing into the water.

By lunchtime, the river looked much cleaner. A boy named Bekzod said he felt proud but also a little angry that people had left so much rubbish. "Next time," he said, "I will tell my friends not to throw anything on the ground." The school plans to repeat the clean-up every spring.`,
    vocab: [
      { en: "riverbank", uz: "daryo qirg‘og‘i" },
      { en: "volunteer", uz: "ko‘ngilli" },
      { en: "wrapper", uz: "o‘ram, qadoq qog‘ozi" },
      { en: "tiny", uz: "juda kichik" },
      { en: "rubbish", uz: "chiqindi" },
      { en: "recycle", uz: "qayta ishlamoq" },
      { en: "root", uz: "ildiz" },
      { en: "soil", uz: "tuproq" },
    ],
    questions: [
      {
        id: "r15-q1",
        q: "Why did some students plant young trees along the bank?",
        options: [
          "To make shade for the fish",
          "To give birds more food",
          "To hide the rubbish",
          "To keep the soil from washing into the water",
        ],
        answer: 3,
        explain: "“Their roots will hold the soil and stop it from washing into the water” – daraxt ildizlari tuproqni ushlab turadi.",
      },
      {
        id: "r15-q2",
        q: "According to Mrs Rahimova, why is plastic a problem?",
        options: [
          "It breaks into small pieces that animals may eat by mistake.",
          "It makes the river water too warm.",
          "It disappears and kills the plants.",
          "It is too heavy for the bags.",
        ],
        answer: 0,
        explain: "O‘qituvchi aytadi: plastik “breaks into tiny pieces, and fish and birds can mistake those pieces for food” – hayvonlar uni xato bilan yeb qo‘yishi mumkin.",
      },
      {
        id: "r15-q3",
        q: "In the text, “volunteers” are people who ...",
        options: [
          "live next to the river",
          "are paid to clean rivers",
          "do work willingly without being paid",
          "study biology at university",
        ],
        answer: 2,
        explain: "Talabalar va o‘qituvchilar o‘z xohishi bilan, hech qanday haq olmasdan daryoni tozalashdi – “volunteers” shu ma‘noni beradi.",
      },
      {
        id: "r15-q4",
        q: "What is the main idea of the text?",
        options: [
          "Plastic is more useful than paper.",
          "Students worked together to clean a river and learned why it matters.",
          "A broken bicycle was found in the water.",
          "Rivers are dirty only in winter.",
        ],
        answer: 1,
        explain: "Matn daryoni tozalash kuni, chiqindilarni ajratish, daraxt ekish va buning ahamiyati haqida. Bu butun matnning asosiy g‘oyasi.",
      },
    ],
  },
  {
    id: "r16",
    title: "My First Train Journey",
    level: "B1",
    text: `Last summer, I travelled by train for the first time. My aunt lives in Samarkand, and my parents decided that I could go alone, as long as my cousin met me at the station. I was nervous and excited at the same time.

We left Tashkent early in the morning. The high-speed train was clean and quiet, and it took about two hours. I had a window seat, so I watched the fields, villages and small mountains pass by. A kind old man sitting next to me shared some grapes and told me stories about his own first trip many years ago. At that time, he said, the journey was much slower, and passengers brought their own tea and bread.

When we arrived, my cousin was waiting on the platform with a big smile. We took a taxi to my aunt's house and had lunch together. That afternoon, we visited the Registan, where the blue tiles on the old buildings shone in the sun.

I learned that travelling alone is not as frightening as it seems. You only need to be careful, ask for help politely, and keep your ticket and phone in a safe place. Now I want to try a longer train journey, perhaps across the whole country.`,
    vocab: [
      { en: "journey", uz: "sayohat, yo‘l" },
      { en: "station", uz: "vokzal" },
      { en: "nervous", uz: "xavotirli" },
      { en: "passenger", uz: "yo‘lovchi" },
      { en: "platform", uz: "platforma (vokzalda)" },
      { en: "frightening", uz: "qo‘rqinchli" },
      { en: "politely", uz: "xushmuomalalik bilan" },
      { en: "ticket", uz: "chipta" },
    ],
    questions: [
      {
        id: "r16-q1",
        q: "Who met the writer at the station?",
        options: ["The aunt", "The cousin", "The parents", "A taxi driver"],
        answer: 1,
        explain: "“My cousin was waiting on the platform with a big smile” – vokzalda amakivachcha (yoki xolavachcha) kutib olgan.",
      },
      {
        id: "r16-q2",
        q: "What did the old man say about train journeys in the past?",
        options: [
          "They were much faster.",
          "They were much cheaper.",
          "They were much more comfortable.",
          "They were much slower.",
        ],
        answer: 3,
        explain: "Chol aytgan: “the journey was much slower, and passengers brought their own tea and bread” – o‘sha paytda yo‘l ancha sekin bo‘lgan.",
      },
      {
        id: "r16-q3",
        q: "In the text, “frightening” means ...",
        options: ["scary", "boring", "expensive", "exciting"],
        answer: 0,
        explain: "“Travelling alone is not as frightening as it seems” – yolg‘iz sayohat ko‘rinadigancha qo‘rqinchli emas. “Frightening” – qo‘rqitadigan, ya‘ni scary.",
      },
      {
        id: "r16-q4",
        q: "What does the writer conclude at the end?",
        options: [
          "Trains are better than taxis.",
          "Children should never travel without parents.",
          "Travelling alone is possible if you are careful and ask for help.",
          "Samarkand is the best city in the country.",
        ],
        answer: 2,
        explain: "Yozuvchi xulosa qiladi: “You only need to be careful, ask for help politely, and keep your ticket and phone in a safe place.”",
      },
    ],
  },
  {
    id: "r17",
    title: "The Journey of a Water Drop",
    level: "B2",
    text: `The water in a glass on your desk has been circulating around our planet for billions of years. This continuous movement, known as the water cycle, is powered mainly by energy from the Sun.

The cycle begins when the Sun heats the surface of oceans, lakes and rivers. Some of the liquid turns into an invisible gas called water vapour, a process known as evaporation. Plants also release water vapour through tiny holes in their leaves, which is called transpiration. As the warm, moist air rises, it cools, and the vapour changes back into tiny drops of liquid water. This is condensation, and it is how clouds form.

When the drops in a cloud become heavy enough, they fall to the ground as precipitation: rain, snow, sleet or hail. What happens next depends on the landscape. Some water runs over the surface into streams and rivers, which eventually carry it back to the sea. Some soaks into the soil and becomes groundwater, which may stay underground for many years and supply wells and springs. In cold regions, snow can be stored as ice in glaciers for centuries before it melts.

Although the cycle never stops, this does not mean that fresh water is unlimited. Only a small part of the planet's water is fresh, and much of that is frozen or deep underground. In addition, pollution can make water unsafe to use, and changing weather patterns can cause droughts in some places and floods in others. Understanding the water cycle therefore helps us to see why protecting rivers, forests and glaciers matters for everyone.`,
    vocab: [
      { en: "circulate", uz: "aylanib yurmoq" },
      { en: "evaporation", uz: "bug‘lanish" },
      { en: "water vapour", uz: "suv bug‘i" },
      { en: "condensation", uz: "kondensatsiya (bug‘ning suvga aylanishi)" },
      { en: "precipitation", uz: "yog‘in-sochin" },
      { en: "groundwater", uz: "yer osti suvi" },
      { en: "glacier", uz: "muzlik" },
      { en: "drought", uz: "qurg‘oqchilik" },
    ],
    questions: [
      {
        id: "r17-q1",
        q: "What is the name of the process in which water vapour changes back into liquid drops and forms clouds?",
        options: ["Evaporation", "Transpiration", "Condensation", "Precipitation"],
        answer: 2,
        explain: "Matnda: “the vapour changes back into tiny drops of liquid water. This is condensation, and it is how clouds form.”",
      },
      {
        id: "r17-q2",
        q: "What is “groundwater”?",
        options: [
          "Water that soaks into the soil and stays underground",
          "Water that falls as snow in the mountains",
          "Water that is frozen in glaciers",
          "Water that runs quickly through rivers",
        ],
        answer: 0,
        explain: "“Some soaks into the soil and becomes groundwater, which may stay underground for many years” – yer osti suvi tuproqqa singib, yer ostida qoladi.",
      },
      {
        id: "r17-q3",
        q: "How do plants take part in the water cycle?",
        options: [
          "They create rain directly.",
          "They release water vapour through their leaves.",
          "They freeze water in the soil.",
          "They carry water back to the sea.",
        ],
        answer: 1,
        explain: "“Plants also release water vapour through tiny holes in their leaves, which is called transpiration” – o‘simliklar barglari orqali suv bug‘ini chiqaradi.",
      },
      {
        id: "r17-q4",
        q: "Which statement would the writer most likely agree with?",
        options: [
          "Because the water cycle never stops, we do not need to worry about water.",
          "Only rivers and lakes are part of the water cycle.",
          "Water is only useful when it is frozen.",
          "Water is constantly recycled, but clean fresh water still needs protection.",
        ],
        answer: 3,
        explain: "Muallif aytadi: sikl to‘xtamaydi, biroq “this does not mean that fresh water is unlimited” va ifloslanish suvni xavfli qilishi mumkin. Shuning uchun uni asrash kerak.",
      },
    ],
  },
  {
    id: "r18",
    title: "AI in Everyday Life",
    level: "B2",
    text: `You may not notice it, but artificial intelligence, or AI, already plays a part in many ordinary moments of your day. When your phone suggests the next word in a message, when a map app chooses the fastest route, or when a video platform recommends a clip you might like, software has analysed huge amounts of data to make a prediction. In recent years, AI tools that can write text, translate languages and create images have become available to almost anyone with an internet connection.

The benefits are considerable. Translation tools help travellers communicate, and language learners can practise conversations at any hour. In medicine, researchers are testing programs that help doctors examine scans more quickly. Teachers can use AI to prepare exercises, while students can ask for an explanation of a difficult topic in simpler words.

However, there are genuine concerns. AI systems can make mistakes and sometimes present wrong information in a very confident tone, so users must check important facts. Some people worry that relying on these tools may weaken our own skills: a student who always asks a program to write an essay will never learn to organise ideas. There are also questions about privacy, because many systems are trained on personal data, and about fairness, since a program can repeat the biases found in the information it learned from.

Experts therefore recommend a balanced approach. AI is best seen as an assistant rather than a replacement for human thinking. Use it to get started, to practise or to check your work, but keep asking questions, compare different sources and make the final decisions yourself. Used wisely, it can save time; used carelessly, it can mislead.`,
    vocab: [
      { en: "artificial intelligence", uz: "sun‘iy intellekt" },
      { en: "recommend", uz: "tavsiya qilmoq" },
      { en: "prediction", uz: "bashorat" },
      { en: "considerable", uz: "katta, sezilarli" },
      { en: "privacy", uz: "shaxsiy daxlsizlik" },
      { en: "bias", uz: "xolislikning buzilishi, tarafkashlik" },
      { en: "rely on", uz: "tayanmoq, ishonmoq" },
      { en: "mislead", uz: "yo‘ldan urmoq, chalg‘itmoq" },
    ],
    questions: [
      {
        id: "r18-q1",
        q: "Why must users check important facts from AI tools?",
        options: [
          "AI tools are always very slow.",
          "AI can give wrong information in a confident tone.",
          "AI tools only work on phones.",
          "AI cannot translate any languages.",
        ],
        answer: 1,
        explain: "Matnda: AI “sometimes present wrong information in a very confident tone, so users must check important facts”.",
      },
      {
        id: "r18-q2",
        q: "In the text, “considerable” means ...",
        options: [
          "very small",
          "difficult to understand",
          "only temporary",
          "large and important",
        ],
        answer: 3,
        explain: "“The benefits are considerable” jumlasidan keyin ko‘plab foydali misollar keltirilgan, ya‘ni foydalar katta va sezilarli.",
      },
      {
        id: "r18-q3",
        q: "What does the example of the student who always asks a program to write an essay suggest?",
        options: [
          "The student may not develop the ability to organise ideas.",
          "The student will get better marks every time.",
          "The student will learn faster than others.",
          "The student should stop using computers.",
        ],
        answer: 0,
        explain: "“A student who always asks a program to write an essay will never learn to organise ideas” – o‘z ko‘nikmalari rivojlanmay qolishi mumkin.",
      },
      {
        id: "r18-q4",
        q: "What is the writer's purpose in the text?",
        options: [
          "To persuade readers to stop using AI",
          "To advertise a new AI program",
          "To give a balanced view of AI's benefits and risks and suggest using it wisely",
          "To explain how to build an AI system",
        ],
        answer: 2,
        explain: "Muallif ham foydalarini, ham xavflarini sanab, “Experts therefore recommend a balanced approach” deydi. Maqsad – muvozanatli nuqtai nazar berish.",
      },
    ],
  },
  {
    id: "r19",
    title: "Why Are the Olympics So Expensive?",
    level: "B2",
    text: `Every few years, a city celebrates when it is chosen to host the Olympic Games. The event brings world attention, visitors and national pride. Yet many hosts have discovered that the final bill is far higher than they first expected, and some cities are now reluctant to bid at all.

One reason for the high cost is the scale of the event. The Games need stadiums, swimming pools, an athletes' village, new roads and extra public transport. Security is another major expense, as thousands of athletes and many thousands of spectators must be protected. In addition, organisers face strict deadlines. Because the opening ceremony cannot be postponed, builders sometimes have to work under pressure, and prices can rise quickly.

Supporters argue that the investment is worthwhile. They point out that new infrastructure can serve residents for decades, that tourism may increase and that the Games can inspire young people to take up sport. Some cities have also reduced costs by using existing buildings or temporary structures that are removed after the competition.

Critics, on the other hand, remind us that facilities built for one event can become expensive burdens if nobody uses them afterwards. Money spent on a stadium, they say, cannot be used for schools or hospitals. Economists generally agree that the answer depends on planning: a city that builds only what it needs and has a clear plan for the buildings' future is more likely to benefit than one that tries to impress the world with the biggest possible show.`,
    vocab: [
      { en: "host", uz: "mezbon bo‘lmoq, uyushtirmoq" },
      { en: "reluctant", uz: "istamaydigan, ikkilanadigan" },
      { en: "bid", uz: "(o‘tkazish uchun) ariza bermoq" },
      { en: "deadline", uz: "oxirgi muddat" },
      { en: "postpone", uz: "keyinga qoldirmoq" },
      { en: "infrastructure", uz: "infratuzilma" },
      { en: "burden", uz: "yuk, og‘irlik" },
      { en: "worthwhile", uz: "o‘zini oqlaydigan, arziydigan" },
    ],
    questions: [
      {
        id: "r19-q1",
        q: "Which of these is given as a reason for the high cost of the Games?",
        options: [
          "High salaries for the athletes",
          "Expensive tickets for visitors",
          "Strict deadlines that cannot be moved",
          "Large prizes for the winners",
        ],
        answer: 2,
        explain: "“Because the opening ceremony cannot be postponed, builders sometimes have to work under pressure, and prices can rise quickly.”",
      },
      {
        id: "r19-q2",
        q: "In the text, “reluctant” means ...",
        options: [
          "unwilling and not eager",
          "very happy",
          "completely sure",
          "extremely rich",
        ],
        answer: 0,
        explain: "Narx kutilganidan yuqori bo‘lgani uchun ba‘zi shaharlar umuman ariza berishni istamaydi. “Reluctant” – istamaydigan, ikkilanadigan.",
      },
      {
        id: "r19-q3",
        q: "Which cities are most likely to benefit from hosting the Games?",
        options: [
          "Those that build the biggest stadiums",
          "Those that spend all their money on security",
          "Those that host the Games every year",
          "Those that plan carefully and have a future use for what they build",
        ],
        answer: 3,
        explain: "Oxirgi xatboshida: “a city that builds only what it needs and has a clear plan for the buildings' future is more likely to benefit”.",
      },
      {
        id: "r19-q4",
        q: "What do critics say about the Games?",
        options: [
          "Nobody enjoys watching them.",
          "Money spent on a stadium cannot be used for schools or hospitals.",
          "Athletes should not travel abroad.",
          "Tourism always falls after the Games.",
        ],
        answer: 1,
        explain: "Tanqidchilar fikri: “Money spent on a stadium, they say, cannot be used for schools or hospitals.”",
      },
    ],
  },
  {
    id: "r20",
    title: "Coral Reefs Under Pressure",
    level: "C1",
    text: `Coral reefs cover only a tiny fraction of the ocean floor, yet they support an extraordinary share of marine life. Scientists estimate that a quarter or more of all known ocean species depend on them at some stage of their lives, which is why reefs are often described as the rainforests of the sea. They also protect coastlines by absorbing the force of waves, and they provide food and income for millions of people through fishing and tourism.

The foundation of a reef is a partnership. Corals are tiny animals, and many of them host microscopic algae within their tissues. The algae use sunlight to produce nutrients, which they share with the coral, and in return the coral offers shelter. This arrangement is also what gives reefs their vivid colours. However, it is delicate. When seawater remains unusually warm for an extended period, the coral becomes stressed and expels the algae. The colour drains away, leaving a pale skeleton, a phenomenon known as bleaching. A bleached coral is not necessarily dead, and it can recover if conditions improve quickly enough; prolonged heat, however, may kill it.

Rising ocean temperatures, driven largely by the burning of fossil fuels, are therefore a central threat. Climate change is not the only one. The oceans also absorb a considerable amount of carbon dioxide from the atmosphere, which makes seawater slightly more acidic and can make it harder for corals to build their hard skeletons. Local pressures, including pollution, destructive fishing and run-off from farmland, weaken reefs further and leave them less able to cope with heat.

The situation is serious but not hopeless. Researchers are studying which corals tolerate heat best, and some projects are growing and replanting fragments on damaged reefs. Many scientists stress, though, that such efforts can only buy time. Without substantial cuts in greenhouse gas emissions, restoration may prove to be little more than a temporary repair. Protecting reefs, in other words, depends on decisions made far from the water's edge.`,
    vocab: [
      { en: "coral reef", uz: "marjon riffi" },
      { en: "algae", uz: "suv o‘tlari" },
      { en: "expel", uz: "chiqarib yubormoq" },
      { en: "bleaching", uz: "oqarib ketish (marjonlarda)" },
      { en: "prolonged", uz: "uzoq davom etgan" },
      { en: "acidic", uz: "kislotali" },
      { en: "run-off", uz: "oqib kelgan ifloslangan suv" },
      { en: "restoration", uz: "tiklash" },
    ],
    questions: [
      {
        id: "r20-q1",
        q: "In the text, the word “expels” is closest in meaning to ...",
        options: ["absorbs", "pushes out", "produces", "protects"],
        answer: 1,
        explain: "Issiq suvda marjon “becomes stressed and expels the algae” – suv o‘tlarini o‘zidan chiqarib yuboradi (pushes out).",
      },
      {
        id: "r20-q2",
        q: "What happens to coral during bleaching?",
        options: [
          "It grows faster and becomes larger.",
          "It produces more algae.",
          "It always dies at once.",
          "It loses its algae and its colour fades.",
        ],
        answer: 3,
        explain: "“The colour drains away, leaving a pale skeleton” – rang yo‘qoladi. Shu bilan birga, bleached coral “is not necessarily dead”, ya‘ni darhol o‘lmaydi.",
      },
      {
        id: "r20-q3",
        q: "What does the writer mean by “decisions made far from the water's edge”?",
        options: [
          "The main cause is global emissions, so action must be taken beyond the reefs themselves.",
          "Only people living near the sea can protect reefs.",
          "Reefs should be moved to deeper water.",
          "Fishermen should decide how to repair reefs.",
        ],
        answer: 0,
        explain: "Muallif isitishning asosiy sababi – issiqxona gazlari chiqindilari ekanini aytadi: “Without substantial cuts in greenhouse gas emissions...”. Demak, qarorlar dengizdan uzoqda qabul qilinadi.",
      },
      {
        id: "r20-q4",
        q: "What does the writer suggest about restoration projects?",
        options: [
          "They are a waste of time.",
          "They have already solved the problem.",
          "They help, but they cannot replace cuts in emissions.",
          "They are needed only on reefs near farms.",
        ],
        answer: 2,
        explain: "“Such efforts can only buy time. Without substantial cuts in greenhouse gas emissions, restoration may prove to be little more than a temporary repair.”",
      },
    ],
  },
  ];
