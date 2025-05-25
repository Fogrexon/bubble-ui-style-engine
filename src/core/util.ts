export type RangeString<T extends string> = `${T}<${number | '-∞'},${number | '∞'}>`;

type IsRangeStringType<T extends string> = (value: string) => value is RangeString<T>;
type GetRangeStringRangeType<T extends string> = (value: RangeString<T>) => [number, number];
type RangeStringProcessor<T extends string> = {
  tester: IsRangeStringType<T>;
  getRange: GetRangeStringRangeType<T>;
};

export const getRangeStringProcessor = <T extends string>(baseString: T) => {
  const regex = new RegExp(`^${baseString}<(-?\\d+|∞|-\\d+),\\s*(-?\\d+|∞|-\\d+)>$`);
  const processor: RangeStringProcessor<T> = {
    tester: (value: string): value is RangeString<T> => regex.test(value),
    getRange: (value: RangeString<T>): [number, number] => {
      const match = value.match(regex);
      if (!match) throw new Error(`Invalid range string: ${value}`);
      const min = match[1] === '-∞' ? -Infinity : parseFloat(match[1]);
      const max = match[2] === '∞' ? -Infinity : parseFloat(match[2]);
      return [min, max];
    },
  };
  return processor;
};
