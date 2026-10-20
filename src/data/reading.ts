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
  },
  {
    id: "r32",
    title: "The Hidden Life of Coral Reefs",
    level: "C1",
    text: `Coral reefs are built by tiny animals called polyps, which produce hard skeletons that gradually accumulate. Although reefs occupy a very small part of the ocean floor, they support an unusually wide variety of marine life. They also benefit people by supporting fisheries, tourism and coastal protection. Reefs are vulnerable to warming seas, pollution, sediment and unsustainable fishing. When corals experience prolonged stress, they may expel the microscopic algae living in their tissues; this process, known as bleaching, makes them appear white. Bleached corals are not necessarily dead, but recovery depends on conditions improving before the stress becomes too severe.`,
    vocab: [
      { en: "polyps", uz: "marjon poliplari" },
      { en: "accumulate", uz: "to‘planib bormoq" },
      { en: "vulnerable", uz: "zaif, ta’sirchan" },
      { en: "bleaching", uz: "oqish hodisasi" },
    ],
    questions: [
      {
        id: "r32-q1",
        q: "What builds the hard structure of many coral reefs?",
        options: ["Fish bones", "Coral polyps", "Seaweed roots", "Underwater rocks"],
        answer: 1,
        explain: "The passage says polyps produce hard skeletons that gradually accumulate."
      },
      {
        id: "r32-q2",
        q: "Why are reefs important to people?",
        options: ["They stop all ocean warming", "They create freshwater", "They support fisheries, tourism and coastal protection", "They remove every pollutant"],
        answer: 2,
        explain: "The passage lists fisheries, tourism and coastal protection as human benefits."
      },
      {
        id: "r32-q3",
        q: "What does bleaching indicate?",
        options: ["Corals are always dead", "Corals have expelled algae under stress", "The reef has moved to colder water", "A reef has stopped growing permanently"],
        answer: 1,
        explain: "Bleaching occurs when stressed corals expel microscopic algae; the passage notes that they are not necessarily dead."
      },
    ],
  },
  {
    id: "r33",
    title: "Why Languages Matter in Education",
    level: "C1",
    text: `Learning is often more effective when students can first understand new ideas in a language they know well. A familiar language can help learners connect unfamiliar concepts with knowledge already stored in memory. This does not mean that additional languages should be avoided. Instead, well-designed multilingual education can use a learner’s strongest language as a bridge toward further languages. When children are taught in a language they barely understand, they may struggle with both the subject and the language at the same time. Education systems therefore face a practical challenge: providing access to global communication while respecting linguistic diversity and local knowledge.`,
    vocab: [
      { en: "multilingual", uz: "ko‘p tilli" },
      { en: "bridge", uz: "ko‘prik; vosita" },
      { en: "linguistic", uz: "tilga oid" },
      { en: "diversity", uz: "xilma-xillik" },
    ],
    questions: [
      {
        id: "r33-q1",
        q: "What role can a familiar language play?",
        options: ["It prevents further language learning", "It can connect new ideas with existing knowledge", "It makes every subject unnecessary", "It replaces all classroom instruction"],
        answer: 1,
        explain: "The passage describes a familiar language as a bridge to concepts and further languages."
      },
      {
        id: "r33-q2",
        q: "What difficulty may arise when children are taught in a poorly understood language?",
        options: ["They may struggle with both the subject and the language", "They automatically become fluent", "They stop needing teachers", "They learn only local history"],
        answer: 0,
        explain: "The text says learners may face the subject and language challenge simultaneously."
      },
      {
        id: "r33-q3",
        q: "What challenge do education systems face?",
        options: ["Choosing between all languages and no languages", "Balancing global communication with linguistic diversity", "Removing local knowledge from lessons", "Making every student speak one language only"],
        answer: 1,
        explain: "The final sentence identifies the need to support global communication while respecting linguistic diversity."
      },
    ],
  },
  {
    id: "r34",
    title: "Oceans Beneath Icy Worlds",
    level: "C1",
    text: `Scientists searching for life beyond Earth often examine planets and moons where liquid water might exist. Some icy worlds may contain oceans beneath frozen outer shells, even when their surfaces are far too cold for liquid water. Internal heating can keep water from freezing completely, and material from an underground ocean might occasionally escape through cracks as a plume. Such activity could offer researchers clues about the chemistry below the ice. However, finding water does not prove that life exists; it identifies a potentially suitable environment that requires further investigation.`,
    vocab: [
      { en: "icy", uz: "muz bilan qoplangan" },
      { en: "plume", uz: "yuqoriga otilgan oqim" },
      { en: "chemistry", uz: "kimyoviy tarkib" },
      { en: "investigation", uz: "tekshiruv" },
    ],
    questions: [
      {
        id: "r34-q1",
        q: "Why might an ocean remain liquid beneath ice?",
        options: ["Sunlight always reaches it", "Internal heating may keep it from freezing", "The surface is extremely hot", "There is no gravity"],
        answer: 1,
        explain: "The passage says internal heating can keep underground water from freezing completely."
      },
      {
        id: "r34-q2",
        q: "How could a plume help researchers?",
        options: ["It could provide clues about chemistry beneath the ice", "It proves a civilisation exists", "It makes the planet warmer", "It removes the need for telescopes"],
        answer: 0,
        explain: "Material escaping through cracks may reveal information about the ocean below."
      },
      {
        id: "r34-q3",
        q: "What conclusion does the passage support?",
        options: ["Any planet with water contains life", "Water is irrelevant to life research", "Liquid water can identify a promising environment but is not proof of life", "Scientists have already confirmed life on icy worlds"],
        answer: 2,
        explain: "The passage explicitly distinguishes a potentially suitable environment from proof of life."
      },
    ],
  },
  {
    id: "r35",
    title: "Biodiversity Has More Than One Value",
    level: "C1",
    text: `People value the natural world for different reasons. Forests and wetlands can provide practical benefits, including clean water, food, materials and protection from floods. Yet many communities also value species and landscapes because they are beautiful, meaningful or connected to cultural identity. These values can overlap, but they do not always fit neatly into financial calculations. Conservation plans are more likely to gain public support when they recognise local experience and involve communities in decisions. Treating nature only as a store of resources can overlook relationships that people consider important in their own right.`,
    vocab: [
      { en: "wetlands", uz: "botqoqli hududlar" },
      { en: "identity", uz: "o‘zlik, shaxsiy yoki madaniy mansublik" },
      { en: "overlap", uz: "ustma-ust tushmoq" },
      { en: "conservation", uz: "muhofaza qilish" },
    ],
    questions: [
      {
        id: "r35-q1",
        q: "Which is an example of a practical benefit of nature?",
        options: ["A wetland helping reduce flood damage", "A painting in a gallery", "A computer programme", "A railway timetable"],
        answer: 0,
        explain: "The passage names protection from floods as a practical benefit."
      },
      {
        id: "r35-q2",
        q: "Why may financial calculations be insufficient?",
        options: ["Nature has no practical value", "Some cultural and personal values are difficult to express in money", "Communities never value landscapes", "All species have identical prices"],
        answer: 1,
        explain: "The text says beauty, meaning and cultural identity do not always fit neatly into financial calculations."
      },
      {
        id: "r35-q3",
        q: "What can improve support for conservation plans?",
        options: ["Ignoring residents", "Making decisions without local knowledge", "Recognising local experience and involving communities", "Valuing only commercially useful species"],
        answer: 2,
        explain: "The passage links public support with recognising local experience and community involvement."
      },
    ],
  },
  {
    id: "r36",
    title: "How Coral Skeletons Record Climate",
    level: "C1",
    text: `Corals build skeletons from calcium carbonate dissolved from seawater. As they grow, their skeletons can preserve patterns associated with seasonal changes in temperature, light and nutrients. These patterns resemble the rings found in trees, although interpreting them requires careful scientific analysis. By examining coral growth, researchers can investigate aspects of past ocean conditions that were not measured directly by instruments. Coral records are not perfect diaries: local conditions can influence growth, and scientists compare different forms of evidence before drawing conclusions about historical climate.`,
    vocab: [
      { en: "calcium carbonate", uz: "kaltsiy karbonat" },
      { en: "seasonal", uz: "mavsumiy" },
      { en: "interpret", uz: "talqin qilmoq" },
      { en: "evidence", uz: "dalil" },
    ],
    questions: [
      {
        id: "r36-q1",
        q: "What creates patterns in coral skeletons?",
        options: ["Seasonal changes in environmental conditions", "Human writing", "The movement of ships", "Moonlight alone"],
        answer: 0,
        explain: "The passage links skeleton patterns with seasonal temperature, light and nutrient changes."
      },
      {
        id: "r36-q2",
        q: "Why are coral records scientifically useful?",
        options: ["They replace all other evidence", "They help investigate past ocean conditions", "They predict every storm exactly", "They reveal only present-day weather"],
        answer: 1,
        explain: "Researchers use them to study past conditions that were not directly measured."
      },
      {
        id: "r36-q3",
        q: "Why should coral records be interpreted carefully?",
        options: ["Corals do not grow", "Local conditions can affect growth", "The skeletons contain no information", "Every coral grows at the same rate"],
        answer: 1,
        explain: "The passage warns that local conditions influence growth, so evidence must be compared."
      },
    ],
  },
  {
    id: "r37",
    title: "Protecting Heritage Through Young People",
    level: "B2",
    text: `Historic buildings, traditional crafts and important natural sites can lose their meaning if younger generations have no chance to learn about them. Heritage education helps students explore the history of their own communities and understand why other societies protect different places and traditions. Activities may include research, visits, interviews with local residents and practical conservation projects. Such work is not only about memorising dates. It can help young people recognise threats to heritage and see themselves as participants in protecting shared cultural and natural resources.`,
    vocab: [
      { en: "heritage", uz: "meros" },
      { en: "conservation", uz: "asrash, muhofaza" },
      { en: "participants", uz: "ishtirokchilar" },
      { en: "threat", uz: "xavf" },
    ],
    questions: [
      {
        id: "r37-q1",
        q: "What is one purpose of heritage education?",
        options: ["To stop students studying history", "To help young people understand and protect heritage", "To replace local traditions", "To focus only on dates"],
        answer: 1,
        explain: "The passage says heritage education helps students understand and protect cultural and natural resources."
      },
      {
        id: "r37-q2",
        q: "Which activity is mentioned as part of heritage education?",
        options: ["Interviewing local residents", "Destroying old buildings", "Avoiding field visits", "Removing traditional crafts"],
        answer: 0,
        explain: "Research, visits and interviews with local residents are listed as possible activities."
      },
      {
        id: "r37-q3",
        q: "What does the passage suggest about young people?",
        options: ["They can play an active role in protecting heritage", "They should leave conservation to experts only", "They have no connection to history", "They should memorise dates without discussion"],
        answer: 0,
        explain: "The final sentence presents young people as participants in heritage protection."
      },
    ],
  },
  {
    id: "r38",
    title: "The Science of Coral Bleaching",
    level: "B2",
    text: `Many corals live in partnership with tiny algae inside their tissues. The algae use sunlight to produce energy, and the corals provide a protected place to live. When water conditions become stressful, especially during unusually warm periods, corals may lose these algae and turn pale or white. Without their partners, corals have less energy available for growth and reproduction. Some recover if conditions improve, but repeated or prolonged stress can cause lasting damage. Reducing pollution and limiting the causes of ocean warming can lower pressure on reef ecosystems.`,
    vocab: [
      { en: "partnership", uz: "hamkorlik" },
      { en: "tissue", uz: "to‘qima" },
      { en: "reproduction", uz: "ko‘payish" },
      { en: "prolonged", uz: "uzoq davom etgan" },
    ],
    questions: [
      {
        id: "r38-q1",
        q: "How do the algae help corals?",
        options: ["They produce energy using sunlight", "They cool the entire ocean", "They build boats", "They prevent all disease"],
        answer: 0,
        explain: "The passage says the algae use sunlight to produce energy."
      },
      {
        id: "r38-q2",
        q: "Why can bleaching weaken corals?",
        options: ["They lose an energy-producing partner", "They become too large", "They stop needing sunlight", "They move into deep forests"],
        answer: 0,
        explain: "Without the algae, corals have less energy for growth and reproduction."
      },
      {
        id: "r38-q3",
        q: "Which response is consistent with the passage?",
        options: ["Increase pollution near reefs", "Ignore ocean temperatures", "Reduce pollution and the causes of ocean warming", "Remove every coral from the sea"],
        answer: 2,
        explain: "The final sentence recommends reducing pollution and ocean-warming pressures."
      },
    ],
  },
  {
    id: "r39",
    title: "Language Loss and Local Knowledge",
    level: "C1",
    text: `A language carries more than vocabulary and grammar. It can preserve names for local plants, descriptions of seasonal changes, oral histories and ways of understanding the landscape. When a language stops being used, some of this knowledge may become harder to pass between generations. Language revitalisation can involve teaching children, recording stories, supporting community media and using the language in public life. These efforts are strongest when communities themselves guide them. Preserving a language does not require rejecting other languages; multilingual people can maintain a local language while also learning languages useful for wider communication.`,
    vocab: [
      { en: "revitalisation", uz: "qayta jonlantirish" },
      { en: "oral history", uz: "og‘zaki tarix" },
      { en: "generation", uz: "avlod" },
      { en: "maintain", uz: "saqlab qolmoq" },
    ],
    questions: [
      {
        id: "r39-q1",
        q: "What can a language preserve besides words?",
        options: ["Local ecological knowledge and oral histories", "Only mathematical symbols", "Weather forecasts from the future", "No cultural information"],
        answer: 0,
        explain: "The passage mentions plant names, seasonal descriptions and oral histories."
      },
      {
        id: "r39-q2",
        q: "Which approach is mentioned for language revitalisation?",
        options: ["Preventing children from learning", "Recording stories and teaching children", "Banning public use", "Replacing all local languages"],
        answer: 1,
        explain: "Teaching children and recording stories are examples in the passage."
      },
      {
        id: "r39-q3",
        q: "Does preserving a local language require rejecting other languages?",
        options: ["Yes, always", "Only in cities", "No; multilingualism can support both", "The passage says language learning must stop"],
        answer: 2,
        explain: "The text says people can maintain a local language while learning others."
      },
    ],
  },
  {
    id: "r40",
    title: "Why Wetlands Matter",
    level: "B2",
    text: `Wetlands include marshes, swamps and other areas where water shapes the environment. They provide habitats for birds, fish, insects and plants, and many help filter water as it moves through soil and vegetation. Some wetlands also absorb excess water during heavy rainfall, reducing flood risks for nearby communities. Despite these benefits, wetlands have often been drained or altered for construction and agriculture. Restoration can be difficult because water flow, soil and wildlife interact in complex ways. Protecting remaining wetlands is often more effective than trying to rebuild an ecosystem after it has been damaged.`,
    vocab: [
      { en: "marsh", uz: "botqoq" },
      { en: "habitat", uz: "yashash muhiti" },
      { en: "drain", uz: "suvini quritmoq" },
      { en: "restoration", uz: "qayta tiklash" },
    ],
    questions: [
      {
        id: "r40-q1",
        q: "Which is a benefit of some wetlands?",
        options: ["They absorb excess water during heavy rainfall", "They prevent all rainfall", "They produce fossil fuels", "They make rivers unnecessary"],
        answer: 0,
        explain: "The passage explains that wetlands can absorb excess water and reduce flood risks."
      },
      {
        id: "r40-q2",
        q: "Why can wetland restoration be difficult?",
        options: ["Water, soil and wildlife interact in complex ways", "Wetlands contain no living things", "All wetlands are identical", "They do not depend on water"],
        answer: 0,
        explain: "The text identifies the complex interaction of water flow, soil and wildlife."
      },
      {
        id: "r40-q3",
        q: "What does the passage imply about protection?",
        options: ["It is always easier to rebuild than protect", "Protecting existing wetlands can be more effective than rebuilding damaged ones", "Wetlands should all be drained", "Restoration never works"],
        answer: 1,
        explain: "The final sentence says protecting remaining wetlands is often more effective."
      },
    ],
  },
  {
    id: "r41",
    title: "How Sleep Supports Learning",
    level: "B2",
    text: `Learning does not end when a student closes a book. During sleep, the brain processes information gathered during the day, and sleep is associated with memory consolidation. A learner who studies late into the night may gain extra minutes of practice but lose some of the rest needed to function well the next day. Sleep needs differ by age and individual, so one schedule does not suit everyone. Consistent routines, a calm sleeping environment and limiting stimulating activities close to bedtime can help people protect their sleep. Effective study therefore depends not only on effort but also on recovery.`,
    vocab: [
      { en: "consolidation", uz: "mustahkamlash" },
      { en: "routine", uz: "odatdagi tartib" },
      { en: "stimulating", uz: "faollashtiruvchi" },
      { en: "recovery", uz: "tiklanish" },
    ],
    questions: [
      {
        id: "r41-q1",
        q: "What does the passage say the brain does during sleep?",
        options: ["Processes information from the day", "Forgets every memory", "Stops all activity", "Learns only new languages"],
        answer: 0,
        explain: "The passage says the brain processes information and sleep is associated with memory consolidation."
      },
      {
        id: "r41-q2",
        q: "What may be a disadvantage of studying very late?",
        options: ["It guarantees perfect results", "It can reduce needed rest", "It eliminates the need for sleep", "It improves every skill automatically"],
        answer: 1,
        explain: "The passage warns that extra study time may come at the cost of needed rest."
      },
      {
        id: "r41-q3",
        q: "Which is presented as a helpful habit?",
        options: ["Changing bedtime randomly every night", "Doing stimulating activities until morning", "Keeping a consistent routine", "Avoiding all recovery time"],
        answer: 2,
        explain: "Consistent routines are listed as a way to protect sleep."
      },
    ],
  },
  {
    id: "r42",
    title: "Urban Trees and Cooler Streets",
    level: "B2",
    text: `Trees can make cities more comfortable during hot weather. Their leaves provide shade, while water released from leaves can cool the surrounding air. Trees may also capture some airborne particles and create spaces that people enjoy walking through. However, planting a tree is not a complete climate strategy by itself. Species must suit the local climate, roots need room to grow, and young trees require care before they become established. City planners therefore need to consider where trees will survive, who will benefit from them and how maintenance will be funded over time.`,
    vocab: [
      { en: "shade", uz: "soya" },
      { en: "particles", uz: "zarrachalar" },
      { en: "established", uz: "yaxshi o‘rnashgan" },
      { en: "maintenance", uz: "parvarish, xizmat ko‘rsatish" },
    ],
    questions: [
      {
        id: "r42-q1",
        q: "How can trees cool city streets?",
        options: ["By providing shade and releasing water from leaves", "By blocking all wind permanently", "By increasing traffic", "By producing concrete"],
        answer: 0,
        explain: "The passage describes shade and water release from leaves as cooling mechanisms."
      },
      {
        id: "r42-q2",
        q: "Why is planting trees not enough on its own?",
        options: ["Trees never help cities", "Trees need suitable conditions and ongoing care", "All species grow anywhere", "Cities do not need planners"],
        answer: 1,
        explain: "The passage notes that species choice, root space and maintenance matter."
      },
      {
        id: "r42-q3",
        q: "What should planners consider?",
        options: ["Only the colour of leaves", "Where trees can survive and who benefits", "How to remove all parks", "Whether trees can replace every climate measure"],
        answer: 1,
        explain: "The final sentence lists survival, beneficiaries and long-term funding."
      },
    ],
  },
  {
    id: "r43",
    title: "The Value of Citizen Science",
    level: "B2",
    text: `Citizen science invites members of the public to contribute observations to research projects. Volunteers may record birds, photograph insects, measure rainfall or report changes in local environments. When many people collect observations across a wide area, researchers can obtain information that would be difficult for a small team to gather alone. The data still need clear instructions and quality checks: a large collection of inconsistent observations may be less useful than a smaller, carefully recorded set. Successful projects explain their methods and show volunteers how their contributions are used.`,
    vocab: [
      { en: "volunteer", uz: "ko‘ngilli" },
      { en: "observation", uz: "kuzatuv" },
      { en: "inconsistent", uz: "bir-biriga mos kelmaydigan" },
      { en: "contribution", uz: "hissa" },
    ],
    questions: [
      {
        id: "r43-q1",
        q: "What is citizen science?",
        options: ["Public participation in research", "Research conducted without observations", "A system that replaces all scientists", "A type of school examination"],
        answer: 0,
        explain: "The opening sentence defines citizen science as public contributions to research."
      },
      {
        id: "r43-q2",
        q: "Why do projects need quality checks?",
        options: ["Large datasets are always perfect", "Observations may be inconsistent", "Volunteers cannot observe nature", "Researchers dislike data"],
        answer: 1,
        explain: "The passage warns that inconsistent observations can reduce usefulness."
      },
      {
        id: "r43-q3",
        q: "What helps a citizen-science project succeed?",
        options: ["Hiding methods from volunteers", "Explaining methods and how contributions are used", "Collecting data without instructions", "Preventing public participation"],
        answer: 1,
        explain: "The final sentence identifies transparent methods and explaining data use as helpful."
      },
    ],
  },
  {
    id: "r44",
    title: "The Journey from Idea to Invention",
    level: "B2",
    text: `Inventions are often described as sudden flashes of inspiration, but many develop through repeated testing and revision. An early design may reveal a problem that was invisible on paper, while feedback from users can expose needs that inventors had overlooked. Failure in one trial can therefore provide useful information rather than simply marking the end of an attempt. At the same time, not every new idea becomes a successful product: cost, safety, materials and public demand all affect whether it can be used widely. Innovation usually combines creativity with patient, evidence-based improvement.`,
    vocab: [
      { en: "revision", uz: "qayta ko‘rib chiqish" },
      { en: "feedback", uz: "fikr-mulohaza" },
      { en: "overlook", uz: "e’tibordan chetda qoldirmoq" },
      { en: "innovation", uz: "yangilik yaratish" },
    ],
    questions: [
      {
        id: "r44-q1",
        q: "How do many inventions develop?",
        options: ["Through repeated testing and revision", "Without any experiments", "Only by accident", "By avoiding feedback"],
        answer: 0,
        explain: "The passage says many inventions emerge through repeated testing and revision."
      },
      {
        id: "r44-q2",
        q: "What can a failed trial provide?",
        options: ["Useful information for improvement", "Proof that science is useless", "A guarantee of market success", "A reason to ignore safety"],
        answer: 0,
        explain: "The text explains that failure can reveal information about a design."
      },
      {
        id: "r44-q3",
        q: "What affects whether an idea becomes widely used?",
        options: ["Creativity alone", "Cost, safety, materials and public demand", "The inventor's age only", "Whether the first trial is perfect"],
        answer: 1,
        explain: "The passage lists these practical factors as influences on adoption."
      },
    ],
  },
  {
    id: "r45",
    title: "Why Archaeologists Study Everyday Objects",
    level: "B2",
    text: `Archaeologists do not rely only on monuments or written records to understand the past. Small objects such as cooking pots, tools and beads can reveal how people worked, traded and organised daily life. Their meaning depends partly on context: an object found beside a dwelling may tell a different story from a similar object discovered in a burial site. Researchers compare materials, location and other evidence before making claims. Because many past communities left few written documents, carefully studying ordinary objects can help reconstruct lives that might otherwise remain poorly understood.`,
    vocab: [
      { en: "archaeologist", uz: "arxeolog" },
      { en: "context", uz: "kontekst, vaziyat" },
      { en: "dwelling", uz: "turar joy" },
      { en: "reconstruct", uz: "qayta tiklamoq" },
    ],
    questions: [
      {
        id: "r45-q1",
        q: "What can everyday objects reveal?",
        options: ["Details of work, trade and daily life", "Only the weather tomorrow", "The exact thoughts of every person", "Nothing about the past"],
        answer: 0,
        explain: "The passage says ordinary objects can reveal work, trade and daily organisation."
      },
      {
        id: "r45-q2",
        q: "Why does an object's context matter?",
        options: ["It can change how the object is interpreted", "It makes all objects identical", "It removes the need for evidence", "It proves the object is modern"],
        answer: 0,
        explain: "The text contrasts objects found beside a dwelling with similar objects in a burial site."
      },
      {
        id: "r45-q3",
        q: "Why are ordinary objects especially useful for some societies?",
        options: ["They always have written labels", "Some communities left few written documents", "They are easier to manufacture today", "They replace all scientific methods"],
        answer: 1,
        explain: "The passage notes that some communities left few written records."
      },
    ],
  },
  {
    id: "r46",
    title: "How Bees Help Food Systems",
    level: "B2",
    text: `Many flowering plants depend on animals to transfer pollen between flowers. Bees are among the best-known pollinators, although flies, butterflies, birds and other animals also contribute. Pollination supports the reproduction of wild plants and the production of many crops. The relationship is not automatic: habitat loss, some pesticides, parasites and disease can put pollinator populations under pressure. Gardens and farms can help by providing a variety of flowering plants and reducing unnecessary chemical use. Protecting pollinators benefits more than honey production; it supports ecological relationships and food systems.`,
    vocab: [
      { en: "pollinator", uz: "changlatuvchi jonivor" },
      { en: "pollen", uz: "gul changi" },
      { en: "parasite", uz: "parazit" },
      { en: "ecological", uz: "ekologik" },
    ],
    questions: [
      {
        id: "r46-q1",
        q: "What do pollinators transfer?",
        options: ["Pollen between flowers", "Water into clouds", "Seeds into the moon", "Soil into rivers"],
        answer: 0,
        explain: "The passage explains that pollinators transfer pollen between flowers."
      },
      {
        id: "r46-q2",
        q: "Which factor can put pollinators under pressure?",
        options: ["Habitat loss", "A variety of flowers", "Healthy ecosystems", "Careful gardening"],
        answer: 0,
        explain: "Habitat loss is listed as one of the pressures on pollinators."
      },
      {
        id: "r46-q3",
        q: "Why does pollinator protection matter?",
        options: ["Only for honey sales", "It supports plants and food systems", "It prevents all plant diseases", "It removes the need for farms"],
        answer: 1,
        explain: "The passage links pollinators to wild plants, crops and food systems."
      },
    ],
  },
  {
    id: "r47",
    title: "The Problem of Plastic Waste",
    level: "B2",
    text: `Plastic is useful because it can be light, durable and inexpensive, but these same qualities can make waste difficult to manage. Some plastic items are used briefly and then discarded, while fragments can persist in the environment for long periods. Waste may reach rivers and seas when collection systems are inadequate or litter is carried by wind and rain. Recycling can help with certain materials, but it depends on collection, sorting and suitable processing facilities. Reducing unnecessary single-use products and improving waste systems are therefore both important parts of addressing plastic pollution.`,
    vocab: [
      { en: "durable", uz: "mustahkam" },
      { en: "discard", uz: "tashlab yubormoq" },
      { en: "fragment", uz: "bo‘lak" },
      { en: "facility", uz: "inshoot, muassasa" },
    ],
    questions: [
      {
        id: "r47-q1",
        q: "Why can plastic waste be difficult to manage?",
        options: ["Plastic can be durable and persist in the environment", "Plastic always dissolves immediately", "It cannot be made into objects", "It exists only in oceans"],
        answer: 0,
        explain: "The passage says durability can make plastic waste difficult to manage."
      },
      {
        id: "r47-q2",
        q: "When may waste reach rivers and seas?",
        options: ["When collection systems are inadequate", "When all waste is safely contained", "Only during winter", "When nobody uses plastic"],
        answer: 0,
        explain: "The text identifies inadequate collection and wind or rain as pathways."
      },
      {
        id: "r47-q3",
        q: "What does the passage recommend?",
        options: ["Relying only on recycling", "Reducing single-use products and improving waste systems", "Burning all rubbish outdoors", "Ignoring collection services"],
        answer: 1,
        explain: "The final sentence identifies both reduction and better systems as important."
      },
    ],
  },
  {
    id: "r48",
    title: "How Satellites Observe Earth",
    level: "B2",
    text: `Satellites allow scientists to observe large areas of Earth repeatedly, including places that are difficult to reach from the ground. Different instruments measure different signals: some record visible light, while others detect heat or information beyond what human eyes can see. These measurements can help monitor forests, crops, ice and ocean conditions. Satellite data do not interpret themselves, however. Clouds, instrument limits and the need to compare measurements over time can complicate analysis. Researchers often combine satellite observations with ground measurements to build a more reliable picture of environmental change.`,
    vocab: [
      { en: "instrument", uz: "asbob" },
      { en: "detect", uz: "aniqlamoq" },
      { en: "measurement", uz: "o‘lchov" },
      { en: "analysis", uz: "tahlil" },
    ],
    questions: [
      {
        id: "r48-q1",
        q: "What is one advantage of satellites?",
        options: ["They can repeatedly observe large, hard-to-reach areas", "They never require interpretation", "They work only indoors", "They can see every detail without limits"],
        answer: 0,
        explain: "The passage says satellites repeatedly observe large areas, including hard-to-reach places."
      },
      {
        id: "r48-q2",
        q: "Why can satellite analysis be complicated?",
        options: ["Clouds and instrument limits affect measurements", "Satellites collect no data", "All measurements are identical", "Earth never changes"],
        answer: 0,
        explain: "The passage names clouds and instrument limits as complications."
      },
      {
        id: "r48-q3",
        q: "Why combine satellite and ground data?",
        options: ["To create a more reliable picture of change", "To prevent future observations", "To make instruments unnecessary", "To avoid comparing measurements"],
        answer: 0,
        explain: "Researchers combine both sources to improve the reliability of environmental understanding."
      },
    ],
  },
  {
    id: "r49",
    title: "The Importance of Dark Skies",
    level: "B2",
    text: `Artificial light has made streets and buildings safer and more convenient to use at night, but excessive or poorly directed lighting can create problems. It can make stars harder to see, waste electricity and affect animals that rely on natural patterns of light and darkness. Some migrating birds become disoriented around brightly lit buildings, while insects may gather around lamps instead of carrying out their usual activities. Better lighting does not necessarily mean darker streets: lights can be aimed where needed, dimmed when possible and chosen to reduce unnecessary glare.`,
    vocab: [
      { en: "artificial", uz: "sun’iy" },
      { en: "disoriented", uz: "yo‘nalishini yo‘qotgan" },
      { en: "migrate", uz: "ko‘chib yurmoq" },
      { en: "glare", uz: "ko‘zni qamashtiruvchi yorug‘lik" },
    ],
    questions: [
      {
        id: "r49-q1",
        q: "Which is a possible effect of excessive artificial light?",
        options: ["Stars become harder to see", "All animals become healthier", "Electricity use falls automatically", "Night disappears completely"],
        answer: 0,
        explain: "The passage says excessive lighting can make stars harder to see."
      },
      {
        id: "r49-q2",
        q: "How can bright buildings affect some migrating birds?",
        options: ["They may become disoriented", "They stop needing to migrate", "They create their own light", "They become insects"],
        answer: 0,
        explain: "The passage says some migrating birds become disoriented around bright buildings."
      },
      {
        id: "r49-q3",
        q: "What does the writer suggest about better lighting?",
        options: ["It must always be brighter", "It can be directed, dimmed and designed to reduce glare", "All outdoor lights should be removed", "Lighting has no benefits"],
        answer: 1,
        explain: "The final sentence lists aiming, dimming and reducing glare as options."
      },
    ],
  },
  {
    id: "r50",
    title: "Why Rivers Change Their Courses",
    level: "B2",
    text: `Rivers continually shape the land through erosion, transport and deposition. Water can wear away the outer bank of a bend, while slower flow on the inner bank allows sand and gravel to settle. Over time, a bend may become more pronounced and, under certain conditions, the river may cut through a narrow section and leave an abandoned loop. Human structures, vegetation and changes in rainfall can influence this process. River landscapes are therefore dynamic rather than fixed, and flood planning must take account of how channels may change.`,
    vocab: [
      { en: "erosion", uz: "yemirilish" },
      { en: "deposition", uz: "cho‘kindi to‘planishi" },
      { en: "gravel", uz: "shag‘al" },
      { en: "dynamic", uz: "doimiy o‘zgaruvchan" },
    ],
    questions: [
      {
        id: "r50-q1",
        q: "What can happen on the outer bank of a river bend?",
        options: ["Erosion may wear it away", "Sand always settles there", "The river stops moving", "No change is possible"],
        answer: 0,
        explain: "The passage says water can wear away the outer bank of a bend."
      },
      {
        id: "r50-q2",
        q: "How can an abandoned loop form?",
        options: ["A river may cut through a narrow section of a bend", "A river freezes permanently", "Rainfall stops forever", "A mountain moves downstream"],
        answer: 0,
        explain: "The text describes a river cutting through a narrow section and leaving a loop."
      },
      {
        id: "r50-q3",
        q: "What implication does the passage have for flood planning?",
        options: ["Channels should be treated as unchanging", "Possible channel changes need to be considered", "Only rainfall matters", "Rivers can be controlled perfectly"],
        answer: 1,
        explain: "Because rivers are dynamic, planning should consider changing channels."
      },
    ],
  },
  {
    id: "r51",
    title: "The Origins of Public Libraries",
    level: "B2",
    text: `Public libraries developed in different ways across countries, but many were created to widen access to books and learning beyond wealthy households. Their role has expanded as communities have needed more than printed collections. Modern libraries may provide internet access, study areas, workshops, language-learning activities and help with digital services. The institution remains valuable not because every person uses it in the same way, but because it offers shared resources that individuals might not be able to afford alone. Libraries also create public spaces where learning can take place without requiring a purchase.`,
    vocab: [
      { en: "access", uz: "foydalanish imkoniyati" },
      { en: "collection", uz: "to‘plam" },
      { en: "institution", uz: "muassasa" },
      { en: "resource", uz: "resurs, manba" },
    ],
    questions: [
      {
        id: "r51-q1",
        q: "What was one aim of many public libraries?",
        options: ["Widening access to books and learning", "Restricting books to wealthy families", "Replacing all schools", "Selling every book"],
        answer: 0,
        explain: "The passage says many libraries were created to widen access beyond wealthy households."
      },
      {
        id: "r51-q2",
        q: "Which service may a modern library provide?",
        options: ["Help with digital services", "Only private banking", "Vehicle repairs", "Airline control"],
        answer: 0,
        explain: "The passage lists help with digital services among modern library offerings."
      },
      {
        id: "r51-q3",
        q: "Why does the writer consider libraries valuable?",
        options: ["Everyone uses them identically", "They provide shared resources and public learning space", "They require people to buy something", "They no longer contain books"],
        answer: 1,
        explain: "The text emphasises shared resources and a place to learn without making a purchase."
      },
    ],
  },
  {
    id: "r52",
    title: "The Psychology of First Impressions",
    level: "C1",
    text: `People often form an initial impression of someone quickly, using limited information such as tone of voice, facial expression and behaviour. These early judgements can influence later interpretations, even when new evidence appears. Psychologists describe related tendencies as cognitive shortcuts: they save effort but can also lead to mistakes. A first impression is therefore not a complete assessment of character. Taking time to gather information, noticing assumptions and being willing to revise a judgement can reduce the influence of an early but inaccurate impression.`,
    vocab: [
      { en: "initial", uz: "dastlabki" },
      { en: "interpretation", uz: "talqin" },
      { en: "cognitive", uz: "idrokka oid" },
      { en: "assumption", uz: "taxmin" },
    ],
    questions: [
      {
        id: "r52-q1",
        q: "Why can first impressions be unreliable?",
        options: ["They are often based on limited information", "They always use complete evidence", "They never influence later views", "They require years to form"],
        answer: 0,
        explain: "The passage says initial impressions use limited information."
      },
      {
        id: "r52-q2",
        q: "What is one benefit of cognitive shortcuts?",
        options: ["They save effort", "They guarantee accuracy", "They remove all bias", "They provide complete biographies"],
        answer: 0,
        explain: "The passage says shortcuts save effort, though they can cause mistakes."
      },
      {
        id: "r52-q3",
        q: "How can people reduce the influence of an inaccurate first impression?",
        options: ["Refuse to consider new evidence", "Gather information and revise judgements", "Make every judgement immediately", "Treat assumptions as facts"],
        answer: 1,
        explain: "The passage recommends gathering information and being willing to revise a judgement."
      },
    ],
  },
  {
    id: "r53",
    title: "Why Some Animals Migrate",
    level: "B2",
    text: `Animal migration is a repeated movement between areas, often linked to seasonal changes in food, temperature or breeding conditions. Some birds travel thousands of kilometres, while fish, mammals and insects also migrate. The journey can be costly and dangerous, but it may allow animals to reach better feeding grounds or places where young have a higher chance of survival. Migration is not simply wandering: many species use environmental cues, inherited behaviours and experience to navigate. Changes in climate and land use can alter the timing or safety of these journeys.`,
    vocab: [
      { en: "seasonal", uz: "mavsumiy" },
      { en: "breeding", uz: "ko‘payish" },
      { en: "navigate", uz: "yo‘l topmoq" },
      { en: "inherited", uz: "irsiy" },
    ],
    questions: [
      {
        id: "r53-q1",
        q: "What can trigger migration?",
        options: ["Seasonal changes in food or breeding conditions", "A desire to avoid all movement", "The absence of environmental change", "Only human instructions"],
        answer: 0,
        explain: "The passage links migration to seasonal food, temperature and breeding conditions."
      },
      {
        id: "r53-q2",
        q: "Why might migration be worthwhile despite its risks?",
        options: ["It may lead to better feeding grounds or safer places for young", "It guarantees no danger", "It prevents animals from needing food", "It stops climate change"],
        answer: 0,
        explain: "The text says migration may improve access to food or survival conditions."
      },
      {
        id: "r53-q3",
        q: "What can affect migration journeys?",
        options: ["Climate and land-use changes", "Only the colour of feathers", "Nothing outside the animal", "The end of all seasons"],
        answer: 0,
        explain: "The passage says climate and land use can alter timing or safety."
      },
    ],
  },
  {
    id: "r54",
    title: "How Museums Preserve Fragile Objects",
    level: "B2",
    text: `Museum collections can include textiles, paper, metal, wood and other materials that respond differently to their surroundings. Light may fade dyes, moisture can encourage mould or corrosion, and sudden changes in temperature can place stress on some objects. Conservators monitor storage conditions and choose suitable supports, containers and display periods. Preservation does not mean preventing every change forever; it means slowing avoidable damage while allowing people to study and appreciate objects. Decisions must balance public access with the long-term survival of the collection.`,
    vocab: [
      { en: "textile", uz: "to‘qimachilik materiali" },
      { en: "corrosion", uz: "korroziya" },
      { en: "conservator", uz: "restavrator, saqlash mutaxassisi" },
      { en: "preservation", uz: "saqlash" },
    ],
    questions: [
      {
        id: "r54-q1",
        q: "Why do museums control light and moisture?",
        options: ["These conditions can damage objects", "They make objects heavier", "They remove the need for storage", "All materials react identically"],
        answer: 0,
        explain: "The passage explains that light and moisture can fade or damage materials."
      },
      {
        id: "r54-q2",
        q: "What is the goal of preservation?",
        options: ["To slow avoidable damage", "To prevent all change forever", "To hide every object permanently", "To make all objects identical"],
        answer: 0,
        explain: "The passage defines preservation as slowing avoidable damage."
      },
      {
        id: "r54-q3",
        q: "What balance must museums consider?",
        options: ["Public access and long-term survival", "Ticket prices and weather only", "Art and sport", "Storage and advertising only"],
        answer: 0,
        explain: "The final sentence states that access must be balanced against the collection's survival."
      },
    ],
  },
  {
    id: "r55",
    title: "The Hidden Work of Soil",
    level: "B2",
    text: `Soil is more than broken rock. It contains mineral particles, air, water, organic matter and a wide range of organisms. Fungi, bacteria, insects and worms help break down dead material and cycle nutrients that plants need. Soil structure also affects how water enters the ground and how easily roots grow. Heavy disturbance, erosion and contamination can reduce soil quality, sometimes over a short period, while rebuilding healthy soil may take much longer. Protecting soil therefore supports agriculture, water management and the wider ecosystems that depend on it.`,
    vocab: [
      { en: "organic matter", uz: "organik modda" },
      { en: "nutrient", uz: "oziqa moddasi" },
      { en: "erosion", uz: "yemirilish" },
      { en: "contamination", uz: "ifloslanish" },
    ],
    questions: [
      {
        id: "r55-q1",
        q: "What do soil organisms help do?",
        options: ["Break down dead material and cycle nutrients", "Turn soil into metal", "Stop all plant growth", "Remove all water"],
        answer: 0,
        explain: "The passage says organisms break down dead matter and cycle nutrients."
      },
      {
        id: "r55-q2",
        q: "How does soil structure affect plants?",
        options: ["It influences water movement and root growth", "It determines the colour of the sky", "It prevents roots from growing", "It has no effect"],
        answer: 0,
        explain: "The text links soil structure to water entry and root growth."
      },
      {
        id: "r55-q3",
        q: "Why is soil protection important?",
        options: ["It supports farming, water management and ecosystems", "Healthy soil is instantly replaceable", "Soil has no living organisms", "It only affects buildings"],
        answer: 0,
        explain: "The final sentence lists agriculture, water management and ecosystems."
      },
    ],
  },
  {
    id: "r56",
    title: "Renewable Energy and the Grid",
    level: "C1",
    text: `Wind and solar power generate electricity without burning fuel at the point of generation, but their output varies with weather and time of day. Electricity systems must keep supply and demand balanced, so a larger share of variable renewable energy can require better forecasting, flexible demand, storage or connections between regions. No single solution fits every place: geography, existing infrastructure and costs all matter. The transition is therefore not simply a matter of installing more panels or turbines; it also involves redesigning how electricity is stored, moved and managed.`,
    vocab: [
      { en: "variable", uz: "o‘zgaruvchan" },
      { en: "forecasting", uz: "oldindan prognoz qilish" },
      { en: "infrastructure", uz: "infratuzilma" },
      { en: "transition", uz: "o‘tish jarayoni" },
    ],
    questions: [
      {
        id: "r56-q1",
        q: "Why can wind and solar output vary?",
        options: ["Weather and time of day affect generation", "They depend only on coal supplies", "They operate identically at all times", "They store unlimited electricity"],
        answer: 0,
        explain: "The passage states that output varies with weather and time of day."
      },
      {
        id: "r56-q2",
        q: "What may help systems manage variable renewable energy?",
        options: ["Forecasting, storage and regional connections", "Ignoring demand", "Removing all transmission lines", "Using only one source everywhere"],
        answer: 0,
        explain: "The passage lists forecasting, flexible demand, storage and regional connections."
      },
      {
        id: "r56-q3",
        q: "What is the main point about the energy transition?",
        options: ["It only requires more turbines", "It also requires changes to storage, transport and management", "Infrastructure is irrelevant", "Every region needs the same solution"],
        answer: 1,
        explain: "The final sentence explains that the transition involves managing the whole electricity system."
      },
    ],
  },
  {
    id: "r57",
    title: "How Vaccines Train the Immune System",
    level: "B2",
    text: `The immune system protects the body by recognising and responding to harmful organisms. Vaccines help prepare this system by presenting an antigen or instructions that allow the body to recognise a particular target without requiring the person to experience the disease in its usual form. The immune system can then respond more quickly if it encounters that target later. Different vaccines work in different ways, and protection is not always complete or permanent. Public-health recommendations depend on evidence about safety, effectiveness, age and the risks associated with a disease.`,
    vocab: [
      { en: "immune system", uz: "immun tizimi" },
      { en: "antigen", uz: "antigen" },
      { en: "recognise", uz: "tanib olmoq" },
      { en: "effectiveness", uz: "samaradorlik" },
    ],
    questions: [
      {
        id: "r57-q1",
        q: "What is one purpose of vaccination?",
        options: ["To help the immune system recognise a target", "To remove the immune system", "To guarantee protection forever", "To cause every disease"],
        answer: 0,
        explain: "The passage says vaccines prepare the immune system to recognise a particular target."
      },
      {
        id: "r57-q2",
        q: "Does the passage claim that vaccines always provide complete, permanent protection?",
        options: ["Yes", "No; protection may not be complete or permanent", "Only for adults", "Only in winter"],
        answer: 1,
        explain: "The passage explicitly notes that protection is not always complete or permanent."
      },
      {
        id: "r57-q3",
        q: "What informs public-health recommendations?",
        options: ["Evidence about safety, effectiveness and risk", "Rumours alone", "A single person's preference only", "The colour of the vaccine"],
        answer: 0,
        explain: "The final sentence lists evidence about safety, effectiveness, age and disease risk."
      },
    ],
  },
  {
    id: "r58",
    title: "Why Clean Water Requires Protection",
    level: "B2",
    text: `Water may appear abundant because oceans, lakes and rivers cover much of Earth, yet only a limited portion is readily available as fresh water for human use. Water quality can be harmed by untreated wastewater, agricultural runoff and industrial pollution. Even when water is present, treatment and distribution systems are needed to make it safe and accessible. Protecting watersheds, monitoring supplies and maintaining infrastructure can prevent some problems before they become expensive emergencies. Water security is therefore about both the amount of water available and its quality and reliability.`,
    vocab: [
      { en: "abundant", uz: "mo‘l" },
      { en: "runoff", uz: "oqib tushadigan suv" },
      { en: "watershed", uz: "suv yig‘ilish havzasi" },
      { en: "reliability", uz: "ishonchlilik" },
    ],
    questions: [
      {
        id: "r58-q1",
        q: "Why is usable fresh water limited?",
        options: ["Only a portion is readily available for human use", "All water on Earth is fresh", "Oceans are safe to drink directly", "Fresh water never needs treatment"],
        answer: 0,
        explain: "The passage says only a limited portion is readily available as fresh water."
      },
      {
        id: "r58-q2",
        q: "What can harm water quality?",
        options: ["Untreated wastewater and agricultural runoff", "Careful monitoring", "Maintained pipes", "Protected watersheds"],
        answer: 0,
        explain: "The text lists untreated wastewater, agricultural runoff and industrial pollution."
      },
      {
        id: "r58-q3",
        q: "What does water security include?",
        options: ["Only the total volume of water", "Amount, quality and reliability", "Only bottled water", "Only rainfall"],
        answer: 1,
        explain: "The final sentence defines water security through amount, quality and reliability."
      },
    ],
  },
  {
    id: "r59",
    title: "The Mathematics of Traffic Flow",
    level: "C1",
    text: `Traffic congestion is not always proportional to the number of vehicles on a road. When traffic is moving freely, an additional car may have little effect. Near the road’s capacity, however, small disturbances can cause drivers to brake, creating waves of slowing traffic that travel backwards through the line of vehicles. A minor collision, lane change or sudden reduction in speed may then trigger a larger queue. Traffic engineers study these patterns to design safer junctions, adjust signals and encourage travel options that reduce pressure at busy times.`,
    vocab: [
      { en: "congestion", uz: "tirbandlik" },
      { en: "proportional", uz: "mutanosib" },
      { en: "disturbance", uz: "buzilish, to‘sqinlik" },
      { en: "trigger", uz: "boshlab yubormoq" },
    ],
    questions: [
      {
        id: "r59-q1",
        q: "When can a small disturbance create a large traffic queue?",
        options: ["When traffic is near road capacity", "When no vehicles are present", "Only on empty roads", "When every driver is stationary at home"],
        answer: 0,
        explain: "The passage says small disturbances near capacity can create waves of slowing traffic."
      },
      {
        id: "r59-q2",
        q: "What does the passage mean by traffic waves travelling backwards?",
        options: ["Slowing can move back through the line even as cars face forward", "Cars physically reverse along the road", "Roads move in reverse", "Traffic lights travel between cars"],
        answer: 0,
        explain: "The text describes waves of slowing traffic moving backwards through a queue."
      },
      {
        id: "r59-q3",
        q: "Why do engineers study traffic patterns?",
        options: ["To design safer junctions and manage demand", "To increase every journey time", "To remove all roads", "To prevent people travelling"],
        answer: 0,
        explain: "The final sentence names junction design, signal adjustment and alternative travel options."
      },
    ],
  },
  {
    id: "r60",
    title: "The Economics of Repairing Things",
    level: "B2",
    text: `Repairing an object can extend its useful life and reduce the need for new materials. Yet people sometimes replace items because repairs are inconvenient, spare parts are unavailable or the cost approaches the price of a new product. Product design affects this decision: objects that can be opened, diagnosed and supplied with replaceable components are often easier to repair. Repair also requires skills and access to trustworthy services. A more repair-friendly economy depends not only on individual choices but also on manufacturers, product standards and local repair networks.`,
    vocab: [
      { en: "extend", uz: "uzaytirmoq" },
      { en: "component", uz: "tarkibiy qism" },
      { en: "diagnose", uz: "nosozlikni aniqlamoq" },
      { en: "network", uz: "tarmoq" },
    ],
    questions: [
      {
        id: "r60-q1",
        q: "What is one benefit of repair?",
        options: ["It can reduce demand for new materials", "It always costs nothing", "It makes products last for only one day", "It removes the need for skills"],
        answer: 0,
        explain: "The passage says repair can extend useful life and reduce the need for new materials."
      },
      {
        id: "r60-q2",
        q: "What can make an object easier to repair?",
        options: ["Replaceable components and accessible design", "Sealed parts that cannot be opened", "Unavailable spare parts", "No diagnostic information"],
        answer: 0,
        explain: "The passage links repairability to objects that can be opened and have replaceable components."
      },
      {
        id: "r60-q3",
        q: "What is needed for a repair-friendly economy?",
        options: ["Individual choices alone", "Manufacturers, standards and local repair networks as well", "Only cheaper advertising", "Fewer repair skills"],
        answer: 1,
        explain: "The final sentence identifies several connected actors and systems."
      },
    ],
  },
  {
    id: "r61",
    title: "The Role of Museums in Difficult Histories",
    level: "C1",
    text: `Museums increasingly face questions about how to present objects connected with conflict, colonialism or unequal power. Displaying an object without explaining how it was obtained can create a misleading impression that collections formed through neutral or uncomplicated processes. Researchers may examine archival records, consult communities of origin and reconsider labels or display choices. There is rarely one method that resolves every disagreement, but transparency can make the reasoning behind decisions clearer. Museums are not only places where objects are stored; they are institutions that shape public understanding of the past.`,
    vocab: [
      { en: "colonialism", uz: "mustamlakachilik" },
      { en: "archive", uz: "arxiv" },
      { en: "consult", uz: "maslahatlashmoq" },
      { en: "transparency", uz: "shaffoflik" },
    ],
    questions: [
      {
        id: "r61-q1",
        q: "Why can displaying an object without its history mislead visitors?",
        options: ["It may hide how the object was obtained", "It makes the object disappear", "It proves every collection is neutral", "It provides too much context"],
        answer: 0,
        explain: "The passage says missing acquisition history can imply that collections formed through uncomplicated processes."
      },
      {
        id: "r61-q2",
        q: "What may museums do when reconsidering an object?",
        options: ["Consult communities of origin", "Destroy all records", "Avoid researching its history", "Remove all labels permanently"],
        answer: 0,
        explain: "The passage lists archival research and consultation with communities of origin."
      },
      {
        id: "r61-q3",
        q: "How does the writer describe museums?",
        options: ["As neutral storage rooms only", "As institutions that influence public understanding", "As places unrelated to history", "As organisations that never change"],
        answer: 1,
        explain: "The final sentence says museums shape public understanding of the past."
      },
    ],
  },
];
