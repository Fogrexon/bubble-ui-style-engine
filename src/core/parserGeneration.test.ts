import { describe, expect, it } from 'vitest';
import { parserGenerator } from './parserGenerator.ts';
import type { GrammarRule } from './grammerRule.ts';

describe('simple keyword grammer', () => {
  const grammarRule: GrammarRule = {
    type: 'keyword',
    value: 'test',
    id: 'testId',
  };
  const parser = parserGenerator(grammarRule);
  it('should generate a parser from the grammar rule', () => {
    const result = parser('test');
    expect(result).toEqual({
      type: 'node',
      children: {
        testId: {
          type: 'atomic',
          value: 'test',
        },
      },
    });
  });
  it('should return null for non-matching input', () => {
    const result = parser('nonMatching');
    expect(result).toBeNull();
  });
});

describe('sequence grammar', () => {
  const borderStyleRule: GrammarRule = {
    id: 'borderStyle',
    type: 'choice',
    rules: [
      {
        id: 'solid',
        type: 'keyword',
        value: 'solid',
      },
      {
        id: 'dashed',
        type: 'keyword',
        value: 'dashed',
      },
      {
        id: 'dotted',
        type: 'keyword',
        value: 'dotted',
      },
    ],
  };
  const grammarRule: GrammarRule = {
    id: 'border',
    type: 'sequence',
    rules: [
      {
        id: 'borderWidth',
        type: 'primitive',
        tokenType: 'length',
      },
      borderStyleRule,
      {
        id: 'borderColor',
        type: 'primitive',
        tokenType: 'color',
      },
    ],
  };
  const parser = parserGenerator(grammarRule);

  it('should generate a parser from the grammar rule', () => {
    const result = parser('1px solid red');
    console.log(JSON.stringify(result, null, 2));
    expect(result).toEqual({
      type: 'node',
      children: {
        borderWidth: {
          type: 'node',
        },
        borderStyle: {
          type: 'node',
          children: {
            solid: {
              type: 'atomic',
              value: 'solid',
            },
          },
        },
        borderColor: {
          type: 'atomic',
          value: 'red',
        },
      },
    });
  });
});
