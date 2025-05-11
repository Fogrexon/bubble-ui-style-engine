import { describe, expect, it } from 'vitest';

describe('sum function', () => {
  it('should return the sum of two numbers', () => {
    const sum = (a: number, b: number) => a + b;
    expect(sum(1, 2)).toBe(3);
  });
});
