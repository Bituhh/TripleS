#include "interpreter/chunk/chunk.h"
#include "tools/debug/debug.h"
#include "interpreter/vm/vm.h"

static void repl() {
  auto &vm = VM::getInstance();

  char line[1024];
  for (;;) {
    printf(">> ");

    if (!fgets(line, sizeof(line), stdin)) {
      printf("\n");
      break;
    }

    vm.interpret(line);
  }

  vm.free();
}

static char *readFile(const char *path) {
  FILE *file = fopen(path, "rb");

  if (file == nullptr) {
    fprintf(stderr, "Couldn't open file \"%s\".\n", path);
  }

  fseek(file, 0L, SEEK_END);
  size_t fileSize = ftell(file);
  rewind(file);

  char *buffer = (char *) malloc(fileSize + 1);
  size_t bytesRead = fread(buffer, sizeof(char), fileSize, file);
  buffer[bytesRead] = '\0';

  fclose(file);
  return buffer;
}

static void runFile(const char *path) {
  auto &vm = VM::getInstance();

  char *source = readFile(path);
  InterpretResult result = vm.interpret(source);
  free(source);

  if (result == INTERPRET_COMPILE_ERROR) exit(65);
  if (result == INTERPRET_RUNTIME_ERROR) exit(70);

  vm.free();
}

int main(int argc, const char *argv[]) {

  if (argc == 1) {
    repl();
  } else {
    runFile(argv[1]);
  }

  return 0;
}
