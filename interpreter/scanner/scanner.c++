//
// Created by usr_admin on 29/04/2021.
//

#include <cstring>
#include "scanner.h"

Scanner::Scanner(const char *source) : start(source), current(source), line(1) {
}

Token Scanner::scanToken() {
  skipWhiteSpace();

  start = current;

  if (isAtEnd()) return makeToken(TOKEN_EOF);

  char c = advance();

  if (Scanner::isAlpha(c)) return makeIdentifierToken();
  if (Scanner::isDigit(c)) return makeNumberToken();

  switch (c) {
    case '(':
      return makeToken(TOKEN_LEFT_PAREN);
    case ')':
      return makeToken(TOKEN_RIGHT_PAREN);
    case '{':
      return makeToken(TOKEN_LEFT_BRACE);
    case '}':
      return makeToken(TOKEN_RIGHT_BRACE);
    case ',':
      return makeToken(TOKEN_COMMA);
    case '.':
      return makeToken(TOKEN_DOT);
    case '-':
      return makeToken(TOKEN_MINUS);
    case '+':
      return makeToken(TOKEN_PLUS);
    case ';':
      return makeToken(TOKEN_SEMICOLON);
    case '/':
      return makeToken(TOKEN_SLASH);
    case '*':
      return makeToken(TOKEN_STAR);
    case '!':
      return makeToken(match('=') ? TOKEN_BANG_EQUAL : TOKEN_BANG);
    case '=':
      return makeToken(match('=') ? TOKEN_EQUAL_EQUAL : TOKEN_EQUAL);
    case '>':
      return makeToken(match('=') ? TOKEN_GREATER_EQUAL : TOKEN_GREATER);
    case '<':
      return makeToken(match('=') ? TOKEN_LESS_EQUAL : TOKEN_LESS);
    case '\'':
    case '"':
      return makeStringToken();
    default:
      return errorToken("Unexpected character.");
  }
}

bool Scanner::isAtEnd() {
  return *current == '\0';
}

Token Scanner::makeToken(TokenType type) {
  Token token;
  token.type = type;
  token.start = start;
  token.length = (int) (current - start);
  token.line = line;
  return token;
}

Token Scanner::errorToken(const char *message) const {
  Token token;
  token.type = TOKEN_ERROR;
  token.start = message;
  token.length = (int) strlen(message);
  token.line = line;
  return token;
}

char Scanner::advance() {
  current++;
  return current[-1];
}

bool Scanner::match(char c) {
  if (isAtEnd()) return false;
  if (*current == c) {
    current++;
    return true;
  }
  return false;
}

Token Scanner::makeStringToken() {
  while (peek() != '"' && peek() != '\'' && !isAtEnd()) {
    if (peek() == '\n') line++;
    advance();
  }

  if (isAtEnd()) return errorToken("Unterminated string.");

  advance();
  return makeToken(TOKEN_STRING);
}

char Scanner::peek() {
  return *current;
}

char Scanner::peekNext() {
  if (isAtEnd()) return '\0';
  return current[1];
}

void Scanner::skipWhiteSpace() {
  for (;;) {
    char c = peek();
    switch (c) {
      case ' ':
      case '\r':
      case '\t':
        advance();
        break;
      case '\n':
        line++;
        advance();
        break;
      case '/':
        if (peekNext() == '/') {
          while (peek() != '\n' && !isAtEnd()) advance();
        } else {
          return;
        }
        break;
      default:
        return;
    }
  }
}

bool Scanner::isDigit(char c) {
  return c >= '0' && c <= '9';
}

Token Scanner::makeNumberToken() {
  while (Scanner::isDigit(peek())) advance();

  if (peek() == '.' && Scanner::isDigit(peekNext())) {
    do {
      advance();
    } while (Scanner::isDigit(peek()));
  }

  return makeToken(TOKEN_NUMBER);
}

bool Scanner::isAlpha(char c) {
  return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c == '_';
}

Token Scanner::makeIdentifierToken() {
  while (isAlpha(peek()) || isDigit(peek())) advance();
  return makeToken(identifierType());
}

TokenType Scanner::identifierType() {
  // Ordered by 'Relative frequency as the first letter of an English word'  -> https://en.wikipedia.org/wiki/Letter_frequency
  switch (start[0]) {
    case 't':
      if (current - start > 1) {
        switch (start[1]) {
          case 'h':
            return checkKeyword(2, "is", TOKEN_THIS);
          case 'r':
            return checkKeyword(2, "ue", TOKEN_TRUE);
        }
      }
      return TOKEN_IDENTIFIER;
    case 'o':
      return checkKeyword(1, "r", TOKEN_OR);
    case 'i':
      return checkKeyword(1, "f", TOKEN_IF);
    case 's':
      return checkKeyword(1, "uper", TOKEN_SUPER);
    case 'w':
      return checkKeyword(1, "hile", TOKEN_WHILE);
    case 'c':
      return checkKeyword(1, "lass", TOKEN_CLASS);
    case 'p':
      return checkKeyword(1, "rint", TOKEN_PRINT);
    case 'f':
      if (current - start > 1) {
        switch (start[1]) {
          case 'o':
            return checkKeyword(2, "r", TOKEN_FOR);
          case 'a':
            return checkKeyword(2, "lse", TOKEN_FALSE);
          case 'u':
            return checkKeyword(2, "nction", TOKEN_FUNCTION);
        }
      }
      return TOKEN_IDENTIFIER;
    case 'e':
      return checkKeyword(1, "lse", TOKEN_ELSE);
    case 'r':
      return checkKeyword(1, "eturn", TOKEN_RETURN);
    case 'n':
      return checkKeyword(1, "ull", TOKEN_NULL);
    case 'a':
      return checkKeyword(1, "nd", TOKEN_AND);
    case 'v':
      return checkKeyword(1, "ar", TOKEN_VAR);
    default:
      return TOKEN_IDENTIFIER;
  }
}

TokenType Scanner::checkKeyword(uint8_t s, const char *rest, TokenType type) {
  const size_t length = strlen(rest);
  if (current - start == s + length && memcmp(start + s, rest, length) == 0) {
    return type;
  }
  return TOKEN_IDENTIFIER;
}
