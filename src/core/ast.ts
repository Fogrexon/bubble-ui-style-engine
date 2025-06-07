export type ASTLeaf<T extends string | number = string | number> = {
  type: 'leaf';
  id: string;
  value: T;
  unit?: string;
};

export type ASTBranch = {
  type: 'branch';
  id: string;
  // eslint-disable-next-line no-use-before-define
  children: ASTNode[];
};

export type ASTNode = ASTBranch | ASTLeaf<string> | ASTLeaf<number>;
