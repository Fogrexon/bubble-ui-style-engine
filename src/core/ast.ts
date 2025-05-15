export type Atomic<T extends string | number = string | number> = {
  type: 'atomic';
  value: T;
  unit?: string;
};

export type ASTNode = {
  type: 'node';
  // eslint-disable-next-line no-use-before-define
  children: Record<string, ASTElement>;
};

export type ASTElement = ASTNode | Atomic<string> | Atomic<number>;
