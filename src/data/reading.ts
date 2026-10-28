import type { ReadingPassage } from '../types';
import { READING_BASE } from './reading-base';
import { READING_MORE } from './reading-more';
import { READING_EXTENDED } from './reading-extended';

export const READING: ReadingPassage[] = [
  ...READING_BASE,
  ...READING_MORE,
  ...READING_EXTENDED,
];
