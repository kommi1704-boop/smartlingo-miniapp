// App version + the "what's new" card. Bump APP_VERSION whenever WHATS_NEW changes:
// every learner whose settings.seenVersion differs sees the card once on the Dashboard.

export const APP_VERSION = '2.1.0';

export interface WhatsNewItem {
  icon: string; // Emo name
  title: string;
  text: string;
}

export const WHATS_NEW: WhatsNewItem[] = [
  { icon: 'gift', title: 'Sirli quti boyadi', text: '100 Coinlik quti endi faqat Coin/XP/muzlatgich emas — tasodifiy avatar, titul, ramka va ism uslublarini ham sovg‘a qiladi!' },
  { icon: 'flame', title: 'Seriya animatsiyasi', text: 'Kunlik safari yakunlanganda olov endi uchqunlar bilan o‘tiradi — 1-kunlik seriyalar ham nishonlanadi.' },
  { icon: 'sparkle', title: 'Shaxsiy fon tuzatildi', text: 'Do‘kondagi «o‘z rasmingiz» foni endi albatta ekranga tushadi — yuklangan rasm avtomatik qo‘llanadi.' },
  { icon: 'trophy', title: 'Chempionat mukofotlari', text: 'Haftalik XP chempionatining 1–3 o‘rin mukofotlari endi har qanday holatda yetib boradi — hech kim mukofotsiz qolmaydi.' },
  { icon: 'globe', title: 'Profil rasmlari xavfsiz', text: 'Boshqa o‘quvchilar sahifasida endi hech qachon sizning rasmingiz ko‘rinmaydi — har kim faqat o‘z rasmini ko‘radi.' },
];
