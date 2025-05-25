/* eslint-disable no-use-before-define */
import type { RangeString } from './util';

export type StaticPrimitiveToken = 'length' | 'percentage' | 'integer' | 'color' | 'image';

export type LimitedLengthToken = RangeString<'length'>;

export type DynamicPrimitiveToken = LimitedLengthToken;

export type PrimitiveToken = StaticPrimitiveToken | DynamicPrimitiveToken;

export type AtomicDefinition = KeywordDefinition | PrimitiveTokenDefinition;
export type RecursiveDefinition = SequenceDefinition | ChoiceDefinition | RepetitionDefinition;

export type RepetitionType = RangeString<'repetition'>;

/**
 * keyword definition
 */
export type KeywordDefinition = {
  type: 'keyword';
  value: string;
  id: string;
};

/**
 * primitive definition
 */
export type PrimitiveTokenDefinition = {
  type: 'primitive';
  tokenType: PrimitiveToken;
  id: string;
};

/**
 * unordered definition
 * A || B || C
 */
export interface UnorderedDefinition {
  type: 'unordered';
  rules: GrammarRule[];
  id: string;
}

/**
 * sequence definition
 * A B C
 */
export interface SequenceDefinition {
  type: 'sequence';
  rules: GrammarRule[];
  id: string;
}

/**
 * choice definition
 * A | B | C
 */
export interface ChoiceDefinition {
  type: 'choice';
  rules: GrammarRule[];
  id: string;
}

/**
 * repetition definition
 * A{1,3}
 */
export interface RepetitionDefinition {
  type: 'repetition' | RepetitionType; // 'repetition<min,max>'
  rule: GrammarRule;
  id: string;
}

/**
 * grammar rule
 * keyword | type | sequence | unordered | choice | repetition
 */
export type GrammarRule =
  | KeywordDefinition
  | PrimitiveTokenDefinition
  | SequenceDefinition
  | UnorderedDefinition
  | ChoiceDefinition
  | RepetitionDefinition;
