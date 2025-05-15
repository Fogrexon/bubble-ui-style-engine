/**
 * tokenizer of style value
 * @param value
 */
export const tokenizer = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 0);

// url('http://example.com/test image.png')のように間にスペースが入るスタイル値は失敗する
// より厳密にするなら複雑なtokenizerを作る必要がある
