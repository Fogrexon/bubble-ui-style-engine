import { describe, expect, it } from 'vitest';
import { parserGenerator } from './parserGenerator.ts';
import type { GrammarRule } from './grammarRule';

describe('simple keyword grammar', () => {
  const grammarRule: GrammarRule = {
    type: 'keyword',
    value: 'test',
    id: 'testId',
  };
  const parser = parserGenerator(grammarRule);
  it('should generate a parser from the grammar rule', () => {
    const result = parser('test');
    expect(result).toEqual({
      type: 'branch',
      id: 'root',
      children: [
        {
          type: 'leaf',
          id: 'keyword',
          value: 'test',
        },
      ],
    });
  });
  it('should throw error for non-matching input', () => {
    expect(() => parser('invalid')).toThrowError('Failed to parse value: invalid');
  });
});

describe('sequence grammar', () => {
  const grammarRule: GrammarRule = {
    id: 'border',
    type: 'sequence',
    rules: [
      {
        id: 'borderWidth',
        type: 'primitive',
        tokenType: 'length',
      },
      {
        id: 'borderRadius',
        type: 'primitive',
        tokenType: 'percentage',
      },
      {
        id: 'borderColor',
        type: 'primitive',
        tokenType: 'color',
      },
    ],
  };
  const parser = parserGenerator(grammarRule);

  it('should generate a parser from the grammar rule', () => {
    const result = parser('1px 10 % red');
    expect(result).toEqual({
      type: 'branch',
      id: 'root',
      children: [
        {
          type: 'branch',
          id: 'borderWidth',
          children: [
            {
              type: 'leaf',
              id: 'length',
              unit: 'px',
              value: 1,
            },
          ],
        },
        {
          type: 'branch',
          id: 'borderRadius',
          children: [
            {
              type: 'leaf',
              id: 'percentage',
              unit: '%',
              value: 10,
            },
          ],
        },
        {
          type: 'branch',
          id: 'borderColor',
          children: [
            {
              type: 'leaf',
              id: 'color',
              value: 'red',
            },
          ],
        },
      ],
    });
  });
  it('should throw error for non-matching input', () => {
    expect(() => parser('invalid')).toThrowError('Failed to parse value: invalid');
    expect(() => parser('1px')).toThrowError('Failed to parse value: 1px');
    expect(() => parser('red 1px')).toThrowError('Failed to parse value: red 1px');
    expect(() => parser('1px red additional')).toThrowError(
      'Failed to parse value: 1px red additional'
    );
  });
});

describe('unordered grammar', () => {
  const grammarRule: GrammarRule = {
    id: 'border',
    type: 'unordered',
    rules: [
      {
        id: 'borderWidth',
        type: 'primitive',
        tokenType: 'length',
      },
      {
        id: 'borderRadius',
        type: 'primitive',
        tokenType: 'percentage',
      },
      {
        id: 'borderColor',
        type: 'primitive',
        tokenType: 'color',
      },
    ],
  };
  const parser = parserGenerator(grammarRule);

  it('should generate a parser from the grammar rule', () => {
    const result = parser('1px red 10%');
    expect(result).toEqual({
      type: 'branch',
      id: 'root',
      children: [
        {
          type: 'branch',
          id: 'borderWidth',
          children: [
            {
              type: 'leaf',
              id: 'length',
              unit: 'px',
              value: 1,
            },
          ],
        },
        {
          type: 'branch',
          id: 'borderColor',
          children: [
            {
              type: 'leaf',
              id: 'color',
              value: 'red',
            },
          ],
        },
        {
          type: 'branch',
          id: 'borderRadius',
          children: [
            {
              type: 'leaf',
              id: 'percentage',
              unit: '%',
              value: 10,
            },
          ],
        },
      ],
    });
  });
  it('should throw error for non-matching input', () => {
    expect(() => parser('invalid')).toThrowError('Failed to parse value: invalid');
    expect(() => parser('1px red additional')).toThrowError(
      'Failed to parse value: 1px red additional'
    );
  });
  it('should parse unordered rules in any order', () => {
    const result = parser('10% red 1px');
    expect(result).toEqual({
      type: 'branch',
      id: 'root',
      children: [
        {
          type: 'branch',
          id: 'borderRadius',
          children: [
            {
              type: 'leaf',
              id: 'percentage',
              unit: '%',
              value: 10,
            },
          ],
        },
        {
          type: 'branch',
          id: 'borderColor',
          children: [
            {
              type: 'leaf',
              id: 'color',
              value: 'red',
            },
          ],
        },
        {
          type: 'branch',
          id: 'borderWidth',
          children: [
            {
              type: 'leaf',
              id: 'length',
              unit: 'px',
              value: 1,
            },
          ],
        },
      ],
    });
  });
  it('should parse subset of unordered rules', () => {
    const result = parser('1px red');
    expect(result).toEqual({
      type: 'branch',
      id: 'root',
      children: [
        {
          type: 'branch',
          id: 'borderWidth',
          children: [
            {
              type: 'leaf',
              id: 'length',
              unit: 'px',
              value: 1,
            },
          ],
        },
        {
          type: 'branch',
          id: 'borderColor',
          children: [
            {
              type: 'leaf',
              id: 'color',
              value: 'red',
            },
          ],
        },
      ],
    });
  });
});

