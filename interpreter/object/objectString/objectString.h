#ifndef TRIPLES_OBJECT_STRING_H
#define TRIPLES_OBJECT_STRING_H

#include "../object.h"

#define IS_STRING(value)  Object::isObjType(value, OBJ_STRING)
#define AS_STRING(value)  ((ObjectString *)AS_OBJ(value))
#define AS_CSTRING(value) (((ObjectString *)AS_OBJ(value))->chars)

class ObjectString: public Object {
public:
  int length;
  char *chars;

  ObjectString(char *chars, int length);

  static ObjectString *copy(const char *chars, int length);

  static ObjectString *takeString(char *chars, int length);
};


#endif //TRIPLES_OBJECT_STRING_H
