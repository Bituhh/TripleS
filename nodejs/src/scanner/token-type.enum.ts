export enum TokenType {

  // Single-character tokens.
  LEFT_PARENTHESIS = '(',
  RIGHT_PARENTHESIS = ')',

  LEFT_BRACE = '{',
  RIGHT_BRACE = '}',

  LEFT_BRACKET = '[',
  RIGHT_BRACKET = ']',

  COMMA = ',',
  DOT = '.',

  CARET = '^',
  PERCENT = '%',
  STAR = '*',
  SLASH = '/',
  PLUS = '+',
  MINUS = '-',

  PIPE = '|',
  AMPERSAND = '&',

  SEMICOLON = ';',
  COLON = ':',

  // One or two character tokens.
  BANG = '!',
  BANG_EQUAL = '!=',
  EQUAL = '=',
  EQUAL_EQUAL = '==',
  GREATER = '>',
  GREATER_EQUAL = '>=',
  LESS = '<',
  LESS_EQUAL = '<=',

  // Literals.
  IDENTIFIER = 'identifier',
  STRING = 'string',
  NUMBER = 'number',

  // Keywords.
  TRUE = 'true',
  FALSE = 'false',
  NULL = 'null',

  VAR = 'var',
  CONST = 'const',

  PRINT = 'print',

  IF = 'if',
  ELSE = 'else',
  WHILE = 'while',
  FOR = 'for',

  OR = 'or ||',
  AND = 'and &&',

  FUNCTION = 'function',
  ARROW_FUNCTION = '->',
  RETURN = 'return',

  CLASS = 'class',
  THIS = 'this',
  SUPER = 'super',
  EXTENDS = 'extends',

  FROM = 'from',
  IMPORT = 'import',
  AS = 'as',
  EXPORT = 'export',

  TRY = 'try',
  CATCH = 'catch',
  FINALLY = 'finally',
  THROW = 'throw',

  EOF = 'EOF',
}