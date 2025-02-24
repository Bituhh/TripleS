#include "vm.h"

#include <iostream>

VM::VM(const Chunk &chunk)
    : chunk(chunk)
#ifdef DEBUG_TRACE_EXECUTION
      ,
      debug(chunk)
#endif
{
  this->stack.reserve(STACK_MAX);
}

InterpretResult VM::interpret() {
#ifdef DEBUG_TRACE_EXECUTION
  std::cout << "== VM ==" << std::endl;
#endif
  // Compiler

  // Free chunk
  return this->run();
}

InterpretResult VM::run() {
  for (;;) {
#ifdef DEBUG_TRACE_EXECUTION
    if (this->stack.size() > 0) {
      std::cout << "\t\t";
      for (const Value &value : this->stack) {
        std::cout << "[ ";
        printValue(value);
        std::cout << " ]";
      }
      std::cout << std::endl;
    }
    this->debug.disassembleInstruction(this->ip);
#endif

    switch (this->readByte()) {
      case OP_CONSTANT:
        {
          const Value constant = this->readConstant();
          stack.push_back(constant);
          break;
        }
      case OP_ADD:
        {
          const Value b = this->pop();
          const Value a = this->pop();
          this->push(a + b);
          break;
        }
      case OP_SUBTRACT:
        {
          const Value b = this->pop();
          const Value a = this->pop();
          this->push(a - b);
          break;
        }
      case OP_MULTIPLY:
        {
          const Value b = this->pop();
          const Value a = this->pop();
          this->push(a * b);
          break;
        }
      case OP_DIVIDE:
        {
          const Value b = this->pop();
          const Value a = this->pop();
          this->push(a / b);
          break;
        }
      case OP_NEGATE:
        {
          this->push(-this->pop());
          break;
        }
      case OP_RETURN:
        {
          printValue(this->pop());
          std::cout << std::endl;
          return INTERPRET_OK;
        }
      default:
        return INTERPRET_RUNTIME_ERROR;
    }
  }
}

inline unsigned char VM::readByte() { return this->chunk.bytes.at(this->ip++); }

inline Value VM::readConstant() { return this->chunk.constants.at(this->readByte()); }

inline void VM::push(const Value value) { return this->stack.push_back(value); }

inline Value VM::pop() {
  const Value value = this->stack.back();
  this->stack.pop_back();
  return value;
}
