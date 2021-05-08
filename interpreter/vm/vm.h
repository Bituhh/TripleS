#ifndef TRIPLES_VM_H
#define TRIPLES_VM_H


#include "../chunk/chunk.h"
#include "../../tools/debug/debug.h"
#include "../compiler/compiler.h"

#define MAX_STACK 256

typedef enum {
  INTERPRET_OK,
  INTERPRET_COMPILE_ERROR,
  INTERPRET_RUNTIME_ERROR
} InterpretResult;

class VM {
private:
  Chunk *chunk;
  uint8_t *instructionPointer;
  Value stack[MAX_STACK];
  Value *stackTop;

  InterpretResult run();

  void reset();

  void push(Value value);

  Value peek(int i);

  Value pop();

  void runtimeError(const char *format, ...);

  static bool isFalsy(Value pop);

  static bool valuesEqual(Value a, Value b);

public:
  VM();

  ~VM();

  InterpretResult interpret(const char *source);
};


#endif //TRIPLES_VM_H
