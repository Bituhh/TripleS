#include "src/chunk.h"
#include "src/compiler/compiler.h"
#include "src/vm.h"

#include <fstream>
#include <iostream>
#include <sstream>

std::string readFile(std::string path) {
  const std::ifstream t("C:/projects/TripleS/definitions/test.sss");
  std::stringstream buffer;
  buffer << t.rdbuf();
  return buffer.str();
}

int main(const int argc, const char *argv[]) {

  // if (argc != 2) {
  //   std::cout << "Usage: clox [path]" << std::endl;
  //   return 64;
  // }

  const std::string source = readFile("");
  Chunk chunk;

  Compiler compiler(source, chunk);
  compiler.compile();

  VM vm(chunk);
  vm.interpret();

  // chunk.write(OP_CONSTANT, 123);
  // chunk.write(chunk.addConstant(1.2), 123);
  //
  // chunk.write(OP_CONSTANT, 123);
  // chunk.write(chunk.addConstant(3.4), 123);
  //
  // chunk.write(OP_ADD, 123); // 1.2 + 3.4 = 4.6
  //
  // chunk.write(OP_CONSTANT, 123);
  // chunk.write(chunk.addConstant(5.6), 123);
  //
  // chunk.write(OP_DIVIDE, 123); // 4.6 / 5.6 = 0.82142857142
  //
  // chunk.write(OP_NEGATE, 123); // -1
  //
  // chunk.write(OP_RETURN, 123);

  // VM vm(&chunk);
  // vm.interpret();

  // auto debug = Debug(&chunk);
  // const std::string value = "test value";
  // debug.disassembleChunk(&value);
}
