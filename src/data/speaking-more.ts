import type { SpeakingPrompt } from '../types';

export const SPEAKING_MORE: SpeakingPrompt[] = [
  {
    id: "s13",
    kind: "conversation",
    level: "Pre-A1",
    title: "My best friend",
    prompt: "Talk about your friend. What is his or her name? How old is he or she? What do you do together?",
    promptUz:
      "Do‘stingiz haqida oddiy gaplar bilan gapiring: ismi nima, necha yoshda va u bilan birga nima qilasiz.",
    sample:
      "This is my friend. His name is Bobur. He is ten years old. He is tall and funny. We go to school together. We play football in the park. We also play games. Bobur is my best friend. I like him very much.",
    expressions: [
      { en: "This is my friend.", uz: "Bu mening do‘stim." },
      { en: "His / Her name is...", uz: "Uning ismi..." },
      { en: "He / She is tall / funny.", uz: "U novcha / kulgili." },
      { en: "We play together.", uz: "Biz birga o‘ynaymiz." },
      { en: "He / She is my best friend.", uz: "U mening eng yaqin do‘stim." },
    ],
  },
  {
    id: "s14",
    kind: "conversation",
    level: "A1",
    title: "My phone",
    prompt: "Do you have a phone or a tablet? What do you do with it? How much time do you use it every day?",
    promptUz:
      "Telefoningiz yoki planshetingiz bormi? Uni nima uchun ishlatasiz va kuniga qancha vaqt foydalanasiz? Oddiy gaplar bilan ayting.",
    sample:
      "I have a small phone. I use it every day. I call my mother and send messages to my friends. I also watch videos and play games. I use my phone for English, too. I learn new words with an app. I use it for about one hour a day. My mother says that is enough.",
    expressions: [
      { en: "I have a phone / a tablet.", uz: "Mening telefonim / planshetim bor." },
      { en: "I use it every day.", uz: "Men uni har kuni ishlataman." },
      { en: "I send messages to my friends.", uz: "Men do‘stlarimga xabar yozaman." },
      { en: "I watch videos.", uz: "Men video ko‘raman." },
      { en: "for one hour a day", uz: "kuniga bir soat" },
    ],
  },
  {
    id: "s15",
    kind: "conversation",
    level: "A1",
    title: "My favourite sport",
    prompt: "What sport do you like? Do you play it or watch it? Where and when do you play?",
    promptUz:
      "Qaysi sportni yoqtirasiz? Uni o‘zingiz o‘ynaysizmi yoki televizorda ko‘rasizmi? Qayerda va qachon o‘ynashingizni ayting.",
    sample:
      "My favourite sport is football. I play it with my friends after school. We play in the yard near my house. I am not a fast runner, but I am a good goalkeeper. I also like swimming in summer. On TV I watch football with my father. Sport is fun and good for my health.",
    expressions: [
      { en: "My favourite sport is...", uz: "Mening sevimli sportim..." },
      { en: "I play ... with my friends.", uz: "Men do‘stlarim bilan ... o‘ynayman." },
      { en: "after school", uz: "maktabdan keyin" },
      { en: "I am (not) good at...", uz: "Men ...da yaxshiman (yaxshi emasman)." },
      { en: "Sport is good for my health.", uz: "Sport sog‘liq uchun foydali." },
    ],
  },
  {
    id: "s16",
    kind: "conversation",
    level: "A1",
    title: "Breakfast and lunch",
    prompt: "What do you eat and drink for breakfast? What do you eat for lunch? What food do you not like?",
    promptUz:
      "Nonushtada nima yeb-ichasiz? Tushlikda nima yeysiz? Qaysi taomlarni yoqtirmaysiz? Oddiy hozirgi zamonda javob bering.",
    sample:
      "For breakfast I usually have bread, an egg and a cup of tea. Sometimes I eat porridge with butter. For lunch I eat soup or rice with chicken. I drink water or juice. I love fruit, especially apples and grapes. I don't like fish and I don't like onions in my salad. After school I am hungry, so I eat a banana or some biscuits.",
    expressions: [
      { en: "For breakfast I have...", uz: "Nonushtada men ... yeyman." },
      { en: "For lunch I eat...", uz: "Tushlikda men ... yeyman." },
      { en: "I drink tea / water / juice.", uz: "Men choy / suv / sharbat ichaman." },
      { en: "I love fruit.", uz: "Men mevani yaxshi ko‘raman." },
      { en: "I don't like...", uz: "Menga ... yoqmaydi." },
    ],
  },
  {
    id: "s17",
    kind: "conversation",
    level: "A2",
    title: "Shopping for clothes",
    prompt:
      "Tell me about a time you bought clothes or shoes. What did you want? What size and colour? How much was it? Do you like shopping?",
    promptUz:
      "Kiyim yoki poyabzal sotib olgan kuningizni eslang: nima kerak edi, o‘lchami va rangi qanday edi, narxi qancha bo‘ldi. Xarid qilishni yoqtirasizmi?",
    sample:
      "Last Saturday I went to a shop with my mother because I needed new shoes for school. I wanted black shoes, size thirty-eight. The shop assistant showed me three pairs. One pair was very nice, but it was too expensive. In the end, I chose a cheaper pair for two hundred thousand som. They were comfortable and looked good. I don't like shopping for a long time, but I like buying new things. I always ask the price before I choose.",
    expressions: [
      { en: "How much is it?", uz: "Bu qancha turadi?" },
      { en: "Can I try it on?", uz: "Kiyib ko‘rsam bo‘ladimi?" },
      { en: "It's too expensive / cheap.", uz: "U juda qimmat / arzon." },
      { en: "Do you have a bigger size?", uz: "Kattaroq o‘lchami bormi?" },
      { en: "I'll take it.", uz: "Men buni olaman." },
      { en: "Can I pay by card?", uz: "Karta bilan to‘lasam bo‘ladimi?" },
    ],
  },
  {
    id: "s18",
    kind: "conversation",
    level: "A2",
    title: "Music I like",
    prompt:
      "What kind of music do you like? Who is your favourite singer or group? When do you listen to music? Can you play an instrument?",
    promptUz:
      "Qanday musiqani yoqtirasiz? Sevimli xonanda yoki guruhingiz kim? Musiqani qachon tinglaysiz va biror cholg‘u asbobida chala olasizmi?",
    sample:
      "I like pop music and some quiet piano songs. My favourite singer is Ed Sheeran, because his songs are slow and have nice words. I listen to music on my phone every day, on the bus and when I do my homework. It helps me to relax. I can play a little guitar. My uncle is teaching me, and I practise for twenty minutes every Sunday. One day I want to play at a school concert.",
    expressions: [
      { en: "I'm into pop / rock / classical music.", uz: "Men pop / rok / klassik musiqani yoqtiraman." },
      { en: "My favourite singer is...", uz: "Mening sevimli xonandam..." },
      { en: "It helps me to relax.", uz: "U menga dam olishga yordam beradi." },
      { en: "I can play the guitar / piano.", uz: "Men gitara / pianino chalaman." },
      { en: "I practise every Sunday.", uz: "Men har yakshanba mashq qilaman." },
    ],
  },
  {
    id: "s19",
    kind: "conversation",
    level: "A2",
    title: "My favourite season",
    prompt:
      "Which season do you like best? What is the weather like? What do you wear and what do you do in this season?",
    promptUz:
      "Yilning qaysi fasli sizga ko‘proq yoqadi? Ob-havo qanday bo‘ladi, nima kiyasiz va shu faslda nimalar qilasiz?",
    sample:
      "My favourite season is spring. In Uzbekistan the weather in spring is warm and sunny, and sometimes it rains. The trees have beautiful flowers and the grass is green. I wear a light jacket. We celebrate Navruz in March, and my family cooks sumalak and visits relatives. I also like to walk in the park and take photos of the flowers. Summer is too hot for me, and winter is too cold.",
    expressions: [
      { en: "My favourite season is...", uz: "Mening sevimli faslim..." },
      { en: "The weather is warm / hot / cold.", uz: "Havo iliq / issiq / sovuq." },
      { en: "It rains / It snows.", uz: "Yomg‘ir yog‘adi / Qor yog‘adi." },
      { en: "I wear a light jacket.", uz: "Men yengil kurtka kiyaman." },
      { en: "It is too hot for me.", uz: "Men uchun u juda issiq." },
    ],
  },
  {
    id: "s20",
    kind: "conversation",
    level: "A2",
    title: "Planning a family trip",
    prompt:
      "Your family wants to travel in Uzbekistan. Where are you going to go? How will you travel? What will you see and do there?",
    promptUz:
      "Oilangiz O‘zbekiston bo‘ylab sayohat qilmoqchi. Qayerga borasiz, qanday yetib borasiz va u yerda nimalarni ko‘rib, nimalar qilasiz? Kelasi zamon shakllaridan foydalaning.",
    sample:
      "We are going to visit Khiva in the summer holidays. We will go by plane from Tashkent because it is faster than the train. We will stay in a small hotel in the old town for three days. I want to walk on the old walls and see the beautiful minarets. My father is going to take lots of photos. We will also try local food, like shivit oshi. I think the weather will be very hot, so we will take hats and water.",
    expressions: [
      { en: "We are going to visit...", uz: "Biz ...ga bormoqchimiz." },
      { en: "We will go by plane / train / car.", uz: "Biz samolyotda / poyezdda / mashinada boramiz." },
      { en: "We will stay in a hotel.", uz: "Biz mehmonxonada qolamiz." },
      { en: "It is faster / cheaper than...", uz: "U ...dan tezroq / arzonroq." },
      { en: "I want to see...", uz: "Men ...ni ko‘rmoqchiman." },
    ],
  },
  {
    id: "s21",
    kind: "conversation",
    level: "B1",
    title: "Pocket money and saving",
    prompt:
      "Do you get pocket money? What do you spend it on? Do you try to save money? What would you like to save up for?",
    promptUz:
      "Cho‘ntak pulingiz bormi? Uni nimaga sarflaysiz? Pul yig‘ishga harakat qilasizmi va nima uchun yig‘moqchisiz? Fikringizni sabab bilan tushuntiring.",
    sample:
      "My parents give me a little pocket money every week, about twenty thousand som. I usually spend it on snacks at school and sometimes on small gifts for my friends. Last year I wasn't careful and I spent everything in two days. Now I try to save half of it in a box at home. I'm saving up for a new bike, which costs about a million som. I think saving is a good habit because it teaches you patience, and it feels great when you finally buy something with your own money.",
    expressions: [
      { en: "I get pocket money every week.", uz: "Men har hafta cho‘ntak puli olaman." },
      { en: "I spend it on...", uz: "Men uni ...ga sarflayman." },
      { en: "I'm saving up for...", uz: "Men ... uchun pul yig‘ayapman." },
      { en: "I try to save half of it.", uz: "Men uning yarmini yig‘ishga harakat qilaman." },
      { en: "It's a good habit.", uz: "Bu yaxshi odat." },
      { en: "I spent everything in two days.", uz: "Men hammasini ikki kunda sarfladim." },
    ],
  },
  {
    id: "s22",
    kind: "ielts",
    level: "B1",
    title: "IELTS Part 1: Music and films",
    prompt:
      "Let's talk about music and films. Do you like listening to music? What kind of music do you enjoy? Do you often go to the cinema? What kind of films do you like best?",
    promptUz:
      "IELTS 1-qism: musiqa va filmlar haqida qisqa savollar. Har bir savolga sabab qo‘shib, 2-3 gapdan iborat javob bering.",
    sample:
      "Yes, I do. I listen to music almost every day, usually on my headphones on the way to school. I enjoy pop and a bit of classical music, especially when I'm studying, because it helps me concentrate. As for films, I go to the cinema about once a month with my friends. I like adventure films and animated films best, because they are exciting and often have a good message. To be honest, I prefer watching films at home, since cinema tickets can be quite expensive.",
    expressions: [
      { en: "I listen to music almost every day.", uz: "Men deyarli har kuni musiqa tinglayman." },
      { en: "It helps me concentrate.", uz: "U diqqatimni jamlashga yordam beradi." },
      { en: "As for films,...", uz: "Filmlarga kelsak,..." },
      { en: "about once a month", uz: "oyiga taxminan bir marta" },
      { en: "I prefer watching... at home.", uz: "Men ...ni uyda ko‘rishni afzal ko‘raman." },
      { en: "since / because...", uz: "chunki..." },
    ],
  },
  {
    id: "s23",
    kind: "conversation",
    level: "B1",
    title: "A science lesson I enjoyed",
    prompt:
      "Tell me about a science lesson or experiment that you enjoyed. What did you do? What did you learn? Do you think science is important?",
    promptUz:
      "Sizga yoqqan fan darsi yoki tajriba haqida o‘tgan zamonda gapiring: nima qildingiz, nimani o‘rgandingiz va fan nega muhim deb o‘ylaysiz.",
    sample:
      "Last year in our physics class we made a battery from lemons. We pushed a copper coin and a zinc nail into each lemon and connected four lemons with wires. To our surprise, they gave enough electricity to light a small bulb. I learned that chemical reactions can produce energy, and I was amazed that it was so simple. I think science is very important because it explains how the world works and helps us solve problems, from curing diseases to protecting the environment.",
    expressions: [
      { en: "We did an experiment on...", uz: "Biz ... bo‘yicha tajriba o‘tkazdik." },
      { en: "To our surprise,...", uz: "Hayratimizga ko‘ra,..." },
      { en: "I learned that...", uz: "Men ... ekanini o‘rgandim." },
      { en: "I was amazed that...", uz: "Men ... ekaniga hayron qoldim." },
      { en: "It explains how...", uz: "U ... qanday ishlashini tushuntiradi." },
      { en: "It helps us solve problems.", uz: "U muammolarni hal qilishimizga yordam beradi." },
    ],
  },
  {
    id: "s24",
    kind: "ielts",
    level: "B1",
    title: "IELTS Part 1: Sport and keeping fit",
    prompt:
      "Let's talk about sport. Do you do any sport? Did you play sports when you were a child? Do you think it is important to exercise regularly? Is there a sport you would like to try?",
    promptUz:
      "IELTS 1-qism: sport haqidagi savollar. Hozirgi va o‘tgan zamonni ishlating, “Yes, I do” bilan cheklanmay, misol yoki sabab qo‘shing.",
    sample:
      "Yes, I do. I play football twice a week and I go swimming at the weekend. When I was younger, I played volleyball at school, but I stopped when I changed schools. I definitely think regular exercise is important, because it keeps you healthy and also helps you feel less stressed before exams. One sport I'd like to try is tennis. It looks difficult, but I think it would be a lot of fun.",
    expressions: [
      { en: "I play ... twice a week.", uz: "Men haftada ikki marta ... o‘ynayman." },
      { en: "When I was younger, I...", uz: "Kichikligimda men..." },
      { en: "It keeps you healthy.", uz: "U sizni sog‘lom saqlaydi." },
      { en: "It helps you feel less stressed.", uz: "U stressni kamaytirishga yordam beradi." },
      { en: "One sport I'd like to try is...", uz: "Men sinab ko‘rmoqchi bo‘lgan sport turlaridan biri..." },
      { en: "It would be a lot of fun.", uz: "Bu juda qiziqarli bo‘lardi." },
    ],
  },
  {
    id: "s25",
    kind: "ielts",
    level: "B2",
    title: "IELTS Part 2: Describe a film",
    prompt:
      "Describe a film that you enjoyed watching.\nYou should say:\n- what the film was\n- who was in it or who made it\n- what it was about\nand explain why you enjoyed it.",
    promptUz:
      "IELTS 2-qism (kartochka): 1 daqiqa tayyorlaning, so‘ng 1-2 daqiqa to‘xtamay gapiring. Film nomi, rejissyor yoki aktyorlar, syujet va nega yoqqanini albatta ayting.",
    sample:
      "I'd like to talk about a film called Inception, which was directed by Christopher Nolan. I watched it at home with my older brother about a year ago, and Leonardo DiCaprio plays the main character. The story is about a man who can enter other people's dreams to steal their secrets. In the film, he is given an almost impossible job: instead of stealing an idea, he has to plant one in someone's mind. The dreams happen inside other dreams, so the story is quite complicated.\n\nI enjoyed it for several reasons. First of all, the visual effects are amazing, especially the scene where a whole city folds over itself. Secondly, it made me think about the difference between dreams and reality. Finally, the music is so powerful that I still listen to it when I study. I'd recommend it to anyone who likes clever films.",
    expressions: [
      { en: "I'd like to talk about...", uz: "Men ... haqida gapirmoqchiman." },
      { en: "It was directed by...", uz: "Uni ... suratga olgan." },
      { en: "The story is about...", uz: "Voqea ... haqida." },
      { en: "The visual effects are amazing.", uz: "Vizual effektlar ajoyib." },
      { en: "It made me think about...", uz: "U meni ... haqida o‘ylashga majbur qildi." },
      { en: "I'd recommend it to anyone who...", uz: "Men uni ... har bir kishiga tavsiya qilaman." },
    ],
  },
  {
    id: "s26",
    kind: "ielts",
    level: "B2",
    title: "IELTS Part 2: Describe a piece of technology",
    prompt:
      "Describe a piece of technology that you use a lot.\nYou should say:\n- what it is\n- how often you use it\n- what you use it for\nand explain why it is important to you.",
    promptUz:
      "IELTS 2-qism: eng ko‘p ishlatadigan texnologik qurilmangizni tasvirlang. Tuzilishga rioya qiling: nima, qanchalik tez-tez, nima uchun va nega muhim.",
    sample:
      "I'd like to talk about my laptop, which is probably the piece of technology I use most. My parents bought it for me two years ago as a present for passing my exams, and it's silver and quite light, so I can carry it to school easily.\n\nI use it almost every day, usually for about three hours. Mainly I use it for homework and research, but I also watch English videos, practise with language apps and, to be honest, play games when I have some free time.\n\nThe reason it matters so much to me is that it gives me access to almost any information I need. Without it, I would have to spend hours in the library. Besides, it has helped me improve my English enormously, so I would feel quite lost if it broke down.",
    expressions: [
      { en: "the piece of technology I use most", uz: "men eng ko‘p ishlatadigan texnologiya" },
      { en: "I use it almost every day.", uz: "Men uni deyarli har kuni ishlataman." },
      { en: "I mainly use it for...", uz: "Men uni asosan ... uchun ishlataman." },
      { en: "It gives me access to...", uz: "U menga ...ga kirish imkonini beradi." },
      { en: "I would feel lost without it.", uz: "Usiz o‘zimni yo‘qotib qo‘ygan bo‘lardim." },
      { en: "Besides,...", uz: "Bundan tashqari,..." },
    ],
  },
  {
    id: "s27",
    kind: "conversation",
    level: "B2",
    title: "Protecting nature where I live",
    prompt:
      "What environmental problems are there in your city or region? What can ordinary people and the government do to protect nature? Do you do anything yourself?",
    promptUz:
      "Shahringiz yoki viloyatingizdagi ekologik muammolar qanday? Oddiy odamlar va davlat tabiatni asrash uchun nima qilishi mumkin? O‘zingiz nima qilasiz? Fikringizni misollar bilan asoslang.",
    sample:
      "One of the biggest problems in our region is air pollution in large cities, mainly because of heavy traffic and, in winter, heating. Water shortage is another serious issue, as the fate of the Aral Sea shows. Governments could invest in public transport, plant more trees and encourage farmers to use water more efficiently. Ordinary people can make a difference, too. In my family we sort our rubbish, take cloth bags to the market and switch off lights when we leave a room. These actions seem small, but if millions of people did the same, the result would be enormous.",
    expressions: [
      { en: "air / water pollution", uz: "havo / suv ifloslanishi" },
      { en: "water shortage", uz: "suv tanqisligi" },
      { en: "invest in public transport", uz: "jamoat transportiga sarmoya kiritish" },
      { en: "make a difference", uz: "o‘zgarish yasash, ta‘sir qilish" },
      { en: "sort rubbish / recycle", uz: "chiqindini saralash / qayta ishlash" },
      { en: "if millions of people did the same,...", uz: "agar millionlab odam shunday qilsa,..." },
    ],
  },
  {
    id: "s28",
    kind: "ielts",
    level: "B2",
    title: "IELTS Part 2: Describe a journey",
    prompt:
      "Describe a journey that you enjoyed.\nYou should say:\n- where you went\n- how you travelled\n- who you were with\nand explain why the journey was enjoyable.",
    promptUz:
      "IELTS 2-qism: sizga yoqqan safarni tasvirlang. O‘tgan zamon shakllaridan foydalaning va nima uchun u yoqimli bo‘lganini oxirida tushuntiring.",
    sample:
      "I'd like to describe a train journey I took last spring from Tashkent to Bukhara. I travelled with my cousin and our grandfather, who wanted to show us the city where he was born. We took a fast train, and the journey lasted about four hours.\n\nWhat made it so enjoyable was the scenery. Outside the window, we saw green fields, small villages and, later, the desert, which looked completely different from the landscape around Tashkent. Meanwhile, my grandfather told us stories about his childhood, and we laughed a lot. We also shared homemade samsa and drank hot tea, which tasted much better on the train.\n\nI think the main reason I enjoyed it was that I wasn't in a hurry. Instead of looking at my phone, I watched the world go by and talked to people I love. It was one of the most relaxing days of my life.",
    expressions: [
      { en: "I'd like to describe a journey I took...", uz: "Men o‘tgan ... safarimni tasvirlamoqchiman." },
      { en: "The journey lasted about...", uz: "Safar taxminan ... davom etdi." },
      { en: "What made it so enjoyable was...", uz: "Uni yoqimli qilgan narsa ... edi." },
      { en: "the scenery", uz: "manzara" },
      { en: "I wasn't in a hurry.", uz: "Men shoshilmayotgan edim." },
      { en: "It was one of the most... days of my life.", uz: "Bu hayotimdagi eng ... kunlardan biri edi." },
    ],
  },
  {
    id: "s29",
    kind: "ielts",
    level: "C1",
    title: "IELTS Part 3: Money and consumer culture",
    prompt:
      "Let's discuss money and shopping. Why do you think people often spend more than they can afford? Should schools teach children how to manage money? How might online shopping change the economy?",
    promptUz:
      "IELTS 3-qism: pul va iste‘mol madaniyati haqida chuqurroq muhokama. Sabab-oqibat bog‘lang, misol keltiring va ikkala tomonni ham ko‘rib chiqing.",
    sample:
      "I think there are several reasons. Advertising plays a huge role, because companies spend billions to convince us that we need things we actually don't. Social media makes it worse, since people compare their lifestyles and feel pressure to keep up. Easy credit also encourages people to buy now and worry later. I'm convinced schools should teach financial literacy, as many young people leave education without understanding budgets, interest or debt. As for online shopping, it has made buying effortless, which benefits big companies and consumers, but small local shops struggle to compete. On balance, the economy gains efficiency, yet society risks becoming overly materialistic.",
    expressions: [
      { en: "spend more than you can afford", uz: "imkoniyatidan ortiq sarflash" },
      { en: "keep up with others", uz: "boshqalardan qolishmaslik" },
      { en: "financial literacy", uz: "moliyaviy savodxonlik" },
      { en: "buy now and worry later", uz: "avval sotib olib, keyin o‘ylash" },
      { en: "On balance,...", uz: "Hammasini hisobga olganda,..." },
      { en: "overly materialistic", uz: "haddan tashqari moddiyatparast" },
    ],
  },
  {
    id: "s30",
    kind: "ielts",
    level: "C1",
    title: "IELTS Part 3: Science and society",
    prompt:
      "Let's talk about science and society. Should governments spend large amounts of money on scientific research, such as space exploration? Who should decide how new discoveries are used? What are the risks of scientific progress?",
    promptUz:
      "IELTS 3-qism: fan va jamiyat haqida muhokama. O‘z pozitsiyangizni bildiring, dalil keltiring, qarama-qarshi fikrni tan oling va xulosa qiling.",
    sample:
      "Personally, I believe governments should invest in scientific research, even when the benefits aren't immediate. Many everyday technologies, such as satellite navigation and the internet, grew out of projects that seemed impractical at first. Having said that, public money is limited, so priorities matter: tackling disease and climate change should arguably come first. As for who decides, I think it should be a combination of independent scientists, elected officials and the public, so that decisions are transparent. The main risks include misuse, such as autonomous weapons, and widening inequality if only wealthy countries benefit.",
    expressions: [
      { en: "Personally, I believe...", uz: "Shaxsan men ... deb hisoblayman." },
      { en: "grew out of...", uz: "...dan kelib chiqqan" },
      { en: "Having said that,...", uz: "Shunday bo‘lsa ham,..." },
      { en: "arguably", uz: "bahsli bo‘lsa-da, ehtimol" },
      { en: "so that decisions are transparent", uz: "qarorlar shaffof bo‘lishi uchun" },
      { en: "widening inequality", uz: "kuchayib borayotgan tengsizlik" },
    ],
  },
];
