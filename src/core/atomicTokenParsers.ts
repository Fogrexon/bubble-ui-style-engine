import type {
  DynamicPrimitiveToken,
  KeywordToken,
  LimitedLengthToken,
  PrimitiveToken,
  StaticPrimitiveToken,
} from './grammarRule';
import type { ASTLeaf, LeafApplicableToken } from './ast';
import { getRangeStringProcessor } from './util';

const createLeaf = <T extends string | number>(
  tokenType: LeafApplicableToken,
  value: T,
  unit?: string
): ASTLeaf<T> => ({
  type: 'leaf',
  tokenType,
  value,
  unit,
});

export type PrimitiveTokenParser<T extends string | number> = (value: string) => ASTLeaf<T> | null;

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

// dynamic tokens

export type DynamicTokenParserGenerator<
  T extends DynamicPrimitiveToken,
  U extends string | number,
> = (tokenType: T) => PrimitiveTokenParser<U>;

const { tester: isLimitedLengthToken, getRange: getLimitedLengthTokenRange } =
  getRangeStringProcessor('length');

const LimitedLengthTokenParserGenerator: DynamicTokenParserGenerator<LimitedLengthToken, number> = (
  tokenType
) => {
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

const isKeywordToken = (value: string): value is KeywordToken =>
  value.startsWith('keyword<') && value.endsWith('>');
const KeywordTokenParserGenerator: DynamicTokenParserGenerator<KeywordToken, string> = (
  tokenType
) => {
  // keyword<type1,type2,...>
  const rawKeywords = tokenType.slice(8, -1); // remove 'keyword<' and '>'
  const keywords = rawKeywords.split(',').map((k) => k.trim().toLowerCase());

  return (value: string) => {
    const s = value.toLowerCase();
    if (!keywords.includes(s)) return null;
    return createLeaf('keyword', s);
  };
};

type PrimitiveTokenParsedType = {
  length: number;
  color: string;
  percentage: number;
  integer: number;
  number: number;
  image: string;
  keyword: string;
};

type PrimitiveTokenParsers = {
  [K in Exclude<StaticPrimitiveToken, 'keyword'>]: PrimitiveTokenParser<
    PrimitiveTokenParsedType[K]
  >;
};

/**
 * parsers of primitive tokens
 */
export const atomicTokenParsers: PrimitiveTokenParsers = {
  length: LengthTokenParser,
  percentage: PercentageTokenParser,
  integer: IntegerTokenParser,
  color: ColorTokenParser,
  image: ImageTokenParser,
};

export const atomicTokenParserSelector = (tokenType: PrimitiveToken) => {
  if (isLimitedLengthToken(tokenType)) {
    return LimitedLengthTokenParserGenerator(tokenType);
  }

  if (isKeywordToken(tokenType)) {
    return KeywordTokenParserGenerator(tokenType);
  }

  return atomicTokenParsers[tokenType] || null;
};
