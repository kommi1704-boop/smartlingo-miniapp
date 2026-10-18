import type { Resource } from '../types';

// Bu ro‘yxatdagi har bir havola yozilayotgan paytda ochib ko‘rilgan va tavsifi sahifadagi
// ma’lumotga tayanadi. Narx/ro‘yxatdan o‘tish haqida sahifada aytilmagan joylarda biz ham
// va’da bermaymiz — saytga kirib o‘zingiz tekshiring.
export const RESOURCES_MORE: Resource[] = [
  // ---------- Listening / video ----------
  {
    id: 'res36',
    title: 'Cambridge English: Learning English',
    category: 'listening',
    level: 'A1–C2',
    desc: 'Cambridge English tashkilotining bepul tinglash, grammatika, lug‘at va o‘qish mashqlari, shuningdek imtihon namunalari. Sahifada yoshi kattaroq o‘smirlar va kattalar uchun deb yozilgan.',
    url: 'https://www.cambridgeenglish.org/learning-english/',
  },
  {
    id: 'res37',
    title: 'VOA Learning English',
    category: 'listening',
    level: 'A2–B2',
    desc: 'Kundalik audio epizodlar (yangiliklar, tarix, milliy bog‘lar, hikoyalar) va “Lesson of the Day” kabi qisqa grammatika darslari. Tinglab, so‘ng matn bilan solishtirish uchun yaxshi.',
    url: 'https://learningenglish.voanews.com/',
  },
  {
    id: 'res38',
    title: 'TED-Ed (sayt)',
    category: 'listening',
    level: 'B1–C1',
    desc: 'Yuzlab animatsion qisqa darslar: fan, san’at, iqtisod va boshqa mavzular. Mavzuli so‘zlarni (fan, texnologiya, san’at) eshitib o‘rganish uchun juda mos.',
    url: 'https://ed.ted.com/',
  },
  {
    id: 'res39',
    title: 'LearnEnglish Kids: Short stories',
    category: 'listening',
    level: 'A1–A2',
    desc: 'British Council bolalar saytidagi qisqa hikoyalar (video) va ularga chop etiladigan mashqlar. Kichikroq yoshdagilar va boshlovchilar uchun.',
    url: 'https://learnenglishkids.britishcouncil.org/short-stories',
  },

  // ---------- Reading ----------
  {
    id: 'res40',
    title: 'Lingua.com: Reading for beginners',
    category: 'reading',
    level: 'A1–C2',
    desc: 'Darajalar bo‘yicha (A1 dan C2 gacha) o‘qish matnlari va har biridan keyin test savollari; natija darhol ko‘rinadi.',
    url: 'https://www.lingua.com/english/reading/',
  },
  {
    id: 'res41',
    title: 'NASA Space Place',
    category: 'reading',
    level: 'A2–B2',
    desc: 'NASA saytining bolalar uchun bo‘limi: koinot va Yer haqida o‘yinlar, qiziqarli maqolalar va qisqa videolar. “Fan” mavzusidagi so‘zlar uchun a’lo.',
    url: 'https://spaceplace.nasa.gov/',
  },
  {
    id: 'res42',
    title: 'National Geographic Kids',
    category: 'reading',
    level: 'A2–B2',
    desc: 'Hayvonlar, fan, tarix va koinot haqida maqolalar, viktorinalar, videolar va o‘yinlar. “Tabiat” va “Sayohat” mavzularidagi so‘zlar uchun yaxshi.',
    url: 'https://kids.nationalgeographic.com/',
  },
  {
    id: 'res43',
    title: 'Britannica Kids',
    category: 'reading',
    level: 'A2–B2',
    desc: 'Maqolalar, rasm va videolar, tarjimai hollar, atlas va lug‘at; materiallar to‘rt xil sinf darajasiga bo‘lingan. Sahifada 7 kunlik bepul sinov ko‘rsatilgan, qolgan shartlarni saytdan tekshiring.',
    url: 'https://kids.britannica.com/',
  },
  {
    id: 'res44',
    title: 'Science Kids',
    category: 'reading',
    level: 'A2–B2',
    desc: 'Fan va texnologiya: tajribalar, qiziqarli faktlar, viktorinalar va videolar. Boshlang‘ich sinfdan yuqori sinfgacha mo‘ljallangan deb yozilgan.',
    url: 'https://www.sciencekids.co.nz/',
  },
  {
    id: 'res45',
    title: 'DOGO News',
    category: 'reading',
    level: 'B1–B2',
    desc: 'Bolalar uchun yozilgan yangiliklar: hozirgi voqealar, fan, ijtimoiy fanlar, koinot va ekologiya bo‘limlari. O‘qish tezligini oshirish uchun.',
    url: 'https://www.dogonews.com/',
  },

  // ---------- Grammar ----------
  {
    id: 'res46',
    title: 'LearnEnglish Kids: Grammar va o‘yinlar',
    category: 'grammar',
    level: 'A1–A2',
    desc: 'British Council bolalar saytida tinglash, o‘qish va grammatika mashqlari hamda bepul o‘yinlar, qo‘shiqlar va hikoyalar.',
    url: 'https://learnenglishkids.britishcouncil.org/',
  },
  {
    id: 'res47',
    title: 'LearnEnglish Teens (bosh sahifa)',
    category: 'grammar',
    level: 'A2–B2',
    desc: 'O‘smirlar uchun British Council sayti: o‘qish, yozish, tinglash, gapirish, grammatika va lug‘at mashqlari hamda imtihon maslahatlari. Sahifada bepul deb yozilgan.',
    url: 'https://learnenglishteens.britishcouncil.org/',
  },
  {
    id: 'res48',
    title: 'LearnEnglish (British Council)',
    category: 'grammar',
    level: 'A1–C2',
    desc: 'Grammatika, lug‘at, tinglash, o‘qish, yozish va gapirish bo‘yicha manbalar, shuningdek IELTS tayyorgarligi va bepul daraja testi.',
    url: 'https://learnenglish.britishcouncil.org/',
  },
  {
    id: 'res49',
    title: 'English Grammar (english-grammar.at)',
    category: 'grammar',
    level: 'A2–B2',
    desc: 'Grammatika va lug‘at bo‘yicha interaktiv mashqlar; PDF ko‘rinishidagi materiallarni bepul yuklab olish mumkin deb yozilgan.',
    url: 'https://www.english-grammar.at/',
  },

  // ---------- Vocabulary ----------
  {
    id: 'res50',
    title: 'LearnEnglish Kids: Word games',
    category: 'vocabulary',
    level: 'A1–A2',
    desc: 'Mavzular bo‘yicha so‘z o‘yinlari: fermadagi hayvonlar, ovqat, sport va boshqalar. O‘yin orqali so‘z yodlash.',
    url: 'https://learnenglishkids.britishcouncil.org/word-games',
  },
  {
    id: 'res51',
    title: 'MES English',
    category: 'vocabulary',
    level: 'A1–B1',
    desc: 'Flesh-kartalar, o‘yinlar, ish varaqlari va fonika materiallari; yuklab olish bepul, lekin litsenziya qayta tarqatish va o‘zgartirishni taqiqlaydi.',
    url: 'https://www.mes-english.com/',
  },
];
