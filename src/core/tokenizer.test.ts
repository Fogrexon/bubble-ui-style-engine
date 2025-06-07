import { it, expect, describe } from 'vitest';
import { tokenizer } from './tokenizer.ts';

describe('tokenizer', () => {
  it('should split a string into tokens', () => {
    const input = '  token1   token2   token3  ';
    const expectedOutput = ['token1', 'token2', 'token3'];
    const result = tokenizer(input);
    expect(result).toEqual(expectedOutput);
  });
  it('should handle tokens with units', () => {
    const input = '10% 20.5em  30rem - ';
    const expectedOutput = ['10%', '20.5em', '30rem', '-'];
    const result = tokenizer(input);
    expect(result).toEqual(expectedOutput);
  });
  it('should handle tokens with whitespace between value and unit', () => {
    const input = '10 % 20 em 30 rem 4 50px';
    const expectedOutput = ['10 %', '20 em', '30 rem', '4', '50px'];
    const result = tokenizer(input);
    expect(result).toEqual(expectedOutput);
  });
  it('should handle tokens with negative values', () => {
    const input = '-10px -20em - 30 rem';
    const expectedOutput = ['-10px', '-20em', '- 30 rem'];
    const result = tokenizer(input);
    expect(result).toEqual(expectedOutput);
  });
  it('should handle tokens with parentheses', () => {
    const input = 'url(https://sample.com/image) argb(255, 0, 0, 0.4)';
    const expectedOutput = ['url(https://sample.com/image)', 'argb(255, 0, 0, 0.4)'];
    const result = tokenizer(input);
    expect(result).toEqual(expectedOutput);
  });
});
