#include "value.h"

#include "../object/objectString/objectString.h"

void ValueArray::print(Value value) {
  switch (value.type) {
    case VAL_BOOL: std::cout << (AS_BOOL(value) ? "true" : "false");
      break;
    case VAL_NULL: std::cout << "null";
      break;
    case VAL_NUMBER: std::cout << AS_NUMBER(value);
      break;
    case VAL_OBJ: Object::print(value);
      break;
  }
}

bool ValueArray::valuesEqual(Value a, Value b) {
  if (a.type != b.type) return false;
  switch (a.type) {
    case VAL_BOOL: return AS_BOOL(a) == AS_BOOL(b);
    case VAL_NULL: return true;
    case VAL_NUMBER: return AS_NUMBER(a) == AS_NUMBER(b);
    case VAL_OBJ: return AS_OBJ(a) == AS_OBJ(b);
    default: return false; // Unreachable;
  }
}
