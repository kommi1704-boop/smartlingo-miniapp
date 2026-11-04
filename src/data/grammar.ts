import type { GrammarLesson } from '../types';
import { GRAMMAR_A } from './grammar-a';
import { GRAMMAR_B } from './grammar-b';
import { GRAMMAR_C } from './grammar-c';
import { GRAMMAR_D } from './grammar-d';

export const GRAMMAR: GrammarLesson[] = [...GRAMMAR_A, ...GRAMMAR_B, ...GRAMMAR_C, ...GRAMMAR_D];
