#ifndef TRIPLES_OBJECT_H
#define TRIPLES_OBJECT_H

#include "../value/value.h"

#define OBJ_TYPE(value)   (AS_OBJ(value)->type)

typedef enum {
  OBJ_STRING,
} ObjectType;

class Object {
 private:
  ObjectType type;

 public:
  Object *next;
  explicit Object(ObjectType type);
  ~Object();
  static bool isObjType(Value value, ObjectType type);
  static void print(Value value);
};

#endif //TRIPLES_OBJECT_H
