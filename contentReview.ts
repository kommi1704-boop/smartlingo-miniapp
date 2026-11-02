// Educational content review statuses.
//
// The platform separates content the team has manually checked from content produced by AI.
// NOTHING is ever labelled "teacher-approved" unless a real teacher has reviewed it — so far no
// content carries that status, and the label simply does not appear in the UI until it does.
//
//  - 'reviewed': written/checked by the team (curated data files shipped with the app).
//  - 'draft':    AI-generated or auto-produced, not human-reviewed yet. Always badged in the UI.
//  - 'approved': verified by a teacher. Reserved — currently unused on purpose.

export type ReviewStatus = 'draft' | 'reviewed' | 'approved';

export interface ReviewBadge {
  label: string;
  tone: 'amber' | 'green' | 'indigo';
  hint: string;
}

export function reviewBadge(status: ReviewStatus): ReviewBadge {
  switch (status) {
    case 'draft':
      return { label: 'AI yozgan — tekshirilmagan', tone: 'amber', hint: 'Bu matn sun’iy intellekt tomonidan yaratilgan va inson tomonidan tekshirilmagan. Xato topsangiz «Xato bor» tugmasi bilan xabar bering.' };
    case 'approved':
      return { label: 'O‘qituvchi tasdiqlagan', tone: 'green', hint: 'Bu material o‘qituvchi tomonidan tekshirilib, tasdiqlangan.' };
    case 'reviewed':
      return { label: 'Tekshirilgan', tone: 'indigo', hint: 'Bu material ilova jamoasi tomonidan tekshirilgan.' };
  }
}

/** Status of the curated content groups shipped with the app. */
export const CURATED_STATUS: Record<string, ReviewStatus> = {
  vocab: 'reviewed',
  grammar: 'reviewed',
  reading: 'reviewed',
  listening: 'reviewed',
  speaking: 'reviewed',
  writing: 'reviewed',
  resources: 'reviewed',
  placement: 'reviewed',
};

/** AI-produced content shown in the app. Everything here MUST render a Draft badge. */
export const AI_STATUS: Record<string, ReviewStatus> = {
  'reading:generated': 'draft', // "Men uchun matn" (AI reading texts)
  'tutor:demo': 'draft', // offline demo tutor replies
};
