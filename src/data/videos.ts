// Curated theme videos for the Daily Learning Journey DISCOVER stage.
//
// Every video was found via YouTube search and VERIFIED through the oEmbed API
// during development (existing + embeddable): see scripts/find_theme_videos.sh.
// Channels: TED-Ed / BBC Learning English — level-appropriate, short (4-6 min),
// visually engaging. If YouTube is unavailable the player degrades to a plain
// "open in Telegram/browser" link and the journey continues without video.

export interface ThemeVideo {
  themeId: string;
  videoId: string;
  title: string;
  channel: string;
  /** One-line Uzbek teaser shown under the player. */
  noteUz: string;
}

export const THEME_VIDEOS: ThemeVideo[] = [
  { themeId: 'communication', videoId: 'i3ku5nx4tMU', title: '4 things all great listeners know', channel: 'TED-Ed', noteUz: 'Muloqotning yarmi — tinglash. Bu videoda yaxshi tinglovchilarning 4 siri.' },
  { themeId: 'animals', videoId: 'sI8NsYIyQ2A', title: 'Why do cats act so weird?', channel: 'TED-Ed', noteUz: 'Mushaklar nega shunday «g‘alati» harakat qiladi? Javobi evolyutsiyada.' },
  { themeId: 'history', videoId: 'fJBlEPOj4Fk', title: 'How did they build the Great Pyramid of Giza?', channel: 'TED-Ed', noteUz: 'Giza piramidasi miloddan avval qanday qurilgan? 4 500 yillik muammo.' },
  { themeId: 'technology', videoId: 'er3v4PVNQqE', title: 'The hidden network that makes the internet possible', channel: 'TED-Ed', noteUz: 'Internet nima uchun «aloqa» demakdir? Yorug‘lik tezligidagi tolalar.' },
  { themeId: 'success', videoId: 'eBz7iUJu9UM', title: 'How to overcome your mistakes', channel: 'TED-Ed', noteUz: 'Xato — muvaffaqiyatga yo‘l. Bu videoda xatolardan qanday kuch olish kerak.' },
  { themeId: 'cultures', videoId: 'MMmOLN5zBLY', title: 'The benefits of a bilingual brain', channel: 'TED-Ed', noteUz: 'Ikki tilda gapirish miyani qanday kuchaytiradi? Siz ham shu yo‘ldasiz!' },
  { themeId: 'everyday', videoId: 'I_tRSrPru94', title: 'How to introduce yourself', channel: 'BBC Learning English', noteUz: 'BBC bilan o‘zingizni tanishtirishni o‘rganing — subtitle bilan suhbat.' },
  { themeId: 'space', videoId: 'I5V2tcg1BvQ', title: 'Could you live on the moon?', channel: 'TED-Ed', noteUz: 'Oyda yashash mumkinmi? Oy koloniyalarining haqiqati.' },
  { themeId: 'business', videoId: 'XNu5ppFZbHo', title: 'What gives a dollar bill its value?', channel: 'TED-Ed', noteUz: 'Pul qog‘ozining qiymati qayerdan keladi? Biznesning eng qiziq savoli.' },
  { themeId: 'environment', videoId: '_6xlNyWPpB8', title: 'What really happens to the plastic you throw away', channel: 'TED-Ed', noteUz: 'Tashlangan plastik aslida qayerga boradi? Uch xil yakun.' },
  { themeId: 'food', videoId: 'n6wpNhyreDE', title: 'How to make the perfect cookies (according to science)', channel: 'TED-Ed', noteUz: 'Mukammal pechenye qanday pishiriladi? Kimyodagi sir.' },
  { themeId: 'sport', videoId: 'm57cimnJ7fc', title: 'Football physics: The "impossible" free kick', channel: 'TED-Ed', noteUz: '«Iloji yo‘q» jarima zarbasi fizikasi — Magnus effekti.' },
];

export const videoForTheme = (themeId: string): ThemeVideo | undefined =>
  THEME_VIDEOS.find((v) => v.themeId === themeId);

export const isKnownVideoId = (id: string): boolean =>
  THEME_VIDEOS.some((v) => v.videoId === id);
