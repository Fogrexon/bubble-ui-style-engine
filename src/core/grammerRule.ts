/* eslint-disable no-use-before-define */
export type PrimitiveToken = 'length' | 'percentage' | 'integer' | 'color' | 'image';

/**
 * keyword definition
 */
export type KeywordDefinition = {
  type: 'keyword';
  value: string;
  id: string;
};

/**
 * type definition
 */
export type PrimitiveTokenDefinition = {
  type: 'type';
  tokenType: PrimitiveToken;
  id: string;
};

/**
 * sequence definition
 * A B C
 */
export interface SequenceDefinition {
  type: 'sequence';
  elements: GrammarRule[];
  id: string;
}

/**
 * choice definition
 * A | B | C
 */
export interface ChoiceDefinition {
  type: 'choice';
  options: GrammarRule[];
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
