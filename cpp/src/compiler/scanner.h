#ifndef SCANNER_H
#define SCANNER_H
#include "token.h"

#include <string>

class Scanner {
public:
  explicit Scanner(const std::string &source);
  Token scanToken();

private:
  std::string source;
  int start = 0;
  int current = 0;
  int line = 1;

  void skipWhitespace();

  Token string();

  Token number();
  static bool isDigit(char c);

  Token identifier();
  TokenType identifierType();
  static bool isAlpha(char c);

  bool isAtEnd() const;
  char peek() const;
  char peekNext() const;
  char peekPrevious() const;
  char advance();
  bool match(char c);

  Token makeToken(TokenType type) const;
  Token errorToken(const std::string &message) const;
};

#endif // SCANNER_H
