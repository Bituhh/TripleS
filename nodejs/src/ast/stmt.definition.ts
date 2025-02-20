import {generateAst, Type} from './generate-ast';

export const stmtDefinition: Type[] = [
  {
    name: 'Expression',
    args: [
      {
        name: 'expression', type: {
          name: 'Expr',
          importFrom: '../expr',
        },
      },
    ],
  },
  {
    name: 'Print',
    args: [
      {
        name: 'expression', type: {
          name: 'Expr',
          importFrom: '../expr',
        },
      },
    ],
  },
  {
    name: 'Var',
    args: [
      {
        name: 'name', type: {
          name: 'Token',
          importFrom: '../scanner',
        },
      },
      {
        name: 'initializer', type: {
          name: 'Expr | null',
          importFrom: '../expr',
          importAs: 'Expr',
        },
      },
    ],
  },
  {
    name: 'Block',
    args: [
      {
        name: 'statements',
        type: 'Stmt[]',
      },
    ],
  },
  {
    name: 'If',
    args: [
      {
        name: 'condition', type: {
          name: 'Expr',
          importFrom: '../expr',
        },
      },
      {
        name: 'thenBranch',
        type: 'Stmt',
      },
      {
        name: 'elseBranch',
        type: 'Stmt | null',
      },
    ],
  },
  {
    name: 'While',
    args: [
      {
        name: 'condition', type: {
          name: 'Expr',
          importFrom: '../expr',
        },
      },
      {
        name: 'body',
        type: 'Stmt',
      },
    ],
  },
  {
    name: 'Function',
    args: [
      {
        name: 'name', type: {
          name: 'Token',
          importFrom: '../scanner',
        },
      },
      {
        name: 'params',
        type: 'Token[]',
      },
      {
        name: 'body',
        type: 'Stmt[]',
      },
    ],
  },
  {
    name: 'Return',
    args: [
      {
        name: 'keyword', type: {
          name: 'Token',
          importFrom: '../scanner',
        },
      },
      {
        name: 'value',
        type: {
          name: 'Expr | null',
          importFrom: '../expr',
          importAs: 'Expr',
        },
      },
    ],
  },
  {
    name: 'Class',
    args: [
      {
        name: 'name', type: {
          name: 'Token',
          importFrom: '../scanner',
        },
      },
      {
        name: 'superclass',
        type: {
          name: 'VariableExpr | null',
          importFrom: '../expr',
          importAs: 'VariableExpr',
        },
      },
      {
        name: 'methods',
        type: {
          name: 'FunctionStmt[]',
          importAs: 'FunctionStmt',
          importFrom: './function.stmt',
        },
      },
    ],
  },
  {
    name: 'Import',
    args: [
      {
        name: 'path',
        type: {
          name: 'Token',
          importFrom: '../scanner',
        },
      },
      {
        name: 'items',
        type: {
          name: '{name: Token, alias: Token | null}[]',
          importFrom: '../scanner',
          importAs: 'Token',
        },
      },
    ],
  },
  {
    name: 'Export',
    args: [
      {
        name: 'statement',
        type: 'Stmt',
      },
    ],
  },
  {
    name: 'Throw',
    args: [
      {
        name: 'keyword',
        type: {
          name: 'Token',
          importFrom: '../scanner',
        },
      },
      {
        name: 'value',
        type: {
          name: 'Expr',
          importFrom: '../expr',
        },
      },
    ],
  },
  {
    name: 'TryCatch',
    args: [
      {
        name: 'tryBlock',
        type: 'Stmt[]',
      },
      {
        name: 'catchBlock',
        type: 'Stmt[] | null',
      },
      {
        name: 'catchParam',
        type: {
          name: 'Token | null',
          importFrom: '../scanner',
          importAs: 'Token',
        },
      },
      {
        name: 'finallyBlock',
        type: 'Stmt[] | null',
      },
    ],
  },
];

generateAst('../', 'Stmt', stmtDefinition);
