// Shared client type for notification categories — must stay in sync with
// api/notify.ts NOTIFY_KINDS (tests cross-check both).
export type NotifyKind = 'streak' | 'news' | 'motivation' | 'achievements' | 'quiz' | 'battle' | 'weekly';

export const NOTIFY_KINDS: NotifyKind[] = ['streak', 'news', 'motivation', 'achievements', 'quiz', 'battle', 'weekly'];
