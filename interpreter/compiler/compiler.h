#ifndef TRIPLES_COMPILER_H
#define TRIPLES_COMPILER_H

#include <cstdio>
#include <cstdlib>

#include "../scanner/scanner.h"
#include "../chunk/chunk.h"
#include "../object/objectString/objectString.h"
#include "../../tools/debug/debug.h"

typedef struct {
  Token current;
  Token previous;
  bool hasError;
  bool panicMode;
} Parser;

typedef enum {
  PRECEDENCE_NONE,
  PRECEDENCE_ASSIGNMENT,  // =
  PRECEDENCE_OR,          // or
  PRECEDENCE_AND,         // and
  PRECEDENCE_EQUALITY,    // == !=
  PRECEDENCE_COMPARISON,  // < > <= >=
  PRECEDENCE_TERM,        // + -
  PRECEDENCE_FACTOR,      // * /
  PRECEDENCE_UNARY,       // ! -
  PRECEDENCE_CALL,        // . ()
  PRECEDENCE_PRIMARY
} Precedence;

typedef enum {
  PARSER_FN_NONE,
  PARSER_FN_UNARY,
  PARSER_FN_BINARY,
  PARSER_FN_NUMBER,
  PARSER_FN_GROUPING,
  PARSER_FN_LITERAL,
  PARSER_FN_STRING,
} ParserFnType;

class ParserRule {
 public:
  ParserFnType prefix;
  ParserFnType infix;
  Precedence precedence;
};

class Compiler {
 private:
  Parser parser;
  Scanner *scanner;
  Chunk *compilingChunk;

  Chunk *currentChunk();

  void declaration();
  void statement();

  void expression();
  void number();
  void grouping();
  void unary();
  void binary();
  void string();

  void parsePrecedence(Precedence precedence);
  static ParserRule *getRule(TokenType type);
  void handleRule(ParserFnType type);
  void literal();
  bool match(TokenType type);
  bool check(TokenType type);

  void errorAtCurrent(const char *start);
  void errorAt(Token *token, const char *message);
  void error(const char *message);

  void advance();
  void consume(TokenType type, const char *message);
  void emitByte(uint8_t byte);
  void emitBytes(uint8_t byte1, uint8_t byte2);
  void emitReturn();
  uint8_t makeConstant(Value value);
  void emitConstant(Value value);
  void printStatement();
  void end();

 public:
  explicit Compiler(const char *source);
  ~Compiler();
  bool compile(Chunk *chunk);
};

#endif //TRIPLES_COMPILER_H
