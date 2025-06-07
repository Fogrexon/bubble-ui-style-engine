/**
 * tokenizer of style value
 * @param value
 */

const units = 'px|\\%|em|rem|vw|vh|vmin|vmax|ch|ex|mm|cm|in|pt|pc';

const tokenizerRegex = new RegExp(
  `\\b\\w+\\([^)]+\\)|` + // 1. url(xxx)
    `((?:-\\s*)?\\d+(?:\\.\\d+)?\\s*(?:${units}))|` + // 2. number + unit
    `((?:-\\s*)?\\d+(?:\\.\\d+)?)\\b|` + // 3. integer
    `[^\\s]+`,
  'g'
);
export const tokenizer = (value: string) => {
  const tokens = value.match(tokenizerRegex);
  if (!tokens) return [];

  return tokens;
};
