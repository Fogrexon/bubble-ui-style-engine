/* eslint-disable no-use-before-define */
export type StaticPrimitiveToken = 'length' | 'percentage' | 'integer' | 'color' | 'image';

export type LimitedLengthToken = `length<${number | '-∞'},${number | '∞'}>`;

export type DynamicPrimitiveToken = LimitedLengthToken;

export type PrimitiveToken = StaticPrimitiveToken | DynamicPrimitiveToken;

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
  type: 'repetition';
  rule: GrammarRule;
  min: number;
  max: number;
  id: string;
}

/**
 * grammar rule
 * keyword | type | sequence | choice | repetition
 */
export type GrammarRule =
  | KeywordDefinition
  | PrimitiveTokenDefinition
  | SequenceDefinition
  | ChoiceDefinition
  | RepetitionDefinition;

/**
 * property grammar
 */
export interface PropertyGrammar {
  propertyName: string;
  rootRule: GrammarRule;
}
