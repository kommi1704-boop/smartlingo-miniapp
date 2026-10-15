import type { GrammarLesson } from '../types';
import { GRAMMAR_A } from './grammar-a';
import { GRAMMAR_B } from './grammar-b';

export const GRAMMAR: GrammarLesson[] = [...GRAMMAR_A, ...GRAMMAR_B];
