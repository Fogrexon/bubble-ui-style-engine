import { it, expect, describe } from 'vitest';
import { atomicTokenParsers, atomicTokenParserSelector } from './atomicTokenParsers';

describe('static token parsers', () => {
  it('length token parser should parse valid length values', () => {
    const lengthParser = atomicTokenParsers.length;
    expect(lengthParser('10 px')).toEqual({
      type: 'leaf',
      tokenType: 'length',
      value: 10,
      unit: 'px',
    });
    expect(lengthParser('20 EM')).toEqual({
      type: 'leaf',
      tokenType: 'length',
      value: 20,
      unit: 'em',
    });
    expect(lengthParser('-30rem')).toEqual({
      type: 'leaf',
      tokenType: 'length',
      value: -30,
      unit: 'rem',
    });
    expect(lengthParser('5')).toEqual({ type: 'leaf', tokenType: 'length', value: 5, unit: '' });
    expect(lengthParser('40%')).toBeNull();
    expect(lengthParser('invalid')).toBeNull();
  });
  it('percentage token parser should parse valid percentage values', () => {
    const percentageParser = atomicTokenParsers.percentage;
    expect(percentageParser('50%')).toEqual({
      type: 'leaf',
      tokenType: 'percentage',
      value: 50,
      unit: '%',
    });
    expect(percentageParser('invalid')).toBeNull();
  });
  it('integer token parser should parse valid integer values', () => {
    const integerParser = atomicTokenParsers.integer;
    expect(integerParser('100')).toEqual({ type: 'leaf', tokenType: 'integer', value: 100 });
    expect(integerParser('-50')).toEqual({ type: 'leaf', tokenType: 'integer', value: -50 });
    expect(integerParser('invalid')).toBeNull();
  });
  it('color token parser should parse valid color values', () => {
    const colorParser = atomicTokenParsers.color;
    expect(colorParser('#ff0000')).toEqual({ type: 'leaf', tokenType: 'color', value: '#ff0000' });
    expect(colorParser('rgb(255, 0, 0)')).toEqual({
      type: 'leaf',
      tokenType: 'color',
      value: 'rgb(255, 0, 0)',
    });
    expect(colorParser('rgba(255, 0, 0, 1)')).toEqual({
      type: 'leaf',
      tokenType: 'color',
      value: 'rgba(255, 0, 0, 1)',
    });
    expect(colorParser('invalid')).toBeNull();
  });
  it('image token parser should parse valid image URLs', () => {
    const imageParser = atomicTokenParsers.image;
    expect(imageParser('url("https://example.com/image.png")')).toEqual({
      type: 'leaf',
      tokenType: 'image',
      value: 'https://example.com/image.png',
    });
    expect(imageParser('url(https://example.com/image.png)')).toEqual({
      type: 'leaf',
      tokenType: 'image',
      value: 'https://example.com/image.png',
    });
    expect(imageParser('invalid')).toBeNull();
  });
});

describe('token parser generator', () => {
  it('limited length token parser should parse valid length values', () => {
    const limitedTokenParser = atomicTokenParserSelector('length<0,100>');
    expect(limitedTokenParser('50px')).toEqual({
      type: 'leaf',
      tokenType: 'length',
      value: 50,
      unit: 'px',
    });
    expect(limitedTokenParser('150px')).toBeNull();
  });

  it('keyword token parser should parse valid keywords', () => {
    const keywordParser = atomicTokenParserSelector('keyword<solid, dashed>');
    expect(keywordParser('solid')).toEqual({
      type: 'leaf',
      tokenType: 'keyword',
      value: 'solid',
    });
    expect(keywordParser('dashed')).toEqual({
      type: 'leaf',
      tokenType: 'keyword',
      value: 'dashed',
    });
    expect(keywordParser('invalid')).toBeNull();
  });
});
