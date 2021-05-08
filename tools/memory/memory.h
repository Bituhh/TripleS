//
// Created by usr_admin on 28/04/2021.
//

#ifndef TRIPLES_MEMORY_H
#define TRIPLES_MEMORY_H

#include <cstdlib>

#define GROW_CAPACITY(capacity) ((capacity) < 8 ? 8 : (capacity) * 2)
#define GROW_ARRAY(type, pointer, oldCount, newCount) (type*)Memory::reallocate(pointer, sizeof(type) * (oldCount), sizeof(type) * (newCount))
#define FREE_ARRAY(type, pointer, oldCount) Memory::reallocate(pointer, sizeof(type) * (oldCount), 0)

class Memory {
public:
  static void *reallocate(void *pointer, size_t oldSize, size_t newSize);
};


#endif //TRIPLES_MEMORY_H
