import type { ListeningActivity } from '../types';

export const LISTENING_EXTRA: ListeningActivity[] = [
  {
    id: "l06",
    title: "Finding a Book in the Library",
    level: "A1",
    situationUz: "Ikki o‘quvchi kutubxonachidan kitob topishda yordam so‘ramoqda.",
    transcript: [
      "Mia: Excuse me. Where can I find books about animals?",
      "Librarian: They are on the second floor, next to the science books.",
      "Mia: Thank you. And where are the storybooks?",
      "Librarian: They are on the ground floor, near the big windows.",
      "Tom: Can we borrow two books each?",
      "Librarian: Yes. You can keep them for two weeks.",
      "Mia: Great. Do we need our library cards?",
      "Librarian: Yes, please show them at the desk."
    ].join("\n"),
    questions: [
      {
        id: "l06-q1",
        q: "Where are the animal books?",
        options: ["On the ground floor", "On the second floor", "In the office", "Near the entrance"],
        answer: 1,
        explain: "Kutubxonachi hayvonlar haqidagi kitoblar ikkinchi qavatda ekanini aytadi.",
      },
      {
        id: "l06-q2",
        q: "Where are the storybooks?",
        options: ["Near the big windows", "Next to the science books", "In the office", "Outside"],
        answer: 0,
        explain: "Hikoya kitoblari birinchi qavatda, katta derazalar yonida.",
      },
      {
        id: "l06-q3",
        q: "How long can they keep the books?",
        options: ["One week", "Two weeks", "Three weeks", "One month"],
        answer: 1,
        explain: "Kitoblarni ikki hafta saqlash mumkin.",
      },
      {
        id: "l06-q4",
        q: "What must they show at the desk?",
        options: ["Their school reports", "Their library cards", "Their tickets", "Their notebooks"],
        answer: 1,
        explain: "Kitob olish uchun kutubxona kartalarini ko‘rsatish kerak.",
      }
    ],
  },
  {
    id: "l07",
    title: "Changing a Sports Lesson",
    level: "A2",
    situationUz: "O‘quvchi sport markaziga qo‘ng‘iroq qilib, mashg‘ulot jadvalini aniqlashtirmoqda.",
    transcript: [
      "Receptionist: Good morning, Green Sports Centre. How can I help?",
      "Sam: Hello. I'm calling about the swimming lesson on Thursday.",
      "Receptionist: The children's class has moved from five to half past five.",
      "Sam: Is it still in the small pool?",
      "Receptionist: No, it will be in the main pool this week.",
      "Sam: Do I need to bring anything special?",
      "Receptionist: Just your swimwear, a towel and your membership card.",
      "Sam: Thanks. I'll arrive ten minutes early."
    ].join("\n"),
    questions: [
      {
        id: "l07-q1",
        q: "What day is the lesson?",
        options: ["Wednesday", "Thursday", "Friday", "Saturday"],
        answer: 1,
        explain: "Sam payshanba kungi suzish mashg‘uloti haqida qo‘ng‘iroq qilmoqda.",
      },
      {
        id: "l07-q2",
        q: "What is the new start time?",
        options: ["5:00", "5:15", "5:30", "6:00"],
        answer: 2,
        explain: "Mashg‘ulot soat beshdan besh yarimga ko‘chirilgan.",
      },
      {
        id: "l07-q3",
        q: "Where will the lesson take place?",
        options: ["The small pool", "The main pool", "The outdoor field", "The gym"],
        answer: 1,
        explain: "Bu hafta mashg‘ulot asosiy basseynda bo‘ladi.",
      },
      {
        id: "l07-q4",
        q: "What should Sam bring?",
        options: ["A ball and shoes", "Swimwear, a towel and membership card", "A lunch box", "A notebook"],
        answer: 1,
        explain: "Qabulxona xodimi suzish kiyimi, sochiq va a’zolik kartasini olib kelishni aytadi.",
      }
    ],
  },
  {
    id: "l08",
    title: "A Message About the Class Trip",
    level: "A2",
    situationUz: "O‘qituvchi sinf sayohati bo‘yicha ovozli xabar qoldirmoqda.",
    transcript: [
      "Hello, everyone. This is Ms Brown with a reminder about our trip to the history museum.",
      "We are meeting at the school gate at quarter past eight on Monday.",
      "Please bring a notebook, a pencil and a packed lunch.",
      "The museum café is closed for repairs, so we cannot buy food there.",
      "The coach will return to school at about three thirty.",
      "If you have any questions, please speak to me before Friday.",
      "I hope you are looking forward to the visit."
    ].join("\n"),
    questions: [
      {
        id: "l08-q1",
        q: "Where are the students going?",
        options: ["A science centre", "A history museum", "A zoo", "A sports stadium"],
        answer: 1,
        explain: "O‘qituvchi tarix muzeyiga sayohat haqida eslatma bermoqda.",
      },
      {
        id: "l08-q2",
        q: "What time should students meet?",
        options: ["8:00", "8:15", "8:30", "9:15"],
        answer: 1,
        explain: "Uchrashuv 8:15 da, ya’ni sakkizdan chorak o‘tganda.",
      },
      {
        id: "l08-q3",
        q: "Why should students bring a packed lunch?",
        options: ["The trip is very long", "The museum café is closed", "The school shop is closed", "There is no lunch break"],
        answer: 1,
        explain: "Muzey kafesi ta’mirlash sababli yopiq, shuning uchun ovqat olib kelish kerak.",
      },
      {
        id: "l08-q4",
        q: "When will the coach return?",
        options: ["About 2:30", "About 3:00", "About 3:30", "About 4:30"],
        answer: 2,
        explain: "Avtobus taxminan 3:30 da maktabga qaytadi.",
      }
    ],
  },
  {
    id: "l09",
    title: "Buying a Train Ticket",
    level: "A2",
    situationUz: "Yo‘lovchi vokzal kassasida chipta sotib olmoqda.",
    transcript: [
      "Passenger: Good morning. I'd like a ticket to Bukhara, please.",
      "Clerk: Certainly. Single or return?",
      "Passenger: Return, please. I'd like to come back on Sunday.",
      "Clerk: The next train leaves at ten twenty and arrives at one fifteen.",
      "Passenger: Is there a later train?",
      "Clerk: Yes, at twelve ten, but it arrives after three.",
      "Passenger: I'll take the ten twenty train. Can I pay by card?",
      "Clerk: Of course. Your seat is in coach four, seat eighteen."
    ].join("\n"),
    questions: [
      {
        id: "l09-q1",
        q: "Where does the passenger want to go?",
        options: ["Samarkand", "Bukhara", "Tashkent", "Khiva"],
        answer: 1,
        explain: "Yo‘lovchi Buxoroga chipta so‘raydi.",
      },
      {
        id: "l09-q2",
        q: "What type of ticket does the passenger buy?",
        options: ["Single", "Return", "A weekly pass", "A child ticket"],
        answer: 1,
        explain: "U yakshanba kuni qaytmoqchi, shuning uchun borib-kelish chiptasini oladi.",
      },
      {
        id: "l09-q3",
        q: "When does the chosen train leave?",
        options: ["10:20", "11:15", "12:10", "3:00"],
        answer: 0,
        explain: "Yo‘lovchi 10:20 dagi poyezdni tanlaydi.",
      },
      {
        id: "l09-q4",
        q: "Where is the passenger's seat?",
        options: ["Coach 2, seat 14", "Coach 3, seat 18", "Coach 4, seat 18", "Coach 4, seat 8"],
        answer: 2,
        explain: "Kassir to‘rtinchi vagondagi 18-o‘rinni aytadi.",
      }
    ],
  },
  {
    id: "l10",
    title: "Planning a Class Presentation",
    level: "B1",
    situationUz: "Ikki sinfdosh taqdimot uchun vazifalarni taqsimlamoqda.",
    transcript: [
      "Nina: Have you started the presentation about renewable energy?",
      "Omar: I've collected information about solar power, but we still need examples of wind energy.",
      "Nina: I can prepare the slides about wind farms. Could you write the introduction?",
      "Omar: Sure. I'll also make a chart comparing the two sources.",
      "Nina: Let's keep the presentation to eight minutes. We only have ten minutes in total, including questions.",
      "Omar: Good idea. Shall we practise after school on Wednesday?",
      "Nina: I can't on Wednesday. How about Thursday during lunch?",
      "Omar: That works. I'll bring my laptop."
    ].join("\n"),
    questions: [
      {
        id: "l10-q1",
        q: "What information has Omar collected?",
        options: ["Solar power", "Hydroelectric dams", "Wind farms", "Nuclear energy"],
        answer: 0,
        explain: "Omar quyosh energiyasi haqida ma’lumot yig‘gan.",
      },
      {
        id: "l10-q2",
        q: "What will Nina prepare?",
        options: ["The introduction", "A comparison chart", "Slides about wind farms", "The conclusion"],
        answer: 2,
        explain: "Nina shamol elektr stansiyalari haqidagi slaydlarni tayyorlashni taklif qiladi.",
      },
      {
        id: "l10-q3",
        q: "How long should the presentation last?",
        options: ["Five minutes", "Eight minutes", "Ten minutes", "Twelve minutes"],
        answer: 1,
        explain: "Ular taqdimotni sakkiz daqiqada tugatishga kelishadi.",
      },
      {
        id: "l10-q4",
        q: "When will they practise?",
        options: ["Wednesday after school", "Thursday during lunch", "Friday morning", "Monday evening"],
        answer: 1,
        explain: "Chorshanba Nina uchun qulay emas, ular payshanba tushlik paytida mashq qilishadi.",
      }
    ],
  },
  {
    id: "l11",
    title: "A Weather Update for Hikers",
    level: "B1",
    situationUz: "Radio boshlovchisi dam olish kunlari tog‘ga chiqmoqchi bo‘lganlar uchun ob-havo ma’lumotini bermoqda.",
    transcript: [
      "Good evening. Here is the weekend forecast for the mountain region.",
      "Saturday will begin with clear skies, although clouds are expected after midday.",
      "Temperatures will reach around eighteen degrees in the valleys and twelve degrees on higher ground.",
      "There may be light rain late on Saturday evening, so hikers should carry waterproof jackets.",
      "Sunday will be cooler and windier, with showers likely throughout the morning.",
      "Anyone planning a long walk should check local conditions before setting out.",
      "The forecast can change quickly in the mountains."
    ].join("\n"),
    questions: [
      {
        id: "l11-q1",
        q: "What will Saturday morning be like?",
        options: ["Foggy", "Clear", "Snowy", "Stormy"],
        answer: 1,
        explain: "Shanba tongida osmon ochiq bo‘lishi kutilmoqda.",
      },
      {
        id: "l11-q2",
        q: "When are clouds expected?",
        options: ["Before sunrise", "After midday", "Late Sunday", "All Saturday"],
        answer: 1,
        explain: "Bulutlar tushdan keyin paydo bo‘lishi kutilmoqda.",
      },
      {
        id: "l11-q3",
        q: "What should hikers carry?",
        options: ["Waterproof jackets", "Sun umbrellas only", "Heavy blankets", "Extra maps only"],
        answer: 0,
        explain: "Kech shanba kuni yengil yomg‘ir ehtimoli bor, shuning uchun suv o‘tkazmaydigan kurtka tavsiya etiladi.",
      },
      {
        id: "l11-q4",
        q: "What is Sunday forecast to be like?",
        options: ["Warmer and calmer", "Cooler and windier", "Sunny all day", "Hot and dry"],
        answer: 1,
        explain: "Yakshanba salqinroq va shamolli, ertalab yomg‘irli bo‘lishi mumkin.",
      }
    ],
  },
  {
    id: "l12",
    title: "Returning a Pair of Shoes",
    level: "B1",
    situationUz: "Xaridor do‘konda olgan oyoq kiyimini almashtirish haqida gaplashmoqda.",
    transcript: [
      "Assistant: Hello. Can I help you?",
      "Customer: Yes, I bought these trainers here on Monday, but they're too small.",
      "Assistant: Do you have the receipt?",
      "Customer: Yes, here it is. I'd like the same pair in a larger size.",
      "Assistant: Let me check. We have size seven in blue, but not in black.",
      "Customer: Blue is fine. Can I try them on first?",
      "Assistant: Of course. The fitting area is just over there.",
      "Customer: Great. If they fit, could I exchange them today?",
      "Assistant: Certainly, as long as the shoes are unworn and you have the receipt."
    ].join("\n"),
    questions: [
      {
        id: "l12-q1",
        q: "What is the problem with the shoes?",
        options: ["They are damaged", "They are too small", "They are the wrong colour", "They are too expensive"],
        answer: 1,
        explain: "Xaridor oyoq kiyimlari kichik ekanini aytadi.",
      },
      {
        id: "l12-q2",
        q: "When did the customer buy them?",
        options: ["Sunday", "Monday", "Tuesday", "Friday"],
        answer: 1,
        explain: "Xaridor dushanba kuni sotib olganini aytadi.",
      },
      {
        id: "l12-q3",
        q: "Which colour is available in the larger size?",
        options: ["Black", "Brown", "Blue", "White"],
        answer: 2,
        explain: "Do‘konda yettinchi o‘lcham ko‘k rangda bor.",
      },
      {
        id: "l12-q4",
        q: "What condition is required for an exchange?",
        options: ["The shoes must be worn", "The shoes must be unworn and the receipt provided", "The customer must pay twice", "The box must be opened"],
        answer: 1,
        explain: "Almashtirish uchun oyoq kiyim kiyilmagan bo‘lishi va chek bo‘lishi kerak.",
      }
    ],
  },
  {
    id: "l13",
    title: "Interview with a Young Photographer",
    level: "B1",
    situationUz: "Maktab radiosi boshlovchisi yosh fotograf bilan suhbatlashmoqda.",
    transcript: [
      "Host: Welcome to the school radio. Today we're speaking to Farida, whose photographs were shown at the town library.",
      "Host: When did you become interested in photography?",
      "Farida: I started taking pictures with my mother's old camera when I was twelve. I liked photographing ordinary street scenes.",
      "Host: Do you use expensive equipment now?",
      "Farida: Not really. I use a basic camera and sometimes my phone. I spend more time thinking about light and composition.",
      "Host: What are you working on at the moment?",
      "Farida: A series about local craftspeople. I visit their workshops and ask before taking pictures.",
      "Host: What advice would you give beginners?",
      "Farida: Take lots of pictures, but look carefully at each one and learn from what didn't work."
    ].join("\n"),
    questions: [
      {
        id: "l13-q1",
        q: "Where were Farida's photographs shown?",
        options: ["At the school gym", "At the town library", "At a shopping centre", "At a museum abroad"],
        answer: 1,
        explain: "Boshlovchi suratlar shahar kutubxonasida namoyish etilganini aytadi.",
      },
      {
        id: "l13-q2",
        q: "How old was Farida when she began?",
        options: ["Ten", "Eleven", "Twelve", "Fourteen"],
        answer: 2,
        explain: "Farida onasining eski kamerasi bilan o‘n ikki yoshida suratga olishni boshlagan.",
      },
      {
        id: "l13-q3",
        q: "What does she say matters more than expensive equipment?",
        options: ["Light and composition", "The camera brand", "The size of the screen", "The number of lenses"],
        answer: 0,
        explain: "U yorug‘lik va kompozitsiya haqida o‘ylash muhimroq ekanini aytadi.",
      },
      {
        id: "l13-q4",
        q: "What is her current project about?",
        options: ["Wild animals", "Local craftspeople", "School sports", "Old buildings"],
        answer: 1,
        explain: "Hozir u mahalliy hunarmandlar haqida fotosuratlar turkumi ustida ishlayapti.",
      }
    ],
  },
  {
    id: "l14",
    title: "A Notice About Water Use",
    level: "B1",
    situationUz: "Mahalla yig‘ilishida suvdan oqilona foydalanish haqida qisqa nutq tinglanmoqda.",
    transcript: [
      "Good evening, neighbours. As you know, the water company is repairing a pipe near the central market this week.",
      "Water pressure may be lower on Tuesday and Wednesday, especially between nine in the morning and four in the afternoon.",
      "Please avoid washing cars or watering gardens during those hours if possible.",
      "The repair team expects the work to finish by Thursday morning.",
      "If you notice a leak in your street, report it using the number on your latest water bill.",
      "Thank you for your patience. The repair should improve the reliability of the local supply."
    ].join("\n"),
    questions: [
      {
        id: "l14-q1",
        q: "Where is the pipe being repaired?",
        options: ["Near the school", "Near the central market", "Beside the station", "In the park"],
        answer: 1,
        explain: "Quvur markaziy bozor yaqinida ta’mirlanmoqda.",
      },
      {
        id: "l14-q2",
        q: "On which days may water pressure be lower?",
        options: ["Monday and Tuesday", "Tuesday and Wednesday", "Wednesday and Thursday", "Friday and Saturday"],
        answer: 1,
        explain: "Bosim seshanba va chorshanba kunlari pasayishi mumkin.",
      },
      {
        id: "l14-q3",
        q: "During which hours is the pressure expected to be lower?",
        options: ["7 a.m. to noon", "9 a.m. to 4 p.m.", "Noon to 8 p.m.", "All night"],
        answer: 1,
        explain: "Ertalab 9 dan tushdan keyin 4 gacha bosim pastroq bo‘lishi mumkin.",
      },
      {
        id: "l14-q4",
        q: "How should residents report a leak?",
        options: ["By writing to the school", "Using the number on the water bill", "By visiting the market", "Through a radio message"],
        answer: 1,
        explain: "Suv sizishini oxirgi hisob-fakturadagi telefon raqami orqali xabar qilish kerak.",
      }
    ],
  },
  {
    id: "l15",
    title: "Podcast: Why We Keep Diaries",
    level: "B2",
    situationUz: "Podkast boshlovchisi kundalik yozish odati va uning foydalari haqida gapirmoqda.",
    transcript: [
      "Presenter: Welcome to Small Habits, Big Ideas. Today we're looking at diary writing.",
      "People keep diaries for different reasons. Some record events so they can remember them later; others use writing to organise thoughts or explore difficult decisions.",
      "A diary does not have to be beautifully written. A few honest sentences can be enough, and there is no need to write every day.",
      "Researchers who study expressive writing have explored how putting experiences into words may help people understand their feelings. However, a diary is not a replacement for professional support when someone needs it.",
      "The most useful approach is often the simplest: choose a time that suits you, write privately and be honest with yourself.",
      "Next week, we'll discuss how people use photographs and voice notes to record memories."
    ].join("\n"),
    questions: [
      {
        id: "l15-q1",
        q: "What is the episode mainly about?",
        options: ["How to publish a book", "Reasons people keep diaries", "The history of paper", "How to take photographs"],
        answer: 1,
        explain: "Boshlovchi epizod kundalik yozish sabablari haqida ekanini aytadi.",
      },
      {
        id: "l15-q2",
        q: "Which is one reason people write diaries?",
        options: ["To organise their thoughts", "To improve their handwriting only", "To sell advertisements", "To avoid all decisions"],
        answer: 0,
        explain: "Matnda kundalik fikrlarni tartibga solish yoki qarorlarni o‘rganish uchun yozilishi aytilgan.",
      },
      {
        id: "l15-q3",
        q: "What does the presenter say about writing every day?",
        options: ["It is absolutely necessary", "It is not necessary to write daily", "It is only for children", "It must be beautifully written"],
        answer: 1,
        explain: "Boshlovchi har kuni yozish shart emasligini ta’kidlaydi.",
      },
      {
        id: "l15-q4",
        q: "What will next week's episode discuss?",
        options: ["Photographs and voice notes", "Professional sports", "School exams", "Cooking diaries"],
        answer: 0,
        explain: "Keyingi hafta xotiralarni suratlar va ovozli qaydlar bilan saqlash mavzusi muhokama qilinadi.",
      }
    ],
  },
  {
    id: "l16",
    title: "A Delay at the Airport",
    level: "B1",
    situationUz: "Aeroport xodimi yo‘lovchilarga reys kechikishi haqida e’lon qilmoqda.",
    transcript: [
      "Attention, passengers travelling on flight 624 to Istanbul.",
      "We regret to inform you that the departure has been delayed because of a technical inspection of the aircraft.",
      "The new estimated departure time is 6:40 p.m., rather than 5:55 p.m.",
      "Passengers should remain near gate twelve and listen for further announcements.",
      "Refreshments are available at the café opposite gate ten. Please keep your boarding passes with you.",
      "We apologise for the inconvenience and will provide another update in thirty minutes."
    ].join("\n"),
    questions: [
      {
        id: "l16-q1",
        q: "Which flight is delayed?",
        options: ["624 to Istanbul", "426 to London", "624 to Dubai", "642 to Istanbul"],
        answer: 0,
        explain: "E’lon 624-reys, Istanbul yo‘nalishi haqida.",
      },
      {
        id: "l16-q2",
        q: "Why is the flight delayed?",
        options: ["Bad weather", "A technical inspection", "A missing passenger", "A problem with tickets"],
        answer: 1,
        explain: "Samolyot texnik tekshiruvdan o‘tayotgani sababli jo‘nash kechikkan.",
      },
      {
        id: "l16-q3",
        q: "What is the new departure time?",
        options: ["5:55 p.m.", "6:10 p.m.", "6:40 p.m.", "7:30 p.m."],
        answer: 2,
        explain: "Yangi taxminiy jo‘nash vaqti 18:40.",
      },
      {
        id: "l16-q4",
        q: "Where should passengers wait?",
        options: ["Gate ten", "Gate twelve", "The main café", "The car park"],
        answer: 1,
        explain: "Yo‘lovchilar 12-darvoza yaqinida qolishlari kerak.",
      }
    ],
  },
  {
    id: "l17",
    title: "A Conversation About Volunteering",
    level: "B1",
    situationUz: "Ikki do‘st dam olish kunlari ko‘ngilli bo‘lib ishlash imkoniyatini muhokama qilmoqda.",
    transcript: [
      "Aisha: Have you decided what to do for the school community project?",
      "Daniel: I'm thinking about helping at the animal shelter, but they need volunteers on Saturday mornings.",
      "Aisha: I can't do Saturdays. I found a river clean-up group that meets on Sunday.",
      "Daniel: What time do they start?",
      "Aisha: At nine, and they finish around midday. They provide gloves and bags, but we should bring water.",
      "Daniel: That sounds manageable. Do we need to register?",
      "Aisha: Yes, there's a short form on the community centre website. I'll send you the details.",
      "Daniel: Great. I'll sign up tonight."
    ].join("\n"),
    questions: [
      {
        id: "l17-q1",
        q: "What did Daniel first consider?",
        options: ["Helping at an animal shelter", "Teaching at school", "Working in a library", "Painting a sports hall"],
        answer: 0,
        explain: "Daniel dastlab hayvonlar boshpanasida yordam berishni o‘ylagan.",
      },
      {
        id: "l17-q2",
        q: "Why can't Aisha choose that option?",
        options: ["She is busy on Saturday mornings", "She dislikes animals", "She has no transport", "She is away all month"],
        answer: 0,
        explain: "Hayvonlar boshpanasiga shanba tonglari ko‘ngillilar kerak, Aisha esa shanba kuni bora olmaydi.",
      },
      {
        id: "l17-q3",
        q: "When does the river clean-up group meet?",
        options: ["Saturday at nine", "Sunday at nine", "Sunday at noon", "Friday evening"],
        answer: 1,
        explain: "Guruh yakshanba kuni soat to‘qqizda uchrashadi.",
      },
      {
        id: "l17-q4",
        q: "What should volunteers bring?",
        options: ["Gloves and bags", "Water", "Cleaning machines", "Lunch for everyone"],
        answer: 1,
        explain: "Tashkilotchilar qo‘lqop va paket beradi, qatnashchilar esa suv olib kelishi kerak.",
      }
    ],
  },
  {
    id: "l18",
    title: "Lecture: How Bridges Stay Strong",
    level: "B2",
    situationUz: "Muhandislik darsida o‘qituvchi ko‘priklarning mustahkamligi haqida tushuntirmoqda.",
    transcript: [
      "Lecturer: Today we'll look at why bridges can carry heavy loads without collapsing.",
      "A bridge must manage several forces. Compression pushes materials together, while tension pulls them apart. Different designs distribute these forces in different ways.",
      "An arch bridge transfers much of its load towards its supports. A suspension bridge uses strong cables to carry the deck, with towers helping transfer the forces into the ground.",
      "Materials matter too. Steel is strong under tension, while concrete performs well under compression. Engineers often combine materials to use their strengths effectively.",
      "Before a bridge opens, it is inspected and tested. Engineers also monitor it over time because temperature, traffic and weather can affect its condition."
    ].join("\n"),
    questions: [
      {
        id: "l18-q1",
        q: "What is compression?",
        options: ["A force that pushes materials together", "A force that pulls materials apart", "A type of bridge deck", "A method of painting steel"],
        answer: 0,
        explain: "Ma’ruzada compression materialni bir-biriga siqadigan kuch deb ta’riflangan.",
      },
      {
        id: "l18-q2",
        q: "How does an arch bridge transfer much of its load?",
        options: ["Into the river", "Towards its supports", "Into the road surface only", "Through moving vehicles"],
        answer: 1,
        explain: "Arka ko‘prik yukning katta qismini tayanchlarga yo‘naltiradi.",
      },
      {
        id: "l18-q3",
        q: "Which material performs well under compression?",
        options: ["Paper", "Concrete", "Rubber", "Glass"],
        answer: 1,
        explain: "Ma’ruzachi beton siqilish kuchiga yaxshi bardosh berishini aytadi.",
      },
      {
        id: "l18-q4",
        q: "Why are bridges monitored after opening?",
        options: ["To change their colour", "Because weather, traffic and temperature can affect them", "To count passengers", "To reduce their length"],
        answer: 1,
        explain: "Ko‘prik holatiga harorat, transport va ob-havo ta’sir qilishi mumkin.",
      }
    ],
  },
  {
    id: "l19",
    title: "A Radio Review of a New Film",
    level: "B2",
    situationUz: "Radio boshlovchisi yangi oilaviy film haqida sharh bermoqda.",
    transcript: [
      "Presenter: This week's family film is The Paper Kite, directed by Lena Morris.",
      "The story follows two cousins who discover a box of letters in their grandfather's attic. Their search for the people who wrote them takes them across the country.",
      "The film is visually beautiful, especially the scenes filmed along the coast. The two young actors are convincing, and the music supports the story without becoming distracting.",
      "The middle section moves a little slowly, and some viewers may guess the ending early. Even so, the final scenes are warm and thoughtful.",
      "I'd recommend it to families who enjoy character-driven stories rather than fast action. It opens in cinemas on Friday."
    ].join("\n"),
    questions: [
      {
        id: "l19-q1",
        q: "What is the film called?",
        options: ["The Blue Letter", "The Paper Kite", "Across the Coast", "The Old Attic"],
        answer: 1,
        explain: "Sharh boshida film nomi “The Paper Kite” deb aytiladi.",
      },
      {
        id: "l19-q2",
        q: "What do the cousins find?",
        options: ["A box of letters", "A camera", "A map", "A musical instrument"],
        answer: 0,
        explain: "Qahramonlar bobosining chordog‘ida xatlar qutisini topishadi.",
      },
      {
        id: "l19-q3",
        q: "What criticism does the presenter make?",
        options: ["The acting is weak", "The middle section is slow", "The music is too loud", "The film is too short"],
        answer: 1,
        explain: "Sharhlovchi filmning o‘rta qismi biroz sekin kechishini aytadi.",
      },
      {
        id: "l19-q4",
        q: "Who might enjoy the film most?",
        options: ["People who want fast action", "Families who like character-driven stories", "Viewers who dislike emotional stories", "Only young children"],
        answer: 1,
        explain: "Sharhlovchi tezkor jangari voqealardan ko‘ra qahramonlarga asoslangan hikoyalarni yoqtiradigan oilalarga tavsiya qiladi.",
      }
    ],
  },
  {
    id: "l20",
    title: "A Discussion About Study Spaces",
    level: "B2",
    situationUz: "Uch o‘quvchi imtihonga tayyorlanish uchun qayerda o‘qish qulayligini muhokama qilmoqda.",
    transcript: [
      "Maya: I usually study at home, but my little brothers make it difficult to concentrate.",
      "Ethan: Have you tried the public library? It's quiet, and you can book a desk online.",
      "Maya: I went there last week, but it closes at six. I often need to study later.",
      "Luca: The youth centre has a study room until nine, although it can get busy before exams.",
      "Ethan: Maybe we could reserve a table there twice a week and work together.",
      "Maya: I'd prefer to work alone for the first hour, then compare notes.",
      "Luca: That sounds fair. I'll check whether group bookings are available."
    ].join("\n"),
    questions: [
      {
        id: "l20-q1",
        q: "Why does Maya find studying at home difficult?",
        options: ["The internet is slow", "Her younger brothers distract her", "There is no desk", "The house is too cold"],
        answer: 1,
        explain: "Maya ukalari sabab diqqatini jamlash qiyinligini aytadi.",
      },
      {
        id: "l20-q2",
        q: "What is one advantage of the public library?",
        options: ["It stays open all night", "It is quiet and desks can be booked", "It provides free laptops", "It has no rules"],
        answer: 1,
        explain: "Kutubxona sokin va stolni onlayn band qilish mumkin.",
      },
      {
        id: "l20-q3",
        q: "What is the library's closing time?",
        options: ["5 p.m.", "6 p.m.", "8 p.m.", "9 p.m."],
        answer: 1,
        explain: "Maya kutubxona soat oltida yopilishini aytadi.",
      },
      {
        id: "l20-q4",
        q: "What arrangement does Maya prefer?",
        options: ["Working together all day", "Working alone first, then comparing notes", "Studying only online", "Meeting at home every night"],
        answer: 1,
        explain: "Maya avval bir soat yolg‘iz ishlash, keyin qaydlarni solishtirishni afzal ko‘radi.",
      }
    ],
  },
  {
    id: "l21",
    title: "Podcast: The Journey of a Plastic Bottle",
    level: "B2",
    situationUz: "Podkastda plastik idish qayta ishlash jarayonidan qanday o‘tishi tushuntirilmoqda.",
    transcript: [
      "Host: A plastic bottle's journey does not end when it is placed in a recycling bin.",
      "First, collected materials are taken to a sorting facility. Workers and machines separate different types of plastic and remove items that cannot be processed.",
      "The suitable plastic is then cleaned and shredded into small flakes. These flakes are melted and formed into pellets, which manufacturers can use to make new products.",
      "Not every bottle becomes another bottle. The material may be used in clothing fibres, packaging or other objects, depending on its quality.",
      "Recycling can reduce the need for new raw materials, but it works best when people also reduce unnecessary packaging and reuse items where possible."
    ].join("\n"),
    questions: [
      {
        id: "l21-q1",
        q: "Where are collected materials taken first?",
        options: ["A supermarket", "A sorting facility", "A clothing factory", "A landfill"],
        answer: 1,
        explain: "Yig‘ilgan materiallar avval saralash markaziga olib boriladi.",
      },
      {
        id: "l21-q2",
        q: "What happens after suitable plastic is cleaned?",
        options: ["It is painted", "It is shredded into flakes", "It is buried", "It is turned into glass"],
        answer: 1,
        explain: "Plastik tozalanib, mayda bo‘laklarga ajratiladi.",
      },
      {
        id: "l21-q3",
        q: "What are pellets used for?",
        options: ["Making new products", "Cleaning the sorting machines", "Growing plants", "Producing electricity"],
        answer: 0,
        explain: "Eritilgan plastik granulalarga aylantirilib, yangi mahsulotlar tayyorlashda ishlatiladi.",
      },
      {
        id: "l21-q4",
        q: "What does the host say works best alongside recycling?",
        options: ["Buying more packaging", "Reducing packaging and reusing items", "Throwing everything away", "Using only glass"],
        answer: 1,
        explain: "Qayta ishlash bilan birga keraksiz qadoqni kamaytirish va buyumlarni qayta ishlatish ham muhim.",
      }
    ],
  },
  {
    id: "l22",
    title: "A Museum Audio Guide",
    level: "B1",
    situationUz: "Muzey audio gidida qadimiy sopol idish haqida ma’lumot berilmoqda.",
    transcript: [
      "Welcome to the history gallery. You are looking at a ceramic bowl made approximately eight hundred years ago.",
      "It was discovered during an archaeological excavation near an old trading settlement.",
      "The bowl is decorated with blue geometric patterns. Although the colours look bright today, the surface has been carefully cleaned and protected by conservation specialists.",
      "Researchers believe it was used for serving food, rather than for storage, because of its shallow shape.",
      "Please look at the small crack near the rim. It helps experts understand how the object was made and used. Photography without flash is permitted."
    ].join("\n"),
    questions: [
      {
        id: "l22-q1",
        q: "How old is the bowl approximately?",
        options: ["Eighty years", "Four hundred years", "Eight hundred years", "Two thousand years"],
        answer: 2,
        explain: "Audio gid idish taxminan sakkiz yuz yillik ekanini aytadi.",
      },
      {
        id: "l22-q2",
        q: "Where was it discovered?",
        options: ["Near an old trading settlement", "Inside a modern house", "At the bottom of a lake", "In a school garden"],
        answer: 0,
        explain: "Idish qadimiy savdo manzilgohi yaqinidagi arxeologik qazishmada topilgan.",
      },
      {
        id: "l22-q3",
        q: "What was the bowl probably used for?",
        options: ["Storing grain", "Serving food", "Carrying water", "Making paint"],
        answer: 1,
        explain: "Tadqiqotchilar uning sayoz shakliga qarab ovqat tortish uchun ishlatilgan deb hisoblaydi.",
      },
      {
        id: "l22-q4",
        q: "What kind of photography is allowed?",
        options: ["Flash photography", "No photography", "Photography without flash", "Video only"],
        answer: 2,
        explain: "Flesh ishlatmasdan suratga olishga ruxsat berilgan.",
      }
    ],
  },
  {
    id: "l23",
    title: "A Phone Call About a Lost Bag",
    level: "A2",
    situationUz: "Yo‘lovchi avtobus kompaniyasiga yo‘qolgan sumkasi haqida qo‘ng‘iroq qilmoqda.",
    transcript: [
      "Staff: City Bus Office. How can I help you?",
      "Caller: I left a green backpack on bus number twenty yesterday.",
      "Staff: Do you remember which route you were travelling on?",
      "Caller: The number six route, from the station to the university. I got off at the library.",
      "Staff: We have a green bag here. Does it have a small football badge on the front?",
      "Caller: Yes, that's mine!",
      "Staff: Please bring some identification when you collect it. Our office is open until five today.",
      "Caller: Thank you. I'll come after my class."
    ].join("\n"),
    questions: [
      {
        id: "l23-q1",
        q: "What did the caller lose?",
        options: ["A wallet", "A green backpack", "A phone", "A blue suitcase"],
        answer: 1,
        explain: "Qo‘ng‘iroq qiluvchi yashil ryukzakni yo‘qotgan.",
      },
      {
        id: "l23-q2",
        q: "Which bus route was it?",
        options: ["Number four", "Number six", "Number twelve", "Number twenty"],
        answer: 1,
        explain: "U 6-raqamli yo‘nalishda ketayotganini aytadi. 20 esa avtobus raqami.",
      },
      {
        id: "l23-q3",
        q: "Where did the caller get off?",
        options: ["At the station", "At the university", "At the library", "At the market"],
        answer: 2,
        explain: "Yo‘lovchi kutubxonada tushgan.",
      },
      {
        id: "l23-q4",
        q: "What should the caller bring to collect the bag?",
        options: ["A photograph", "Identification", "A bus ticket for tomorrow", "A school book"],
        answer: 1,
        explain: "Sumkani olish uchun shaxsini tasdiqlovchi hujjat olib kelish kerak.",
      }
    ],
  },
  {
    id: "l24",
    title: "Interview: Working as a Park Ranger",
    level: "B2",
    situationUz: "Boshlovchi milliy bog‘da ishlaydigan park inspektori bilan suhbatlashmoqda.",
    transcript: [
      "Interviewer: What does a typical day as a park ranger involve?",
      "Ranger: There isn't really a typical day. I might check walking paths, speak to visitors or record signs of wildlife activity.",
      "Interviewer: Is the job mostly about protecting animals?",
      "Ranger: That's important, but we also maintain paths, explain safety rules and help visitors understand the landscape.",
      "Interviewer: What is the most challenging part?",
      "Ranger: Balancing public access with conservation. People should be able to enjoy the park, but sensitive areas need protection, especially during breeding seasons.",
      "Interviewer: What advice would you give someone interested in this work?",
      "Ranger: Learn about ecology, develop communication skills and be prepared to work outdoors in changing weather."
    ].join("\n"),
    questions: [
      {
        id: "l24-q1",
        q: "What might a park ranger do during a typical day?",
        options: ["Check paths and record wildlife activity", "Sell tickets at a cinema", "Repair city roads", "Teach mathematics"],
        answer: 0,
        explain: "Inspektor yo‘laklarni tekshirishi, tashrif buyuruvchilar bilan gaplashishi yoki yovvoyi tabiat belgilarini qayd etishi mumkin.",
      },
      {
        id: "l24-q2",
        q: "What else do rangers do besides protecting animals?",
        options: ["Maintain paths and explain safety rules", "Build shopping centres", "Organise concerts", "Drive public buses"],
        answer: 0,
        explain: "Ular yo‘laklarni saqlaydi va xavfsizlik qoidalarini tushuntiradi.",
      },
      {
        id: "l24-q3",
        q: "What is the most challenging part of the job?",
        options: ["Finding food", "Balancing public access with conservation", "Learning foreign languages", "Working indoors"],
        answer: 1,
        explain: "Eng qiyin vazifa odamlarning parkdan foydalanishi va tabiatni muhofaza qilish o‘rtasida muvozanat topish.",
      },
      {
        id: "l24-q4",
        q: "Which skills does the ranger recommend?",
        options: ["Ecology and communication", "Accounting only", "Cooking and painting", "Computer gaming"],
        answer: 0,
        explain: "Ekologiyani o‘rganish va muloqot ko‘nikmalarini rivojlantirish tavsiya etiladi.",
      }
    ],
  },
  {
    id: "l25",
    title: "Lecture: Why Languages Change",
    level: "C1",
    situationUz: "Tilshunos qisqa ma’ruzada tillar nima sababdan o‘zgarishini tushuntirmoqda.",
    transcript: [
      "Lecturer: Languages are not fixed systems. They change as communities interact, move and develop new ways of communicating.",
      "New words may enter a language through technology, trade or contact with other languages. Existing words can also acquire new meanings, while pronunciation and grammar may shift gradually across generations.",
      "These changes are not automatically signs of decline. A form that sounds unusual to one generation may become ordinary to the next. At the same time, speakers often adjust their language depending on context, using more formal expressions in some situations and informal ones in others.",
      "Studying language change helps us understand social history. It can reveal patterns of migration, cultural contact and changing attitudes.",
      "The key point is that language belongs to its speakers, and their everyday choices help shape what it becomes."
    ].join("\n"),
    questions: [
      {
        id: "l25-q1",
        q: "What does the lecturer say about languages?",
        options: ["They are fixed systems", "They change as communities develop", "They never borrow words", "They change only through laws"],
        answer: 1,
        explain: "Ma’ruzachi tillar jamiyatlar o‘zaro aloqada bo‘lishi va rivojlanishi bilan o‘zgarishini aytadi.",
      },
      {
        id: "l25-q2",
        q: "How can new words enter a language?",
        options: ["Through technology, trade and language contact", "Only through schools", "Only through dictionaries", "By removing old words"],
        answer: 0,
        explain: "Yangi so‘zlar texnologiya, savdo va boshqa tillar bilan aloqa orqali kirishi mumkin.",
      },
      {
        id: "l25-q3",
        q: "Why are language changes not automatically signs of decline?",
        options: ["Every change is planned", "Forms can become ordinary across generations", "Grammar never changes", "Older speakers always agree"],
        answer: 1,
        explain: "Bir avlodga g‘alati tuyulgan shakl keyingi avlod uchun odatiy bo‘lib qolishi mumkin.",
      },
      {
        id: "l25-q4",
        q: "What can studying language change reveal?",
        options: ["Only spelling mistakes", "Migration and cultural contact", "The weather", "The age of buildings"],
        answer: 1,
        explain: "Til o‘zgarishlarini o‘rganish migratsiya, madaniy aloqa va munosabatlardagi o‘zgarishlarni ko‘rsatishi mumkin.",
      }
    ],
  }
];
