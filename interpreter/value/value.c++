//
// Created by usr_admin on 28/04/2021.
//

#include "value.h"

void ValueArray::print(Value value) {
  switch (value.type) {
    case VAL_BOOL:
      printf(AS_BOOL(value) ? "true" : "false");
      break;
    case VAL_NULL:
      printf("null");
      break;
    case VAL_NUMBER:
      printf("%g", AS_NUMBER(value));
      break;
  }
};
