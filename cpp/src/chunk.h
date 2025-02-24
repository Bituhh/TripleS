#ifndef CHUNK_H
#define CHUNK_H
#include "value.h"

#include <vector>

typedef enum {
  OP_CONSTANT,
  OP_ADD,
  OP_SUBTRACT,
  OP_MULTIPLY,
  OP_DIVIDE,
  OP_NEGATE,
  OP_RETURN,
} OpCode;

template <typename T = unsigned long long> using Array = std::vector<T>;

class Chunk {
public:
  Array<unsigned long long> bytes;
  Array<Value> constants;
  Array<unsigned int> lines;

  void write(unsigned long long chunk, unsigned int line);
  unsigned long long addConstant(Value constant);

  void free();
};

#endif // CHUNK_H
