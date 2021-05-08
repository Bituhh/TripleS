//
// Created by usr_admin on 29/04/2021.
//

#ifndef TRIPLES_SCANNER_H
#define TRIPLES_SCANNER_H

#include <cstdint>

typedef enum {
  TOKEN_LEFT_PAREN, // Single-character tokens.
  TOKEN_RIGHT_PAREN,
  TOKEN_LEFT_BRACE,
  TOKEN_RIGHT_BRACE,
  TOKEN_COMMA,
  TOKEN_DOT,
  TOKEN_MINUS,
  TOKEN_PLUS,
  TOKEN_SEMICOLON,
  TOKEN_SLASH,
  TOKEN_STAR,
  TOKEN_BANG, // One or two character tokens.
  TOKEN_BANG_EQUAL,
  TOKEN_EQUAL,
  TOKEN_EQUAL_EQUAL,
  TOKEN_GREATER,
  TOKEN_GREATER_EQUAL,
  TOKEN_LESS,
  TOKEN_LESS_EQUAL,
  TOKEN_IDENTIFIER, // Literals.
  TOKEN_STRING,
  TOKEN_NUMBER,
  TOKEN_AND, // Keywords.
  TOKEN_CLASS,
  TOKEN_ELSE,
  TOKEN_FALSE,
  TOKEN_FOR,
  TOKEN_FUNCTION,
  TOKEN_IF,
  TOKEN_NULL,
  TOKEN_OR,
  TOKEN_PRINT,
  TOKEN_RETURN,
  TOKEN_SUPER,
  TOKEN_THIS,
  TOKEN_TRUE,
  TOKEN_VAR,
  TOKEN_WHILE,
  TOKEN_ERROR,
  TOKEN_EOF
} TokenType;


typedef struct {
  TokenType type;
  const char *start;
  int length;
  int line;
} Token;

class Scanner {
private:
  const char *start;
  const char *current;
  int line;

  Token makeToken(TokenType type);

  Token makeStringToken();

  Token makeNumberToken();

  Token makeIdentifierToken();

  TokenType identifierType();

  Token errorToken(const char *message) const;

  void skipWhiteSpace();

  bool isAtEnd();

  char advance();

  bool match(char c);

  char peek();

  char peekNext();

  static bool isAlpha(char c);

  static bool isDigit(char c);

public:
  explicit Scanner(const char *source);

  Token scanToken();

  TokenType checkKeyword(uint8_t s, const char *rest, TokenType type);
};


#endif //TRIPLES_SCANNER_H
