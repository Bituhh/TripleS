#include "object.h"
#include "objectString/objectString.h"
#include "../vm/vm.h"

Object::Object(ObjectType type) : type(type) {
  auto &vm = VM::getInstance();
  next = vm.objects;
  vm.objects = next;
}

Object::~Object() {
  switch (type) {
    case OBJ_STRING: {
      auto *string = (ObjectString *) this;
      delete[] string->chars;
      delete this;
      break;
    }
  }
}

bool Object::isObjType(Value value, ObjectType type) {
  return IS_OBJ(value) && AS_OBJ(value)->type == type;
}

void Object::print(Value value) {
  switch (OBJ_TYPE(value)) {
    case OBJ_STRING:
      printf("%s", AS_CSTRING(value));
      break;
  }
}
