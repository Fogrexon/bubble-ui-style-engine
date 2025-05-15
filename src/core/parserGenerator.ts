import type { AstNode, GrammarRule } from './grammerRule.ts';
import { atomicTokenParsers } from './atomicTokenParsers.ts';
import type { ASTElement } from './ast.ts';

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParseError';
    Object.setPrototypeOf(this, ParseError.prototype);
  }
}

export type StyleParser = (value: string) => AstNode;
export type InternalStyleParser = (
  tokens: string[],
  currentIndex: number
) => { ast: Record<string, ASTElement>; consumed: number };

const internalParserGenerator = (rule: GrammarRule): InternalStyleParser | null => {
  switch (rule.type) {
    case 'keyword':
      return (tokens, currentIndex) => {
        if (currentIndex < tokens.length) {
          const matchedValue = atomicTokenParsers.keyword(tokens[currentIndex], rule.value);
          if (matchedValue !== null) {
            return { ast: { [rule.id]: matchedValue }, consumed: 1 };
          }
        }
        return null;
      };

    case 'type':
      return (tokens, currentIndex) => {
        if (currentIndex < tokens.length) {
          const parsedValue = atomicTokenParsers[rule.tokenType](tokens[currentIndex]);
          if (parsedValue !== null) {
            return { ast: { [rule.id]: parsedValue }, consumed: 1 };
          }
        }
        return null;
      };

    case 'sequence':
      return (tokens, currentIndex) => {
        const sequenceAstParts: AstNode = {}; // シーケンス内の各要素のASTを格納
        let totalConsumedInSequence = 0;
        let currentElementIndex = currentIndex;
        for (let i = 0; i < rule.elements.length; i += 1) {
          const elementRule = rule.elements[i];
          const elementParser = internalParserGenerator(elementRule);
          const result = elementParser(tokens, currentElementIndex);
          if (result) {
            // 各要素のASTをマージする。要素のidが重複しないように注意。
            // ここでは、elementRuleのidをキーとして、その結果のASTを格納する形も考えられる。
            // 例: sequenceAstParts[elementRule.id] = result.ast;
            // 現在はフラットにマージしている。
            Object.assign(sequenceAstParts, result.ast);
            totalConsumedInSequence += result.consumed;
            currentElementIndex += result.consumed;
          } else {
            return null; // シーケンスの一部がマッチしなかった
          }
        }
        // シーケンス全体の結果を rule.id の下にネストする
        if (totalConsumedInSequence > 0 || rule.elements.length === 0) {
          return { ast: { [rule.id]: sequenceAstParts }, consumed: totalConsumedInSequence };
        }
        return null;
      };

    case 'choice':
      return (tokens, currentIndex) => {
        for (let i = 0; i < rule.options.length; i += 1) {
          const optionRule = rule.options[i];
          const optionParser = internalParserGenerator(optionRule);
          const result = optionParser(tokens, currentIndex);
          if (result) {
            // 選択されたオプションのASTを rule.id の下にネストする
            return { ast: { [rule.id]: result.ast }, consumed: result.consumed };
          }
        }
        return null;
      };

    case 'repetition': // OptionalDefinition から RepetitionDefinition に変更
      return (tokens, currentIndex) => {
        const repetitionResults: AstNode[] = []; // 繰り返されたルールのASTを格納する配列
        let totalConsumedInRepetition = 0;
        let currentRepetitionTokenIndex = currentIndex;
        const innerParser = internalParserGenerator(rule.rule, terminalParsers);

        while (repetitionResults.length < rule.max) {
          // 現在のトークン位置で内包ルールを試行
          const result = innerParser(tokens, currentRepetitionTokenIndex);

          if (result && result.consumed > 0) {
            // マッチし、かつトークンを消費した場合のみ進む
            // result.ast は通常 { innerRuleId: value } の形。これを配列に追加。
            repetitionResults.push(result.ast);
            totalConsumedInRepetition += result.consumed;
            currentRepetitionTokenIndex += result.consumed;
          } else if (result && result.consumed === 0) {
            // マッチしたがトークンを消費しなかった場合 (例: 内包ルールがオプショナルで空にマッチ)
            // 無限ループを防ぐため、ここで停止する必要がある。
            // ただし、minが0でまだ何もマッチしていない場合は、空のマッチとして許容されるべき。
            // このケースは複雑なので、ここでは「消費がなければ繰り返し終了」とする。
            break;
          } else {
            break; // マッチしなかったら繰り返し終了
          }
        }

        // 最小回数を満たしているか確認
        if (repetitionResults.length >= rule.min) {
          return { ast: { [rule.id]: repetitionResults }, consumed: totalConsumedInRepetition };
        }
        return null; // 最小回数に満たなかった
      };

    default:
      // @ts-ignore rule が never 型であることを保証
      throw new ParseError(`Unsupported grammar rule type: ${rule}`);
  }
};
