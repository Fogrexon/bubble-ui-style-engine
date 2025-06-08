export type RangeString<T extends string> = `${T}<${number | '-∞'},${number | '∞'}>`;

type IsRangeStringType<T extends string> = (value: string) => value is RangeString<T>;
type GetRangeStringRangeType<T extends string> = (value: RangeString<T>) => [number, number];
type RangeStringProcessor<T extends string> = {
  tester: IsRangeStringType<T>;
  getRange: GetRangeStringRangeType<T>;
};

export const getRangeStringProcessor = <T extends string>(baseString: T) => {
  const regex = new RegExp(`^${baseString}<(-?\\d+|-∞),(-?\\d+|\\+?∞)>$`);
  const processor: RangeStringProcessor<T> = {
    tester: (value: string): value is RangeString<T> => regex.test(value),
    getRange: (value: RangeString<T>): [number, number] => {
      const match = value.match(regex);
      if (!match) throw new Error(`Invalid range string: ${value}`);
      const min = match[1] === '-∞' ? -Infinity : parseFloat(match[1]);
      const max = match[2] === '∞' ? Infinity : parseFloat(match[2]);
      if (min > max) throw new Error(`Invalid range: ${min} is greater than ${max}`);
      return [min, max];
    },
  };
  return processor;
};

/**
 * 文字列の配列を、指定された区切り文字で結合する型
 * @template T - 文字列の配列 (e.g., ['a', 'b', 'c'])
 * @template D - 区切り文字 (e.g., ',')
 * @returns 結合された文字列 (e.g., 'a,b,c')
 */
export type Join<T extends readonly string[], D extends string> = T extends []
  ? ''
  : T extends [string]
    ? T[0]
    : T extends readonly [string, ...infer Rest]
      ? Rest extends readonly string[]
        ? `${T[0]}${D}${Join<Rest, D>}`
        : never
      : string;

/**
 * keyword<type1,type2,...> の形式の文字列型を生成する
 * @template TKeyword - 接頭辞となるキーワード
 * @template TTypes - ★★★ 型名を表す「文字列の配列」 ★★★
 */
export type SpeciallyFormattedString<
  TKeyword extends string,
  TTypes extends readonly string[],
> = `${TKeyword}<${Join<TTypes, ','>}>`;
