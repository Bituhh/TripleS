#ifndef TRIPLES_CHUNK_H
#define TRIPLES_CHUNK_H

#include <cstdint>
#include <vector>
#include "../value/value.h"

typedef enum {
  OP_CONSTANT,
  OP_NULL,
  OP_TRUE,
  OP_FALSE,
  OP_EQUAL,
  OP_GREATER,
  OP_GREATER_EQUAL,
  OP_LESS,
  OP_LESS_EQUAL,
  OP_ADD,
  OP_SUBTRACT,
  OP_MULTIPLE,
  OP_DIVIDE,
  OP_NOT,
  OP_NOT_EQUAL,
  OP_NEGATE,
  OP_RETURN,
} OpCode;

class Chunk {
public:
  ValueArray constants;
  std::vector<int> lines;
  std::vector<uint8_t> code;

  Chunk();

  void write(uint8_t byte, int line);

  unsigned int addConstant(Value value);
};


#endif //TRIPLES_CHUNK_H
