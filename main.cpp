#include "interpreter/chunk/chunk.h"
#include "tools/debug/debug.h"
#include "interpreter/vm/vm.h"
#include <fstream>

static void repl() {
  auto &vm = VM::getInstance();

  std::string line;
  while (true) {
    std::cout << ">> ";
    std::cin >> line;

    if (line == "exit") break;

    vm.interpret(line.c_str());
  };

  vm.free();
}

static std::string readFile(const std::string &path) {
  std::ifstream file(path);
  if (!file.is_open()) std::cerr << "Couldn't open file \"" << path << "\"." << std::endl;

  std::string allLines;
  std::string line;
  while (std::getline(file, line)) {
    allLines += line + '\n';
  }

  std::cout << allLines << std::endl;

  file.close();

  return allLines;
}

static void runFile(const char *path) {
  auto &vm = VM::getInstance();

  std::string source = readFile(path);
  InterpretResult result = vm.interpret(source.c_str());

  if (result == INTERPRET_COMPILE_ERROR) exit(65);
  if (result == INTERPRET_RUNTIME_ERROR) exit(70);

  vm.free();
}

int main(int argc, const char *argv[]) {
//
//  if (argc == 1) {
//    repl();
//  } else {
//    runFile(argv[1]);
//  }

  runFile("D:/usr/Victor/Documents/Projects/Cpp/triples/definitions/test.sss");

  return 0;
}
