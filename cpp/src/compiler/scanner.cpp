#include "scanner.h"

#include <iostream>
Scanner::Scanner(const std::string &source) : source(source) {}

Token Scanner::scanToken() {
  this->skipWhitespace();
  this->start = this->current;

  if (this->isAtEnd()) return this->makeToken(TokenType::TOKEN_EOF);

  const char c = this->advance();
  switch (c) {
    case '(':
      return this->makeToken(TokenType::TOKEN_LEFT_PAREN);
    case ')':
      return this->makeToken(TokenType::TOKEN_RIGHT_PAREN);
    case '{':
      return this->makeToken(TokenType::TOKEN_LEFT_BRACE);
    case '}':
      return this->makeToken(TokenType::TOKEN_RIGHT_BRACE);
    case ',':
      return this->makeToken(TokenType::TOKEN_COMMA);
    case '.':
      return this->makeToken(TokenType::TOKEN_DOT);
    case '-':
      return this->makeToken(TokenType::TOKEN_MINUS);
    case '+':
      return this->makeToken(TokenType::TOKEN_PLUS);
    case ';':
      return this->makeToken(TokenType::TOKEN_SEMICOLON);
    case '*':
      return this->makeToken(TokenType::TOKEN_STAR);
    case '!':
      return this->makeToken(this->match('=') ? TokenType::TOKEN_BANG_EQUAL : TokenType::TOKEN_BANG);
    case '=':
      return this->makeToken(this->match('=') ? TokenType::TOKEN_EQUAL_EQUAL : TokenType::TOKEN_EQUAL);
    case '<':
      return this->makeToken(this->match('=') ? TokenType::TOKEN_LESS_EQUAL : TokenType::TOKEN_LESS);
    case '>':
      return this->makeToken(this->match('=') ? TokenType::TOKEN_GREATER_EQUAL : TokenType::TOKEN_GREATER);
    case '/':
        return this->makeToken(TokenType::TOKEN_SLASH);

    case '\'':
    case '\"':
      return this->string();

    default:
      if (this->isDigit(c)) return this->number();
      if (this->isAlpha(c)) return this->identifier();
      return this->errorToken("Unexpected character.");
  }

  return this->errorToken("Unexpected character.");
}

void Scanner::skipWhitespace() {
  for (;;) {
    const char c = this->peek();
    switch (c) {
      case ' ':
      case '\r':
      case '\t':
        this->advance();
        break;
      case '\n':
        this->line++;
        this->advance();
        break;
      case '/':
        if (this->peekNext() == '/') {
          // A comment goes until the end of the line.
          while (peek() != '\n' && !isAtEnd()) this->advance();
        } else {
          return;
        }
        break;
      default:
        return;
    }
  }
}

Token Scanner::string() {
  const char quote = this->peekPrevious();
  while (this->peek() != quote && !this->isAtEnd()) {
    if (this->peek() == '\n') this->line++;
    if (this->peek() == '\\' && this->peekNext() == quote) {
      this->advance();
    }
    this->advance();
  }

  if (this->isAtEnd()) return this->errorToken("Unterminated string.");

  // The closing quote.
  this->advance();
  return this->makeToken(TokenType::TOKEN_STRING);
}

Token Scanner::number() {
  while (this->isDigit(this->peek())) {
    this->advance();
  }

  // Look for a fractional part.
  if (this->peek() == '.' && this->isDigit(this->peekNext())) {
    // Consume the ".".
    this->advance();

    while (this->isDigit(this->peek())) {
      this->advance();
    }
  }

  return this->makeToken(TokenType::TOKEN_NUMBER);
}

bool Scanner::isDigit(const char c) { return c >= '0' && c <= '9'; }

Token Scanner::identifier() {
  while (this->isAlpha(this->peek()) || this->isDigit(this->peek())) {
    this->advance();
  }

  return this->makeToken(this->identifierType());
}

TokenType Scanner::identifierType() {
  const std::string keyword = this->source.substr(this->start, this->current - this->start);
  if (keyword.compare("true") == 0) return TokenType::TOKEN_TRUE;
  if (keyword.compare("false") == 0) return TokenType::TOKEN_FALSE;

  if (keyword.compare("and") == 0) return TokenType::TOKEN_AND;
  if (keyword.compare("or") == 0) return TokenType::TOKEN_OR;

  if (keyword.compare("var") == 0) return TokenType::TOKEN_VAR;

  if (keyword.compare("function") == 0) return TokenType::TOKEN_FUNCTION;
  if (keyword.compare("return") == 0) return TokenType::TOKEN_RETURN;

  if (keyword.compare("class") == 0) return TokenType::TOKEN_CLASS;
  if (keyword.compare("super") == 0) return TokenType::TOKEN_SUPER;
  if (keyword.compare("this") == 0) return TokenType::TOKEN_THIS;

  if (keyword.compare("if") == 0) return TokenType::TOKEN_IF;
  if (keyword.compare("else") == 0) return TokenType::TOKEN_ELSE;

  if (keyword.compare("while") == 0) return TokenType::TOKEN_WHILE;
  if (keyword.compare("for") == 0) return TokenType::TOKEN_FOR;

  if (keyword.compare("print") == 0) return TokenType::TOKEN_PRINT;
  if (keyword.compare("null") == 0) return TokenType::TOKEN_NULL;
  return TokenType::TOKEN_IDENTIFIER;
}

bool Scanner::isAlpha(const char c) { return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c == '_'; }

bool Scanner::isAtEnd() const { return this->current >= this->source.length(); }

char Scanner::advance() { return this->source[this->current++]; }

bool Scanner::match(const char c) {
  if (this->isAtEnd()) return false;
  if (this->source[this->current] != c) return false;
  this->current++;
  return true;
}

char Scanner::peek() const { return this->source[this->current]; }

char Scanner::peekNext() const {
  if (this->isAtEnd()) return '\0';
  return this->source[this->current + 1];
}

char Scanner::peekPrevious() const { return this->source[this->current - 1]; }

Token Scanner::makeToken(const TokenType type) const {
  Token token;
  token.type = type;
  token.start = this->start;
  token.length = this->current - this->start;
  token.lexeme = this->source.substr(token.start, token.length);
  token.line = this->line;
  return token;
}

Token Scanner::errorToken(const std::string &message) const {
  Token token;
  token.type = TokenType::TOKEN_ERROR;
  token.start = 0;
  token.length = message.length();
  token.lexeme = message;
  token.line = this->line;
  return token;
}