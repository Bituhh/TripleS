#include "compiler.h"

#include <iostream>

Compiler::Compiler(const std::string &source, Chunk &chunk)
    : source(source), scanner(source), parser(), compilingChunk(&chunk)
#ifdef DEBUG_PRINT_CODE
      ,
      debug(chunk)
#endif
{
}

bool Compiler::compile() {
  this->advance();

  this->expression();

  this->consume(TokenType::TOKEN_EOF, "Expect end of expression.");

  this->endCompiler();
  return !this->parser.hadError;
}

void Compiler::expression() { this->parsePrecedence(Precedence::PRECEDENCE_ASSIGNMENT); }

void Compiler::advance() {
  parser.previous = parser.current;

  for (;;) {
    this->parser.current = this->scanner.scanToken();
    if (this->parser.current.type != TokenType::TOKEN_ERROR) break;

    this->errorAtCurrent(this->parser.current.lexeme);
  }
}

void Compiler::consume(const TokenType type, const std::string &message) {
  if (this->parser.current.type == type) {
    this->advance();
    return;
  }

  this->errorAtCurrent(message);
}

void Compiler::emitByte(const unsigned long long byte) {
  this->currentChunk()->write(byte, this->parser.previous.line);
}

void Compiler::emitBytes(const unsigned long long byte1, const unsigned long long byte2) {
  this->emitByte(byte1);
  this->emitByte(byte2);
}

void Compiler::emitReturn() { this->emitByte(OpCode::OP_RETURN); }

unsigned long long Compiler::makeConstant(const double value) {
  const unsigned long long constant = this->currentChunk()->addConstant(value);
  if (constant > ULONG_LONG_MAX) {
    this->errorAtCurrent("Too many constants in one chunk.");
    return 0;
  }

  return constant;
}

void Compiler::emitConstant(const double value) {
  const unsigned long long constant = this->makeConstant(value);
  this->emitBytes(OpCode::OP_CONSTANT, constant);
}

void Compiler::endCompiler() {
#ifdef DEBUG_PRINT_CODE
  if (!this->parser.hadError) {
    this->debug.chunk = *this->currentChunk();
    this->debug.disassembleChunk("COMPILER");
  }
#endif
  this->emitReturn();
}

void Compiler::binary() {
  const TokenType operatorType = this->parser.previous.type;

  const ParseRule rule = this->getRule(operatorType);
  this->parsePrecedence(static_cast<Precedence>(rule.precedence + 1));

  switch (operatorType) {
    case TokenType::TOKEN_PLUS:
      this->emitByte(OpCode::OP_ADD);
      break;
    case TokenType::TOKEN_MINUS:
      this->emitByte(OpCode::OP_SUBTRACT);
      break;
    case TokenType::TOKEN_STAR:
      this->emitByte(OpCode::OP_MULTIPLY);
      break;
    case TokenType::TOKEN_SLASH:
      this->emitByte(OpCode::OP_DIVIDE);
      break;
    default:
      // Unreachable, hopefully!
      return;
  }
}

void Compiler::grouping() {
  this->expression();
  this->consume(TokenType::TOKEN_RIGHT_PAREN, "Expect ')' after expression.");
}

void Compiler::number() {
  const double value = std::stod(this->parser.previous.lexeme);
  this->emitConstant(value);
}

void Compiler::unary() {
  const TokenType operatorType = this->parser.previous.type;

  this->parsePrecedence(Precedence::PRECEDENCE_UNARY);

  switch (operatorType) {
    case TokenType::TOKEN_MINUS:
      this->emitByte(OpCode::OP_NEGATE);
      break;
    default:
      // Unreachable, hopefully!
      return;
  }
}

void Compiler::parsePrecedence(const Precedence precedence) {
  this->advance();

  const ParseFn prefixRule = this->getRule(this->parser.previous.type).prefix;
  if (prefixRule == nullptr) {
    this->errorAtCurrent("Expect expression.");
    return;
  }

  prefixRule();

  while (precedence <= this->getRule(this->parser.current.type).precedence) {
    this->advance();
    const ParseFn infixRule = this->getRule(this->parser.previous.type).infix;
    infixRule();
  }
}

