import type { ReadingPassage } from '../types';

export const READING: ReadingPassage[] = [
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
   {
    id: "r11",
    title: "My School Bag",
    level: "Pre-A1",
    text: `My name is Madina. I have a blue school bag. It is big. I have two books, three pens, and one pencil. My lunch is in my bag. I go to school with my friend. We like our school.`,
    vocab: [
      { en: "bag", uz: "sumka" },
      { en: "blue", uz: "ko‘k" },
      { en: "pencil", uz: "qalam" },
      { en: "lunch", uz: "tushlik" },
      { en: "friend", uz: "do‘st" }
    ],
    questions: [
      {
        id: "r11-q1",
        q: "What color is Madina's bag?",
        options: ["Red", "Blue", "Green", "Black"],
        answer: 1,
        explain: "Matnda “I have a blue school bag” deyilgan. Demak, sumkasi ko‘k."
      },
      {
        id: "r11-q2",
        q: "How many books does she have?",
        options: ["One", "Three", "Two", "Four"],
        answer: 2,
        explain: "Madina sumkasida ikkita kitob borligini aytadi."
      },
      {
        id: "r11-q3",
        q: "Who goes to school with Madina?",
        options: ["Her friend", "Her father", "Her teacher", "Her sister"],
        answer: 0,
        explain: "Matnda u maktabga do‘sti bilan borishi aytilgan."
      }
    ]
  },
  {
    id: "r12",
    title: "A Day at the Park",
    level: "Pre-A1",
    text: `It is Sunday. Omar goes to the park with his sister. The sun is bright. Omar plays with a ball. His sister reads a book under a tree. They eat apples and drink water. At five o'clock, they go home.`,
    vocab: [
      { en: "park", uz: "bog‘" },
      { en: "bright", uz: "yorqin" },
      { en: "ball", uz: "to‘p" },
      { en: "under", uz: "ostida" },
      { en: "home", uz: "uy" }
    ],
    questions: [
      {
        id: "r12-q1",
        q: "What day is it?",
        options: ["Monday", "Friday", "Sunday", "Tuesday"],
        answer: 2,
        explain: "Hikoya “It is Sunday” jumlasi bilan boshlanadi."
      },
      {
        id: "r12-q2",
        q: "What does Omar play with?",
        options: ["A book", "A ball", "A toy car", "A kite"],
        answer: 1,
        explain: "Omar bog‘da to‘p bilan o‘ynaydi."
      },
      {
        id: "r12-q3",
        q: "What time do they go home?",
        options: ["At three", "At four", "At six", "At five"],
        answer: 3,
        explain: "Matnda ular soat beshda uyga ketishi aytilgan."
      }
    ]
  },
  {
    id: "r13",
    title: "My Little Cat",
    level: "Pre-A1",
    text: `I have a little cat. Her name is Mimi. She is white and has green eyes. Mimi likes milk and fish. She sleeps on my bed. Every morning, she plays with a small ball. I love my cat.`,
    vocab: [
      { en: "little", uz: "kichkina" },
      { en: "white", uz: "oq" },
      { en: "eyes", uz: "ko‘zlar" },
      { en: "sleeps", uz: "uxlaydi" },
      { en: "fish", uz: "baliq" }
    ],
    questions: [
      {
        id: "r13-q1",
        q: "What is the cat's name?",
        options: ["Lola", "Mimi", "Bella", "Luna"],
        answer: 1,
        explain: "Mushukning ismi Mimi."
      },
      {
        id: "r13-q2",
        q: "What color is Mimi?",
        options: ["Black", "Brown", "White", "Grey"],
        answer: 2,
        explain: "Matnda Mimi oq rangda ekani aytilgan."
      },
      {
        id: "r13-q3",
        q: "Where does Mimi sleep?",
        options: ["On the bed", "In the garden", "Under the table", "In a box"],
        answer: 0,
        explain: "Mimi egasining karavotida uxlaydi."
      }
    ]
  },

  // ==================== A1 ====================
  {
    id: "r14",
    title: "A Busy Morning",
    level: "A1",
    text: `Dilshod gets up at seven o'clock every morning. First, he washes his face and brushes his teeth. Then he eats eggs and bread for breakfast. He walks to school because it is near his home. His lessons start at eight thirty. After school, he usually plays football with his friends.`,
    vocab: [
      { en: "get up", uz: "o‘rindan turmoq" },
      { en: "brush", uz: "tozalamoq" },
      { en: "breakfast", uz: "nonushta" },
      { en: "near", uz: "yaqin" },
      { en: "usually", uz: "odatda" }
    ],
    questions: [
      {
        id: "r14-q1",
        q: "What time does Dilshod get up?",
        options: ["At six", "At seven", "At eight", "At nine"],
        answer: 1,
        explain: "Dilshod har kuni ertalab soat yettida turadi."
      },
      {
        id: "r14-q2",
        q: "Why does he walk to school?",
        options: ["He has no shoes.", "He likes running.", "The school is near his home.", "His friends drive him."],
        answer: 2,
        explain: "Maktab uyiga yaqin bo‘lgani uchun u piyoda boradi."
      },
      {
        id: "r14-q3",
        q: "What does he do after school?",
        options: ["He plays football.", "He cooks dinner.", "He watches a film.", "He goes shopping."],
        answer: 0,
        explain: "Darslardan keyin u odatda do‘stlari bilan futbol o‘ynaydi."
      }
    ]
  },
  {
    id: "r15",
    title: "Shopping with Mother",
    level: "A1",
    text: `On Saturday, Malika goes shopping with her mother. They visit a small supermarket near their house. Her mother buys rice, milk, tomatoes, and chicken. Malika chooses some apples and a chocolate bar. At the checkout, her mother pays 120,000 soums. They carry the bags home together.`,
    vocab: [
      { en: "supermarket", uz: "supermarket" },
      { en: "choose", uz: "tanlamoq" },
      { en: "checkout", uz: "kassa" },
      { en: "pay", uz: "to‘lamoq" },
      { en: "carry", uz: "ko‘tarib olib bormoq" }
    ],
    questions: [
      {
        id: "r15-q1",
        q: "When does Malika go shopping?",
        options: ["On Monday", "On Friday", "On Saturday", "On Sunday"],
        answer: 2,
        explain: "Malika onasi bilan shanba kuni xaridga boradi."
      },
      {
        id: "r15-q2",
        q: "What does Malika choose?",
        options: ["Rice and milk", "Apples and chocolate", "Chicken and tomatoes", "Bread and cheese"],
        answer: 1,
        explain: "Malika olma va bir dona shokolad tanlaydi."
      },
      {
        id: "r15-q3",
        q: "How much does her mother pay?",
        options: ["100,000 soums", "150,000 soums", "200,000 soums", "120,000 soums"],
        answer: 3,
        explain: "Kassada onasi 120 000 so‘m to‘laydi."
      }
    ]
  },
  {
    id: "r16",
    title: "A New Classmate",
    level: "A1",
    text: `A new student joins our class today. His name is Bekzod, and he comes from Samarkand. He is eleven years old. He likes drawing pictures and playing chess. During the break, I sit next to him and ask about his hobbies. We discover that we both enjoy reading adventure stories. I hope we become good friends.`,
    vocab: [
      { en: "classmate", uz: "sinfdosh" },
      { en: "join", uz: "qo‘shilmoq" },
      { en: "drawing", uz: "rasm chizish" },
      { en: "hobby", uz: "sevimli mashg‘ulot" },
      { en: "discover", uz: "aniqlamoq" }
    ],
    questions: [
      {
        id: "r16-q1",
        q: "Where does Bekzod come from?",
        options: ["Bukhara", "Tashkent", "Samarkand", "Khiva"],
        answer: 2,
        explain: "Bekzod Samarqanddan kelgan."
      },
      {
        id: "r16-q2",
        q: "Which game does Bekzod like?",
        options: ["Chess", "Tennis", "Basketball", "Volleyball"],
        answer: 0,
        explain: "Matnda Bekzod shaxmat o‘ynashni yoqtirishi aytilgan."
      },
      {
        id: "r16-q3",
        q: "What do the two students both enjoy?",
        options: ["Cooking", "Swimming", "Drawing maps", "Reading adventure stories"],
        answer: 3,
        explain: "Ikkala o‘quvchi ham sarguzasht hikoyalarini o‘qishni yoqtiradi."
      }
    ]
  },

  // ==================== A2 ====================
  {
    id: "r17",
    title: "The First Train Journey",
    level: "A2",
    text: `Last summer, Jasur travelled by train from Tashkent to Bukhara with his uncle. It was his first long train journey. They arrived at the station early because they did not want to miss the train. During the trip, Jasur watched fields, villages, and distant mountains through the window. His uncle explained some interesting facts about the region. When they arrived, they visited the old city and tasted traditional Bukhara food. Jasur enjoyed the journey more than he had expected.`,
    vocab: [
      { en: "journey", uz: "sayohat, safar" },
      { en: "arrive", uz: "yetib kelmoq" },
      { en: "miss", uz: "o‘tkazib yubormoq" },
      { en: "region", uz: "hudud" },
      { en: "traditional", uz: "an’anaviy" }
    ],
    questions: [
      {
        id: "r17-q1",
        q: "Why did Jasur and his uncle arrive early?",
        options: ["They wanted breakfast.", "They did not want to miss the train.", "The station was far away.", "They needed to buy new clothes."],
        answer: 1,
        explain: "Ular poyezdni o‘tkazib yubormaslik uchun vokzalga erta kelishgan."
      },
      {
        id: "r17-q2",
        q: "What did Jasur see through the window?",
        options: ["Only large cities", "The sea and beaches", "Fields, villages, and mountains", "Airports and factories"],
        answer: 2,
        explain: "Safar davomida u dalalar, qishloqlar va uzoqdagi tog‘larni kuzatgan."
      },
      {
        id: "r17-q3",
        q: "How did Jasur feel about the journey?",
        options: ["He enjoyed it more than expected.", "He thought it was dangerous.", "He wanted to return immediately.", "He found it completely boring."],
        answer: 0,
        explain: "Jasur safardan kutganidan ham ko‘proq zavq olgan."
      }
    ]
  },
  {
    id: "r18",
    title: "Learning to Cook",
    level: "A2",
    text: `When Nodira was twelve, she decided to learn how to cook. At first, she could only make simple meals such as eggs and sandwiches. Her grandmother showed her how to prepare soup and rice. Nodira made mistakes sometimes, especially when she added too much salt. Instead of giving up, she wrote down each recipe and tried again. After several months, she could prepare dinner for the whole family. Now she wants to learn how to bake cakes.`,
    vocab: [
      { en: "decide", uz: "qaror qilmoq" },
      { en: "prepare", uz: "tayyorlamoq" },
      { en: "recipe", uz: "retsept" },
      { en: "give up", uz: "taslim bo‘lmoq" },
      { en: "bake", uz: "pechda pishirmoq" }
    ],
    questions: [
      {
        id: "r18-q1",
        q: "Who taught Nodira to prepare soup and rice?",
        options: ["Her mother", "Her teacher", "Her friend", "Her grandmother"],
        answer: 3,
        explain: "Nodiraga sho‘rva va guruch tayyorlashni buvisi o‘rgatgan."
      },
      {
        id: "r18-q2",
        q: "What mistake did Nodira sometimes make?",
        options: ["She used too much salt.", "She forgot to buy plates.", "She cooked too early.", "She added too much sugar to everything."],
        answer: 0,
        explain: "U ba'zan ovqatga ortiqcha tuz solib yuborgan."
      },
      {
        id: "r18-q3",
        q: "What does Nodira want to learn next?",
        options: ["How to grow vegetables", "How to bake cakes", "How to make furniture", "How to drive a car"],
        answer: 1,
        explain: "Endi Nodira tort pishirishni o‘rganmoqchi."
      }
    ]
  },
  {
    id: "r19",
    title: "A Cleaner Neighbourhood",
    level: "A2",
    text: `People in our neighbourhood were worried about rubbish in the streets. Plastic bottles and paper often collected near the playground. One Saturday, a group of teenagers organised a clean-up day. They invited neighbours, brought gloves and large bags, and separated plastic from other waste. A local shop gave them free water. By lunchtime, the streets looked much better. The group decided to organise another clean-up every month and put more rubbish bins near the park.`,
    vocab: [
      { en: "neighbourhood", uz: "mahalla" },
      { en: "rubbish", uz: "axlat" },
      { en: "organise", uz: "tashkil qilmoq" },
      { en: "separate", uz: "ajratmoq" },
      { en: "waste", uz: "chiqindi" }
    ],
    questions: [
      {
        id: "r19-q1",
        q: "What problem did the neighbourhood have?",
        options: ["Too many cars", "A broken playground", "Rubbish in the streets", "A lack of shops"],
        answer: 2,
        explain: "Mahalladagi asosiy muammo ko‘chalarda axlat to‘planishi edi."
      },
      {
        id: "r19-q2",
        q: "What did the teenagers do with the waste?",
        options: ["They burned all of it.", "They left it near the playground.", "They took it into their homes.", "They separated plastic from other waste."],
        answer: 3,
        explain: "O‘smirlar plastik chiqindilarni boshqa chiqindilardan ajratishgan."
      },
      {
        id: "r19-q3",
        q: "What did the group plan to do next?",
        options: ["Clean up every month", "Close the local shop", "Build a new school", "Stop using rubbish bins"],
        answer: 0,
        explain: "Ular har oy tozalash tadbirini tashkil etishga qaror qilishgan."
      }
    ]
  },

  // ==================== B1 ====================
  {
    id: "r20",
    title: "The Value of Volunteering",
    level: "B1",
    text: `When Aziz finished his school exams, he expected to spend the summer playing video games and meeting friends. Instead, his older cousin persuaded him to volunteer at a community centre. At first, Aziz thought the work would be boring. He helped younger children with homework, organised sports activities, and prepared books for a small reading room. Gradually, he realised that the children were becoming more confident because someone was willing to listen to them. The experience also taught Aziz to communicate more patiently and take responsibility for his tasks. By the end of summer, he had decided to continue volunteering during the school year. He still enjoyed relaxing with friends, but he no longer believed that free time had to be spent only on entertainment.`,
    vocab: [
      { en: "volunteer", uz: "ko‘ngilli bo‘lib ishlamoq" },
      { en: "persuade", uz: "ko‘ndirmoq" },
      { en: "community", uz: "hamjamiyat" },
      { en: "confident", uz: "o‘ziga ishongan" },
      { en: "responsibility", uz: "mas'uliyat" }
    ],
    questions: [
      {
        id: "r20-q1",
        q: "Why did Aziz first agree to volunteer?",
        options: ["His school required it.", "His cousin persuaded him.", "He wanted to earn money.", "His friends were already there."],
        answer: 1,
        explain: "Aziz ko‘ngilli bo‘lib ishlashga qarindoshining ko‘ndiruvi bilan rozi bo‘lgan."
      },
      {
        id: "r20-q2",
        q: "What did Aziz notice about the children?",
        options: ["They stopped doing homework.", "They wanted to leave the centre.", "They became more confident.", "They disliked sports activities."],
        answer: 2,
        explain: "Aziz bolalarning o‘ziga ishonchi oshayotganini sezgan."
      },
      {
        id: "r20-q3",
        q: "What is the main lesson Aziz learned?",
        options: ["Free time should only be for entertainment.", "Volunteering is always easy.", "School exams are unimportant.", "Helping others can be personally valuable."],
        answer: 3,
        explain: "Tajriba Azizga boshqalarga yordam berish ham mazmunli ekanini ko‘rsatgan."
      }
    ]
  },
  {
    id: "r21",
    title: "Working from Home",
    level: "B1",
    text: `Several years ago, working from home was unusual in many companies. Today, video calls and online collaboration tools allow employees to complete many tasks without travelling to an office. Supporters say this arrangement saves commuting time and gives people more flexibility. However, working remotely can also create difficulties. Some employees feel isolated, while others struggle to separate their professional duties from family life. Managers may also find it harder to notice when a team member needs support. For these reasons, some organisations use a hybrid system in which employees work from home on certain days and meet colleagues in person on others. There is no single arrangement that suits everyone. The most effective approach often depends on the type of work, the employee's circumstances, and the quality of communication within the team.`,
    vocab: [
      { en: "arrangement", uz: "tashkiliy tartib" },
      { en: "commuting", uz: "ishga qatnab yurish" },
      { en: "flexibility", uz: "moslashuvchanlik" },
      { en: "isolated", uz: "yakkalanib qolgan" },
      { en: "hybrid", uz: "aralash" }
    ],
    questions: [
      {
        id: "r21-q1",
        q: "What is one advantage of working from home?",
        options: ["It removes every work problem.", "It saves commuting time.", "It guarantees promotion.", "It makes teamwork unnecessary."],
        answer: 1,
        explain: "Masofadan ishlash ishga qatnab yurishga ketadigan vaqtni tejaydi."
      },
      {
        id: "r21-q2",
        q: "Why do some organisations use a hybrid system?",
        options: ["To prevent employees from using computers", "To make all employees work longer", "To combine remote work with in-person meetings", "To remove communication between colleagues"],
        answer: 2,
        explain: "Gibrid tizim uyda ishlash va yuzma-yuz uchrashuvlarni birlashtiradi."
      },
      {
        id: "r21-q3",
        q: "What does the writer suggest about working arrangements?",
        options: ["One system is best for every employee.", "Remote work should be banned.", "Office work is always more productive.", "The best arrangement depends on several factors."],
        answer: 3,
        explain: "Eng samarali tartib ish turi, xodim sharoiti va muloqot sifatiga bog‘liq."
      }
    ]
  },
  {
    id: "r22",
    title: "Why Cities Need Trees",
    level: "B1",
    text: `Trees are sometimes treated as decorations in modern cities, but their role is much more important. Their leaves provide shade, making streets and public spaces more comfortable during hot weather. Trees can also absorb some air pollutants and provide habitats for birds and insects. In addition, green spaces give residents places to walk, exercise, or relax away from busy roads. However, planting trees requires careful planning. The wrong species may damage pavements, need too much water, or fail to survive local conditions. Young trees also need regular care before they become established. City planners therefore need to consider local climate, available space, and maintenance costs. A successful urban tree programme is not simply about planting as many trees as possible; it is about choosing suitable trees and helping them grow for many years.`,
    vocab: [
      { en: "decoration", uz: "bezak" },
      { en: "shade", uz: "soya" },
      { en: "pollutant", uz: "ifloslantiruvchi modda" },
      { en: "habitat", uz: "yashash muhiti" },
      { en: "maintenance", uz: "parvarish" }
    ],
    questions: [
      {
        id: "r22-q1",
        q: "According to the passage, what is one benefit of city trees?",
        options: ["They eliminate all traffic.", "They provide shade and improve public spaces.", "They make buildings unnecessary.", "They prevent every type of pollution."],
        answer: 1,
        explain: "Daraxtlar soya beradi va shahar jamoat joylarini qulayroq qiladi."
      },
      {
        id: "r22-q2",
        q: "Why must tree species be chosen carefully?",
        options: ["All trees grow at the same speed.", "Trees cannot grow near roads.", "Some trees may not suit local conditions.", "Residents never want trees."],
        answer: 2,
        explain: "Ayrim daraxt turlari mahalliy iqlimga mos kelmasligi yoki yo‘laklarga zarar yetkazishi mumkin."
      },
      {
        id: "r22-q3",
        q: "What is the main idea of the passage?",
        options: ["Cities should remove all old trees.", "Trees are only useful for decoration.", "Planting trees requires no planning.", "Urban trees need thoughtful selection and long-term care."],
        answer: 3,
        explain: "Matn shahar daraxtlarini to‘g‘ri tanlash va uzoq muddat parvarish qilish muhimligini tushuntiradi."
      }
    ]
  },

  // ==================== B2 ====================
  {
    id: "r23",
    title: "The Attention Economy",
    level: "B2",
    text: `Many digital services appear to be free, yet users often pay for them in a less obvious way: with their attention. Social media platforms, video services, and news applications compete to keep people looking at their screens. Their recommendation systems analyse past behaviour to predict what a user is likely to click next. This can make online experiences convenient, but it may also encourage people to spend longer on a platform than they originally intended. The issue is not simply that technology distracts us; it is that many services are designed around measurable engagement, such as clicks and viewing time. These measurements do not always reflect whether users are learning, relaxing, or benefiting from what they see. Some critics argue that individuals should take more responsibility by setting limits, while others believe companies should provide clearer controls and more transparent design choices. A balanced response recognises that digital tools can be useful while questioning business models that reward attention regardless of its consequences.`,
    vocab: [
      { en: "attention", uz: "diqqat" },
      { en: "recommendation", uz: "tavsiya" },
      { en: "engagement", uz: "foydalanuvchi faolligi" },
      { en: "transparent", uz: "shaffof" },
      { en: "consequence", uz: "oqibat" }
    ],
    questions: [
      {
        id: "r23-q1",
        q: "What does the phrase 'pay for them in a less obvious way' mean?",
        options: ["Users always pay a monthly fee.", "Users may give up their time and attention.", "Users must buy new devices.", "Users work for the companies."],
        answer: 1,
        explain: "Xizmatlardan foydalanishning yashirin xarajati vaqt va diqqat bo‘lishi mumkin."
      },
      {
        id: "r23-q2",
        q: "Why might engagement measurements be misleading?",
        options: ["They are never recorded.", "They only measure educational progress.", "They do not necessarily show whether users benefit.", "They prevent users from clicking links."],
        answer: 2,
        explain: "Ko‘rish vaqti yoki bosishlar foydalanuvchi haqiqatan foyda olganini doim ham ko‘rsatmaydi."
      },
      {
        id: "r23-q3",
        q: "What is the writer's overall position?",
        options: ["All digital services should be closed.", "Users alone are responsible for every problem.", "Technology has no benefits.", "Digital tools are useful, but their design and incentives deserve scrutiny."],
        answer: 3,
        explain: "Muallif texnologiyaning foydasini tan oladi, biroq uning diqqatni jalb qilishga asoslangan biznes modellarini tanqidiy baholashni taklif qiladi."
      }
    ]
  },
  {
    id: "r24",
    title: "The Limits of Productivity",
    level: "B2",
    text: `Productivity advice often promises that a better schedule, a new application, or a stricter morning routine will transform a person's life. Such methods can certainly help people organise tasks, but they are not universal solutions. A schedule that works well for an office worker may be unsuitable for a parent caring for young children or someone whose work changes from day to day. Moreover, focusing exclusively on measurable output can make important but less visible activities seem unproductive. Thinking carefully, building relationships, and recovering from fatigue may not produce immediate results, yet they often support better decisions over time. There is also a risk that productivity techniques become another source of pressure: people may spend so much time optimising their routines that they neglect the work itself. A more sustainable approach begins by identifying meaningful goals, recognising personal constraints, and choosing a small number of habits that genuinely help. Efficiency matters, but it should serve a worthwhile purpose rather than become the purpose itself.`,
    vocab: [
      { en: "universal", uz: "hamma uchun mos" },
      { en: "exclusively", uz: "faqatgina" },
      { en: "measurable", uz: "o‘lchash mumkin bo‘lgan" },
      { en: "fatigue", uz: "charchoq" },
      { en: "sustainable", uz: "barqaror" }
    ],
    questions: [
      {
        id: "r24-q1",
        q: "Why are productivity methods not universal solutions?",
        options: ["They are always too expensive.", "People have different circumstances and responsibilities.", "They only work in the morning.", "They make every task more difficult."],
        answer: 1,
        explain: "Odamlarning sharoitlari va majburiyatlari turlicha bo‘lgani uchun bitta usul hammaga mos kelmaydi."
      },
      {
        id: "r24-q2",
        q: "What does the writer say about rest and relationships?",
        options: ["They always waste time.", "They should be measured in money.", "They can support better decisions over time.", "They are less important than every task."],
        answer: 2,
        explain: "Dam olish va munosabatlarni rivojlantirish vaqt o‘tishi bilan yaxshiroq qarorlar qabul qilishga yordam beradi."
      },
      {
        id: "r24-q3",
        q: "What does the writer mean by saying efficiency should serve a purpose?",
        options: ["People should avoid making plans.", "Every task must be completed immediately.", "The busiest people are always the most successful.", "Being efficient matters when it helps achieve meaningful goals."],
        answer: 3,
        explain: "Samaradorlik mazmunli natijalarga erishishga xizmat qilishi kerak."
      }
    ]
  },
  {
    id: "r25",
    title: "When Museums Go Digital",
    level: "B2",
    text: `Museums increasingly use digital technology to make collections accessible to people who cannot visit in person. High-resolution images, virtual tours, and online catalogues allow users to examine objects from different angles and explore material that may be stored away from public view. Such tools can be particularly valuable for students and researchers who live far from major cultural institutions. Nevertheless, a digital display cannot reproduce every aspect of seeing an object in person. Its size, texture, and relationship to surrounding objects may be difficult to communicate on a screen. There is also a question of access: reliable internet connections and suitable devices are not equally available to everyone. Rather than treating digital experiences as replacements for physical museums, many institutions view them as complementary ways of engaging audiences. The challenge is to design online resources that provide meaningful context, respect cultural sensitivities, and encourage deeper exploration instead of reducing complex objects to attractive images.`,
    vocab: [
      { en: "accessible", uz: "foydalanish mumkin bo‘lgan" },
      { en: "catalogue", uz: "katalog" },
      { en: "texture", uz: "sirt tuzilishi" },
      { en: "complementary", uz: "bir-birini to‘ldiruvchi" },
      { en: "sensitivity", uz: "nozik jihatlarni hisobga olish" }
    ],
    questions: [
      {
        id: "r25-q1",
        q: "What is one benefit of online museum collections?",
        options: ["They make every object physically available.", "They allow people far away to explore collections.", "They remove the need for historical research.", "They guarantee equal internet access."],
        answer: 1,
        explain: "Raqamli kolleksiyalar uzoqda yashaydigan odamlarga ham muzey materiallarini o‘rganish imkonini beradi."
      },
      {
        id: "r25-q2",
        q: "What may be difficult to communicate on a screen?",
        options: ["The name of every museum", "The existence of online catalogues", "An object's physical size and texture", "The date when a website opens"],
        answer: 2,
        explain: "Ekranda buyumning haqiqiy hajmi va sirt tuzilishini to‘liq his qilish qiyin."
      },
      {
        id: "r25-q3",
        q: "How does the writer view digital museum experiences?",
        options: ["They should completely replace museums.", "They have no educational value.", "They should only display attractive images.", "They can complement physical visits when thoughtfully designed."],
        answer: 3,
        explain: "Muallif raqamli tajribalarni an'anaviy muzeylarga qo‘shimcha vosita sifatida ko‘radi."
      }
    ]
  },

  // ==================== C1 ====================
  {
    id: "r26",
    title: "The Hidden Cost of Convenience",
    level: "C1",
    text: `Modern life is frequently organised around convenience. Meals arrive at our doors, information appears instantly, and automated systems remove countless small obstacles from daily routines. Yet convenience is not a neutral improvement: it can reshape expectations, habits, and even our understanding of effort. When every delay is treated as a problem to be eliminated, people may become less willing to tolerate the uncertainty that accompanies learning, creativity, or meaningful relationships. Consider navigation applications. They are undeniably useful, but constant reliance on turn-by-turn instructions can reduce opportunities to develop an independent sense of direction. Similar tensions arise when automated services replace interactions that once required negotiation, patience, or mutual assistance. This does not mean that convenience should be rejected. Rather, it invites a more careful distinction between unnecessary friction and productive effort. The former consumes resources without adding value; the latter may cultivate competence, resilience, or social connection. A society that automates every inconvenience risks overlooking the less obvious benefits embedded in ordinary difficulties. The central question, therefore, is not whether a task can be made easier, but whether making it easier improves the experience or quietly removes something worth preserving.`,
    vocab: [
      { en: "neutral", uz: "betaraf" },
      { en: "reliance", uz: "tayanish" },
      { en: "undeniably", uz: "shubhasiz" },
      { en: "resilience", uz: "qiyinchiliklardan tiklana olish" },
      { en: "embedded", uz: "ichiga singdirilgan" }
    ],
    questions: [
      {
        id: "r26-q1",
        q: "What is the central argument of the passage?",
        options: ["Convenience should always be rejected.", "Automation inevitably destroys relationships.", "Convenience can remove both pointless obstacles and valuable experiences.", "Technology never improves daily life."],
        answer: 2,
        explain: "Qulaylik foydali bo‘lishi mumkin, ammo rivojlanishga yordam beradigan qiyinchiliklarni ham yo‘qotishi mumkin."
      },
      {
        id: "r26-q2",
        q: "Why does the writer mention navigation applications?",
        options: ["To argue that maps are inaccurate", "To show how convenience may limit the development of independent skills", "To explain why travelling is unnecessary", "To suggest that all applications should be removed"],
        answer: 1,
        explain: "Navigatsiya misoli texnologik yordam mustaqil yo‘nalish topish ko‘nikmasini rivojlantirish imkonini kamaytirishi mumkinligini ko‘rsatadi."
      },
      {
        id: "r26-q3",
        q: "What distinction does the writer make between two types of difficulty?",
        options: ["Old difficulties and new difficulties", "Physical difficulty and emotional difficulty", "Expensive difficulty and inexpensive difficulty", "Unnecessary friction and effort that builds useful abilities"],
        answer: 3,
        explain: "Muallif foydasiz to‘siqlarni qobiliyat va chidamlilikni rivojlantiradigan foydali sa'y-harakatlardan ajratadi."
      }
    ]
  },
  {
    id: "r27",
    title: "Rethinking Educational Assessment",
    level: "C1",
    text: `Examinations remain influential because they offer institutions a relatively standardised way to compare large numbers of learners. Their apparent precision, however, can conceal the complexity of the abilities they seek to measure. A timed test may reveal how effectively a student recalls information under pressure, yet provide limited evidence of their capacity to collaborate, investigate an unfamiliar problem, or revise an argument after receiving feedback. Conversely, projects and portfolios can capture a wider range of skills but introduce challenges of consistency, authorship, and assessment time. The debate is therefore not best understood as a choice between examinations and alternative methods. Each approach makes certain aspects of learning visible while leaving others less apparent. A more defensible system combines different forms of evidence and aligns them with clearly defined learning outcomes. It also recognises that assessment influences behaviour: if students are rewarded exclusively for reproducing facts, they are likely to prioritise memorisation. When evaluation values reasoning, reflection, and application, learners receive a stronger signal that these abilities matter. Ultimately, the quality of assessment depends not on whether a method appears objective, but on whether the conclusions drawn from it are justified and useful.`,
    vocab: [
      { en: "standardised", uz: "standartlashtirilgan" },
      { en: "precision", uz: "aniqlik" },
      { en: "portfolio", uz: "ishlar to‘plami" },
      { en: "consistency", uz: "izchillik" },
      { en: "justify", uz: "asoslab bermoq" }
    ],
    questions: [
      {
        id: "r27-q1",
        q: "What limitation of timed examinations does the writer identify?",
        options: ["They cannot assess any knowledge.", "They are always unfair.", "They may fail to reveal a wider range of abilities.", "They require no preparation."],
        answer: 2,
        explain: "Vaqt bilan cheklangan imtihonlar hamkorlik va murakkab muammolarni hal qilish kabi ko‘nikmalarni to‘liq ko‘rsatmasligi mumkin."
      },
      {
        id: "r27-q2",
        q: "Why does the writer discuss projects and portfolios?",
        options: ["To show that they eliminate all assessment problems", "To demonstrate that alternative methods have both strengths and limitations", "To argue that examinations should be abolished immediately", "To suggest that students should grade themselves exclusively"],
        answer: 1,
        explain: "Loyihalar ko‘proq ko‘nikmalarni ko‘rsatadi, biroq ularni baholashda ham ayrim qiyinchiliklar mavjud."
      },
      {
        id: "r27-q3",
        q: "According to the passage, what determines the quality of assessment?",
        options: ["How difficult the test appears", "How many students take it", "Whether it uses digital technology", "Whether its conclusions are justified and useful"],
        answer: 3,
        explain: "Baholash sifati uning xulosalari qanchalik asosli va foydali ekaniga bog‘liq."
      }
    ]
  },
  {
    id: "r28",
    title: "Cities and the Right to Public Space",
    level: "C1",
    text: `Public spaces are often described as places where citizens meet beyond the boundaries of home and work. Parks, libraries, squares, and pedestrian streets can support social interaction among people who might otherwise rarely encounter one another. Their value, however, depends on more than their physical existence. A square dominated by expensive cafés may technically be open to everyone while subtly discouraging those who cannot afford to spend money there. Similarly, security measures intended to protect visitors can make certain groups feel unwelcome if they are applied unevenly. Urban design therefore involves decisions about whose presence is anticipated, which activities are encouraged, and what forms of behaviour are considered acceptable. Commercial development can finance improvements and attract visitors, but it may also transform shared environments into spaces organised primarily for consumption. The challenge for city authorities is not to eliminate commercial activity or regulation, but to ensure that neither becomes a barrier to ordinary public use. Truly inclusive spaces allow people to sit, gather, observe, and participate without having to demonstrate their economic value. Their success should consequently be assessed not only through visitor numbers or revenue, but also through the diversity of people who feel entitled to use them.`,
    vocab: [
      { en: "boundaries", uz: "chegaralar" },
      { en: "subtly", uz: "nozik tarzda" },
      { en: "unevenly", uz: "notekis tarzda" },
      { en: "consumption", uz: "iste'mol" },
      { en: "inclusive", uz: "barchani qamrab oluvchi" }
    ],
    questions: [
      {
        id: "r28-q1",
        q: "What does the example of expensive cafés illustrate?",
        options: ["All cafés should be closed.", "Public spaces are always privately owned.", "A space can be technically open but socially exclusionary.", "Visitors prefer shopping to parks."],
        answer: 2,
        explain: "Qimmat kafelar joy hamma uchun ochiq bo‘lsa-da, ayrim odamlarni amalda chetlashtirishi mumkinligini ko‘rsatadi."
      },
      {
        id: "r28-q2",
        q: "What concern does the writer raise about commercial development?",
        options: ["It always reduces city revenue.", "It can make shared spaces primarily about spending money.", "It prevents any visitor from entering a square.", "It removes the need for urban planning."],
        answer: 1,
        explain: "Tijoriy rivojlanish umumiy joylarni odamlar asosan pul sarflaydigan makonga aylantirishi mumkin."
      },
      {
        id: "r28-q3",
        q: "How should inclusive public spaces be evaluated?",
        options: ["Only by the number of cafés", "Only by their construction costs", "By how much money visitors spend", "By whether diverse groups feel welcome and able to use them"],
        answer: 3,
        explain: "Jamoat joylarini turli guruhlar ulardan erkin va qulay foydalana olishiga qarab ham baholash kerak."
      }
    ]
  },

  // ==================== C2 ====================
  {
    id: "r29",
    title: "The Paradox of Expertise",
    level: "C2",
    text: `Expertise is commonly associated with the ability to recognise patterns that remain invisible to the inexperienced. Years of practice allow specialists to distinguish meaningful signals from incidental variation, often making their judgements faster and more reliable. Yet the very frameworks that enable expert performance can also constrain it. When familiar categories become too deeply established, unusual evidence may be dismissed because it does not fit an accepted explanation. This is not simply a matter of arrogance; it can arise from the cognitive efficiency that expertise itself requires. No professional can reconsider every assumption from first principles each time a decision is made. The difficulty is therefore to preserve the advantages of accumulated knowledge without allowing it to become immune to challenge. In research, this may involve actively seeking disconfirming evidence. In medicine, it may mean reconsidering an initial diagnosis when new symptoms emerge. In organisations, it can require giving less experienced colleagues a genuine opportunity to question established procedures. Expertise is most valuable not when it eliminates uncertainty, but when it provides the discipline to navigate uncertainty while remaining responsive to evidence that could overturn an earlier conclusion.`,
    vocab: [
      { en: "incidental", uz: "tasodifiy" },
      { en: "constrain", uz: "cheklamoq" },
      { en: "framework", uz: "konseptual tizim" },
      { en: "disconfirming", uz: "qarama-qarshi dalil keltiruvchi" },
      { en: "responsive", uz: "moslashuvchan" }
    ],
    questions: [
      {
        id: "r29-q1",
        q: "What is the paradox of expertise described in the passage?",
        options: ["Experts never recognise patterns.", "Practice always makes decisions slower.", "The knowledge that improves judgement can also make experts resistant to unusual evidence.", "Inexperienced people are always more reliable."],
        answer: 2,
        explain: "Mutaxassislik to‘g‘ri naqshlarni tez aniqlashga yordam beradi, biroq noodatiy dalillarni rad etishga ham olib kelishi mumkin."
      },
      {
        id: "r29-q2",
        q: "Why does the writer reject arrogance as the only explanation?",
        options: ["Experts never make mistakes.", "Established categories can influence judgement because they make thinking more efficient.", "Experts have no established frameworks.", "Unusual evidence is never important."],
        answer: 1,
        explain: "Muammo faqat kibrda emas; tanish fikrlash tizimlari samaradorlikni oshirishi bilan birga fikrlashni cheklashi ham mumkin."
      },
      {
        id: "r29-q3",
        q: "What does the final sentence suggest about genuine expertise?",
        options: ["It guarantees certainty.", "It requires rejecting previous knowledge.", "It depends on following established procedures without question.", "It combines informed judgement with openness to contrary evidence."],
        answer: 3,
        explain: "Haqiqiy mutaxassislik bilimga asoslangan qaror va unga zid dalillarga ochiqlikni birlashtiradi."
      }
    ]
  },
  {
    id: "r30",
    title: "Memory, History, and Collective Identity",
    level: "C2",
    text: `Collective memory is often invoked as though a community possessed a single, stable account of its past. In practice, remembrance is selective, contested, and continually reconstructed. Public monuments, school curricula, family narratives, and commemorative ceremonies all contribute to the stories through which societies interpret their origins and obligations. These stories can sustain solidarity, particularly when they acknowledge experiences that were previously ignored. They can also simplify complex events into moral narratives that divide historical actors into unambiguous heroes and villains. The problem is not that communities remember selectively; no account can include every detail. Rather, difficulties arise when selection is mistaken for completeness or when one interpretation is protected from scrutiny because it has become central to group identity. Historical revision, in this sense, need not imply that facts are arbitrary or that all interpretations are equally defensible. It can instead represent an effort to incorporate neglected evidence, reconsider inherited assumptions, and distinguish what is documented from what has been mythologised. A mature relationship with the past requires neither unquestioning reverence nor reflexive rejection. It requires a willingness to acknowledge uncertainty, preserve inconvenient evidence, and recognise that a community's identity can evolve without losing its historical foundations.`,
    vocab: [
      { en: "collective", uz: "jamoaviy" },
      { en: "contested", uz: "bahsli" },
      { en: "commemorative", uz: "xotirlashga oid" },
      { en: "scrutiny", uz: "sinchiklab tekshirish" },
      { en: "mythologised", uz: "afsonalashtirilgan" }
    ],
    questions: [
      {
        id: "r30-q1",
        q: "Why does the writer describe collective memory as reconstructed?",
        options: ["Communities forget every historical event.", "Historical facts change every year.", "Societies continually select and reinterpret stories about their past.", "Monuments always provide complete accounts."],
        answer: 2,
        explain: "Jamoaviy xotira jamiyatning o‘tmish haqidagi hikoyalarni tanlashi va qayta talqin qilishi orqali shakllanadi."
      },
      {
        id: "r30-q2",
        q: "What distinction does the writer make about historical revision?",
        options: ["It means all historical claims are equally valid.", "It can reconsider assumptions without treating facts as arbitrary.", "It requires rejecting every national tradition.", "It proves that historical evidence is useless."],
        answer: 1,
        explain: "Tarixni qayta ko‘rib chiqish faktlarni ahamiyatsiz deb bilish emas, balki dalillar va oldingi taxminlarni qayta baholashdir."
      },
      {
        id: "r30-q3",
        q: "What does a 'mature relationship with the past' involve?",
        options: ["Accepting every traditional account without question", "Removing all controversial monuments", "Avoiding discussions of uncertainty", "Respecting historical foundations while remaining willing to reassess interpretations"],
        answer: 3,
        explain: "O‘tmishga yetuk munosabat ko‘r-ko‘rona qabul qilish yoki butunlay rad etish emas, balki dalillarga ochiq va tanqidiy qarashdir."
      }
    ]
  },
  {
    id: "r31",
    title: "Scientific Uncertainty and Public Trust",
    level: "C2",
    text: `Public discussions of science frequently reveal an uncomfortable tension between uncertainty and authority. Scientific findings are provisional in the sense that they remain open to revision when stronger evidence becomes available. Yet public institutions are often expected to deliver clear recommendations, sometimes before the available evidence permits definitive conclusions. If researchers emphasise uncertainty, audiences may interpret their caution as incompetence; if officials communicate with excessive confidence, later revisions may be taken as proof that the original advice was deceptive. Neither response reflects the logic of scientific inquiry particularly well. Uncertainty is not a uniform condition: evidence may be strong on one aspect of a problem and weak on another, while the practical consequences of waiting for further information may differ considerably. Responsible communication therefore requires more than attaching a general disclaimer to a statement. It involves explaining what is known, what remains unresolved, how confident researchers are, and which decisions are robust across several plausible scenarios. Institutions must also distinguish a legitimate change of view in response to new evidence from an attempt to conceal previous errors. Public trust is unlikely to depend on the appearance of infallibility. It is more plausibly sustained by transparent reasoning, consistent standards of evidence, and a willingness to explain why recommendations change as understanding develops.`,
    vocab: [
      { en: "provisional", uz: "yakuniy bo‘lmagan" },
      { en: "definitive", uz: "qat'iy, yakuniy" },
      { en: "incompetence", uz: "qobiliyatsizlik" },
      { en: "disclaimer", uz: "mas'uliyatni cheklovchi izoh" },
      { en: "infallibility", uz: "xato qilmaslik xususiyati" }
    ],
    questions: [
      {
        id: "r31-q1",
        q: "What tension does the passage identify?",
        options: ["Scientists refuse to collect evidence.", "The public never wants recommendations.", "Scientific knowledge can be uncertain while institutions are expected to give clear advice.", "Research findings are never revised."],
        answer: 2,
        explain: "Ilmiy xulosalar yangi dalillar asosida o‘zgarishi mumkin, ammo jamoatchilik muassasalardan aniq tavsiyalar kutadi."
      },
      {
        id: "r31-q2",
        q: "Why can excessive confidence damage public trust?",
        options: ["It prevents researchers from publishing.", "Later changes may be interpreted as evidence that earlier advice was deceptive.", "It makes all evidence stronger.", "It guarantees that recommendations remain unchanged."],
        answer: 1,
        explain: "Haddan tashqari qat'iy bayonotlar keyinchalik o‘zgartirilsa, odamlar dastlabki tavsiyalar chalg‘ituvchi bo‘lgan deb o‘ylashlari mumkin."
      },
      {
        id: "r31-q3",
        q: "According to the writer, what best supports public trust in science?",
        options: ["Pretending that uncertainty does not exist", "Never changing recommendations", "Using technical language without explanation", "Transparent reasoning and clear explanations for revised recommendations"],
        answer: 3,
        explain: "Ilm-fanga ishonch shaffof fikrlash va tavsiyalar nima sababdan o‘zgarishini tushuntirish orqali mustahkamlanadi."
      }
    ]
  }
];
