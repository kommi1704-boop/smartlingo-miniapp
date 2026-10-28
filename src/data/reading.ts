import type { ReadingPassage } from '../types';
import { READING_MORE } from './reading-more';
import { READING_EXTENDED } from './reading-extended';

const READING_BASE: ReadingPassage[] = [
  {
    id: "r01",
    title: "My Family",
    level: "Pre-A1",
    text: `My name is Aziza. I am nine. I have a small family. My father is a driver. My mother is a teacher. I have one brother. His name is Timur. We live in a house. I love my family.`,
    vocab: [
      { en: "family", uz: "oila" },
      { en: "small", uz: "kichik" },
      { en: "driver", uz: "haydovchi" },
      { en: "teacher", uz: "o‘qituvchi" },
      { en: "brother", uz: "aka yoki uka" },
      { en: "live", uz: "yashamoq" },
      { en: "house", uz: "uy (hovli uy)" },
    ],
    questions: [
      {
        id: "r01-q1",
        q: "How old is Aziza?",
        options: ["Seven", "Eight", "Nine", "Ten"],
        answer: 2,
        explain: "Matnda “I am nine” deyilgan, ya’ni Aziza to‘qqiz yoshda.".replace("’", "‘"),
      },
      {
        id: "r01-q2",
        q: "What is Aziza's mother's job?",
        options: ["She is a driver.", "She is a teacher.", "She is a doctor.", "She is a cook."],
        answer: 1,
        explain: "“My mother is a teacher” jumlasi onasi o‘qituvchi ekanini bildiradi. Haydovchi esa uning otasi.",
      },
      {
        id: "r01-q3",
        q: "Who is Timur?",
        options: ["Aziza's brother", "Aziza's cousin", "Aziza's friend", "Aziza's father"],
        answer: 0,
        explain: "“I have one brother. His name is Timur” – Timur Azizaning akasi (yoki ukasi).",
      },
      {
        id: "r01-q4",
        q: "Where does Aziza's family live?",
        options: ["In a car", "In a shop", "In a school", "In a house"],
        answer: 3,
        explain: "Matnda “We live in a house” deb yozilgan, ya’ni ular uyda yashaydi.".replace("’", "‘"),
      },
    ],
  },
  {
    id: "r02",
    title: "A Day at School",
    level: "A1",
    text: `Timur gets up at seven o'clock every morning. He has breakfast with his family and then walks to school. School starts at eight. Timur has five lessons every day. His favourite lesson is English because his teacher is very kind. At twelve o'clock he has lunch in the school canteen with his friends. After school he plays football for one hour. In the evening he does his homework and goes to bed at nine.`,
    vocab: [
      { en: "breakfast", uz: "nonushta" },
      { en: "lesson", uz: "dars" },
      { en: "favourite", uz: "sevimli" },
      { en: "kind", uz: "mehribon" },
      { en: "lunch", uz: "tushlik" },
      { en: "canteen", uz: "maktab oshxonasi" },
      { en: "homework", uz: "uy vazifasi" },
    ],
    questions: [
      {
        id: "r02-q1",
        q: "How does Timur get to school?",
        options: ["By bus", "By car", "On foot", "By bike"],
        answer: 2,
        explain: "“He has breakfast ... and then walks to school” – u maktabga piyoda boradi.",
      },
      {
        id: "r02-q2",
        q: "Why does Timur like English?",
        options: ["The lessons are short.", "His teacher is very kind.", "He plays games in class.", "His friends are in the class."],
        answer: 1,
        explain: "Matnda “because his teacher is very kind” deyilgan: o‘qituvchisi juda mehribon.",
      },
      {
        id: "r02-q3",
        q: "What does Timur do after school?",
        options: ["He plays football.", "He has breakfast.", "He starts his lessons.", "He has lunch."],
        answer: 0,
        explain: "“After school he plays football for one hour” – maktabdan keyin u bir soat futbol o‘ynaydi.",
      },
      {
        id: "r02-q4",
        q: "Where does Timur have lunch?",
        options: ["In the park", "At home", "In a café", "In the school canteen"],
        answer: 3,
        explain: "“At twelve o'clock he has lunch in the school canteen” – tushlikni maktab oshxonasida qiladi.",
      },
    ],
  },
  {
    id: "r03",
    title: "My Room and My Pet",
    level: "A1",
    text: `My name is Dilnoza and I am eleven years old. I have a small room in our house. There is a bed, a desk and a window in my room. On the wall there are many pictures of animals because I love them. I also have a pet. It is a rabbit and its name is Snow. Snow is white and very soft. He eats carrots and grass. Every morning I give him food and clean water. In the afternoon he runs around the garden and I play with him.`,
    vocab: [
      { en: "wall", uz: "devor" },
      { en: "pet", uz: "uy hayvoni" },
      { en: "rabbit", uz: "quyon" },
      { en: "soft", uz: "yumshoq" },
      { en: "carrot", uz: "sabzi" },
      { en: "grass", uz: "o‘t" },
      { en: "clean", uz: "toza" },
      { en: "garden", uz: "bog‘" },
    ],
    questions: [
      {
        id: "r03-q1",
        q: "How old is Dilnoza?",
        options: ["Eleven", "Ten", "Twelve", "Nine"],
        answer: 0,
        explain: "Birinchi gapda “I am eleven years old” deyilgan: Dilnoza o‘n bir yoshda.",
      },
      {
        id: "r03-q2",
        q: "What is on the wall of her room?",
        options: ["A big clock", "A map", "Photos of her family", "Pictures of animals"],
        answer: 3,
        explain: "“On the wall there are many pictures of animals” – devorda hayvonlar rasmlari bor.",
      },
      {
        id: "r03-q3",
        q: "What does Snow eat?",
        options: ["Meat and milk", "Carrots and grass", "Fish and rice", "Bread and cheese"],
        answer: 1,
        explain: "“He eats carrots and grass” – quyon sabzi va o‘t yeydi.",
      },
      {
        id: "r03-q4",
        q: "When does Snow run around the garden?",
        options: ["In the morning", "At night", "In the afternoon", "In the evening"],
        answer: 2,
        explain: "“In the afternoon he runs around the garden” – tushdan keyin bog‘da yuguradi. Ertalab esa Dilnoza unga ovqat beradi.",
      },
    ],
  },
  {
    id: "r04",
    title: "A Weekend Trip",
    level: "A2",
    text: `Last Saturday, Timur and his family went to the mountains near Chimgan. They left home at six o'clock in the morning because the road was long. His father drove the car and his mother made sandwiches for the journey. After two hours, they arrived at a beautiful valley.

First, they walked along a river for about an hour. Timur's sister, Madina, took a lot of photos of the flowers. Then they had a picnic under a big tree. After lunch, Timur wanted to climb a small hill, but his father said it was too dangerous without a guide. They played football instead. In the evening they were tired but happy. Timur said, "This was the best weekend of the year!"`,
    vocab: [
      { en: "journey", uz: "safar, yo‘l" },
      { en: "valley", uz: "vodiy" },
      { en: "picnic", uz: "piknik" },
      { en: "climb", uz: "chiqmoq, tırmashmoq".replace("ı", "i") },
      { en: "dangerous", uz: "xavfli" },
      { en: "guide", uz: "yo‘lboshchi, gid" },
      { en: "instead", uz: "uning o‘rniga" },
      { en: "tired", uz: "charchagan" },
    ],
    questions: [
      {
        id: "r04-q1",
        q: "Why did the family leave home so early?",
        options: ["The weather was bad.", "The road was long.", "Timur had school.", "They wanted to buy food."],
        answer: 1,
        explain: "Matnda “because the road was long” deyilgan: yo‘l uzoq bo‘lgani uchun erta chiqishgan.",
      },
      {
        id: "r04-q2",
        q: "Who took photos of the flowers?",
        options: ["Madina", "Timur", "His mother", "His father"],
        answer: 0,
        explain: "“Timur's sister, Madina, took a lot of photos of the flowers” – rasmga Madina oldi.",
      },
      {
        id: "r04-q3",
        q: "Why did Timur not climb the hill?",
        options: ["He was too tired.", "It was raining.", "There was no time.", "His father said it was too dangerous without a guide."],
        answer: 3,
        explain: "Otasi “too dangerous without a guide” degan, shuning uchun ular futbol o‘ynashdi.",
      },
      {
        id: "r04-q4",
        q: "In the text, the word “journey” means ...",
        options: ["a kind of sandwich", "a mountain", "a type of car", "a trip from one place to another"],
        answer: 3,
        explain: "Onasi “sandwiches for the journey” tayyorlagan, ya’ni uzoq yo‘lga. “Journey” – bir joydan boshqa joyga safar.",
      },
    ],
  },
  {
    id: "r05",
    title: "Healthy Food",
    level: "A2",
    text: `Many children like fast food, sweets and fizzy drinks. These things taste good, but they are not very healthy. If you eat them every day, you can get tired easily and you may have problems with your teeth.

A healthy diet is not difficult. You should eat fruit and vegetables every day. Bread, rice and potatoes give you energy for school and sports. You also need protein, which you can find in meat, fish, eggs and beans. Milk and yogurt are good for your bones.

Of course, you don't have to stop eating sweets completely. You can have a small piece of cake at a birthday party. The important thing is to eat a variety of food and not too much sugar. It is also a good idea to drink water instead of fizzy drinks. Finally, don't skip breakfast.`,
    vocab: [
      { en: "fizzy drinks", uz: "gazlangan ichimliklar" },
      { en: "healthy", uz: "sog‘lom, foydali" },
      { en: "diet", uz: "ovqatlanish tartibi" },
      { en: "energy", uz: "quvvat, energiya" },
      { en: "protein", uz: "oqsil" },
      { en: "bones", uz: "suyaklar" },
      { en: "a variety of", uz: "xilma-xil" },
      { en: "skip", uz: "o‘tkazib yubormoq" },
    ],
    questions: [
      {
        id: "r05-q1",
        q: "What can happen if you eat fast food and sweets every day?",
        options: ["You can get tired easily.", "You will grow taller.", "You will sleep more.", "You will run faster."],
        answer: 0,
        explain: "Birinchi xatboshida “you can get tired easily and you may have problems with your teeth” deyilgan.",
      },
      {
        id: "r05-q2",
        q: "Which food gives you protein, according to the text?",
        options: ["Rice", "Beans", "Bread", "Potatoes"],
        answer: 1,
        explain: "“You also need protein, which you can find in meat, fish, eggs and beans” – oqsil loviyada bor. Non, guruch va kartoshka esa energiya beradi.",
      },
      {
        id: "r05-q3",
        q: "What does the writer say about sweets?",
        options: ["Never eat them.", "Eat them only at school.", "A small amount sometimes is fine.", "Eat them instead of lunch."],
        answer: 2,
        explain: "“You don't have to stop eating sweets completely” va “a small piece of cake” – ozgina shirinlik vaqti-vaqti bilan mumkin.",
      },
      {
        id: "r05-q4",
        q: "In the last sentence, “don't skip breakfast” means ...",
        options: ["eat breakfast quickly", "cook breakfast for others", "eat a very big breakfast", "do not miss breakfast"],
        answer: 3,
        explain: "“Skip” – biror narsani qoldirib ketmoq. “Don't skip breakfast” – nonushtani tashlab ketma, degani.",
      },
    ],
  },
  {
    id: "r06",
    title: "The New Student",
    level: "B1",
    text: `When Aziza walked into her new classroom on Monday morning, her heart was beating fast. Her family had moved from Samarkand to Tashkent over the summer because of her father's job, and now she had to start again at a school where she knew nobody. She sat at the back of the room and tried not to look nervous.

During the first lesson, the teacher asked everyone to introduce themselves. Aziza's voice shook a little, but she managed to say that she loved drawing and playing the piano. To her surprise, a girl named Malika smiled at her and whispered, "I play the piano too!"

At break, Malika invited Aziza to sit with her group. At first Aziza felt shy, although everyone was friendly and asked her lots of questions about Samarkand. By the end of the day, she had agreed to join the school music club.

On the bus home, Aziza realised that her fears had been unnecessary. Of course, she still missed her old friends, but she was no longer afraid of tomorrow. Making new friends, she thought, was not as difficult as she had imagined.`,
    vocab: [
      { en: "nervous", uz: "hayajonlangan, xavotirli" },
      { en: "introduce themselves", uz: "o‘zini tanishtirmoq" },
      { en: "whisper", uz: "pichirlamoq" },
      { en: "invite", uz: "taklif qilmoq" },
      { en: "shy", uz: "uyatchan" },
      { en: "realise", uz: "anglab yetmoq" },
      { en: "unnecessary", uz: "keraksiz" },
      { en: "miss", uz: "sog‘inmoq" },
    ],
    questions: [
      {
        id: "r06-q1",
        q: "Why did Aziza's family move to Tashkent?",
        options: ["Aziza wanted a new school.", "Her father got a job there.", "Her grandmother lived there.", "There were better music teachers."],
        answer: 1,
        explain: "“because of her father's job” – oila otasining ishi tufayli Toshkentga ko‘chib o‘tgan.",
      },
      {
        id: "r06-q2",
        q: "How did Aziza and Malika first connect?",
        options: ["They both played the piano.", "They sat together on the bus.", "The teacher introduced them.", "They were both from Samarkand."],
        answer: 0,
        explain: "Aziza pianino chalishini aytganda, Malika “I play the piano too!” deb pichirladi – ularni musiqa bog‘ladi.",
      },
      {
        id: "r06-q3",
        q: "How does Aziza feel at the end of the day?",
        options: ["Still very afraid", "Angry about moving", "More confident and hopeful", "Bored at her new school"],
        answer: 2,
        explain: "U “no longer afraid of tomorrow” va yangi do‘st orttirish qiyin emasligini tushunadi – demak, o‘ziga ishonchi ortgan.",
      },
      {
        id: "r06-q4",
        q: "“Her fears had been unnecessary” means that her fears ...",
        options: ["were very strong", "were a secret", "were completely new", "were not needed because nothing bad happened"],
        answer: 3,
        explain: "“Unnecessary” – keraksiz. Aziza qo‘rqqan narsalari bo‘lmadi, do‘stlar topdi, shuning uchun qo‘rquvlar behuda edi.",
      },
    ],
  },
  {
    id: "r07",
    title: "Social Media and Teenagers",
    level: "B1",
    text: `Most teenagers today spend several hours a day on social media. They chat with friends, watch short videos and share photos. There are certainly some benefits. Social media helps young people stay in touch with relatives who live far away, and it can be a great place to find information or discover new hobbies.

However, there are also serious problems. Many teenagers compare their lives with the perfect pictures they see online, and this can make them feel unhappy about themselves. Others stay up late scrolling on their phones, so they are tired at school the next day. Another danger is that people sometimes say unkind things online that they would never say face to face.

So what should we do? Experts do not say that teenagers must stop using social media completely. Instead, they suggest setting limits. For example, you could keep your phone out of the bedroom at night, or decide to use it for only one hour after finishing your homework. It is also important to remember that photos online do not always show real life. Social media can be useful, but only if we control it, and it does not control us.`,
    vocab: [
      { en: "benefit", uz: "foyda, afzallik" },
      { en: "relatives", uz: "qarindoshlar" },
      { en: "compare", uz: "solishtirmoq" },
      { en: "scroll", uz: "ekranni surib ko‘rmoq" },
      { en: "unkind", uz: "bag‘rikengsiz, qo‘pol" },
      { en: "expert", uz: "mutaxassis" },
      { en: "limit", uz: "cheklov, chegara" },
      { en: "completely", uz: "butunlay" },
    ],
    questions: [
      {
        id: "r07-q1",
        q: "Which benefit of social media does the text mention?",
        options: [
          "It helps teenagers keep in touch with relatives far away.",
          "It helps teenagers sleep better.",
          "It improves their handwriting.",
          "It gives them free phones.",
        ],
        answer: 0,
        explain: "Birinchi xatboshida “helps young people stay in touch with relatives who live far away” deyilgan.",
      },
      {
        id: "r07-q2",
        q: "Why might some teenagers feel unhappy about themselves?",
        options: [
          "They have too much homework.",
          "Their phones are old.",
          "They compare their lives with perfect pictures online.",
          "They have no friends.",
        ],
        answer: 2,
        explain: "“Many teenagers compare their lives with the perfect pictures they see online” – shu ularni xafa qilishi mumkin.",
      },
      {
        id: "r07-q3",
        q: "What does the writer suggest about photos online?",
        options: [
          "They always show real life.",
          "They do not always show real life.",
          "They are usually very old.",
          "They are bad for phones.",
        ],
        answer: 1,
        explain: "“Photos online do not always show real life” – internetdagi suratlar haqiqiy hayotni doim ko‘rsatavermaydi.",
      },
      {
        id: "r07-q4",
        q: "What does “it does not control us” in the last sentence mean?",
        options: [
          "Phones should be turned off all day.",
          "Social media is always dangerous.",
          "Teenagers should delete all their friends.",
          "We should not let social media take over our lives.",
        ],
        answer: 3,
        explain: "Muallif ijtimoiy tarmoqni nazorat qilish kerakligini, u bizni boshqarib qo‘ymasligi lozimligini aytadi.",
      },
    ],
  },
  {
    id: "r08",
    title: "Why Sleep Matters",
    level: "B2",
    text: `Many teenagers believe that sleeping is a waste of time, especially during exam season, when it seems more productive to study until midnight. Scientists, however, have discovered that this belief is almost entirely mistaken. Sleep is not simply a period of rest; during the night, the brain is surprisingly active, sorting the information we have gathered during the day and storing the important parts in long-term memory.

Adolescents need between eight and ten hours of sleep each night, yet surveys suggest that a large proportion of them get considerably less. The consequences are noticeable. Students who are short of sleep find it harder to concentrate, make more mistakes, and are more likely to feel anxious or irritable. Over time, chronic tiredness can even weaken the immune system, which makes it easier to catch infections.

Part of the problem is biological. During puberty, the body clock shifts, so teenagers naturally feel sleepy later in the evening than children or adults do. Unfortunately, school usually begins early, which leaves many young people permanently exhausted. Bright screens make matters worse, because the light they emit tricks the brain into thinking it is still daytime.

Fortunately, simple habits can help. Going to bed at the same time every night, avoiding caffeine in the afternoon and switching off devices an hour before sleep all improve the quality of rest. The student who sleeps well tomorrow night may well outperform the one who stays awake with the textbooks.`,
    vocab: [
      { en: "productive", uz: "samarali" },
      { en: "adolescent", uz: "o‘smir" },
      { en: "anxious", uz: "xavotirli" },
      { en: "chronic", uz: "surunkali, uzoq davom etadigan" },
      { en: "immune system", uz: "immunitet tizimi" },
      { en: "exhausted", uz: "juda charchagan" },
      { en: "emit", uz: "chiqarmoq (nur, tovush)" },
      { en: "outperform", uz: "yaxshiroq natija ko‘rsatmoq" },
    ],
    questions: [
      {
        id: "r08-q1",
        q: "According to the text, what does the brain do during sleep?",
        options: [
          "It stops working completely.",
          "It sorts and stores information from the day.",
          "It grows new bones.",
          "It forgets everything we learned.",
        ],
        answer: 1,
        explain: "Birinchi xatboshida miya tunda “sorting the information ... and storing the important parts in long-term memory” deyilgan.",
      },
      {
        id: "r08-q2",
        q: "Why do teenagers naturally feel sleepy later in the evening?",
        options: [
          "They drink too much caffeine.",
          "They have more homework than adults.",
          "They sleep too much during the day.",
          "Their body clock shifts during puberty.",
        ],
        answer: 3,
        explain: "“During puberty, the body clock shifts” – balog‘at davrida tana soati o‘zgaradi, shuning uchun kechroq uyqu keladi.",
      },
      {
        id: "r08-q3",
        q: "What does the writer imply in the final sentence?",
        options: [
          "Sleeping well can lead to better results than studying all night.",
          "Textbooks are useless for exams.",
          "Students should never study in the evening.",
          "Exams are easy for everyone.",
        ],
        answer: 0,
        explain: "Yaxshi uxlagan o‘quvchi kitob bilan tun bo‘yi uyg‘oq o‘tirganidan “may well outperform” – ya’ni yaxshiroq natija ko‘rsatishi mumkin.",
      },
      {
        id: "r08-q4",
        q: "In the text, “chronic tiredness” is tiredness that ...",
        options: [
          "comes very suddenly",
          "happens only before exams",
          "lasts for a long time",
          "is caused only by screens",
        ],
        answer: 2,
        explain: "“Over time, chronic tiredness...” – vaqt o‘tishi bilan ta‘sir qiladi, demak, bu uzoq davom etadigan charchoq.".replace("ta‘sir", "kuchayib"),
      },
    ],
  },
  {
    id: "r09",
    title: "Learning a Language",
    level: "B2",
    text: `Learning a foreign language is often described as a long and frustrating journey, but research suggests that the way we approach it matters far more than natural talent. Many learners assume they need to be gifted, or that they should have started as small children. In reality, adults and teenagers can learn quickly, provided that they use effective strategies.

One of the most important factors is consistency. Twenty minutes of practice every day is considerably more beneficial than a three-hour session once a week, because regular repetition helps the brain to retain new words instead of forgetting them. Another key factor is exposure. Learners who listen to songs, watch films with subtitles and read stories in the target language gradually absorb grammar patterns without having to memorise endless rules.

Equally important is the willingness to make mistakes. Some students are so afraid of sounding foolish that they remain silent in class, yet speaking is exactly what develops fluency. Errors are not a sign of failure; they show that the learner is experimenting and, therefore, progressing. Teachers often point out that the most successful students are not those who never make mistakes, but those who learn from them.

Finally, motivation plays a decisive role. People who have a personal reason for learning, such as travelling, studying abroad or communicating with an online friend, are likelier to persevere when the process becomes difficult. Setting small, realistic goals, for instance, understanding a favourite song or ordering a meal in a restaurant, makes progress visible and keeps enthusiasm high. Ultimately, language learning is less a sprint than a marathon.`,
    vocab: [
      { en: "frustrating", uz: "zerikarli, asabiylashtiradigan" },
      { en: "gifted", uz: "iqtidorli" },
      { en: "consistency", uz: "muntazamlik" },
      { en: "retain", uz: "esda saqlab qolmoq" },
      { en: "exposure", uz: "til muhitida bo‘lish, duch kelish" },
      { en: "fluency", uz: "ravon gapirish" },
      { en: "persevere", uz: "sabr bilan davom ettirmoq" },
      { en: "decisive", uz: "hal qiluvchi" },
    ],
    questions: [
      {
        id: "r09-q1",
        q: "According to the writer, what matters more than natural talent?",
        options: [
          "The age at which you start",
          "The way you approach learning",
          "The size of your school",
          "The number of books you own",
        ],
        answer: 1,
        explain: "Birinchi gapda “the way we approach it matters far more than natural talent” deyilgan – o‘rganish usuli iqtidordan muhimroq.",
      },
      {
        id: "r09-q2",
        q: "Why is twenty minutes every day better than three hours once a week?",
        options: [
          "It costs less money.",
          "Teachers prefer short lessons.",
          "Regular repetition helps the brain retain new words.",
          "Grammar becomes easier to write.",
        ],
        answer: 2,
        explain: "“Regular repetition helps the brain to retain new words instead of forgetting them” – muntazam takrorlash so‘zlarni yaxshiroq eslab qolishga yordam beradi.",
      },
      {
        id: "r09-q3",
        q: "What attitude to mistakes does the writer recommend?",
        options: [
          "Avoid speaking until you are perfect.",
          "Ignore them completely.",
          "Feel ashamed of them.",
          "Treat them as a sign of progress.",
        ],
        answer: 3,
        explain: "“Errors are not a sign of failure; they show that the learner is ... progressing” – xatolar o‘sish belgisi, uyat emas.",
      },
      {
        id: "r09-q4",
        q: "What does “language learning is less a sprint than a marathon” suggest?",
        options: [
          "It needs effort over a long period of time.",
          "It is a kind of sport.",
          "It can be finished very quickly.",
          "It should only be done outdoors.",
        ],
        answer: 0,
        explain: "Sprint – qisqa tez yugurish, marafon – uzoq masofa. Demak, til o‘rganish uzoq vaqt davomida sabr va mehnat talab qiladi.",
      },
    ],
  },
  {
    id: "r10",
    title: "Learning in the Age of AI",
    level: "C1",
    text: `Few developments have provoked as much debate in recent years as the rise of artificial intelligence. Predictions range from the utopian to the apocalyptic: some commentators foresee a world in which machines liberate humanity from drudgery, while others warn of mass unemployment. The truth, as is often the case, probably lies somewhere in between.

History offers a useful perspective. When mechanised looms appeared in the nineteenth century, many weavers feared that their livelihoods would vanish. Certain jobs did disappear, but new occupations emerged that nobody had anticipated. What changed most profoundly was not the quantity of work, but its nature. Analysts suggest that something similar is happening now: routine tasks, such as entering data or translating simple texts, are increasingly automated, whereas roles demanding creativity, empathy and complex judgement remain stubbornly human.

This has far-reaching implications for education. If facts can be retrieved in seconds, there is little point in training students merely to memorise them. Schools may therefore need to prioritise skills that are harder to replicate: critical thinking, collaboration, adaptability and the ability to evaluate sources of information. Ironically, the more sophisticated our tools become, the more valuable our distinctly human qualities appear to be.

Nevertheless, optimism should not breed complacency. Access to technology remains unequal, and children without reliable internet connections risk falling further behind. Furthermore, an over-reliance on automated assistance may erode the very abilities that education seeks to cultivate. Policymakers must ensure that technology supplements rather than supplants the effort of learning. Today's students will spend their careers in a landscape we can barely imagine; the best preparation we can offer is not a fixed body of knowledge, but the capacity to keep learning.`,
    vocab: [
      { en: "drudgery", uz: "zerikarli, charchatuvchi mehnat" },
      { en: "livelihood", uz: "tirikchilik manbai" },
      { en: "automated", uz: "avtomatlashtirilgan" },
      { en: "empathy", uz: "hamdardlik, boshqani his qilish" },
      { en: "replicate", uz: "takrorlamoq, nusxalamoq" },
      { en: "complacency", uz: "o‘zidan qoniqib, beparvo bo‘lish" },
      { en: "erode", uz: "asta-sekin yemirmoq" },
      { en: "supplant", uz: "o‘rnini egallamoq" },
    ],
    questions: [
      {
        id: "r10-q1",
        q: "What point does the example of mechanised looms illustrate?",
        options: [
          "New technology tends to change the nature of work rather than simply remove it.",
          "Weavers refused to use machines.",
          "Machines never replace human workers.",
          "Industry was small in the nineteenth century.",
        ],
        answer: 0,
        explain: "Matnda “Certain jobs did disappear, but new occupations emerged” va “What changed most profoundly was ... its nature” deyilgan.",
      },
      {
        id: "r10-q2",
        q: "Which skills does the writer say schools should prioritise?",
        options: [
          "Memorising facts quickly",
          "Typing and handwriting",
          "Critical thinking and adaptability",
          "Computer programming only",
        ],
        answer: 2,
        explain: "Uchinchi xatboshida “critical thinking, collaboration, adaptability” kabi takrorlash qiyin ko‘nikmalar sanab o‘tilgan.",
      },
      {
        id: "r10-q3",
        q: "What does “optimism should not breed complacency” mean?",
        options: [
          "We should stop using technology.",
          "Hopeful people always make mistakes.",
          "Technology will certainly fix all problems.",
          "We can be hopeful, but must not assume problems will solve themselves.",
        ],
        answer: 3,
        explain: "Shundan keyin muallif teng bo‘lmagan imkoniyatlar va haddan ortiq tayanish xavfini eslatadi: umid bo‘lsin, lekin beparvolik bo‘lmasin.",
      },
      {
        id: "r10-q4",
        q: "“Technology supplements rather than supplants the effort of learning” implies that technology should ...",
        options: [
          "do the learning for students",
          "support learning without replacing students' own effort",
          "be banned from classrooms",
          "be used only by teachers",
        ],
        answer: 1,
        explain: "“Supplement” – to‘ldirmoq, “supplant” – o‘rnini bosmoq. Texnologiya o‘quvchining mehnatini to‘ldirishi kerak, uning o‘rniga o‘tmasligi lozim.",
      },
    ],
  },
];

export const READING: ReadingPassage[] = [...READING_BASE, ...READING_MORE, ...READING_EXTENDED];
