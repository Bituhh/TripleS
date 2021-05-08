//
// Created by usr_admin on 28/04/2021.
//

#include "memory.h"

void *Memory::reallocate(void *pointer, size_t oldSize, size_t newSize) {
  if (newSize == 0) {
    free(pointer);
    return nullptr;
  }

  void *result = realloc(pointer, newSize);
  if (result == nullptr) exit(137);
  return result;
}
