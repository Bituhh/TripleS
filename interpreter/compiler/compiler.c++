#include "compiler.h"

Compiler::Compiler(const char *source) : scanner(new Scanner(source)), parser(), compilingChunk() {
}

Compiler::~Compiler() {
  delete scanner;
}

bool Compiler::compile(Chunk *chunk) {
  compilingChunk = chunk;

  parser.hasError = false;
  parser.panicMode = false;

  advance(); // Gets the first token

  while (!match(TOKEN_EOF)) {
    declaration();
  }

  end();
  return !parser.hasError;
}

void Compiler::advance() {
  parser.previous = parser.current;

  for (;;) {
    parser.current = scanner->scanToken();
    if (parser.current.type != TOKEN_ERROR) break;

    errorAtCurrent(parser.current.start);
  }
}

void Compiler::consume(TokenType type, const char *message) {
  if (parser.current.type == type) {
    advance();
    return;
  }

  errorAtCurrent(message);
}

// Declaration
void Compiler::declaration() {
  statement();
}
// Declaration

// Statement
void Compiler::statement() {
  if (match(TOKEN_PRINT)) {
    printStatement();
  }
}
// Statement

// Expression
void Compiler::expression() {
  parsePrecedence(PRECEDENCE_ASSIGNMENT);
}
// Expression

// Number
void Compiler::number() {
  double value = strtod(parser.previous.start, nullptr);
  emitConstant(NUMBER_VAL(value));
}

void Compiler::emitConstant(Value value) {
  emitBytes(OP_CONSTANT, makeConstant(value));
}

uint8_t Compiler::makeConstant(Value value) {
  int constant = currentChunk()->addConstant(value);
  if (constant == UINT8_MAX) {
    error("Too many constants in one chunk.");
    return 0;
  }

  return (uint8_t) constant;
}
// Number

// Grouping
void Compiler::grouping() {
  expression();
  consume(TOKEN_RIGHT_PAREN, "Expected ')' after expression.");
}
// Grouping

// Unary
void Compiler::unary() {
  TokenType operatorType = parser.previous.type;

  parsePrecedence(PRECEDENCE_UNARY);

  switch (operatorType) {
    case TOKEN_BANG:emitByte(OP_NOT);
      break;
    case TOKEN_MINUS:emitByte(OP_NEGATE);
      break;
    default:return; // Unreachable
  }
}
// Unary

// Binary
void Compiler::binary() {
  TokenType operatorType = parser.previous.type;

  ParserRule *rule = getRule(operatorType);
  parsePrecedence((Precedence) (rule->precedence + 1));

  switch (operatorType) {
    case TOKEN_BANG_EQUAL:emitByte(OP_NOT_EQUAL);
      break;
    case TOKEN_EQUAL_EQUAL:emitByte(OP_EQUAL);
      break;
    case TOKEN_GREATER:emitByte(OP_GREATER);
      break;
    case TOKEN_GREATER_EQUAL:emitByte(OP_GREATER_EQUAL);
      break;
    case TOKEN_LESS:emitByte(OP_LESS);
      break;
    case TOKEN_LESS_EQUAL:emitByte(OP_LESS_EQUAL);
      break;
    case TOKEN_PLUS:emitByte(OP_ADD);
      break;
    case TOKEN_MINUS:emitByte(OP_SUBTRACT);
      break;
    case TOKEN_STAR:emitByte(OP_MULTIPLE);
      break;
    case TOKEN_SLASH:emitByte(OP_DIVIDE);
      break;
    default:return;
  }
}
// Binary

// Literal
void Compiler::literal() {
  switch (parser.previous.type) {
    case TOKEN_FALSE:emitByte(OP_FALSE);
      break;
    case TOKEN_NULL:emitByte(OP_NULL);
      break;
    case TOKEN_TRUE:emitByte(OP_TRUE);
      break;
    default:return; // Unreachable.
  }
}
// Literal

// String
void Compiler::string() {
  std::string c = std::basic_string<char>(parser.previous.start + 1, parser.previous.length - 2);
  emitConstant(OBJ_VAL(ObjectString::copy(c)));
}
// String

void Compiler::parsePrecedence(Precedence precedence) {
  advance();
  ParserFnType prefixRuleType = getRule(parser.previous.type)->prefix;
  if (prefixRuleType == PARSER_FN_NONE) {
    error("Expect expression.");
    return;
  }

  handleRule(prefixRuleType);

  while (precedence <= getRule(parser.current.type)->precedence) {
    advance();
    ParserFnType infixRuleType = getRule(parser.previous.type)->infix;
    handleRule(infixRuleType);
  }
}

Chunk *Compiler::currentChunk() {
  return compilingChunk;
}

