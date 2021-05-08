//
// Created by usr_admin on 28/04/2021.
//

#include "chunk.h"

Chunk::Chunk() : constants(ValueArray()), code(Array<uint8_t>()), lines(Array<int>()) {
};

void Chunk::write(uint8_t byte, int line) {
  code.write(byte);
  lines.write(line);
}

int Chunk::addConstant(Value value) {
  constants.write(value);
  return constants.length - 1;
}
