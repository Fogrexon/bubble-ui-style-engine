// generate util test
import { describe, it, expect } from 'vitest';
import { getRangeStringProcessor } from './util';

describe('getRangeStringProcessor', () => {
  const { tester, getRange } = getRangeStringProcessor('length');

  it('should correctly identify valid range strings', () => {
    expect(tester('length<0,100>')).toBe(true);
    expect(tester('length<-∞,∞>')).toBe(true);
    expect(tester('length<10,20>')).toBe(true);
  });

  it('should return false for invalid range strings', () => {
    expect(tester('length<abc,100>')).toBe(false);
    expect(tester('length<10,20,30>')).toBe(false);
    expect(tester('invalid<10,20>')).toBe(false);
  });

  it('should correctly extract ranges from valid range strings', () => {
    expect(getRange('length<0,100>')).toEqual([0, 100]);
    expect(getRange('length<-∞,∞>')).toEqual([-Infinity, Infinity]);
    expect(getRange('length<10,20>')).toEqual([10, 20]);
  });

  it('should throw an error for invalid range strings when extracting ranges', () => {
    expect(() => getRange('length<100,0>')).toThrow();
  });
});
