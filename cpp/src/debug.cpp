#include "debug.h"
#include "value.h"

#include <iomanip>
#include <iostream>

Debug::Debug(const Chunk &chunk) : chunk(chunk) {}

void Debug::disassembleChunk(const std::string &name) {
  std::cout << "== " << name << " ==" << std::endl;

  for (int offset = 0; offset < this->chunk.bytes.size();) {
    offset = this->disassembleInstruction(offset);
  }
}
int Debug::disassembleInstruction(const unsigned int offset) {
  std::cout << std::setw(4) << std::setfill('0') << offset;

  std::cout << "\t";

  auto printLineNumber = [this, offset]() {
    const int currentLine = this->chunk.lines.at(offset);
    if (offset > 0) {
      const int previousLine = this->chunk.lines.at(offset - 1);
      if (currentLine == previousLine) {
        std::cout << "   | ";
        return;
      }
    }

    std::cout << std::setw(4) << std::setfill('0') << currentLine;
  };
  printLineNumber();

  std::cout << "\t";

  const auto instruction = this->chunk.bytes.at(offset);
  switch (instruction) {
    case OpCode::OP_CONSTANT:
      return this->constantInstruction("OP_CONSTANT", offset);
    case OpCode::OP_ADD:
      return this->simpleInstruction("OP_ADD", offset);
    case OpCode::OP_SUBTRACT:
      return this->simpleInstruction("OP_SUBTRACT", offset);
    case OpCode::OP_MULTIPLY:
      return this->simpleInstruction("OP_MULTIPLY", offset);
    case OpCode::OP_DIVIDE:
      return this->simpleInstruction("OP_DIVIDE", offset);
    case OpCode::OP_NEGATE:
      return this->simpleInstruction("OP_NEGATE", offset);
    case OpCode::OP_RETURN:
      return this->simpleInstruction("OP_RETURN", offset);
    default:
      std::cout << "Unknown opcode " << instruction << std::endl;
      return offset + 1;
  }
}

int Debug::simpleInstruction(const std::string &name, const int offset) {
  std::cout << name << std::endl;
  return offset + 1;
}

int Debug::constantInstruction(const std::string &name, const int offset) const {
  const auto constant = this->chunk.bytes.at(offset + 1);
  std::cout << name;
  std::cout << "\t";

  printValue(this->chunk.constants.at(constant));
  std::cout << std::endl;
  return offset + 2;
}