#ifndef COMPILER_H
#define COMPILER_H


#include "../debug.h"
#include "../chunk.h"
#include "scanner.h"
#include "token.h"

#include <functional>
#include <string>

typedef enum {
  PRECEDENCE_NONE,
  PRECEDENCE_ASSIGNMENT, // =
  PRECEDENCE_OR,         // or
  PRECEDENCE_AND,        // and
  PRECEDENCE_EQUALITY,   // == !=
  PRECEDENCE_COMPARISON, // < > <= >=
  PRECEDENCE_TERM,       // + -
  PRECEDENCE_FACTOR,     // * /
  PRECEDENCE_UNARY,      // ! -
  PRECEDENCE_CALL,       // . ()
  PRECEDENCE_PRIMARY
} Precedence;

typedef std::function<void()> ParseFn;

typedef struct {
  ParseFn prefix;
  ParseFn infix;
  Precedence precedence;
} ParseRule;

typedef struct {
  Token current;
  Token previous;
  bool hadError;
  bool panicMode;
} Parser;

#endif // COMPILER_H
class Compiler {
public:
  explicit Compiler(const std::string &source, Chunk &chunk);
  bool compile();

private:
  std::string source;
  Scanner scanner;
  Parser parser = {.hadError = false, .panicMode = false};
  Chunk *compilingChunk;
#ifdef DEBUG_PRINT_CODE
  Debug debug;
#endif

  void expression();

  void advance();
  void consume(TokenType type, const std::string &message);
  void emitByte(unsigned long long byte);
  void emitBytes(unsigned long long byte1, unsigned long long byte2);
  void emitReturn();
  unsigned long long makeConstant(double value);
  void emitConstant(double value);
  void endCompiler();
  void binary();
  void grouping();
  void number();
  void unary();
  void parsePrecedence(Precedence precedence);
  ParseRule getRule(TokenType type);

  void errorAtCurrent(const std::string &message);
  void errorAt(const Token &token, const std::string &message);
  Chunk *currentChunk();
};
