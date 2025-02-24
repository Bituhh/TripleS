#ifndef DEBUG_H
#define DEBUG_H

#define DEBUG_PRINT_CODE
#define DEBUG_TRACE_EXECUTION

#include "chunk.h"

#include <string>

class Debug {
public:
  Chunk chunk;

  explicit Debug(const Chunk &chunk);
  void disassembleChunk(const std::string &name);
  int disassembleInstruction(unsigned int offset);

private:
  int simpleInstruction(const std::string &name, int offset);
  int constantInstruction(const std::string &name, int offset) const;
};

#endif // DEBUG_H