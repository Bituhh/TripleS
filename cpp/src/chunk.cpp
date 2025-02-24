#include "chunk.h"

void Chunk::write(const unsigned long long chunk, const unsigned int line) {
    this->bytes.push_back(chunk);
    this->lines.push_back(line);
}

unsigned long long Chunk::addConstant(const Value constant) {
  this->constants.push_back(constant);
  return this->constants.size() - 1;
}

void Chunk::free() {
  // Free vectors
  this->bytes.clear();
  this->constants.clear();
  this->lines.clear();
}