void Compiler::end() {
  emitReturn();
#ifdef DEBUG_PRINT_CODE
  if (!parser.hasError) {
    Debug::disassembleChunk(currentChunk(), "code");
  }
#endif
}

void Compiler::emitReturn() {
  emitByte(OP_RETURN);
}

void Compiler::emitByte(uint8_t byte) {
  currentChunk()->write(byte, parser.previous.line);
}

void Compiler::emitBytes(uint8_t byte1, uint8_t byte2) {
  emitByte(byte1);
  emitByte(byte2);
}

void Compiler::errorAtCurrent(const char *message) {
  errorAt(&parser.current, message);
}

void Compiler::error(const char *message) {
  errorAt(&parser.previous, message);
}

void Compiler::errorAt(Token *token, const char *message) {
  if (parser.panicMode) return;
  parser.panicMode = true;
  fprintf(stderr, "[Line %d] Error", token->line);

  if (token->type == TOKEN_EOF) {
    fprintf(stderr, " at end");
  } else if (token->type == TOKEN_ERROR) {

  } else {
    fprintf(stderr, " at '%.*s'", token->length, token->start);
  }

  fprintf(stderr, ": %s\n", message);
  parser.hasError = true;
}

ParserRule *Compiler::getRule(TokenType type) {
  switch (type) {
    case TOKEN_LEFT_PAREN: return new ParserRule{.prefix = PARSER_FN_GROUPING, .infix = PARSER_FN_NONE, .precedence = PRECEDENCE_NONE};
    case TOKEN_RIGHT_PAREN: return new ParserRule{.prefix = PARSER_FN_NONE, .infix = PARSER_FN_NONE, .precedence = PRECEDENCE_NONE};
    case TOKEN_LEFT_BRACE: return new ParserRule{.prefix = PARSER_FN_NONE, .infix = PARSER_FN_NONE, .precedence = PRECEDENCE_NONE};
    case TOKEN_RIGHT_BRACE: return new ParserRule{.prefix = PARSER_FN_NONE, .infix = PARSER_FN_NONE, .precedence = PRECEDENCE_NONE};
    case TOKEN_COMMA: return new ParserRule{.prefix = PARSER_FN_NONE, .infix = PARSER_FN_NONE, .precedence = PRECEDENCE_NONE};
    case TOKEN_DOT: return new ParserRule{.prefix = PARSER_FN_NONE, .infix = PARSER_FN_NONE, .precedence = PRECEDENCE_NONE};
    case TOKEN_MINUS: return new ParserRule{.prefix = PARSER_FN_UNARY, .infix = PARSER_FN_BINARY, .precedence = PRECEDENCE_TERM};
    case TOKEN_PLUS: return new ParserRule{.prefix = PARSER_FN_NONE, .infix = PARSER_FN_BINARY, .precedence = PRECEDENCE_TERM};
    case TOKEN_SEMICOLON: return new ParserRule{.prefix = PARSER_FN_NONE, .infix = PARSER_FN_NONE, .precedence = PRECEDENCE_NONE};
    case TOKEN_SLASH: return new ParserRule{.prefix = PARSER_FN_NONE, .infix = PARSER_FN_BINARY, .precedence = PRECEDENCE_FACTOR};
    case TOKEN_STAR: return new ParserRule{.prefix = PARSER_FN_NONE, .infix = PARSER_FN_BINARY, .precedence = PRECEDENCE_FACTOR};
    case TOKEN_BANG: return new ParserRule{.prefix = PARSER_FN_UNARY, .infix = PARSER_FN_NONE, .precedence = PRECEDENCE_NONE};
    case TOKEN_BANG_EQUAL: return new ParserRule{.prefix = PARSER_FN_NONE, .infix = PARSER_FN_BINARY, .precedence = PRECEDENCE_EQUALITY};
    case TOKEN_EQUAL: return new ParserRule{.prefix = PARSER_FN_NONE, .infix = PARSER_FN_NONE, .precedence = PRECEDENCE_NONE};
    case TOKEN_EQUAL_EQUAL: return new ParserRule{.prefix = PARSER_FN_NONE, .infix = PARSER_FN_BINARY, .precedence = PRECEDENCE_EQUALITY};
    case TOKEN_GREATER: return new ParserRule{.prefix = PARSER_FN_NONE, .infix = PARSER_FN_BINARY, .precedence = PRECEDENCE_COMPARISON};
    case TOKEN_GREATER_EQUAL: return new ParserRule{.prefix = PARSER_FN_NONE, .infix = PARSER_FN_BINARY, .precedence = PRECEDENCE_COMPARISON};
    case TOKEN_LESS: return new ParserRule{.prefix = PARSER_FN_NONE, .infix = PARSER_FN_BINARY, .precedence = PRECEDENCE_COMPARISON};
    case TOKEN_LESS_EQUAL: return new ParserRule{.prefix = PARSER_FN_NONE, .infix = PARSER_FN_BINARY, .precedence = PRECEDENCE_COMPARISON};
    case TOKEN_IDENTIFIER: return new ParserRule{.prefix = PARSER_FN_NONE, .infix = PARSER_FN_NONE, .precedence = PRECEDENCE_NONE};
    case TOKEN_STRING: return new ParserRule{.prefix = PARSER_FN_STRING, .infix = PARSER_FN_NONE, .precedence = PRECEDENCE_NONE};
    case TOKEN_NUMBER: return new ParserRule{.prefix = PARSER_FN_NUMBER, .infix = PARSER_FN_NONE, .precedence = PRECEDENCE_NONE};
    case TOKEN_AND: return new ParserRule{.prefix = PARSER_FN_NONE, .infix = PARSER_FN_NONE, .precedence = PRECEDENCE_NONE};
    case TOKEN_CLASS: return new ParserRule{.prefix = PARSER_FN_NONE, .infix = PARSER_FN_NONE, .precedence = PRECEDENCE_NONE};
    case TOKEN_ELSE: return new ParserRule{.prefix = PARSER_FN_NONE, .infix = PARSER_FN_NONE, .precedence = PRECEDENCE_NONE};
    case TOKEN_FALSE: return new ParserRule{.prefix = PARSER_FN_LITERAL, .infix = PARSER_FN_NONE, .precedence = PRECEDENCE_NONE};
    case TOKEN_FOR: return new ParserRule{.prefix = PARSER_FN_NONE, .infix = PARSER_FN_NONE, .precedence = PRECEDENCE_NONE};
    case TOKEN_FUNCTION: return new ParserRule{.prefix = PARSER_FN_NONE, .infix = PARSER_FN_NONE, .precedence = PRECEDENCE_NONE};
    case TOKEN_IF: return new ParserRule{.prefix = PARSER_FN_NONE, .infix = PARSER_FN_NONE, .precedence = PRECEDENCE_NONE};
    case TOKEN_NULL: return new ParserRule{.prefix = PARSER_FN_LITERAL, .infix = PARSER_FN_NONE, .precedence = PRECEDENCE_NONE};
    case TOKEN_OR: return new ParserRule{.prefix = PARSER_FN_NONE, .infix = PARSER_FN_NONE, .precedence = PRECEDENCE_NONE};
    case TOKEN_PRINT: return new ParserRule{.prefix = PARSER_FN_NONE, .infix = PARSER_FN_NONE, .precedence = PRECEDENCE_NONE};
    case TOKEN_RETURN: return new ParserRule{.prefix = PARSER_FN_NONE, .infix = PARSER_FN_NONE, .precedence = PRECEDENCE_NONE};
    case TOKEN_SUPER: return new ParserRule{.prefix = PARSER_FN_NONE, .infix = PARSER_FN_NONE, .precedence = PRECEDENCE_NONE};
    case TOKEN_THIS: return new ParserRule{.prefix = PARSER_FN_NONE, .infix = PARSER_FN_NONE, .precedence = PRECEDENCE_NONE};
    case TOKEN_TRUE: return new ParserRule{.prefix = PARSER_FN_LITERAL, .infix = PARSER_FN_NONE, .precedence = PRECEDENCE_NONE};
    case TOKEN_VAR: return new ParserRule{.prefix = PARSER_FN_NONE, .infix = PARSER_FN_NONE, .precedence = PRECEDENCE_NONE};
    case TOKEN_WHILE: return new ParserRule{.prefix = PARSER_FN_NONE, .infix = PARSER_FN_NONE, .precedence = PRECEDENCE_NONE};
    case TOKEN_ERROR: return new ParserRule{.prefix = PARSER_FN_NONE, .infix = PARSER_FN_NONE, .precedence = PRECEDENCE_NONE};
    case TOKEN_EOF: return new ParserRule{.prefix = PARSER_FN_NONE, .infix = PARSER_FN_NONE, .precedence = PRECEDENCE_NONE};
    default: return nullptr;
  }
}

void Compiler::handleRule(ParserFnType type) {
  switch (type) {
    case PARSER_FN_UNARY: unary();
      break;
    case PARSER_FN_BINARY: binary();
      break;
    case PARSER_FN_NUMBER: number();
      break;
    case PARSER_FN_GROUPING: grouping();
      break;
    case PARSER_FN_LITERAL: literal();
      break;
    case PARSER_FN_STRING: string();
      break;
    default:break;
  }
}

bool Compiler::match(TokenType type) {
  if (!check(type)) return false;
  advance();
  return true;
}

bool Compiler::check(TokenType type) {
  return parser.current.type == type;
}

void Compiler::printStatement() {
  expression();
  consume(TOKEN_SEMICOLON, "Expected ';' after value.");
  emitByte(OP_PRINT);
}