describe('choice grammar', () => {
  const grammarRule: GrammarRule = {
    id: 'border',
    type: 'choice',
    rules: [
      {
        id: 'borderWidth',
        type: 'primitive',
        tokenType: 'length',
      },
      {
        id: 'borderRadius',
        type: 'primitive',
        tokenType: 'percentage',
      },
      {
        id: 'borderColor',
        type: 'primitive',
        tokenType: 'color',
      },
    ],
  };
  const parser = parserGenerator(grammarRule);

  it('should generate a parser from the grammar rule', () => {
    const result = parser('1px');
    expect(result).toEqual({
      type: 'branch',
      id: 'root',
      children: [
        {
          type: 'branch',
          id: 'borderWidth',
          children: [
            {
              type: 'leaf',
              id: 'length',
              unit: 'px',
              value: 1,
            },
          ],
        },
      ],
    });
  });
  it('should throw error for non-matching input', () => {
    expect(() => parser('invalid')).toThrowError('Failed to parse value: invalid');
    expect(() => parser('1px red')).toThrowError('Failed to parse value: 1px red');
  });
});

describe('repetition grammar', () => {
  const grammarRule: GrammarRule = {
    id: 'border',
    type: 'repetition<2,4>',
    rule: {
      id: 'borderWidth',
      type: 'primitive',
      tokenType: 'length',
    },
  };
  const infiniteGrammarRule: GrammarRule = {
    id: 'border',
    type: 'repetition',
    rule: {
      id: 'borderWidth',
      type: 'primitive',
      tokenType: 'length',
    },
  };
  const parser = parserGenerator(grammarRule);

  it('should generate a parser from the grammar rule', () => {
    const result = parser('1px 2px 3px');
    expect(result).toEqual({
      type: 'branch',
      id: 'root',
      children: [
        {
          type: 'branch',
          id: 'borderWidth',
          children: [
            { type: 'leaf', id: 'length', unit: 'px', value: 1 },
            { type: 'leaf', id: 'length', unit: 'px', value: 2 },
            { type: 'leaf', id: 'length', unit: 'px', value: 3 },
          ],
        },
      ],
    });
  });
  it('should throw error for non-matching input', () => {
    expect(() => parser('invalid')).toThrowError('Failed to parse value: invalid');
    expect(() => parser('1px')).toThrowError('Failed to parse value: 1px');
    expect(() => parser('1px red')).toThrowError('Failed to parse value: 1px red');
    expect(() => parser('1px 2px 3px 4px 5px')).toThrowError(
      'Failed to parse value: 1px 2px 3px 4px 5px'
    );
  });
  it('check infinite repetition', () => {
    const infiniteParser = parserGenerator(infiniteGrammarRule);
    const result = infiniteParser('1px 2px 3px 4px 5px');
    expect(result).toEqual({
      type: 'branch',
      id: 'root',
      children: [
        {
          type: 'branch',
          id: 'borderWidth',
          children: [
            { type: 'leaf', id: 'length', unit: 'px', value: 1 },
            { type: 'leaf', id: 'length', unit: 'px', value: 2 },
            { type: 'leaf', id: 'length', unit: 'px', value: 3 },
            { type: 'leaf', id: 'length', unit: 'px', value: 4 },
            { type: 'leaf', id: 'length', unit: 'px', value: 5 },
          ],
        },
      ],
    });
  });
});

describe('united grammar', () => {
  const borderStyleGrammarRule: GrammarRule = {
    id: 'borderStyle',
    type: 'choice',
    rules: [
      {
        type: 'keyword',
        value: 'solid',
      },
      {
        type: 'keyword',
        value: 'dashed',
      },
      {
        type: 'keyword',
        value: 'dotted',
      },
    ],
  };

  const borderWidthGrammarRule: GrammarRule = {
    id: 'borderWidth',
    type: 'repetition<1,4>',
    rule: {
      id: 'length',
      type: 'primitive',
      tokenType: 'length',
    },
  };

  const borderGrammarRule: GrammarRule = {
    id: 'border',
    type: 'unordered',
    rules: [
      borderStyleGrammarRule,
      borderWidthGrammarRule,
      {
        id: 'borderColor',
        type: 'primitive',
        tokenType: 'color',
      },
    ],
  };
  const parser = parserGenerator(borderGrammarRule);

  it('should parse border style, width, and color in any order', () => {
    const result = parser('solid 1px red');
    expect(result).toEqual({
      type: 'branch',
      id: 'root',
      children: [
        {
          type: 'branch',
          id: 'borderStyle',
          children: [{ type: 'leaf', id: 'keyword', value: 'solid' }],
        },
        {
          type: 'branch',
          id: 'borderWidth',
          children: [{ type: 'leaf', id: 'length', unit: 'px', value: 1 }],
        },
        {
          type: 'branch',
          id: 'borderColor',
          children: [{ type: 'leaf', id: 'color', value: 'red' }],
        },
      ],
    });
  });

  it('should parse fewer elements if not all are provided', () => {
    const result = parser('2px 5px 3px 7px dashed');
    expect(result).toEqual({
      type: 'branch',
      id: 'root',
      children: [
        {
          type: 'branch',
          id: 'borderWidth',
          children: [
            { type: 'leaf', id: 'length', unit: 'px', value: 2 },
            { type: 'leaf', id: 'length', unit: 'px', value: 5 },
            { type: 'leaf', id: 'length', unit: 'px', value: 3 },
            { type: 'leaf', id: 'length', unit: 'px', value: 7 },
          ],
        },
        {
          type: 'branch',
          id: 'borderStyle',
          children: [{ type: 'leaf', id: 'keyword', value: 'dashed' }],
        },
      ],
    });
  });
  it('should throw error for non-matching input', () => {
    expect(() => parser('invalid')).toThrowError('Failed to parse value: invalid');
  });
});
