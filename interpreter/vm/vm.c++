#include <cstdarg>
#include "vm.h"


VM::VM() {
  reset();
}

VM::~VM() {
};

InterpretResult VM::interpret(const char *source) {
  auto *lChunk = new Chunk();

  auto *compiler = new Compiler(source);
  if (!compiler->compile(lChunk)) {
    delete compiler;
    delete lChunk;
    return INTERPRET_COMPILE_ERROR;
  }

  chunk = lChunk;
  instructionPointer = chunk->code.values;

  InterpretResult result = run();

  delete compiler;
  delete lChunk;
  return result;
}

InterpretResult VM::run() {
#define READ_BYTE()     *instructionPointer++
#define READ_CONSTANT() (chunk->constants.values[READ_BYTE()])
#define BINARY_OP(valueType, op)   do { \
    if (!IS_NUMBER(peek(0)) || !IS_NUMBER(peek(1))) { \
      runtimeError("Operands must be numbers."); \
      return INTERPRET_RUNTIME_ERROR; \
    } \
    double b = AS_NUMBER(pop()); \
    double a = AS_NUMBER(pop()); \
    push(valueType(a op b)); \
  } \
  while (false)

  for (;;) {
#ifdef DEBUG_TRACE_EXECUTION
    printf("          ");
    for (Value *slot = stack; slot < stackTop; slot++) {
      printf("[ ");
      ValueArray::print(*slot);
      printf(" ]");
    }
    printf("\n");

    Debug::disassembleInstruction(chunk, (int) (instructionPointer - chunk->code.values));
#endif
    uint8_t instruction;
    switch (instruction = READ_BYTE()) {
      case OP_CONSTANT: {
        Value constant = READ_CONSTANT();
        push(constant);
        break;
      }
      case OP_NULL:
        push(NULL_VAL);
        break;
      case OP_TRUE:
        push(BOOL_VAL(true));
        break;
      case OP_FALSE:
        push(BOOL_VAL(false));
        break;
      case OP_EQUAL: {
        Value b = pop();
        Value a = pop();
        push(BOOL_VAL(valuesEqual(a, b)));
        break;
      }
      case OP_GREATER:
        BINARY_OP(BOOL_VAL, >);
        break;
      case OP_GREATER_EQUAL:
        BINARY_OP(BOOL_VAL, >=);
        break;
      case OP_LESS:
        BINARY_OP(BOOL_VAL, <);
        break;
      case OP_LESS_EQUAL:
        BINARY_OP(BOOL_VAL, <=);
        break;
      case OP_ADD:
        BINARY_OP(NUMBER_VAL, +);
        break;
      case OP_SUBTRACT:
        BINARY_OP(NUMBER_VAL, -);
        break;
      case OP_MULTIPLE:
        BINARY_OP(NUMBER_VAL, *);
        break;
      case OP_DIVIDE:
        BINARY_OP(NUMBER_VAL, /);
        break;
      case OP_NOT:
        push(BOOL_VAL(isFalsy(pop())));
        break;
      case OP_NOT_EQUAL: {
        Value b = pop();
        Value a = pop();
        push(BOOL_VAL(!valuesEqual(a, b)));
        break;
      }
      case OP_NEGATE:
        if (!IS_NUMBER(peek(0))) {
          runtimeError("Operand must be a number.");
          return INTERPRET_RUNTIME_ERROR;
        }
        push(NUMBER_VAL(-AS_NUMBER(pop())));
        break;
      case OP_RETURN: {
        ValueArray::print(pop());
        printf("\n");
        return INTERPRET_OK;
      }
    }
  }

#undef BINARY_OP
#undef READ_CONSTANT
#undef READ_BYTE
}

void VM::reset() {
  stackTop = stack;
}

void VM::push(Value value) {
  *stackTop = value;
  stackTop++;
}

Value VM::pop() {
  stackTop--;
  return *stackTop;
}

Value VM::peek(int distance) {
  return stackTop[-1 - distance];
}

void VM::runtimeError(const char *format, ...) {
  va_list args;
  va_start(args, format);
  vfprintf(stderr, format, args);
  va_end(args);
  fputs("\n", stderr);

  size_t instruction = instructionPointer - chunk->code.values - 1;
  int line = chunk->lines.values[instruction];
  fprintf(stderr, "[line %d] in script\n", line);
  reset();
}

bool VM::isFalsy(Value value) {
  return IS_NULL(value) || (IS_BOOL(value) && !AS_BOOL(value)) || (IS_NUMBER(value) && AS_NUMBER(value) == 0);
}

bool VM::valuesEqual(Value a, Value b) {
  if (a.type != b.type) return false;
  switch (a.type) {
    case VAL_BOOL:
      return AS_BOOL(a) == AS_BOOL(b);
    case VAL_NULL:
      return true;
    case VAL_NUMBER:
      return AS_NUMBER(a) == AS_NUMBER(b);
    default:
      return false; // Unreachable;
  }
}
