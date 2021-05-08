//
// Created by usr_admin on 28/04/2021.
//

#ifndef TRIPLES_ARRAY_H
#define TRIPLES_ARRAY_H

#include <cstdint>
#include "../memory/memory.h"

template<class T>
class Array {
private:
  int capacity;

public:
  int length;
  T *values;

  Array();
  ~Array();

  void write(T value);
};


#endif //TRIPLES_ARRAY_H
