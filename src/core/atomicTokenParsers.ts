import type { PrimitiveToken } from './grammerRule.ts';
import type { Atomic } from './ast.ts';

const createAtomic = <T extends string | number>(value: T, unit?: string): Atomic<T> => ({
  type: 'atomic',
  value,
  unit,
});

export type PrimitiveTokenParser<T extends string | number> = (value: string) => Atomic<T> | null;

const LengthTokenParser: PrimitiveTokenParser<number> = (value) => {
  const unit = value.match(/(px|em|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc)$/);
  const number = value.match(/-?\d*\.?\d+/);
  if (!unit || !number) return null;
  const unitValue = unit[0];
  const numberValue = parseFloat(number[0]);
  if (Number.isNaN(numberValue)) return null;
  return createAtomic(numberValue, unitValue);
};

const PercentageTokenParser: PrimitiveTokenParser<number> = (value) => {
  const unit = value.match(/%$/);
  const number = value.match(/-?\d*\.?\d+/);
  if (!number || !unit) return null;
  const numberValue = parseFloat(number[0]);
  if (Number.isNaN(numberValue)) return null;
  return createAtomic(numberValue, '%');
};

const IntegerTokenParser: PrimitiveTokenParser<number> = (value) => {
  const number = value.match(/-?\d+/);
  if (!number) return null;
  const numberValue = parseInt(number[0], 10);
  if (Number.isNaN(numberValue)) return null;
  return createAtomic(numberValue);
};

const ColorTokenParser: PrimitiveTokenParser<string> = (value) => {
  const s = value.toLowerCase();
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
    // これに限らないが、いったん有名そうなものを列挙
  ];
  if (
    !commonColors.includes(s) &&
    !/^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(s) &&
    !/^rgba?\s*\((\s*\d+%?\s*,\s*){2}\s*\d+%?\s*(,\s*(0|1|0?\.\d+)\s*)?\)$/.test(s) &&
    !/^hsla?\s*\((\s*\d+\s*,\s*){2}\s*\d+%\s*(,\s*(0|1|0?\.\d+)\s*)?\)$/.test(s)
  )
    return null; // 簡単なチェック
  return createAtomic(s);
};

const ImageTokenParser: PrimitiveTokenParser<string> = (value) => {
  const s = value.toLowerCase();
  const extractedUrl = s.match(/url\(([^)]+)\)/);
  if (!extractedUrl) return null;
  return createAtomic(extractedUrl[1]);
};

const keywordTokenParser = (value: string, keyword: string) => {
  const s = value.toLowerCase();
  if (s !== keyword) return null;
  return createAtomic(s);
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
  [K in PrimitiveToken]: PrimitiveTokenParser<PrimitiveTokenParsedType[K]>;
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