ParseRule Compiler::getRule(const TokenType type) {
  switch (type) {
    case TOKEN_LEFT_PAREN:
      return {[this]() { this->grouping(); }, nullptr, Precedence::PRECEDENCE_NONE};
    case TOKEN_RIGHT_PAREN:
      return {nullptr, nullptr, Precedence::PRECEDENCE_NONE};
    case TOKEN_LEFT_BRACE:
      return {nullptr, nullptr, Precedence::PRECEDENCE_NONE};
    case TOKEN_RIGHT_BRACE:
      return {nullptr, nullptr, Precedence::PRECEDENCE_NONE};
    case TOKEN_COMMA:
      return {nullptr, nullptr, Precedence::PRECEDENCE_NONE};
    case TOKEN_DOT:
      return {nullptr, nullptr, Precedence::PRECEDENCE_NONE};
    case TOKEN_MINUS:
      return {[this]() { this->unary(); }, [this]() { this->binary(); }, Precedence::PRECEDENCE_TERM};
    case TOKEN_PLUS:
      return {nullptr, [this]() { this->binary(); }, Precedence::PRECEDENCE_TERM};
    case TOKEN_SEMICOLON:
      return {nullptr, nullptr, Precedence::PRECEDENCE_NONE};
    case TOKEN_SLASH:
      return {nullptr, [this]() { this->binary(); }, Precedence::PRECEDENCE_FACTOR};
    case TOKEN_STAR:
      return {nullptr, [this]() { this->binary(); }, Precedence::PRECEDENCE_FACTOR};
    case TOKEN_BANG:
      return {nullptr, nullptr, Precedence::PRECEDENCE_NONE};
    case TOKEN_BANG_EQUAL:
      return {nullptr, nullptr, Precedence::PRECEDENCE_NONE};
    case TOKEN_EQUAL:
      return {nullptr, nullptr, Precedence::PRECEDENCE_NONE};
    case TOKEN_EQUAL_EQUAL:
      return {nullptr, nullptr, Precedence::PRECEDENCE_NONE};
    case TOKEN_GREATER:
      return {nullptr, nullptr, Precedence::PRECEDENCE_NONE};
    case TOKEN_GREATER_EQUAL:
      return {nullptr, nullptr, Precedence::PRECEDENCE_NONE};
    case TOKEN_LESS:
      return {nullptr, nullptr, Precedence::PRECEDENCE_NONE};
    case TOKEN_LESS_EQUAL:
      return {nullptr, nullptr, Precedence::PRECEDENCE_NONE};
    case TOKEN_IDENTIFIER:
      return {nullptr, nullptr, Precedence::PRECEDENCE_NONE};
    case TOKEN_STRING:
      return {nullptr, nullptr, Precedence::PRECEDENCE_NONE};
    case TOKEN_NUMBER:
      return {[this]() { this->number(); }, nullptr, Precedence::PRECEDENCE_NONE};
    case TOKEN_AND:
      return {nullptr, nullptr, Precedence::PRECEDENCE_NONE};
    case TOKEN_CLASS:
      return {nullptr, nullptr, Precedence::PRECEDENCE_NONE};
    case TOKEN_ELSE:
      return {nullptr, nullptr, Precedence::PRECEDENCE_NONE};
    case TOKEN_FALSE:
      return {nullptr, nullptr, Precedence::PRECEDENCE_NONE};
    case TOKEN_FOR:
      return {nullptr, nullptr, Precedence::PRECEDENCE_NONE};
    case TOKEN_FUNCTION:
      return {nullptr, nullptr, Precedence::PRECEDENCE_NONE};
    case TOKEN_IF:
      return {nullptr, nullptr, Precedence::PRECEDENCE_NONE};
    case TOKEN_NULL:
      return {nullptr, nullptr, Precedence::PRECEDENCE_NONE};
    case TOKEN_OR:
      return {nullptr, nullptr, Precedence::PRECEDENCE_NONE};
    case TOKEN_PRINT:
      return {nullptr, nullptr, Precedence::PRECEDENCE_NONE};
    case TOKEN_RETURN:
      return {nullptr, nullptr, Precedence::PRECEDENCE_NONE};
    case TOKEN_SUPER:
      return {nullptr, nullptr, Precedence::PRECEDENCE_NONE};
    case TOKEN_THIS:
      return {nullptr, nullptr, Precedence::PRECEDENCE_NONE};
    case TOKEN_TRUE:
      return {nullptr, nullptr, Precedence::PRECEDENCE_NONE};
    case TOKEN_VAR:
      return {nullptr, nullptr, Precedence::PRECEDENCE_NONE};
    case TOKEN_WHILE:
      return {nullptr, nullptr, Precedence::PRECEDENCE_NONE};
    case TOKEN_ERROR:
      return {nullptr, nullptr, Precedence::PRECEDENCE_NONE};
    case TOKEN_EOF:
      return {nullptr, nullptr, Precedence::PRECEDENCE_NONE};
    default:
      return {nullptr, nullptr, Precedence::PRECEDENCE_NONE};
  }
}

void Compiler::errorAtCurrent(const std::string &message) { this->errorAt(this->parser.previous, message); }

void Compiler::errorAt(const Token &token, const std::string &message) {
  if (this->parser.panicMode) return;
  this->parser.panicMode = true;

  std::cerr << "[line " << token.line << "] Error";
  if (token.type == TokenType::TOKEN_EOF) {
    std::cerr << " at end";
  } else if (token.type == TokenType::TOKEN_ERROR) {
  } else {
    std::cerr << " at '" << token.lexeme << "'";
  }

  std::cerr << ": " << message << std::endl;
  this->parser.hadError = true;
}

Chunk *Compiler::currentChunk() { return this->compilingChunk; }
