#include "debug.h"

void Debug::disassembleChunk(Chunk *chunk, const char *name) {
  printf("== %s ==\n", name);

  for (int offset = 0; offset < chunk->code.length;) {
    offset = Debug::disassembleInstruction(chunk, offset);
  }
}

int Debug::disassembleInstruction(Chunk *chunk, int offset) {
  printf("%04d ", offset);
  if (offset > 0 && chunk->lines.values[offset] == chunk->lines.values[offset - 1]) {
    printf("   | ");
  } else {
    printf("%4d ", chunk->lines.values[offset]);
  }

  uint8_t instruction = chunk->code.values[offset];
  switch (instruction) {
    case OP_CONSTANT:
      return Debug::constantInstruction("OP_CONSTANT", chunk, offset);
    case OP_NULL:
      return Debug::simpleInstruction("OP_NULL", offset);
    case OP_TRUE:
      return Debug::simpleInstruction("OP_TRUE", offset);
    case OP_FALSE:
      return Debug::simpleInstruction("OP_FALSE", offset);
    case OP_EQUAL:
      return Debug::simpleInstruction("OP_EQUAL", offset);
    case OP_GREATER:
      return Debug::simpleInstruction("OP_GREATER", offset);
    case OP_GREATER_EQUAL:
      return Debug::simpleInstruction("OP_GREATER_EQUAL", offset);
    case OP_LESS:
      return Debug::simpleInstruction("OP_LESS", offset);
    case OP_LESS_EQUAL:
      return Debug::simpleInstruction("OP_LESS_EQUAL", offset);
    case OP_ADD:
      return Debug::simpleInstruction("OP_ADD", offset);
    case OP_SUBTRACT:
      return Debug::simpleInstruction("OP_SUBTRACT", offset);
    case OP_MULTIPLE:
      return Debug::simpleInstruction("OP_MULTIPLE", offset);
    case OP_DIVIDE:
      return Debug::simpleInstruction("OP_DIVIDE", offset);
    case OP_NOT:
      return Debug::simpleInstruction("OP_NOT", offset);
    case OP_NOT_EQUAL:
      return Debug::simpleInstruction("OP_NOT_EQUAL", offset);
    case OP_NEGATE:
      return Debug::simpleInstruction("OP_NEGATE", offset);
    case OP_RETURN:
      return Debug::simpleInstruction("OP_RETURN", offset);
    default:
      printf("Unknown OP_CODE %d\n", instruction);
      return offset + 1;
  }
}

int Debug::simpleInstruction(const char *name, int offset) {
  printf("%s\n", name);
  return offset + 1;
}

int Debug::constantInstruction(const char *name, Chunk *chunk, int offset) {
  uint8_t constant = chunk->code.values[offset + 1];
  printf("%-16s %4d '", name, constant);
  ValueArray::print(chunk->constants.values[constant]);
  printf("'\n");
  return offset + 2;
}
