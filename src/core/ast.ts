export type Atomic<T extends string | number = string | number> = {
  type: 'atomic';
  value: T;
  unit?: string;
};

export type ASTBranch = {
  type: 'node';
  // eslint-disable-next-line no-use-before-define
  children: Record<string, ASTNode>;
};

export type ASTNode = ASTBranch | Atomic<string> | Atomic<number>;
