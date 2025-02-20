import {TokenType} from './token-type.enum';

export const KEYWORDS: {[key: string]: TokenType} = {
  true: TokenType.TRUE,
  false: TokenType.FALSE,
  null: TokenType.NULL,

  var: TokenType.VAR,
  const: TokenType.CONST,

  print: TokenType.PRINT,

  if: TokenType.IF,
  else: TokenType.ELSE,
  while: TokenType.WHILE,
  for: TokenType.FOR,

  or: TokenType.OR,
  and: TokenType.AND,

  function: TokenType.FUNCTION,
  return: TokenType.RETURN,

  class: TokenType.CLASS,
  this: TokenType.THIS,
  super: TokenType.SUPER,
  extends: TokenType.EXTENDS,

  from: TokenType.FROM,
  import: TokenType.IMPORT,
  as:  TokenType.AS,
  export: TokenType.EXPORT,

  try: TokenType.TRY,
  catch: TokenType.CATCH,
  finally: TokenType.FINALLY,
  throw: TokenType.THROW
}