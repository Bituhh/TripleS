#ifndef VM_H
#define VM_H
#include "chunk.h"
#include "debug.h"

#define STACK_MAX 256

typedef enum { INTERPRET_OK, INTERPRET_COMPILE_ERROR, INTERPRET_RUNTIME_ERROR } InterpretResult;

class VM {
public:
  explicit VM(const Chunk &chunk);
  InterpretResult interpret();

private:
  Chunk chunk;
#ifdef DEBUG_TRACE_EXECUTION
  Debug debug;
#endif
  unsigned int ip = 0;
  Array<Value> stack;

  InterpretResult run();
  unsigned char readByte();
  Value readConstant();
  void push(Value value);
  Value pop();
};

#endif // VM_H
