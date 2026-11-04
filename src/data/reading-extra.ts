import type { ReadingPassage } from '../types';

export const READING_EXTRA: ReadingPassage[] = [
  {
    id: "r21",
    title: "The Community Garden",
    level: "A2",
    text: `Every Saturday morning, a group of neighbours meets on an empty piece of land behind the library. A year ago, the area was full of weeds and broken furniture. Now it has rows of tomatoes, beans and flowers. The project began when Ms Patel, a science teacher, suggested turning the space into a community garden.

People share the work. Some water the plants, while others make signs or collect fallen leaves for compost. Children have their own small beds where they grow herbs. The vegetables are shared among volunteers, and any extra produce is given to the local food bank.

The garden has changed more than the appearance of the street. Neighbours who hardly spoke before now exchange advice and recipes. They say the best part is not the vegetables but the friendships they have grown.`,
    vocab: [
      { en: "community", uz: "hamjamiyat" },
      { en: "weeds", uz: "begona o‘tlar" },
      { en: "row", uz: "qator" },
      { en: "compost", uz: "kompost" },
      { en: "volunteer", uz: "ko‘ngilli" },
      { en: "produce", uz: "qishloq xo‘jaligi mahsuloti" }
    ],
    questions: [
      {
        id: "r21-q1",
        q: "When do neighbours meet in the garden?",
        options: ["Every Friday evening", "Every Saturday morning", "Every Sunday afternoon", "Every school day"],
        answer: 1,
        explain: "Birinchi jumlada qo‘shnilar har shanba ertalab uchrashishi aytilgan.",
      },
      {
        id: "r21-q2",
        q: "Who first suggested creating the garden?",
        options: ["A librarian", "A local farmer", "Ms Patel", "The food bank manager"],
        answer: 2,
        explain: "Loyiha g‘oyasini fan o‘qituvchisi Ms Patel taklif qilgan.",
      },
      {
        id: "r21-q3",
        q: "What happens to extra vegetables?",
        options: ["They are sold at a market", "They are given to a food bank", "They are taken to school", "They are left in the garden"],
        answer: 1,
        explain: "Ortiqcha hosil mahalliy oziq-ovqat bankiga beriladi.",
      },
      {
        id: "r21-q4",
        q: "What do neighbours value most about the project?",
        options: ["The money they earn", "The size of the garden", "The new friendships", "The flowers"],
        answer: 2,
        explain: "Matn oxirida eng yaxshi jihat sabzavotlar emas, balki do‘stliklar ekani aytilgan.",
      }
    ],
  },
  {
    id: "r22",
    title: "A Library That Travels",
    level: "A2",
    text: `In a small town, not everyone lives close to the public library. Some older residents find the journey difficult, and families in nearby villages have limited transport. To help them, the library started a mobile service: a bright blue van filled with books.

The van follows the same route every Wednesday. It stops outside the health centre, the market and three village halls. Readers can borrow up to four books and return them on the next visit. The driver, Mr Lewis, also helps people choose books and explains how to use the library's online catalogue.

Children often wait excitedly for the van because it carries picture books and simple science kits. The service has made reading easier for people who once felt that the library was too far away.`,
    vocab: [
      { en: "resident", uz: "yashovchi" },
      { en: "mobile service", uz: "ko‘chma xizmat" },
      { en: "route", uz: "yo‘nalish" },
      { en: "borrow", uz: "qarzga olmoq" },
      { en: "catalogue", uz: "katalog" },
      { en: "kit", uz: "to‘plam" }
    ],
    questions: [
      {
        id: "r22-q1",
        q: "Why did the library start a mobile service?",
        options: ["The main building was closed", "Some people lived too far away", "It had too many books", "The town had no schools"],
        answer: 1,
        explain: "Ko‘chma xizmat kutubxonaga borishi qiyin yoki uzoq bo‘lgan aholiga yordam berish uchun boshlangan.",
      },
      {
        id: "r22-q2",
        q: "When does the van follow its route?",
        options: ["Every Monday", "Every Tuesday", "Every Wednesday", "Every Saturday"],
        answer: 2,
        explain: "Matnda furgon har chorshanba bir xil yo‘nalishda yurishi aytilgan.",
      },
      {
        id: "r22-q3",
        q: "How many books may a reader borrow?",
        options: ["Two", "Three", "Four", "Six"],
        answer: 2,
        explain: "O‘quvchilar to‘rttagacha kitob olishi mumkin.",
      },
      {
        id: "r22-q4",
        q: "Besides books, what does the van carry for children?",
        options: ["Sports equipment", "Simple science kits", "Musical instruments", "School uniforms"],
        answer: 1,
        explain: "Bolalar uchun rasmli kitoblar va oddiy ilmiy to‘plamlar ham olib kelinadi.",
      }
    ],
  },
  {
    id: "r23",
    title: "The Missing Lunchbox",
    level: "A1",
    text: `On Tuesday, Emma could not find her lunchbox. She looked in her school bag, under her desk and beside the classroom door. It was not there. Her friend Leo helped her search.

At break time, they went to the playground. A small boy was sitting on a bench with a blue lunchbox. Emma recognised the yellow star sticker on its lid. She politely asked him about it. The boy said he had found it near the football field and was waiting for its owner.

Emma thanked him and opened the box. Her sandwich and apple were still inside. She offered the boy one biscuit as a thank-you. They smiled and went back to class together.`,
    vocab: [
      { en: "lunchbox", uz: "ovqat soladigan quti" },
      { en: "search", uz: "qidirmoq" },
      { en: "playground", uz: "o‘yin maydonchasi" },
      { en: "recognise", uz: "tanib olmoq" },
      { en: "lid", uz: "qopqoq" },
      { en: "owner", uz: "egasi" }
    ],
    questions: [
      {
        id: "r23-q1",
        q: "When did Emma lose her lunchbox?",
        options: ["Monday", "Tuesday", "Wednesday", "Friday"],
        answer: 1,
        explain: "Matnning birinchi jumlasida voqea seshanba kuni bo‘lgani aytilgan.",
      },
      {
        id: "r23-q2",
        q: "Who helped Emma look for it?",
        options: ["Her teacher", "Her brother", "Leo", "A small boy"],
        answer: 2,
        explain: "Leo uning do‘sti va qidirishda yordam bergan.",
      },
      {
        id: "r23-q3",
        q: "Where did the boy find the lunchbox?",
        options: ["Near the football field", "In the library", "Under a desk", "At the bus stop"],
        answer: 0,
        explain: "Bola qutini futbol maydoni yaqinidan topgan.",
      },
      {
        id: "r23-q4",
        q: "How did Emma thank the boy?",
        options: ["She gave him a biscuit", "She bought him a toy", "She lent him a book", "She wrote him a letter"],
        answer: 0,
        explain: "Emma minnatdorchilik sifatida unga bitta pechenye taklif qilgan.",
      }
    ],
  },
  {
    id: "r24",
    title: "A Simple Recipe for Pancakes",
    level: "A1",
    text: `On Sunday, my older brother and I made pancakes for breakfast. First, we put one cup of flour and one egg into a large bowl. Then we added a cup of milk and mixed everything until the batter was smooth.

My brother heated a little oil in a pan. I poured in some batter and waited until small bubbles appeared. Then I turned the pancake over with a wooden spoon. We made six pancakes in total.

We ate them with sliced bananas and a little honey. The kitchen was messy, but we had fun. Next weekend, we want to make them again for our grandparents.`,
    vocab: [
      { en: "flour", uz: "un" },
      { en: "batter", uz: "quyuq suyuq xamir" },
      { en: "smooth", uz: "bir tekis, silliq" },
      { en: "pan", uz: "tova" },
      { en: "bubble", uz: "pufakcha" },
      { en: "slice", uz: "tilimlamoq" }
    ],
    questions: [
      {
        id: "r24-q1",
        q: "Who made pancakes with the writer?",
        options: ["A sister", "An older brother", "A grandmother", "A friend"],
        answer: 1,
        explain: "Yozuvchi yakshanba kuni akasi bilan quymoq tayyorlagan.",
      },
      {
        id: "r24-q2",
        q: "What did they add after the flour and egg?",
        options: ["Water and sugar", "Milk", "Cheese", "Butter"],
        answer: 1,
        explain: "Retseptda keyin bir stakan sut qo‘shilgani aytilgan.",
      },
      {
        id: "r24-q3",
        q: "What showed that the first side was ready?",
        options: ["The pan became cold", "The batter changed colour", "Small bubbles appeared", "The pancake became very hard"],
        answer: 2,
        explain: "Xamir yuzasida mayda pufakchalar paydo bo‘lgach, quymoqni ag‘darishgan.",
      },
      {
        id: "r24-q4",
        q: "Who do they want to cook for next weekend?",
        options: ["Their grandparents", "Their neighbours", "Their teacher", "Their cousins"],
        answer: 0,
        explain: "Oxirgi jumlada keyingi dam olish kuni buvi va bobosi uchun tayyorlashmoqchi ekanlari aytilgan.",
      }
    ],
  },
  {
    id: "r25",
    title: "The School Art Exhibition",
    level: "A2",
    text: `Our school held its first art exhibition last Thursday. Students from every year group displayed paintings, photographs and small sculptures in the hall. The theme was 'My World', so the work showed places, people and everyday moments that mattered to the artists.

I entered a photograph of the old clock tower in the town centre. I took it early in the morning when the streets were quiet. I did not win a prize, but several visitors asked me how I had captured the warm light.

The head teacher thanked everyone who took part. She said the exhibition would become an annual event. The money from the entrance tickets will help buy new art materials for the school.`,
    vocab: [
      { en: "exhibition", uz: "ko‘rgazma" },
      { en: "display", uz: "namoyish qilmoq" },
      { en: "sculpture", uz: "haykal" },
      { en: "theme", uz: "mavzu" },
      { en: "capture", uz: "tasvirga olmoq" },
      { en: "annual", uz: "yillik" }
    ],
    questions: [
      {
        id: "r25-q1",
        q: "Where was the exhibition held?",
        options: ["In the library", "In the school hall", "In the sports centre", "In the town museum"],
        answer: 1,
        explain: "Barcha san’at ishlari maktab zalida namoyish etilgan.",
      },
      {
        id: "r25-q2",
        q: "What was the exhibition's theme?",
        options: ["The Future", "My Family", "My World", "Our School"],
        answer: 2,
        explain: "Matnda mavzu “My World” deb berilgan.",
      },
      {
        id: "r25-q3",
        q: "When did the writer photograph the clock tower?",
        options: ["At lunchtime", "Late at night", "Early in the morning", "In the afternoon"],
        answer: 2,
        explain: "Yozuvchi ko‘chalar tinch bo‘lgan erta tongda suratga olgan.",
      },
      {
        id: "r25-q4",
        q: "What will ticket money be used for?",
        options: ["A school trip", "New art materials", "A new clock", "Sports uniforms"],
        answer: 1,
        explain: "Kirish chiptalaridan tushgan pul maktabga yangi san’at materiallari olishga sarflanadi.",
      }
    ],
  },
  {
    id: "r26",
    title: "Learning to Ride a Bicycle",
    level: "A2",
    text: `When I was eight, I wanted to ride a bicycle without training wheels. My uncle took me to a quiet park on Sunday mornings. At first, he held the back of the seat while I tried to keep the handlebars straight. I fell off twice, but I was wearing a helmet and knee pads, so I was not hurt.

After a few weeks, my uncle began running beside me without holding the bicycle. One morning, I suddenly noticed that he was several steps behind. I was riding by myself! I was so excited that I nearly forgot to use the brakes.

Now I ride to the park with my friends. I still remember how patient my uncle was, and I try to encourage younger children when they are learning something new.`,
    vocab: [
      { en: "training wheels", uz: "yordamchi g‘ildiraklar" },
      { en: "handlebar", uz: "velosiped rul(i)" },
      { en: "helmet", uz: "shlem" },
      { en: "knee pad", uz: "tizza himoyasi" },
      { en: "brake", uz: "tormoz" },
      { en: "encourage", uz: "ruh berib qo‘llab-quvvatlamoq" }
    ],
    questions: [
      {
        id: "r26-q1",
        q: "Where did the writer practise?",
        options: ["In a quiet park", "On a busy road", "At school", "In a sports hall"],
        answer: 0,
        explain: "Amakisi bilan yakshanba tonglari tinch parkda mashq qilgan.",
      },
      {
        id: "r26-q2",
        q: "What did the writer wear for safety?",
        options: ["A cap and gloves", "A helmet and knee pads", "A thick coat", "A life jacket"],
        answer: 1,
        explain: "Matnda shlem va tizza himoyasi kiyilgani aytilgan.",
      },
      {
        id: "r26-q3",
        q: "What did the writer notice one morning?",
        options: ["The bicycle had a flat tyre", "The uncle was holding the seat", "The uncle was behind and not holding the bike", "The park was closed"],
        answer: 2,
        explain: "Yozuvchi amakisi bir necha qadam orqada ekanini, velosipedni o‘zi boshqarayotganini payqagan.",
      },
      {
        id: "r26-q4",
        q: "What does the writer now try to do for younger children?",
        options: ["Buy them bicycles", "Teach them to drive", "Encourage them", "Race against them"],
        answer: 2,
        explain: "Yozuvchi yangi narsa o‘rganayotgan bolalarni ruhlantirishga harakat qiladi.",
      }
    ],
  },
  {
    id: "r27",
    title: "A Day Without Plastic",
    level: "B1",
    text: `When our science club announced a 'day without single-use plastic', I thought it would be easy. I already carried a reusable water bottle, so I expected to make only a few small changes. I was wrong. At the bakery, the assistant automatically put my bread in a plastic bag. At lunch, the café served its salad with a disposable fork.

I began to notice how often plastic appeared without my asking for it. The next day, I took a cloth bag and a reusable container with me. I also politely asked shop assistants whether I could refuse extra packaging.

The experiment did not solve the world's waste problem, but it changed my habits. I now plan ahead instead of accepting every convenience. Our club has shared the results with other classes and hopes to organise a longer challenge.`,
    vocab: [
      { en: "single-use", uz: "bir martalik" },
      { en: "reusable", uz: "qayta ishlatish mumkin bo‘lgan" },
      { en: "automatically", uz: "avtomatik ravishda" },
      { en: "disposable", uz: "bir marta ishlatiladigan" },
      { en: "packaging", uz: "qadoq" },
      { en: "convenience", uz: "qulaylik" }
    ],
    questions: [
      {
        id: "r27-q1",
        q: "What did the writer already use before the challenge?",
        options: ["A cloth shopping bag", "A reusable water bottle", "A metal lunchbox", "A paper cup"],
        answer: 1,
        explain: "Yozuvchi avvaldan qayta ishlatiladigan suv idishiga ega bo‘lgan.",
      },
      {
        id: "r27-q2",
        q: "What surprised the writer?",
        options: ["How expensive reusable items were", "How often plastic was used automatically", "How difficult the science test was", "How many people joined the club"],
        answer: 1,
        explain: "U plastik qadoqlar o‘zi so‘ramasa ham juda ko‘p joyda berilishini payqagan.",
      },
      {
        id: "r27-q3",
        q: "What did the writer take the next day?",
        options: ["A cloth bag and reusable container", "A plastic fork", "A paper bottle", "A large cardboard box"],
        answer: 0,
        explain: "Keyingi kuni mato sumka va qayta ishlatiladigan idish olib kelgan.",
      },
      {
        id: "r27-q4",
        q: "What was the main result of the experiment?",
        options: ["It ended plastic pollution", "It changed the writer's everyday habits", "It closed the bakery", "It stopped the café serving salads"],
        answer: 1,
        explain: "Tajriba butun dunyo muammosini hal qilmagan, lekin yozuvchining odatlarini o‘zgartirgan.",
      }
    ],
  },
  {
    id: "r28",
    title: "The Quiet Power of Public Parks",
    level: "B1",
    text: `In crowded cities, a public park can seem like a luxury. Yet research into urban life suggests that green spaces do much more than make streets attractive. They offer residents a place to walk, play, meet neighbours and take a break from traffic and noise.

Parks can also help cities cope with hot weather. Trees provide shade, while plants and soil absorb some rainwater instead of allowing it all to run quickly into drains. This can reduce local flooding after heavy rain. However, these benefits are not shared equally if parks are concentrated in wealthier districts.

City planners increasingly argue that green spaces should be treated as essential public services. A well-designed park is not simply decoration; it is part of the infrastructure that supports healthier and more connected communities.`,
    vocab: [
      { en: "urban", uz: "shaharga oid" },
      { en: "green space", uz: "ko‘kalamzor hudud" },
      { en: "resident", uz: "aholi vakili" },
      { en: "absorb", uz: "shimib olmoq" },
      { en: "drain", uz: "suv oqizish quvuri" },
      { en: "infrastructure", uz: "infratuzilma" }
    ],
    questions: [
      {
        id: "r28-q1",
        q: "According to the passage, what do parks offer residents?",
        options: ["Only places for sports", "Places to relax and meet others", "Free public transport", "Indoor study rooms"],
        answer: 1,
        explain: "Parklar sayr qilish, o‘ynash, qo‘shnilar bilan uchrashish va dam olish imkonini beradi.",
      },
      {
        id: "r28-q2",
        q: "How can trees and soil help during heavy rain?",
        options: ["They make rain stop", "They absorb some rainwater", "They send water into homes", "They increase traffic"],
        answer: 1,
        explain: "Daraxt va tuproq yomg‘ir suvining bir qismini shimib, drenajga tez oqib ketishini kamaytiradi.",
      },
      {
        id: "r28-q3",
        q: "What inequality does the writer identify?",
        options: ["Some districts have fewer green spaces", "All parks are too large", "Wealthy areas have no trees", "Parks are closed in summer"],
        answer: 0,
        explain: "Yashil hududlar boyroq tumanlarda ko‘proq bo‘lsa, foyda teng taqsimlanmaydi.",
      },
      {
        id: "r28-q4",
        q: "What is the writer's main argument?",
        options: ["Parks are expensive decorations", "Parks should be considered essential city services", "Cities should replace parks with roads", "Only children need parks"],
        answer: 1,
        explain: "Xulosa parklarni shunchaki bezak emas, sog‘lom jamiyat uchun zarur infratuzilma deb ko‘rish kerakligini ta’kidlaydi.",
      }
    ],
  },
  {
    id: "r29",
    title: "Why Bees Matter",
    level: "B1",
    text: `Bees are often associated with honey, but their most important contribution is pollination. As bees visit flowers to collect nectar and pollen, they transfer pollen between plants. This process helps many crops produce fruit and seeds.

Not every crop depends on bees, and other insects and animals also pollinate plants. Nevertheless, wild and managed bees play a significant role in food production. Their work supports a wide range of plants, which in turn provide habitats and food for other species.

Bee populations face several pressures, including loss of flower-rich habitats, some pesticides, parasites and changing weather patterns. Gardeners can help by planting a variety of flowers that bloom at different times and by avoiding unnecessary chemical treatments. Small local actions cannot solve every problem, but they can make gardens more welcoming to pollinators.`,
    vocab: [
      { en: "contribution", uz: "hissa" },
      { en: "pollination", uz: "changlanish" },
      { en: "nectar", uz: "gul shirasi" },
      { en: "pollen", uz: "gul changi" },
      { en: "crop", uz: "ekin" },
      { en: "habitat", uz: "yashash muhiti" }
    ],
    questions: [
      {
        id: "r29-q1",
        q: "What is the bees' most important contribution mentioned?",
        options: ["Making wax", "Pollination", "Building nests", "Eating insects"],
        answer: 1,
        explain: "Matnda asal bilan bog‘liq bo‘lsa-da, eng muhim hissasi changlatish ekani aytilgan.",
      },
      {
        id: "r29-q2",
        q: "What happens when bees visit flowers?",
        options: ["They transfer pollen between plants", "They remove all the leaves", "They make the soil dry", "They stop seeds from growing"],
        answer: 0,
        explain: "Asalarilar gullar orasida changni ko‘chirib, o‘simliklarning meva va urug‘ hosil qilishiga yordam beradi.",
      },
      {
        id: "r29-q3",
        q: "Which is listed as a pressure on bee populations?",
        options: ["Too many gardens", "Loss of flower-rich habitats", "A lack of honey shops", "Longer school days"],
        answer: 1,
        explain: "Asosiy xavflardan biri gullarga boy yashash hududlarining yo‘qolishidir.",
      },
      {
        id: "r29-q4",
        q: "What does the writer recommend gardeners do?",
        options: ["Use more chemicals", "Plant different flowers across seasons", "Remove all wild plants", "Keep gardens empty"],
        answer: 1,
        explain: "Turli va turli vaqtda gullaydigan o‘simliklarni ekish tavsiya etiladi.",
      }
    ],
  },
  {
    id: "r30",
    title: "The First Radio Broadcast",
    level: "B2",
    text: `Before radio became a familiar part of daily life, sending sound over long distances seemed almost magical. Early wireless experiments showed that messages could travel without cables, but turning those signals into a regular public service required further technical and organisational work.

In the early twentieth century, stations began experimenting with scheduled programmes. At first, broadcasts were limited and audiences were small. As receivers became more affordable, families gathered around them to hear music, news and live events. Radio changed the experience of distance: listeners could hear a voice from another city, or even another country, at the same moment.

The arrival of television later challenged radio's position, yet radio adapted rather than disappeared. It became portable, developed specialist formats and found new audiences through digital streaming. Its history illustrates that a communication technology can remain useful by changing the way people use it.`,
    vocab: [
      { en: "wireless", uz: "simsiz aloqa" },
      { en: "signal", uz: "signal" },
      { en: "broadcast", uz: "efirga uzatish" },
      { en: "receiver", uz: "qabul qilgich" },
      { en: "affordable", uz: "hamyonbop" },
      { en: "adapt", uz: "moslashmoq" }
    ],
    questions: [
      {
        id: "r30-q1",
        q: "What did early wireless experiments demonstrate?",
        options: ["Sound could travel without cables", "Television was unnecessary", "Music could be recorded on paper", "All messages were private"],
        answer: 0,
        explain: "Dastlabki tajribalar xabarlar simlarsiz uzatilishi mumkinligini ko‘rsatgan.",
      },
      {
        id: "r30-q2",
        q: "Why did families begin gathering around radios?",
        options: ["Receivers became more affordable", "Stations stopped playing music", "Television became cheaper", "Radio signals disappeared"],
        answer: 0,
        explain: "Qabul qilgichlar arzonlashgani sababli ko‘proq oilalar radio tinglay boshlagan.",
      },
      {
        id: "r30-q3",
        q: "How did radio respond to television?",
        options: ["It disappeared immediately", "It adapted and developed new formats", "It stopped broadcasting news", "It became less portable"],
        answer: 1,
        explain: "Radio yo‘qolib ketmagan, balki ko‘chma qurilmalar, maxsus dasturlar va raqamli oqimga moslashgan.",
      },
      {
        id: "r30-q4",
        q: "What broader lesson does the passage draw?",
        options: ["Technology never changes", "Older technologies can survive by adapting", "People dislike live events", "Communication must use cables"],
        answer: 1,
        explain: "Oxirgi jumla texnologiya foydalanish usulini o‘zgartirib, dolzarbligini saqlashi mumkinligini ko‘rsatadi.",
      }
    ],
  },
  {
    id: "r31",
    title: "A Museum of Everyday Objects",
    level: "B1",
    text: `The City Museum recently opened a small exhibition called 'Ordinary Things, Extraordinary Stories'. Instead of displaying royal jewellery or famous paintings, it focuses on objects that people used at home and at work: a baker's wooden spoon, a railway worker's lunch tin and a child's first school notebook.

Each object is accompanied by a short recording from someone who remembers it. One woman explains how her family's radio brought neighbours together during important football matches. Another visitor recognises a sewing machine that looks exactly like the one her grandmother used.

The curators hope visitors will realise that history is not only made by famous people. Everyday objects can reveal changes in technology, work and family life. The exhibition also invites local residents to lend photographs and objects for future displays.`,
    vocab: [
      { en: "exhibition", uz: "ko‘rgazma" },
      { en: "accompany", uz: "hamroh bo‘lmoq" },
      { en: "curator", uz: "muzey kuratori" },
      { en: "recognise", uz: "tanimoq" },
      { en: "reveal", uz: "oshkor qilmoq" },
      { en: "lend", uz: "vaqtincha berib turmoq" }
    ],
    questions: [
      {
        id: "r31-q1",
        q: "What kind of objects does the exhibition focus on?",
        options: ["Royal jewellery", "Everyday objects used at home and work", "Modern paintings", "Ancient weapons"],
        answer: 1,
        explain: "Ko‘rgazmada kundalik hayotda ishlatilgan oddiy buyumlar namoyish etiladi.",
      },
      {
        id: "r31-q2",
        q: "What accompanies each object?",
        options: ["A price label", "A short recording", "A science experiment", "A map of the city"],
        answer: 1,
        explain: "Har bir buyum yonida uni eslaydigan kishining qisqa audio yozuvi bor.",
      },
      {
        id: "r31-q3",
        q: "What do the curators want visitors to understand?",
        options: ["Only famous people make history", "Ordinary objects can tell us about history", "Old objects have no value", "Museums should not accept loans"],
        answer: 1,
        explain: "Kuratorlar kundalik buyumlar ham tarixiy o‘zgarishlarni ko‘rsatishini anglatmoqchi.",
      },
      {
        id: "r31-q4",
        q: "What can local residents do?",
        options: ["Buy the building", "Lend objects or photographs", "Remove the recordings", "Choose the museum director"],
        answer: 1,
        explain: "Mahalliy aholi kelajakdagi ko‘rgazmalar uchun surat yoki buyumlarini vaqtincha berishi mumkin.",
      }
    ],
  },
  {
    id: "r32",
    title: "The Science of a Good Night's Rest",
    level: "B2",
    text: `Sleep is sometimes treated as empty time, particularly by students facing deadlines. Yet the brain remains active while we rest. During sleep, it processes experiences and helps stabilise memories, making it easier to retrieve information later.

A consistent routine can support better rest. Going to bed and waking up at roughly the same time helps the body's internal clock. A calm, dark room is also useful, while bright light late in the evening can make it harder to feel sleepy. Caffeine may remain in the body for several hours, so drinking it late in the day can affect some people's sleep.

There is no single routine that works perfectly for everyone. Age, health and daily schedules all matter. Still, treating sleep as part of learning, rather than as time stolen from it, is a sensible starting point.`,
    vocab: [
      { en: "deadline", uz: "oxirgi muddat" },
      { en: "process", uz: "qayta ishlamoq" },
      { en: "stabilise", uz: "barqarorlashtirmoq" },
      { en: "retrieve", uz: "esga tushirmoq" },
      { en: "internal clock", uz: "ichki biologik soat" },
      { en: "sensible", uz: "oqilona" }
    ],
    questions: [
      {
        id: "r32-q1",
        q: "What does the brain do during sleep?",
        options: ["It stops processing information", "It helps stabilise memories", "It removes all experiences", "It only controls movement"],
        answer: 1,
        explain: "Matnda uyqu vaqtida miya tajribalarni qayta ishlab, xotiralarni mustahkamlashi aytilgan.",
      },
      {
        id: "r32-q2",
        q: "How can a consistent routine help?",
        options: ["It supports the body's internal clock", "It removes the need for rest", "It makes caffeine disappear", "It changes a person's age"],
        answer: 0,
        explain: "Bir xil vaqtda uxlash va uyg‘onish ichki biologik soatga yordam beradi.",
      },
      {
        id: "r32-q3",
        q: "Why might late caffeine affect sleep?",
        options: ["It can remain in the body for hours", "It makes rooms darker", "It improves memory instantly", "It lowers the temperature"],
        answer: 0,
        explain: "Kofein tanada bir necha soat qolishi mumkinligi sababli kech ichilsa uyquga ta’sir qiladi.",
      },
      {
        id: "r32-q4",
        q: "What is the writer's overall view?",
        options: ["Everyone needs exactly the same routine", "Sleep should be seen as part of learning", "Students should never study", "Sleep is useful only for children"],
        answer: 1,
        explain: "Muallif uyquni o‘qishga xalaqit emas, o‘rganish jarayonining bir qismi sifatida ko‘rishni tavsiya qiladi.",
      }
    ],
  },
  {
    id: "r33",
    title: "The Floating Market",
    level: "A2",
    text: `During our holiday in Thailand, my family visited a floating market outside the city. The market was on a narrow canal, and sellers travelled in small wooden boats. Some boats carried fruit and vegetables, while others sold hot noodles and sweet drinks.

We arrived early because our guide said the canal would become busy later. My mother bought mangoes, and my father tried a bowl of noodle soup from a boat with a red umbrella. I took photographs from the wooden walkway beside the water.

The market was noisy but friendly. Our guide explained that some local people still use the canal for everyday shopping, although many visitors now come to see the boats. It was a very different experience from shopping in a supermarket.`,
    vocab: [
      { en: "floating", uz: "suzib yuruvchi" },
      { en: "canal", uz: "kanal" },
      { en: "seller", uz: "sotuvchi" },
      { en: "wooden", uz: "yog‘ochdan yasalgan" },
      { en: "walkway", uz: "piyodalar yo‘lagi" },
      { en: "visitor", uz: "tashrif buyuruvchi" }
    ],
    questions: [
      {
        id: "r33-q1",
        q: "Where was the market?",
        options: ["On a mountain", "On a canal", "Inside a shopping centre", "Near an airport"],
        answer: 1,
        explain: "Bozor shahar tashqarisidagi tor kanal bo‘yida joylashgan.",
      },
      {
        id: "r33-q2",
        q: "How did sellers move around?",
        options: ["By bicycle", "In wooden boats", "On buses", "On foot"],
        answer: 1,
        explain: "Sotuvchilar kichik yog‘och qayiqlarda harakatlangan.",
      },
      {
        id: "r33-q3",
        q: "Why did the family arrive early?",
        options: ["The market closed at noon", "The canal would get busy later", "The guide was late", "They wanted to swim"],
        answer: 1,
        explain: "Yo‘lboshchi keyinroq kanal gavjum bo‘lishini aytgan.",
      },
      {
        id: "r33-q4",
        q: "What did the mother buy?",
        options: ["Mangoes", "Noodles", "A red umbrella", "Photographs"],
        answer: 0,
        explain: "Onasi bozordan mango sotib olgan.",
      }
    ],
  },
  {
    id: "r34",
    title: "The Power of Taking Notes",
    level: "B1",
    text: `When students listen to a lesson, trying to write down every word can become a distraction. Effective note-taking is not about creating a complete record; it is about selecting the ideas that will help you understand and remember the topic.

One useful method is to divide a page into sections. Write key terms and questions on one side, and add short explanations on the other. Leave some space at the bottom for a brief summary after the lesson. Using symbols and abbreviations can save time, provided you still understand them later.

Notes are most useful when they are reviewed soon after class. Add missing details while the lesson is still fresh in your mind, then use the notes to explain the topic in your own words. This turns note-taking from copying into active learning.`,
    vocab: [
      { en: "distraction", uz: "chalg‘ituvchi narsa" },
      { en: "select", uz: "tanlab olmoq" },
      { en: "section", uz: "bo‘lim" },
      { en: "abbreviation", uz: "qisqartma" },
      { en: "provided", uz: "agar ... bo‘lsa" },
      { en: "review", uz: "qayta ko‘rib chiqmoq" }
    ],
    questions: [
      {
        id: "r34-q1",
        q: "What is effective note-taking mainly about?",
        options: ["Writing every spoken word", "Selecting useful ideas", "Drawing perfect pictures", "Using many colours"],
        answer: 1,
        explain: "Muallif samarali qayd yozish barcha so‘zlarni ko‘chirish emas, muhim fikrlarni tanlash ekanini aytadi.",
      },
      {
        id: "r34-q2",
        q: "What should students leave at the bottom of the page?",
        options: ["A brief summary", "Their phone number", "A list of classmates", "A drawing"],
        answer: 0,
        explain: "Sahifaning pastida darsdan keyin qisqa xulosa uchun joy qoldirish tavsiya etiladi.",
      },
      {
        id: "r34-q3",
        q: "When are notes most useful to review?",
        options: ["Several months later", "Soon after class", "Only before exams", "Before the lesson begins"],
        answer: 1,
        explain: "Darsdan keyin tez orada qayta ko‘rish foydaliroq.",
      },
      {
        id: "r34-q4",
        q: "What does the final sentence suggest?",
        options: ["Notes should be copied exactly", "Note-taking can become active learning", "Students should stop writing", "Teachers should collect all notes"],
        answer: 1,
        explain: "O‘z so‘zlari bilan mavzuni tushuntirish qayd yozishni faol o‘rganishga aylantiradi.",
      }
    ],
  },
  {
    id: "r35",
    title: "A Walk Through Samarkand",
    level: "B1",
    text: `Visitors often arrive in Samarkand expecting to see famous blue-tiled buildings, but the city is more than a collection of monuments. Its streets reveal layers of history, from traditional courtyards to modern cafés and busy workshops.

A local guide may begin at Registan Square, where three madrasahs frame an open space. From there, a short walk leads to the old trading domes, where craftspeople sell ceramics, textiles and metalwork. The objects are not simply souvenirs; many designs reflect skills passed from one generation to another.

To understand the city, it helps to slow down. Notice the patterns on a doorway, listen to the sound of a workshop and speak to the people who keep local traditions alive. The most memorable discoveries are sometimes made between the famous sights.`,
    vocab: [
      { en: "monument", uz: "yodgorlik" },
      { en: "courtyard", uz: "ichki hovli" },
      { en: "madrasah", uz: "madrasa" },
      { en: "trading dome", uz: "savdo gumbazi" },
      { en: "craftspeople", uz: "hunarmandlar" },
      { en: "generation", uz: "avlod" }
    ],
    questions: [
      {
        id: "r35-q1",
        q: "What do visitors often expect to see?",
        options: ["Modern factories", "Blue-tiled buildings", "Large beaches", "Mountain villages"],
        answer: 1,
        explain: "Birinchi jumlada sayyohlar ko‘k koshinli binolarni ko‘rishni kutishi aytilgan.",
      },
      {
        id: "r35-q2",
        q: "What can visitors find near the old trading domes?",
        options: ["Ceramics and textiles", "Only fresh fish", "Electronic devices", "Sports equipment"],
        answer: 0,
        explain: "Savdo gumbazlari atrofida kulolchilik buyumlari, matolar va metall buyumlar sotiladi.",
      },
      {
        id: "r35-q3",
        q: "Why are the crafts important?",
        options: ["They are all newly invented", "Their designs reflect skills passed between generations", "They are made only for tourists", "They have no local meaning"],
        answer: 1,
        explain: "Ko‘plab dizaynlar avloddan-avlodga o‘tgan hunarlarni aks ettiradi.",
      },
      {
        id: "r35-q4",
        q: "What does the writer advise visitors to do?",
        options: ["Rush between monuments", "Only buy souvenirs", "Slow down and notice everyday details", "Avoid talking to local people"],
        answer: 2,
        explain: "Muallif shaharni yaxshiroq anglash uchun shoshilmaslik, mayda tafsilotlarga e’tibor berishni maslahat beradi.",
      }
    ],
  },
  {
    id: "r36",
    title: "When Cities Become Hotter",
    level: "B2",
    text: `Urban areas can become warmer than the countryside around them, a pattern known as the urban heat island effect. Buildings, roads and car parks absorb energy from sunlight and release it slowly, while areas with fewer trees offer less shade and cooling through evaporation.

The effect is not distributed evenly. Neighbourhoods with wide roads and limited green space may experience higher temperatures than districts with parks and mature trees. This matters because extreme heat can affect health, energy use and the comfort of people who work outdoors.

There is no single solution. Planting trees, creating shaded public spaces, using lighter materials on roofs and designing buildings to allow airflow can all help. However, these measures need to be planned across entire neighbourhoods. A few attractive green projects cannot compensate for a city that continues to remove trees and cover open ground with concrete.`,
    vocab: [
      { en: "urban heat island", uz: "shahar issiqlik oroli hodisasi" },
      { en: "absorb", uz: "yutmoq, shimmoq" },
      { en: "evaporation", uz: "bug‘lanish" },
      { en: "distribute", uz: "taqsimlamoq" },
      { en: "extreme", uz: "keskin, haddan tashqari" },
      { en: "airflow", uz: "havo oqimi" }
    ],
    questions: [
      {
        id: "r36-q1",
        q: "What is the urban heat island effect?",
        options: ["Cities becoming warmer than nearby countryside", "Rural areas becoming warmer than cities", "A change in ocean temperature", "A type of air pollution"],
        answer: 0,
        explain: "Matn shahar hududlari atrofdagi qishloq joylardan issiqroq bo‘lish hodisasini ta’riflaydi.",
      },
      {
        id: "r36-q2",
        q: "Why can roads and buildings increase heat?",
        options: ["They absorb sunlight energy and release it slowly", "They create more rainfall", "They block all wind", "They reflect every ray of sunlight"],
        answer: 0,
        explain: "Yo‘llar va binolar quyosh energiyasini yutib, sekin chiqaradi.",
      },
      {
        id: "r36-q3",
        q: "Which neighbourhood may be hotter?",
        options: ["One with mature trees", "One with parks", "One with wide roads and little green space", "One beside a forest"],
        answer: 2,
        explain: "Yashil hududi kam va keng yo‘llari bor mahallalarda harorat yuqoriroq bo‘lishi mumkin.",
      },
      {
        id: "r36-q4",
        q: "What limitation of small green projects does the writer mention?",
        options: ["They are always too expensive", "They cannot offset wider tree removal and concrete cover", "They attract too many birds", "They make buildings colder in winter"],
        answer: 1,
        explain: "Bir nechta loyiha butun shahar bo‘ylab daraxtlarni kesish va beton qoplamani qoplab ketolmaydi.",
      }
    ],
  },
  {
    id: "r37",
    title: "A Student Exchange Visit",
    level: "A2",
    text: `Last month, our class welcomed twelve students from a school in South Korea. They stayed in our town for five days as part of an exchange programme. On the first morning, we showed them around our school and introduced them to our teachers.

During the week, we worked in mixed groups on a project about traditional food. Our visitors taught us how to make a simple Korean rice dish, and we showed them how to prepare a local salad. We also visited a history museum and played a friendly volleyball match.

At first, some students were nervous because we spoke different languages. By the final day, however, everyone was exchanging messages and taking group photographs. We learned that sharing activities can help people communicate even when their words are limited.`,
    vocab: [
      { en: "exchange programme", uz: "almashinuv dasturi" },
      { en: "welcome", uz: "kutib olmoq" },
      { en: "mixed group", uz: "aralash guruh" },
      { en: "traditional", uz: "an’anaviy" },
      { en: "prepare", uz: "tayyorlamoq" },
      { en: "communicate", uz: "muloqot qilmoq" }
    ],
    questions: [
      {
        id: "r37-q1",
        q: "How long did the visitors stay?",
        options: ["Two days", "Three days", "Five days", "One week"],
        answer: 2,
        explain: "Mehmon o‘quvchilar shaharda besh kun qolishgan.",
      },
      {
        id: "r37-q2",
        q: "What project did the students work on?",
        options: ["Traditional food", "Local transport", "School uniforms", "Modern music"],
        answer: 0,
        explain: "Ular an’anaviy taomlar haqida loyiha tayyorlashgan.",
      },
      {
        id: "r37-q3",
        q: "What sport did they play together?",
        options: ["Basketball", "Volleyball", "Tennis", "Football"],
        answer: 1,
        explain: "Dastur davomida do‘stona voleybol o‘yini bo‘lgan.",
      },
      {
        id: "r37-q4",
        q: "What helped the students communicate?",
        options: ["Only using dictionaries", "Sharing activities", "Staying in separate rooms", "Avoiding group work"],
        answer: 1,
        explain: "Birgalikdagi mashg‘ulotlar turli tillarda gaplashadigan o‘quvchilarga muloqot qilishga yordam bergan.",
      }
    ],
  },
  {
    id: "r38",
    title: "The Hidden Work of Bees in Cities",
    level: "B2",
    text: `City gardens are sometimes dismissed as too small to matter for wildlife. Yet a network of balconies, parks, roadside trees and community plots can provide food and shelter for pollinating insects. For a bee, a sequence of small green spaces may be more useful than one isolated patch.

The quality of these spaces matters as much as their number. A lawn cut short every week offers little food, whereas a mix of flowering plants can provide nectar across several seasons. Water sources and nesting places also make a difference. Gardeners do not need to turn every space into a wild meadow; even a few carefully chosen plants can contribute.

Urban biodiversity depends on many connected decisions. Local councils can protect mature trees, while residents can choose plants that support insects. The aim is not to make cities look untidy, but to recognise that nature needs continuity as well as attractive individual parks.`,
    vocab: [
      { en: "dismiss", uz: "ahamiyatsiz deb hisoblamoq" },
      { en: "network", uz: "tarmoq" },
      { en: "isolated", uz: "alohida, uzilgan" },
      { en: "nectar", uz: "gul shirasi" },
      { en: "biodiversity", uz: "biologik xilma-xillik" },
      { en: "continuity", uz: "uzluksizlik" }
    ],
    questions: [
      {
        id: "r38-q1",
        q: "Why can several small green spaces be useful?",
        options: ["They can form a connected route of food and shelter", "They stop all city traffic", "They replace every large park", "They prevent all insects from moving"],
        answer: 0,
        explain: "Bir-biriga yaqin kichik yashil joylar changlatuvchilar uchun oziq va boshpana tarmog‘ini yaratishi mumkin.",
      },
      {
        id: "r38-q2",
        q: "What is the problem with a lawn cut very short?",
        options: ["It offers little food for insects", "It uses too much sunlight", "It attracts too many birds", "It produces too much nectar"],
        answer: 0,
        explain: "Juda kalta qilib kesilgan maysazorda hasharotlar uchun oziq kam bo‘ladi.",
      },
      {
        id: "r38-q3",
        q: "According to the writer, what else besides flowers can help?",
        options: ["Water sources and nesting places", "Bright street signs", "More car parks", "Indoor swimming pools"],
        answer: 0,
        explain: "Suv manbalari va uya qurish joylari ham foydali.",
      },
      {
        id: "r38-q4",
        q: "What is the main point of the final paragraph?",
        options: ["Cities should remove all parks", "Biodiversity needs connected efforts from councils and residents", "Only councils can help nature", "Urban nature must look completely wild"],
        answer: 1,
        explain: "Biologik xilma-xillik uchun mahalliy hokimiyat va aholining o‘zaro bog‘liq qarorlari zarur.",
      }
    ],
  },
  {
    id: "r39",
    title: "The Oldest Map in the Classroom",
    level: "A2",
    text: `Our geography teacher brought an old map to class last week. It showed our country as it looked many years ago. Some city names were different, and several roads that we use today were not on the map at all.

We worked in pairs and compared the old map with a modern one on the classroom screen. We noticed that the town had grown towards the east, where a new railway station and several housing areas had been built. The river, however, followed almost the same route.

The teacher explained that maps are useful records of change. They can show how people travel, where new buildings appear and which natural features remain. I had always thought maps were only for finding places, but now I see that they also tell stories.`,
    vocab: [
      { en: "geography", uz: "geografiya" },
      { en: "compare", uz: "taqqoslamoq" },
      { en: "railway station", uz: "temiryo‘l vokzali" },
      { en: "housing area", uz: "turar joy hududi" },
      { en: "route", uz: "yo‘nalish" },
      { en: "feature", uz: "xususiyat" }
    ],
    questions: [
      {
        id: "r39-q1",
        q: "What did the old map show?",
        options: ["The country many years ago", "A future city plan", "Only mountain paths", "A map of another planet"],
        answer: 0,
        explain: "Eski xaritada mamlakatning ko‘p yillar avvalgi ko‘rinishi tasvirlangan.",
      },
      {
        id: "r39-q2",
        q: "How did students compare the maps?",
        options: ["By drawing new roads", "In pairs using a classroom screen", "By visiting the railway station", "By asking local drivers"],
        answer: 1,
        explain: "O‘quvchilar juftlikda ishlashib, zamonaviy xaritani ekranda ko‘rishgan.",
      },
      {
        id: "r39-q3",
        q: "In which direction had the town grown?",
        options: ["North", "South", "East", "West"],
        answer: 2,
        explain: "Matnda shahar sharq tomonga kengaygani aytilgan.",
      },
      {
        id: "r39-q4",
        q: "What did the writer learn about maps?",
        options: ["They are only for finding places", "They can show how places change over time", "They are always inaccurate", "They cannot show natural features"],
        answer: 1,
        explain: "Xaritalar joylarni topishdan tashqari, vaqt o‘tishi bilan yuz bergan o‘zgarishlarni ham hikoya qiladi.",
      }
    ],
  },
  {
    id: "r40",
    title: "The Value of Repair Cafés",
    level: "B2",
    text: `A repair café is a community event where people bring broken household objects and work with volunteers to fix them. The atmosphere is usually informal: someone may arrive with a lamp that no longer switches on, while another person brings a jacket with a torn seam.

The purpose is not simply to save money. Repair events allow people to learn practical skills, share tools and keep useful materials out of the waste stream. They also challenge the assumption that a faulty object must immediately be replaced. Sometimes a small repair can extend the life of an item for years.

Repair cafés do have limits. Some products are difficult or unsafe to repair, and spare parts may be unavailable. Even so, organisers argue that the events encourage a more thoughtful relationship with the things we own. They turn maintenance into a shared activity rather than an invisible task.`,
    vocab: [
      { en: "household", uz: "uy-ro‘zg‘orga oid" },
      { en: "volunteer", uz: "ko‘ngilli" },
      { en: "seam", uz: "tikuv choki" },
      { en: "waste stream", uz: "chiqindi oqimi" },
      { en: "faulty", uz: "nosoz" },
      { en: "maintenance", uz: "texnik xizmat, parvarish" }
    ],
    questions: [
      {
        id: "r40-q1",
        q: "What happens at a repair café?",
        options: ["People exchange new products", "People work together to fix household items", "People learn to cook", "People sell old furniture"],
        answer: 1,
        explain: "Repair café tadbirida odamlar uy buyumlarini ko‘ngillilar bilan birga tuzatishga harakat qiladi.",
      },
      {
        id: "r40-q2",
        q: "What is one benefit besides saving money?",
        options: ["Learning practical skills", "Getting free electricity", "Buying replacement products", "Avoiding all household work"],
        answer: 0,
        explain: "Tadbirlar amaliy ko‘nikmalarni o‘rganish va asboblarni bo‘lishishga imkon beradi.",
      },
      {
        id: "r40-q3",
        q: "What limitation is mentioned?",
        options: ["All repairs take several days", "Some products are difficult or unsafe to repair", "Volunteers never have tools", "No one brings clothing"],
        answer: 1,
        explain: "Ba’zi buyumlarni tuzatish qiyin yoki xavfsiz emas, ehtiyot qismlar ham topilmasligi mumkin.",
      },
      {
        id: "r40-q4",
        q: "How do organisers want people to view maintenance?",
        options: ["As an unnecessary expense", "As a shared and thoughtful activity", "As a job for factories only", "As a reason to replace everything"],
        answer: 1,
        explain: "Tashkilotchilar ta’mirlashni birgalikda bajariladigan foydali faoliyat sifatida ko‘rsatmoqchi.",
      }
    ],
  },
  {
    id: "r41",
    title: "The Girl Who Recorded Birdsong",
    level: "B1",
    text: `At the edge of her village, Laylo began recording birds with a small microphone borrowed from the school science club. She was curious about why some birds seemed to sing more loudly just before sunrise. At first, she could identify only a few common calls, so she kept a notebook and asked her biology teacher for help.

After several weeks, Laylo noticed that the sounds changed with the season. Some birds became quieter after nesting, while others arrived later in the year. She shared short recordings with a local nature group, whose members helped identify unfamiliar species.

Her project became part of a school presentation about local wildlife. Laylo says the most important discovery was not a rare bird but the value of paying attention. Once she started listening carefully, the familiar landscape seemed full of new information.`,
    vocab: [
      { en: "record", uz: "yozib olmoq" },
      { en: "microphone", uz: "mikrofon" },
      { en: "identify", uz: "aniqlamoq" },
      { en: "call", uz: "qush sayrashi" },
      { en: "nesting", uz: "uya qurish" },
      { en: "species", uz: "tur" }
    ],
    questions: [
      {
        id: "r41-q1",
        q: "What equipment did Laylo borrow?",
        options: ["A camera", "A microphone", "A telescope", "A laptop"],
        answer: 1,
        explain: "Laylo maktab fan to‘garagidan kichik mikrofon olgan.",
      },
      {
        id: "r41-q2",
        q: "Why did she keep a notebook?",
        options: ["To write poems", "To record bird calls she was learning", "To list her homework", "To draw the village map"],
        answer: 1,
        explain: "U tanib olayotgan qush tovushlarini qayd etish uchun daftar yuritgan.",
      },
      {
        id: "r41-q3",
        q: "Who helped identify unfamiliar species?",
        options: ["A local nature group", "Her neighbours", "The school cook", "A tourist guide"],
        answer: 0,
        explain: "Mahalliy tabiat guruhi a’zolari notanish qush turlarini aniqlashga yordam bergan.",
      },
      {
        id: "r41-q4",
        q: "What did Laylo consider her most important discovery?",
        options: ["Finding a rare bird", "Buying new equipment", "Learning to pay attention", "Winning a competition"],
        answer: 2,
        explain: "Uningcha, eng muhim kashfiyot atrofga diqqat bilan quloq solishning qadri bo‘lgan.",
      }
    ],
  },
  {
    id: "r42",
    title: "How Maps Help During Disasters",
    level: "B2",
    text: `When floods, earthquakes or wildfires affect a region, reliable maps can help emergency teams decide where to go first. Maps combine information about roads, rivers, buildings and population centres, allowing planners to identify areas that may be difficult to reach or especially vulnerable.

Modern digital maps can be updated with information from satellites, aircraft and people on the ground. However, technology does not automatically guarantee accuracy. A road may be blocked after a landslide, or a bridge shown on an old map may no longer be safe. Local knowledge is therefore essential: residents can report changes that remote systems have not yet recorded.

The most useful emergency maps are not simply detailed; they are current, clear and designed for the people who must act on them. Good information can support better decisions, but it must be checked and communicated carefully.`,
    vocab: [
      { en: "reliable", uz: "ishonchli" },
      { en: "emergency team", uz: "favqulodda vaziyatlar guruhi" },
      { en: "vulnerable", uz: "zaif, xavf ostidagi" },
      { en: "satellite", uz: "sun’iy yo‘ldosh" },
      { en: "landslide", uz: "ko‘chki" },
      { en: "remote", uz: "masofaviy" }
    ],
    questions: [
      {
        id: "r42-q1",
        q: "How can maps help emergency teams?",
        options: ["By showing routes and vulnerable areas", "By predicting every event exactly", "By replacing all local workers", "By stopping bad weather"],
        answer: 0,
        explain: "Xaritalar yo‘llar, daryolar, binolar va xavfga moyil hududlarni ko‘rsatadi.",
      },
      {
        id: "r42-q2",
        q: "Where can modern digital maps get updated information?",
        options: ["Only from printed books", "Satellites, aircraft and people on the ground", "Only from old photographs", "From weather balloons only"],
        answer: 1,
        explain: "Matnda sun’iy yo‘ldoshlar, samolyotlar va joydagi odamlardan ma’lumot olinishi aytilgan.",
      },
      {
        id: "r42-q3",
        q: "Why is local knowledge essential?",
        options: ["Remote maps are always perfect", "Residents can report recent changes", "Local people control satellites", "It makes maps colourful"],
        answer: 1,
        explain: "Aholi masalan, ko‘chki sabab yopilgan yo‘l kabi hali xaritada aks etmagan o‘zgarishlarni xabar qilishi mumkin.",
      },
      {
        id: "r42-q4",
        q: "What qualities should useful emergency maps have?",
        options: ["They should be old and detailed", "They should be current, clear and practical", "They should show only roads", "They should avoid local information"],
        answer: 1,
        explain: "Muallif eng foydali xaritalar yangilangan, tushunarli va ulardan foydalanuvchilar uchun mos bo‘lishi kerakligini aytadi.",
      }
    ],
  },
  {
    id: "r43",
    title: "A Small Change at the Bus Stop",
    level: "A2",
    text: `For years, the bus stop near our school had no roof or seats. On rainy days, students stood close together, and in summer there was little shade. One afternoon, our class wrote a polite letter to the town council asking for a better waiting area.

Two months later, workers arrived. They installed a covered shelter, three seats and a timetable with larger letters. A local shop also placed a small rubbish bin nearby. The changes were simple, but they made the stop more comfortable for students and older passengers.

Our teacher used the project to show us that writing to local organisations can be useful. We learned to describe a problem clearly, suggest a practical solution and explain who would benefit.`,
    vocab: [
      { en: "shelter", uz: "boshpana, bekat soyaboni" },
      { en: "council", uz: "mahalliy kengash" },
      { en: "install", uz: "o‘rnatmoq" },
      { en: "timetable", uz: "jadval" },
      { en: "passenger", uz: "yo‘lovchi" },
      { en: "benefit", uz: "foyda ko‘rmoq" }
    ],
    questions: [
      {
        id: "r43-q1",
        q: "What was missing from the bus stop?",
        options: ["A road sign", "A roof and seats", "A ticket machine", "A traffic light"],
        answer: 1,
        explain: "Bekatda avval tom va o‘rindiqlar bo‘lmagan.",
      },
      {
        id: "r43-q2",
        q: "Who did the class write to?",
        options: ["The school principal", "The town council", "The bus driver", "A local newspaper"],
        answer: 1,
        explain: "Sinf yaxshiroq kutish joyi so‘rab mahalliy kengashga xat yozgan.",
      },
      {
        id: "r43-q3",
        q: "What was installed?",
        options: ["A shelter, seats and a timetable", "A shop and a café", "A new road", "A bicycle stand"],
        answer: 0,
        explain: "Ishchilar yopiq bekat, uchta o‘rindiq va katta harfli jadval o‘rnatishgan.",
      },
      {
        id: "r43-q4",
        q: "What did the students learn from the project?",
        options: ["Letters cannot change anything", "How to explain a problem and suggest a solution", "How to build a bus", "How to drive safely"],
        answer: 1,
        explain: "Loyiha muammoni aniq tasvirlash va amaliy yechim taklif qilishni o‘rgatgan.",
      }
    ],
  },
  {
    id: "r44",
    title: "Why Some Buildings Have Green Roofs",
    level: "B2",
    text: `A green roof is a roof partly or completely covered with plants. It may look like a garden above the street, but its purpose is practical as well as attractive. The layers beneath the plants can hold some rainwater, reducing the amount that enters drains during heavy showers. The vegetation can also provide insulation and create small habitats for insects.

Green roofs are not suitable for every building. The structure must be strong enough to support the extra weight, and plants need maintenance, especially during dry periods. Installation can also cost more than a conventional roof.

Despite these challenges, green roofs are increasingly included in discussions about sustainable cities. They work best as one part of a wider plan that includes trees, parks, efficient buildings and good water management.`,
    vocab: [
      { en: "vegetation", uz: "o‘simlik qoplami" },
      { en: "insulation", uz: "issiqlik izolyatsiyasi" },
      { en: "habitat", uz: "yashash muhiti" },
      { en: "structure", uz: "konstruksiya" },
      { en: "conventional", uz: "an’anaviy" },
      { en: "sustainable", uz: "barqaror" }
    ],
    questions: [
      {
        id: "r44-q1",
        q: "What is a green roof?",
        options: ["A roof covered partly or fully with plants", "A roof painted green", "A roof used only for sports", "A glass roof"],
        answer: 0,
        explain: "Yashil tom o‘simliklar bilan qisman yoki to‘liq qoplangan tomdir.",
      },
      {
        id: "r44-q2",
        q: "How can green roofs help during heavy rain?",
        options: ["They create more rain", "They hold some rainwater", "They send water into buildings", "They remove all drains"],
        answer: 1,
        explain: "Tom qatlamlari yomg‘ir suvining bir qismini ushlab qoladi.",
      },
      {
        id: "r44-q3",
        q: "What is one limitation of green roofs?",
        options: ["They cannot support insects", "Every building is too tall", "The structure must support extra weight", "They never need maintenance"],
        answer: 2,
        explain: "Bino konstruksiyasi qo‘shimcha og‘irlikni ko‘tara olishi kerak.",
      },
      {
        id: "r44-q4",
        q: "What does the writer say about green roofs?",
        options: ["They solve every city problem alone", "They work best as part of a wider sustainable plan", "They should replace all parks", "They are suitable for every building"],
        answer: 1,
        explain: "Ular daraxtlar, parklar va suv boshqaruvi bilan birga kengroq rejaning bir qismi bo‘lganda samarali.",
      }
    ],
  },
  {
    id: "r45",
    title: "The Last Bookshop on the Street",
    level: "B1",
    text: `When a large shopping centre opened nearby, many people expected the small bookshop on Oak Street to close. Instead, its owner, Mr Green, changed the way it worked. He began hosting short evening events where local writers read from their books, and he created a quiet corner where children could browse picture books.

The shop also started taking online orders, but customers could still collect their purchases in person and ask for recommendations. Mr Green says that personal conversation is something a website cannot fully replace. Regular visitors often come in not knowing exactly what they want and leave with a book suggested by another reader.

The shop is not as busy as it was ten years ago, but it has found a new role as a meeting place. Its success depends less on competing with large stores and more on offering something distinctive.`,
    vocab: [
      { en: "shopping centre", uz: "savdo markazi" },
      { en: "host", uz: "tashkil qilmoq" },
      { en: "browse", uz: "varaqlab ko‘rmoq" },
      { en: "recommendation", uz: "tavsiya" },
      { en: "distinctive", uz: "o‘ziga xos" },
      { en: "compete", uz: "raqobatlashmoq" }
    ],
    questions: [
      {
        id: "r45-q1",
        q: "What did Mr Green introduce to the bookshop?",
        options: ["Evening events with local writers", "A large restaurant", "A cinema", "A sports club"],
        answer: 0,
        explain: "U mahalliy yozuvchilar kitob o‘qib beradigan kechki tadbirlarni boshlagan.",
      },
      {
        id: "r45-q2",
        q: "What can children do in the shop?",
        options: ["Use a swimming pool", "Browse picture books in a quiet corner", "Buy school uniforms", "Watch films"],
        answer: 1,
        explain: "Bolalar uchun rasmli kitoblarni ko‘rish mumkin bo‘lgan sokin burchak yaratilgan.",
      },
      {
        id: "r45-q3",
        q: "Why does Mr Green value personal conversation?",
        options: ["It is cheaper than books", "A website cannot fully replace it", "It makes orders slower", "Customers dislike recommendations"],
        answer: 1,
        explain: "Uning fikricha, shaxsiy suhbat va tavsiyalarni veb-sayt to‘liq almashtira olmaydi.",
      },
      {
        id: "r45-q4",
        q: "What is the shop's new role?",
        options: ["A warehouse", "A meeting place for the community", "A large shopping centre", "A school library"],
        answer: 1,
        explain: "Kitob do‘koni yangi vazifada odamlar uchrashadigan maskanga aylangan.",
      }
    ],
  },
  {
    id: "r46",
    title: "The Importance of Clear Instructions",
    level: "B1",
    text: `A set of instructions may be technically correct and still be difficult to follow. This often happens when writers assume that readers already know the background, or when several actions are packed into one long sentence.

Good instructions use a clear order. They introduce any materials or information needed, explain one action at a time and use familiar words wherever possible. Headings, numbered steps and simple diagrams can make a complicated task easier to understand. It is also helpful to test instructions with someone who has not done the task before.

The goal is not to remove every detail. It is to present the right information at the moment the reader needs it. Clear instructions save time, reduce mistakes and make people more confident about trying something new.`,
    vocab: [
      { en: "technically", uz: "texnik jihatdan" },
      { en: "assume", uz: "deb hisoblamoq" },
      { en: "background", uz: "oldingi ma’lumot" },
      { en: "sequence", uz: "ketma-ketlik" },
      { en: "diagram", uz: "chizma" },
      { en: "confident", uz: "o‘ziga ishongan" }
    ],
    questions: [
      {
        id: "r46-q1",
        q: "Why can correct instructions still be difficult?",
        options: ["They may assume readers know the background", "They always use pictures", "They are too short", "They contain no actions"],
        answer: 0,
        explain: "Muallif yozuvchilar o‘quvchi oldingi ma’lumotni biladi deb taxmin qilishi mumkinligini aytadi.",
      },
      {
        id: "r46-q2",
        q: "What can make instructions easier to follow?",
        options: ["Long paragraphs only", "Headings and numbered steps", "Unfamiliar words", "Removing all examples"],
        answer: 1,
        explain: "Sarlavhalar, raqamlangan qadamlar va sodda chizmalar tushunishni osonlashtiradi.",
      },
      {
        id: "r46-q3",
        q: "Why should instructions be tested with a new user?",
        options: ["To make them longer", "To see whether someone unfamiliar can follow them", "To remove all diagrams", "To check the writer's handwriting"],
        answer: 1,
        explain: "Yangi foydalanuvchi bilan sinash ko‘rsatmalar haqiqatan tushunarliligini tekshiradi.",
      },
      {
        id: "r46-q4",
        q: "What is the main goal of clear instructions?",
        options: ["To include every possible detail at once", "To give the right information when needed", "To make tasks seem difficult", "To replace practical experience"],
        answer: 1,
        explain: "Asosiy maqsad kerakli ma’lumotni o‘quvchi aynan kerak bo‘lgan paytda berishdir.",
      }
    ],
  },
  {
    id: "r47",
    title: "A New Life for Old Clothes",
    level: "B2",
    text: `Clothing is often treated as disposable, even when an item is still usable. A growing number of community groups are trying to change this by organising repair workshops, swap events and clothing libraries. These projects encourage people to think about the resources involved in making garments, including water, energy and labour.

Swapping clothes can extend the life of items that no longer suit one person but may be useful to someone else. Repair workshops teach basic skills such as replacing a button or fixing a seam. Some organisations also collect fabric scraps and turn them into bags or cleaning cloths.

These activities are not a complete answer to the environmental impact of the fashion industry. However, they make reuse more visible and practical. They also remind consumers that the cheapest option at the checkout is not always the least costly for the environment.`,
    vocab: [
      { en: "disposable", uz: "bir martalik, tashlab yuboriladigan" },
      { en: "garment", uz: "kiyim" },
      { en: "swap", uz: "almashtirmoq" },
      { en: "fabric", uz: "mato" },
      { en: "scrap", uz: "qoldiq" },
      { en: "consumer", uz: "iste’molchi" }
    ],
    questions: [
      {
        id: "r47-q1",
        q: "What do community groups organise?",
        options: ["Repair workshops and swap events", "Fashion competitions only", "New clothing factories", "Online advertising courses"],
        answer: 0,
        explain: "Guruhlar ta’mirlash mashg‘ulotlari, kiyim almashish tadbirlari va kiyim kutubxonalarini tashkil qiladi.",
      },
      {
        id: "r47-q2",
        q: "How does swapping clothes help?",
        options: ["It makes clothes heavier", "It lets useful items find another owner", "It increases water use", "It prevents repairs"],
        answer: 1,
        explain: "Bir kishiga kerak bo‘lmagan, lekin yaroqli kiyim boshqa odamga foydali bo‘lishi mumkin.",
      },
      {
        id: "r47-q3",
        q: "What can fabric scraps become?",
        options: ["Metal tools", "Bags or cleaning cloths", "New shoes immediately", "Paper books"],
        answer: 1,
        explain: "Mato qoldiqlaridan sumkalar yoki tozalash matolari tayyorlanishi mumkin.",
      },
      {
        id: "r47-q4",
        q: "What is the writer's final point?",
        options: ["The cheapest item is always best", "Reuse solves every fashion problem", "Low checkout prices may hide environmental costs", "Clothes should never be repaired"],
        answer: 2,
        explain: "Eng arzon xarid narxi atrof-muhit uchun eng kam xarajat degani emas.",
      }
    ],
  },
  {
    id: "r48",
    title: "A Young Inventor's Notebook",
    level: "A2",
    text: `Nodira keeps a notebook beside her bed. Whenever she has an idea for a useful object, she draws it and writes a few sentences about how it might work. Some ideas are simple, such as a pencil case with separate spaces for small items. Others are more unusual, like a plant pot that tells you when the soil is dry.

At school, her technology teacher encouraged her to build a model of one idea. Nodira chose the plant pot. She used a small sensor and a light that turns on when the soil needs water. Her first model did not work properly, so she changed the position of the sensor and tried again.

The second model worked. Nodira learned that inventing is not only about having ideas; it also requires testing, patience and improvement.`,
    vocab: [
      { en: "notebook", uz: "daftar" },
      { en: "object", uz: "buyum" },
      { en: "separate", uz: "alohida" },
      { en: "soil", uz: "tuproq" },
      { en: "sensor", uz: "datchik" },
      { en: "improvement", uz: "takomillashtirish" }
    ],
    questions: [
      {
        id: "r48-q1",
        q: "Where does Nodira keep her notebook?",
        options: ["Beside her bed", "In the kitchen", "At the library", "In her school bag"],
        answer: 0,
        explain: "Nodira daftarini karavoti yonida saqlaydi.",
      },
      {
        id: "r48-q2",
        q: "Which idea did she choose to build?",
        options: ["A new pencil", "A plant pot that signals dry soil", "A talking clock", "A school desk"],
        answer: 1,
        explain: "U tuproq quruq bo‘lganda xabar beradigan gul tuvagini tanlagan.",
      },
      {
        id: "r48-q3",
        q: "What happened to her first model?",
        options: ["It worked perfectly", "It did not work properly", "It was lost", "It was too large for school"],
        answer: 1,
        explain: "Birinchi model to‘g‘ri ishlamagan, shuning uchun datchik joyini o‘zgartirgan.",
      },
      {
        id: "r48-q4",
        q: "What did Nodira learn about inventing?",
        options: ["Ideas are enough", "Testing and patience are important", "Models should never change", "Only adults can invent"],
        answer: 1,
        explain: "Ixtiro qilish g‘oyadan tashqari sinash, sabr va takomillashtirishni ham talab qiladi.",
      }
    ],
  },
  {
    id: "r49",
    title: "The Future of Public Transport",
    level: "C1",
    text: `Debates about public transport often focus on speed, cost and convenience, but reliability may be the factor that most strongly influences whether people use it. A frequent service that arrives predictably can make daily journeys easier to plan, even if it is not the fastest option available.

Reliability depends on more than the number of vehicles. Dedicated bus lanes, coordinated timetables and clear passenger information can reduce uncertainty. Ticketing systems also matter: if changing between buses and trains is confusing or expensive, travellers may prefer private cars despite congestion.

No single policy will suit every city. Dense urban centres may support frequent rail services, while smaller towns may need flexible bus routes. What matters is designing a network around the journeys people actually make, rather than expecting passengers to adapt to a system built without their needs in mind.`,
    vocab: [
      { en: "reliability", uz: "ishonchlilik" },
      { en: "predictably", uz: "oldindan taxmin qilinadigan tarzda" },
      { en: "dedicated", uz: "maxsus ajratilgan" },
      { en: "coordinate", uz: "muvofiqlashtirmoq" },
      { en: "congestion", uz: "tirbandlik" },
      { en: "flexible", uz: "moslashuvchan" }
    ],
    questions: [
      {
        id: "r49-q1",
        q: "Which factor may most strongly influence public transport use?",
        options: ["Vehicle colour", "Reliability", "Advertising", "Station architecture"],
        answer: 1,
        explain: "Matnda odamlarning jamoat transportidan foydalanishiga ishonchlilik kuchli ta’sir qilishi mumkinligi aytilgan.",
      },
      {
        id: "r49-q2",
        q: "What can reduce uncertainty for passengers?",
        options: ["Dedicated bus lanes and coordinated timetables", "Fewer signs", "More complicated tickets", "Less frequent services"],
        answer: 0,
        explain: "Maxsus avtobus yo‘laklari, muvofiqlashtirilgan jadval va aniq axborot noaniqlikni kamaytiradi.",
      },
      {
        id: "r49-q3",
        q: "Why might travellers prefer private cars?",
        options: ["Public transport is always faster", "Changing between services can be confusing or expensive", "Cars never face traffic", "Buses do not have seats"],
        answer: 1,
        explain: "Avtobus va poyezd o‘rtasida almashish qiyin yoki qimmat bo‘lsa, odamlar mashinani tanlashi mumkin.",
      },
      {
        id: "r49-q4",
        q: "What principle should guide transport network design?",
        options: ["Passengers should adapt to any system", "Networks should reflect journeys people actually make", "Every town needs a metro", "Speed is the only goal"],
        answer: 1,
        explain: "Muallif transport tarmog‘i odamlar amalda qiladigan safarlarga mos loyihalanishi kerakligini ta’kidlaydi.",
      }
    ],
  },
  {
    id: "r50",
    title: "Why Local Stories Matter",
    level: "C1",
    text: `A community's identity is shaped not only by official records but also by stories passed between generations. Memories of a market, a school or a neighbourhood festival may seem personal and ordinary, yet together they reveal how a place has changed.

Collecting oral histories can preserve experiences that rarely appear in written archives. Older residents may remember how a street was used before new buildings appeared, while younger people can describe how digital communication has altered local relationships. Such accounts are valuable, although they should not be treated as perfectly objective: memory is selective, and different people may recall the same event in different ways.

The challenge for historians is to listen carefully, compare accounts and place individual memories alongside other evidence. Done thoughtfully, this process gives communities a richer understanding of their past and a stronger sense of connection to one another.`,
    vocab: [
      { en: "identity", uz: "o‘zlik, kimlik" },
      { en: "generation", uz: "avlod" },
      { en: "oral history", uz: "og‘zaki tarix" },
      { en: "archive", uz: "arxiv" },
      { en: "selective", uz: "tanlab eslaydigan" },
      { en: "evidence", uz: "dalil" }
    ],
    questions: [
      {
        id: "r50-q1",
        q: "What can local stories reveal?",
        options: ["Only official dates", "How a place has changed", "The future with certainty", "Exact population figures"],
        answer: 1,
        explain: "Avlodlar hikoyalari joyning vaqt davomida qanday o‘zgarganini ko‘rsatishi mumkin.",
      },
      {
        id: "r50-q2",
        q: "What is an oral history?",
        options: ["A map made by children", "Experiences preserved through spoken accounts", "A list of official laws", "A printed timetable"],
        answer: 1,
        explain: "Og‘zaki tarix odamlarning so‘zlab bergan tajribalarini saqlashni anglatadi.",
      },
      {
        id: "r50-q3",
        q: "Why should oral accounts be compared with other evidence?",
        options: ["Memory can be selective", "All speakers tell lies", "Written records are always wrong", "Stories have no value"],
        answer: 0,
        explain: "Xotira tanlab ishlaydi va odamlar bir voqeani turlicha eslashi mumkin.",
      },
      {
        id: "r50-q4",
        q: "What is the benefit of collecting local stories thoughtfully?",
        options: ["It replaces all archives", "It deepens understanding of the past and community connections", "It removes differences between memories", "It proves every story is exact"],
        answer: 1,
        explain: "Ehtiyotkorlik bilan yig‘ilgan hikoyalar o‘tmishni chuqurroq anglash va jamoa aloqalarini mustahkamlashga yordam beradi.",
      }
    ],
  }
];
