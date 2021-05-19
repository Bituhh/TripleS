#ifndef TRIPLES_DEBUG_H
#define TRIPLES_DEBUG_H

#include <cstdio>
#include "../../interpreter/chunk/chunk.h"

//#define DEBUG_TRACE_EXECUTION
#define DEBUG_PRINT_CODE

class Debug {
 private:
  static int simpleInstruction(const char *name, int offset);
  static int constantInstruction(const char *name, Chunk *chunk, int offset);

 public:
  static void disassembleChunk(Chunk *chunk, const char *name);
  static int disassembleInstruction(Chunk *chunk, int offset);
};

#endif //TRIPLES_DEBUG_H
