#include <iomanip>
#include "debug.h"

void Debug::disassembleChunk(Chunk *chunk, const char *name) {
  std::cout << "== " << name << " ==" << std::endl;

  for (int offset = 0; offset < chunk->code.size();) {
    offset = Debug::disassembleInstruction(chunk, offset);
  }
}

int Debug::disassembleInstruction(Chunk *chunk, int offset) {
  std::cout << std::setfill('0') << std::setw(4) << offset << std::setfill(' ');
  if (offset > 0 && chunk->lines.at(offset) == chunk->lines.at(offset - 1)) {
    std::cout << "   | ";
  } else {
    std::cout << std::setw(4) << chunk->lines.at(offset) << ' ';
  }

  uint8_t instruction = chunk->code.at(offset);
  switch (instruction) {
    case OP_CONSTANT: return Debug::constantInstruction("OP_CONSTANT", chunk, offset);
    case OP_NULL: return Debug::simpleInstruction("OP_NULL", offset);
    case OP_TRUE: return Debug::simpleInstruction("OP_TRUE", offset);
    case OP_FALSE: return Debug::simpleInstruction("OP_FALSE", offset);
    case OP_POP: return Debug::simpleInstruction("OP_POP", offset);
    case OP_DEFINE_GLOBAL: return Debug::constantInstruction("OP_DEFINE_GLOBAL", chunk, offset);
    case OP_GET_GLOBAL: return Debug::constantInstruction("OP_GET_GLOBAL", chunk, offset);
    case OP_SET_GLOBAL: return Debug::constantInstruction("OP_SET_GLOBAL", chunk, offset);
    case OP_EQUAL: return Debug::simpleInstruction("OP_EQUAL", offset);
    case OP_GREATER: return Debug::simpleInstruction("OP_GREATER", offset);
    case OP_GREATER_EQUAL: return Debug::simpleInstruction("OP_GREATER_EQUAL", offset);
    case OP_LESS: return Debug::simpleInstruction("OP_LESS", offset);
    case OP_LESS_EQUAL: return Debug::simpleInstruction("OP_LESS_EQUAL", offset);
    case OP_ADD: return Debug::simpleInstruction("OP_ADD", offset);
    case OP_SUBTRACT: return Debug::simpleInstruction("OP_SUBTRACT", offset);
    case OP_MULTIPLE: return Debug::simpleInstruction("OP_MULTIPLE", offset);
    case OP_DIVIDE: return Debug::simpleInstruction("OP_DIVIDE", offset);
    case OP_NOT: return Debug::simpleInstruction("OP_NOT", offset);
    case OP_NOT_EQUAL: return Debug::simpleInstruction("OP_NOT_EQUAL", offset);
    case OP_NEGATE: return Debug::simpleInstruction("OP_NEGATE", offset);
    case OP_PRINT: return Debug::simpleInstruction("OP_PRINT", offset);
    case OP_RETURN: return Debug::simpleInstruction("OP_RETURN", offset);
    default: std::cout << "Unknown OP_CODE " << (int) instruction << std::endl;
      return offset + 1;
  }
}

int Debug::simpleInstruction(const char *name, int offset) {
  std::cout << name << std::endl;
  return offset + 1;
}

int Debug::constantInstruction(const char *name, Chunk *chunk, int offset) {
  uint8_t constant = chunk->code.at(offset + 1);
  std::cout << std::left << std::setw(17) << name << std::right << std::setw(4) << (int) constant << " '";
  ValueArray::print(chunk->constants.at(constant));
  std::cout << '\'' << std::endl;
  return offset + 2;
}
