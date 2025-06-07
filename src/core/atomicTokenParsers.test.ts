import { it, expect, describe } from 'vitest';
import { atomicTokenParsers, atomicTokenParserSelector } from './atomicTokenParsers';

describe('static token parsers', () => {
  it('length token parser should parse valid length values', () => {
    const lengthParser = atomicTokenParsers.length;
    expect(lengthParser('10 px')).toEqual({ type: 'leaf', id: 'length', value: 10, unit: 'px' });
    expect(lengthParser('20 EM')).toEqual({ type: 'leaf', id: 'length', value: 20, unit: 'em' });
    expect(lengthParser('-30rem')).toEqual({ type: 'leaf', id: 'length', value: -30, unit: 'rem' });
    expect(lengthParser('5')).toEqual({ type: 'leaf', id: 'length', value: 5, unit: '' });
    expect(lengthParser('40%')).toBeNull();
    expect(lengthParser('invalid')).toBeNull();
  });
  it('percentage token parser should parse valid percentage values', () => {
    const percentageParser = atomicTokenParsers.percentage;
    expect(percentageParser('50%')).toEqual({
      type: 'leaf',
      id: 'percentage',
      value: 50,
      unit: '%',
    });
    expect(percentageParser('invalid')).toBeNull();
  });
  it('integer token parser should parse valid integer values', () => {
    const integerParser = atomicTokenParsers.integer;
    expect(integerParser('100')).toEqual({ type: 'leaf', id: 'integer', value: 100 });
    expect(integerParser('-50')).toEqual({ type: 'leaf', id: 'integer', value: -50 });
    expect(integerParser('invalid')).toBeNull();
  });
  it('color token parser should parse valid color values', () => {
    const colorParser = atomicTokenParsers.color;
    expect(colorParser('#ff0000')).toEqual({ type: 'leaf', id: 'color', value: '#ff0000' });
    expect(colorParser('rgb(255, 0, 0)')).toEqual({
      type: 'leaf',
      id: 'color',
      value: 'rgb(255, 0, 0)',
    });
    expect(colorParser('rgba(255, 0, 0, 1)')).toEqual({
      type: 'leaf',
      id: 'color',
      value: 'rgba(255, 0, 0, 1)',
    });
    expect(colorParser('invalid')).toBeNull();
  });
  it('image token parser should parse valid image URLs', () => {
    const imageParser = atomicTokenParsers.image;
    expect(imageParser('url("https://example.com/image.png")')).toEqual({
      type: 'leaf',
      id: 'image',
      value: 'https://example.com/image.png',
    });
    expect(imageParser('url(https://example.com/image.png)')).toEqual({
      type: 'leaf',
      id: 'image',
      value: 'https://example.com/image.png',
    });
    expect(imageParser('invalid')).toBeNull();
  });
  it('keyword token parser should parse valid keywords', () => {
    const keywordParser = atomicTokenParsers.keyword;
    expect(keywordParser('solid', 'solid')).toEqual({
      type: 'leaf',
      id: 'keyword',
      value: 'solid',
    });
    expect(keywordParser('dashed', 'dashed')).toEqual({
      type: 'leaf',
      id: 'keyword',
      value: 'dashed',
    });
    expect(keywordParser('invalid', 'solid')).toBeNull();
  });
});

describe('token parser generator', () => {
  it('limited length token definition should parse valid length values', () => {
    const dynamicLengthParser = atomicTokenParserSelector('length<0,100>');
    expect(dynamicLengthParser('50px')).toEqual({
      type: 'leaf',
      id: 'length',
      value: 50,
      unit: 'px',
    });
    expect(dynamicLengthParser('150px')).toBeNull();
  });
});
