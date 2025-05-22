import type { GrammarRule } from './grammerRule.ts';
import { atomicTokenParsers } from './atomicTokenParsers.ts';
import type { ASTNode, ASTBranch } from './ast.ts';

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParseError';
    Object.setPrototypeOf(this, ParseError.prototype);
  }
}

export type StyleParser = (value: string) => ASTBranch;
export type InternalStyleParser = (
  tokens: string[],
  currentIndex: number
) => { asts: Record<string, ASTNode>; consumed: number } | null;

const internalParserGenerator = (rule: GrammarRule): InternalStyleParser => {
  switch (rule.type) {
    case 'keyword': {
      const keyword = rule.value;
      return (tokens, currentIndex) => {
        if (currentIndex < tokens.length) {
          const matchedValue = atomicTokenParsers.keyword(tokens[currentIndex], keyword);
          if (matchedValue !== null) {
            return { asts: { [rule.id]: matchedValue }, consumed: 1 };
          }
        }
        return null;
      };
    }

    case 'primitive': {
      const atomicParser = atomicTokenParsers[rule.tokenType];
      return (tokens, currentIndex) => {
        if (currentIndex < tokens.length) {
          const parsedValue = atomicParser(tokens[currentIndex]);
          if (parsedValue !== null) {
            return { asts: { [rule.id]: parsedValue }, consumed: 1 };
          }
        }
        return null;
      };
    }

    // TODO: non-order

    case 'sequence': {
      const astPairs = rule.rules.map((element) => ({
        id: element.id,
        parser: internalParserGenerator(element),
      }));

      return (tokens, currentIndex) => {
        const sequenceAstParts: Record<string, ASTNode> = {}; // シーケンス内の各要素のASTを格納
        let totalConsumedInSequence = 0;
        let currentElementIndex = currentIndex;

        astPairs.forEach((parserPair) => {
          const result = parserPair.parser(tokens, currentElementIndex);
          if (result) {
            sequenceAstParts[parserPair.id] = {
              type: 'node',
              children: result.asts,
            };
            totalConsumedInSequence += result.consumed;
            currentElementIndex += result.consumed;
          }
        });

        // シーケンス全体の結果を rule.id の下にネストする
        if (totalConsumedInSequence > 0 || rule.rules.length === 0) {
          return { asts: sequenceAstParts, consumed: totalConsumedInSequence };
        }
        return null;
      };
    }

    case 'choice': {
      const astPairs = rule.rules.map((option) => ({
        id: option.id,
        parser: internalParserGenerator(option),
      }));

      return (tokens, currentIndex) => {
        const choiceAstParts: Record<string, ASTNode> = {};

        for (let i = 0; i < astPairs.length; i += 1) {
          const parserPair = astPairs[i];
          const result = parserPair.parser(tokens, currentIndex);
          if (result) {
            choiceAstParts[parserPair.id] = {
              type: 'node',
              children: result.asts,
            };
            return { asts: choiceAstParts, consumed: result.consumed };
          }
        }
        return null;
      };
    }

    case 'repetition': {
      const { min, max } = rule;
      if (min > max) {
        throw new ParseError(
          `Invalid repetition rule: min (${min}) cannot be greater than max (${max}).`
        );
      }
      if (min < 0 || max < 0) {
        throw new ParseError(
          `Invalid repetition rule: min (${min}) and max (${max}) must be non-negative.`
        );
      }
      const innerParser = internalParserGenerator(rule.rule);

      return (tokens, currentIndex) => {
        const repetitionResults: Record<string, ASTNode> = {};
        let repetitionCount = 0;
        let totalConsumedInRepetition = 0;
        let currentRepetitionTokenIndex = currentIndex;

        while (repetitionCount < max) {
          const result = innerParser(tokens, currentRepetitionTokenIndex);

          if (result && result.consumed > 0) {
            repetitionCount += 1;
            repetitionResults[`${rule.id}_${repetitionCount}`] = {
              type: 'node',
              children: result.asts,
            };
            totalConsumedInRepetition += result.consumed;
            currentRepetitionTokenIndex += result.consumed;
          } else if (result && result.consumed === 0) {
            // If matched but no tokens were consumed (e.g., the inner rule is optional and matches empty),
            // it is necessary to stop here to prevent an infinite loop.
            break;
          } else {
            // no match
            break;
          }
        }

        if (repetitionCount >= min) {
          return { asts: repetitionResults, consumed: totalConsumedInRepetition };
        }
        return null;
      };
    }
    default:
      throw new ParseError(`Unsupported grammar rule type: ${rule}`);
  }
};

export const parserGenerator = (rule: GrammarRule): StyleParser => {
  const internalParser = internalParserGenerator(rule);

  return (value: string) => {
    const tokens = value.split(/\s+/);
    const result = internalParser(tokens, 0);
    if (result) {
      return { type: 'node', children: result.asts };
    }
    throw new ParseError(`Failed to parse value: ${value}`);
  };
};
