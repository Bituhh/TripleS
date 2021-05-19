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
  PARSER_FN_VARIABLE,
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

  void varDeclaration();
  void statement();

  void printStatement();
  void expressionStatement();
  void expression();

  void unary();
  void binary();
  void number();
  void grouping();
  void literal();
  void string();
  void variable(bool isAssignable);

  void parsePrecedence(Precedence precedence);
  static ParserRule *getRule(TokenType type);
  void handleRule(ParserFnType type, bool isAssignable);

  void errorAtCurrent(const char *start);
  void errorAt(Token *token, const char *message);
  void error(const char *message);
  void synchronize();

  void advance();
  bool match(TokenType type);
  bool check(TokenType type);
  void consume(TokenType type, const char *message);
  void emitByte(uint8_t byte);
  void emitBytes(uint8_t byte1, uint8_t byte2);
  void emitReturn();
  uint8_t parseVariable(const char *string);
  void defineVariable(uint8_t global);
  uint8_t identifierConstant(Token *name);
  uint8_t makeConstant(Value value);
  void emitConstant(Value value);
  void end();

 public:
  explicit Compiler(const char *source);
  ~Compiler();
  bool compile(Chunk *chunk);
  void namedVariable(Token name, bool isAssignable);
};

#endif //TRIPLES_COMPILER_H
