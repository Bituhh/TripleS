#include "chunk.h"

Chunk::Chunk() : constants(ValueArray()), code(std::vector<uint8_t>()), lines(std::vector<int>()) {
}

void Chunk::write(uint8_t byte, int line) {
  code.push_back(byte);
  lines.push_back(line);
}

unsigned int Chunk::addConstant(Value value) {
  constants.push_back(value);
  return constants.size() - 1;
}
