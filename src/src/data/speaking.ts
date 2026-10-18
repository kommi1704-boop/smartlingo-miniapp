import type { SpeakingPrompt } from "../types";
import { SPEAKING_MORE } from './speaking-more';

const SPEAKING_BASE: SpeakingPrompt[] = [
  {
    id: "s01",
    kind: "conversation",
    level: "Pre-A1",
    title: "Introduce yourself",
    prompt: "Tell me about yourself. What is your name? How old are you? Where do you live? What do you like?",
    promptUz:
      "O‘zingizni tanishtiring: ismingiz, yoshingiz, yashash joyingiz va nimalarni yoqtirishingizni oddiy gaplar bilan ayting.",
    sample:
      "Hello! My name is Aziza. I am ten years old. I live in Tashkent. I am a student. I like cats and I like drawing. I have a small family. Nice to meet you!",
    expressions: [
      { en: "My name is...", uz: "Mening ismim..." },
      { en: "I am ... years old.", uz: "Men ... yoshdaman." },
      { en: "I live in...", uz: "Men ...da yashayman." },
      { en: "I like...", uz: "Menga ... yoqadi." },
      { en: "Nice to meet you!", uz: "Tanishganimdan xursandman!" },
    ],
  },
  {
    id: "s02",
    kind: "conversation",
    level: "A1",
    title: "My family",
    prompt: "Talk about your family. How many people are in your family? What do they do?",
    promptUz:
      "Oilangiz haqida gapiring: oilada necha kishi bor, ular kimlar va nima ish qilishadi.",
    sample:
      "There are five people in my family. I have a mother, a father, one brother and one grandmother. My father is a driver. My mother is a teacher. My brother is twelve. I love my family very much.",
    expressions: [
      { en: "There are ... people in my family.", uz: "Oilamizda ... kishi bor." },
      { en: "I have a brother / a sister.", uz: "Mening akam yoki ukam / opam yoki singlim bor." },
      { en: "He / She is a...", uz: "U ... (kasb egasi)." },
      { en: "He / She is ... years old.", uz: "U ... yoshda." },
      { en: "I love my family.", uz: "Men oilamni yaxshi ko‘raman." },
    ],
  },
  {
    id: "s03",
    kind: "conversation",
    level: "A1",
    title: "My school day",
    prompt: "Describe your school day. When do you get up? What lessons do you have? What do you do after school?",
    promptUz:
      "Maktab kuningizni vaqt tartibida tasvirlang: nechada turasiz, qanday darslar bor va maktabdan keyin nima qilasiz.",
    sample:
      "I get up at seven o'clock. I have breakfast and go to school by bus. Lessons start at eight. I like English and maths. After school I do my homework and play with my friends.",
    expressions: [
      { en: "I get up at...", uz: "Men soat ...da turaman." },
      { en: "I go to school by bus / on foot.", uz: "Maktabga avtobusda / piyoda boraman." },
      { en: "Lessons start at...", uz: "Darslar soat ...da boshlanadi." },
      { en: "My favourite subject is...", uz: "Mening sevimli fanim..." },
      { en: "After school, I...", uz: "Maktabdan keyin men..." },
    ],
  },
  {
    id: "s04",
    kind: "conversation",
    level: "A1",
    title: "My hobbies",
    prompt: "What do you like doing in your free time? Who do you do it with? How often?",
    promptUz:
      "Bo‘sh vaqtingizda nima qilishni yoqtirasiz? Kim bilan va qanchalik tez-tez shug‘ullanishingizni aytib bering.",
    sample:
      "My favourite hobby is football. I play it with my friends every Saturday in the park. I also like reading books and listening to music. I am not very good at drawing, but I want to learn.",
    expressions: [
      { en: "My favourite hobby is...", uz: "Mening sevimli mashg‘ulotim..." },
      { en: "I like playing / reading...", uz: "Menga ... o‘ynash / o‘qish yoqadi." },
      { en: "every Saturday", uz: "har shanba" },
      { en: "I am good at...", uz: "Men ...da yaxshiman." },
      { en: "I want to learn...", uz: "Men ...ni o‘rganmoqchiman." },
    ],
  },
  {
    id: "s05",
    kind: "conversation",
    level: "A2",
    title: "My favourite food",
    prompt: "What is your favourite food? Who makes it? What is in it? How often do you eat it?",
    promptUz:
      "Eng yaxshi ko‘rgan taomingiz haqida gapiring: uni kim pishiradi, nimalardan iborat va qanchalik tez-tez yeysiz.",
    sample:
      "My favourite food is plov. My grandmother makes the best plov in our family. It has rice, meat, carrots and onions. I eat it with salad and tea. I like pizza too, but it is not very healthy.",
    expressions: [
      { en: "My favourite food is...", uz: "Mening sevimli taomim..." },
      { en: "It is made of...", uz: "U ...dan tayyorlanadi." },
      { en: "It tastes delicious.", uz: "U juda mazali." },
      { en: "I eat it once a week.", uz: "Men uni haftada bir marta yeyman." },
      { en: "It is (not) healthy.", uz: "U foydali (emas)." },
    ],
  },
  {
    id: "s06",
    kind: "conversation",
    level: "A2",
    title: "My weekend plans",
    prompt: "What are you going to do this weekend? Who will you be with? What will you do if the weather is bad?",
    promptUz:
      "Shu dam olish kunlarida nima qilmoqchisiz? Kim bilan bo‘lasiz? Ob-havo yomon bo‘lsa-chi? Kelasi zamon shakllaridan foydalaning.",
    sample:
      "This weekend I am going to visit my cousins. On Saturday we are going to play football and have a picnic if the weather is good. On Sunday I will do my homework and help my mother.",
    expressions: [
      { en: "I am going to...", uz: "Men ... qilmoqchiman." },
      { en: "We are going to visit...", uz: "Biz ...ga mehmonga boramiz." },
      { en: "If the weather is good, we will...", uz: "Agar ob-havo yaxshi bo‘lsa, biz ... qilamiz." },
      { en: "On Saturday / On Sunday", uz: "Shanba kuni / Yakshanba kuni" },
      { en: "I will help my parents.", uz: "Men ota-onamga yordam beraman." },
    ],
  },
  {
    id: "s07",
    kind: "conversation",
    level: "B1",
    title: "Describe my best friend",
    prompt: "Describe your best friend. What does he or she look like? What is he or she like? Why are you friends?",
    promptUz:
      "Eng yaqin do‘stingizni tasvirlang: tashqi ko‘rinishi, xarakteri va nega aynan u bilan do‘st ekaningizni tushuntiring.",
    sample:
      "My best friend is called Jasur. He is tall, with short black hair and a friendly smile. We have been friends since we were six. He is funny and he always helps me with maths. He is the kindest person I know.",
    expressions: [
      { en: "He / She looks like...", uz: "U ...ga o‘xshaydi." },
      { en: "He / She is very kind / funny.", uz: "U juda mehribon / kulgili." },
      { en: "We have been friends since...", uz: "Biz ...dan beri do‘stmiz." },
      { en: "He / She always helps me with...", uz: "U menga doim ...da yordam beradi." },
      { en: "He / She is the ... person I know.", uz: "U men bilgan eng ... odam." },
    ],
  },
  {
    id: "s08",
    kind: "conversation",
    level: "B1",
    title: "A trip I remember",
    prompt: "Tell me about a trip you remember. Where did you go? Who with? What did you see and do? Would you go back?",
    promptUz:
      "Esda qolgan sayohatingiz haqida o‘tgan zamonda gapiring: qayerga, kim bilan borgansiz, nimalarni ko‘rdingiz va yana borasizmi.",
    sample:
      "Last summer I went to Samarkand with my family. We travelled by train and stayed in a small hotel near the Registan. I will never forget the beautiful blue buildings. The food was delicious, and the people were very kind. I would love to go back one day.",
    expressions: [
      { en: "Last summer I went to...", uz: "O‘tgan yozda men ...ga bordim." },
      { en: "We travelled by train / plane.", uz: "Biz poyezdda / samolyotda sayohat qildik." },
      { en: "I will never forget...", uz: "Men ...ni hech qachon unutmayman." },
      { en: "It was an unforgettable experience.", uz: "Bu unutilmas tajriba bo‘ldi." },
      { en: "I would love to go back.", uz: "Men yana u yerga borishni xohlardim." },
    ],
  },
  {
    id: "s09",
    kind: "ielts",
    level: "B1",
    title: "IELTS Part 1: Hometown and studies",
    prompt:
      "Let's talk about your hometown and your studies. Where are you from? What do you like about your hometown? What subject are you studying? Why did you choose it?",
    promptUz:
      "IELTS 1-qism: imtihonchi qisqa savollar beradi. Har bir savolga 2-3 gapdan iborat to‘liq javob bering, faqat “Yes” yoki “No” bilan cheklanmang.",
    sample:
      "I'm from Samarkand, which is one of the oldest cities in Uzbekistan. What I like most about it is the historic architecture and the friendly atmosphere. At the moment I'm studying at a secondary school, and my favourite subject is biology. I chose it because I'm fascinated by how the human body works, and I'd like to become a doctor in the future.",
    expressions: [
      { en: "I'm originally from...", uz: "Men asli ...lik man." },
      { en: "What I like most about it is...", uz: "Menga eng yoqadigan jihati..." },
      { en: "At the moment, I'm studying...", uz: "Hozir men ...ni o‘qiyapman." },
      { en: "I chose it because...", uz: "Men uni ... uchun tanladim." },
      { en: "I'm fascinated by...", uz: "Men ...ga qiziqaman." },
    ],
  },
  {
    id: "s10",
    kind: "ielts",
    level: "B2",
    title: "IELTS Part 2: Describe a book",
    prompt:
      "Describe a book that you enjoyed reading.\nYou should say:\n- what the book was\n- who wrote it\n- what it was about\nand explain why you enjoyed it.",
    promptUz:
      "IELTS 2-qism (kartochka): 1 daqiqa tayyorlaning, so‘ng 1-2 daqiqa to‘xtamay gapiring. Kartochkadagi to‘rtta bandning hammasiga javob bering.",
    sample:
      "I'd like to talk about a novel called The Alchemist, which was written by Paulo Coelho. I read it last year when my English teacher recommended it to me. The story is about a young shepherd called Santiago who dreams of finding a hidden treasure near the Egyptian pyramids. During his journey he meets many interesting people and learns important lessons about life, courage and following your dreams.\n\nThere are several reasons why I enjoyed it so much. Firstly, the language is simple but beautiful, so it was easy for me to follow even though it was in English. Secondly, the main message really inspired me: it taught me that we should never give up, even when things get difficult. What's more, I could relate to Santiago because I also have big dreams for the future. To be honest, I finished it in just three days, and I've already read it twice. I would definitely recommend it to anyone who wants to feel motivated.",
    expressions: [
      { en: "I'd like to talk about...", uz: "Men ... haqida gapirmoqchiman." },
      { en: "The story is about...", uz: "Voqea ... haqida." },
      { en: "There are several reasons why...", uz: "... bo‘lishining bir necha sababi bor." },
      { en: "I could relate to...", uz: "Men ...ni yaxshi tushundim, o‘zimga yaqin his qildim." },
      { en: "To be honest,...", uz: "Rostini aytsam,..." },
      { en: "I would definitely recommend it.", uz: "Men uni albatta tavsiya qilaman." },
    ],
  },
  {
    id: "s11",
    kind: "ielts",
    level: "B2",
    title: "IELTS Part 2: Describe a place",
    prompt:
      "Describe a place you would like to visit in the future.\nYou should say:\n- where it is\n- how you would travel there\n- what you would do there\nand explain why you want to go there.",
    promptUz:
      "IELTS 2-qism: kelajakda borishni istagan joyingizni tasvirlang. “Would” bilan shartli gaplardan foydalaning va oxirida sababini tushuntiring.",
    sample:
      "One place I'd really love to visit is Japan, especially the city of Kyoto. I've wanted to go there for several years, ever since I watched a documentary about its ancient temples and traditional gardens. I would probably fly there from Tashkent, with one change on the way, because there is no direct flight, as far as I know.\n\nIf I had the chance, I would spend about two weeks there. I'd walk through the famous bamboo forest, visit the old wooden temples and try authentic Japanese food, such as sushi and ramen. I would also like to wear a traditional kimono and take plenty of photos.\n\nThe main reason I want to go is that Japan combines tradition and modern technology in a really unique way. I'm also curious about the culture, because people there are known for being polite and hard-working. I believe the trip would broaden my horizons and teach me a lot.",
    expressions: [
      { en: "One place I'd really love to visit is...", uz: "Men albatta borishni istagan joylardan biri..." },
      { en: "If I had the chance, I would...", uz: "Agar imkonim bo‘lsa, men ... qilardim." },
      { en: "as far as I know", uz: "men bilishimcha" },
      { en: "The main reason is that...", uz: "Asosiy sabab shuki..." },
      { en: "It would broaden my horizons.", uz: "Bu dunyoqarashimni kengaytirardi." },
    ],
  },
  {
    id: "s12",
    kind: "ielts",
    level: "C1",
    title: "IELTS Part 3: Technology and education",
    prompt:
      "Let's discuss technology and education. How has technology changed the way young people learn? Do you think technology will ever replace teachers? Why or why not?",
    promptUz:
      "IELTS 3-qism: murakkabroq muhokama savollari. Fikringizni bildiring, sabab va misol keltiring, ikkala tomonni ham ko‘rib chiqing.",
    sample:
      "Technology has transformed education in many ways. Nowadays students can access lessons, videos and practice exercises at any time, which makes learning far more flexible than it used to be. Apps can also adapt to each learner's level, something a teacher with thirty students can rarely do. However, I don't think technology will ever fully replace teachers. A teacher doesn't just deliver information; they motivate students, notice when someone is struggling and teach social skills. Moreover, excessive screen time may reduce concentration. In my opinion, the ideal solution is a blend: technology for personalised practice and teachers for guidance and inspiration.",
    expressions: [
      { en: "In my opinion,...", uz: "Mening fikrimcha,..." },
      { en: "On the one hand..., on the other hand...", uz: "Bir tomondan..., ikkinchi tomondan..." },
      { en: "It depends on...", uz: "Bu ...ga bog‘liq." },
      { en: "Moreover, / What's more,...", uz: "Bundan tashqari,..." },
      { en: "There is a risk that...", uz: "... xavfi bor." },
      { en: "The ideal solution is a blend of...", uz: "Eng yaxshi yechim ...ning uyg‘unligi." },
    ],
  },
];

export const SPEAKING_CHECKLIST: string[] = [
  "Men javobimni to‘liq gap bilan aytdim.",
  "Men savolga aniq va mavzuga mos javob berdim.",
  "Men kamida bitta foydali ibora ishlatdim.",
  "Men sekin, tiniq va o‘z vaqtida to‘xtab gapirdim.",
  "Men fikrimga sabab yoki misol qo‘shdim.",
  "Men to‘g‘ri zamondan foydalandim.",
];

export const SPEAKING: SpeakingPrompt[] = [...SPEAKING_BASE, ...SPEAKING_MORE];
