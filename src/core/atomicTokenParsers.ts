import type { LimitedLengthToken, PrimitiveToken, StaticPrimitiveToken } from './grammarRule';
import type { ASTLeaf } from './ast';
import { getRangeStringProcessor } from './util';

const createLeaf = <T extends string | number>(
  id: StaticPrimitiveToken | 'keyword',
  value: T,
  unit?: string
): ASTLeaf<T> => ({
  type: 'leaf',
  id,
  value,
  unit,
});

export type PrimitiveTokenParser<T extends string | number> = (value: string) => ASTLeaf<T> | null;

const { tester: isLimitedLengthToken, getRange: getLimitedLengthTokenRange } =
  getRangeStringProcessor('length');

const LimitedLengthTokenParserGenerator: (
  tokenType: LimitedLengthToken
) => PrimitiveTokenParser<number> = (tokenType) => {
  const [min, max] = getLimitedLengthTokenRange(tokenType);

  return (value: string) => {
    const s = value.toLowerCase().trim();
    const unit = s.match(/(px|%|em|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc)$/);
    const number = s.match(/-?\d*\.?\d+/);
    if (!number || (unit && unit[0] === '%')) return null;
    const unitValue = unit ? unit[0] : '';
    const numberValue = parseFloat(number[0]);
    if (Number.isNaN(numberValue)) return null;
    if (numberValue < min || numberValue > max) return null;
    return createLeaf('length', numberValue, unitValue);
  };
};

const LengthTokenParser: PrimitiveTokenParser<number> = (value) => {
  const s = value.toLowerCase().trim();
  const unit = s.match(/(px|%|em|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc)$/);
  const number = s.match(/-?\d*\.?\d+/);
  if (!number || (unit && unit[0] === '%')) return null;
  const unitValue = unit ? unit[0] : '';
  const numberValue = parseFloat(number[0]);
  if (Number.isNaN(numberValue)) return null;
  return createLeaf('length', numberValue, unitValue);
};

const PercentageTokenParser: PrimitiveTokenParser<number> = (value) => {
  const s = value.toLowerCase().trim();
  const unit = s.match(/%$/);
  const number = s.match(/-?\d*\.?\d+/);
  if (!number || !unit) return null;
  const numberValue = parseFloat(number[0]);
  if (Number.isNaN(numberValue)) return null;
  return createLeaf('percentage', numberValue, '%');
};

const IntegerTokenParser: PrimitiveTokenParser<number> = (value) => {
  const number = value.match(/-?\d+/);
  if (!number) return null;
  const numberValue = parseInt(number[0], 10);
  if (Number.isNaN(numberValue)) return null;
  return createLeaf('integer', numberValue);
};

const ColorTokenParser: PrimitiveTokenParser<string> = (value) => {
  const s = value.toLowerCase().trim();
  const commonColors = [
    'transparent',
    'currentcolor',
    'black',
    'silver',
    'gray',
    'white',
    'maroon',
    'red',
    'purple',
    'fuchsia',
    'green',
    'lime',
    'olive',
    'yellow',
    'navy',
    'blue',
    'teal',
    'aqua',
    'rebeccapurple',
    // Not limited to this, but list some famous ones for now
  ];
  if (
    !commonColors.includes(s) &&
    !/^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(s) &&
    !/^rgba?\s*\((\s*\d+%?\s*,\s*){2}\s*\d+%?\s*(,\s*(0|1|0?\.\d+)\s*)?\)$/.test(s) &&
    !/^hsla?\s*\((\s*\d+\s*,\s*){2}\s*\d+%\s*(,\s*(0|1|0?\.\d+)\s*)?\)$/.test(s)
  )
    return null; // 簡単なチェック
  return createLeaf('color', s);
};

const ImageTokenParser: PrimitiveTokenParser<string> = (value) => {
  const s = value.toLowerCase();
  const extractedUrl = s.match(/url\(([^)]+)\)/);
  if (!extractedUrl) return null;
  return createLeaf('image', extractedUrl[1].replace(/['"]/g, ''));
};

const keywordTokenParser = (value: string, keyword: string) => {
  const s = value.toLowerCase();
  if (s !== keyword) return null;
  return createLeaf('keyword', s);
};

type PrimitiveTokenParsedType = {
  length: number;
  color: string;
  percentage: number;
  integer: number;
  number: number;
  image: string;
};

type PrimitiveTokenParsers = {
  [K in StaticPrimitiveToken]: PrimitiveTokenParser<PrimitiveTokenParsedType[K]>;
};

type KeywordTokenParsers = {
  keyword: typeof keywordTokenParser;
};

/**
 * parsers of primitive tokens
 */
export const atomicTokenParsers: PrimitiveTokenParsers & KeywordTokenParsers = {
  length: LengthTokenParser,
  percentage: PercentageTokenParser,
  integer: IntegerTokenParser,
  color: ColorTokenParser,
  image: ImageTokenParser,
  keyword: keywordTokenParser,
};

export const atomicTokenParserSelector = (tokenType: PrimitiveToken) => {
  if (isLimitedLengthToken(tokenType)) {
    return LimitedLengthTokenParserGenerator(tokenType);
  }

  return atomicTokenParsers[tokenType] || null;
};
